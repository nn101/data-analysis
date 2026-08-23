// Quick: inside window eval, perform cloud pipeline step by step and verify
const fs = require('fs');
const { createCanvas, loadImage, ImageData } = require('canvas');
const { JSDOM } = require('jsdom');

// Reuse the test_algo setup
const domHtml = fs.readFileSync('/workspace/test_algo.js','utf8').match(/new JSDOM\(`([\s\S]*?)`,\s*\{pretendToBeVisual/)[1];
const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${domHtml}</body></html>`, {pretendToBeVisual:true});
W = dom.window;
global.window = W;
global.document = W.document;

const origCreate = W.document.createElement.bind(W.document);
const reg = new WeakMap();
function mkCanvas(el){
  let c = reg.get(el);
  if(!c){ c = createCanvas(300,150); reg.set(el,c); }
  return c;
}
W.document.createElement = function(t){
  const el = origCreate(t);
  if(String(t).toLowerCase()==='canvas'){
    const real = mkCanvas(el);
    const orig = el.getContext.bind(el);
    el.getContext = function(type,opts){return String(type).toLowerCase()==='2d'? real.getContext('2d',opts):orig(type,opts)};
    Object.defineProperty(el,'width',{configurable:true,enumerable:true,get(){return real.width},set(v){return real.width=v}});
    Object.defineProperty(el,'height',{configurable:true,enumerable:true,get(){return real.height},set(v){return real.height=v}});
    el.__nodeCanvas = real;
  }
  return el;
};
W.ImageData = ImageData;
for (const preCanvas of [...W.document.querySelectorAll('canvas')]) {
  const real = mkCanvas(preCanvas);
  const orig = preCanvas.getContext ? preCanvas.getContext.bind(preCanvas) : null;
  preCanvas.getContext = function(type,opts){return String(type).toLowerCase()==='2d'? real.getContext('2d',opts):orig?orig(type,opts):null};
  Object.defineProperty(preCanvas,'width',{configurable:true,enumerable:true,get(){return real.width},set(v){return real.width=v}});
  Object.defineProperty(preCanvas,'height',{configurable:true,enumerable:true,get(){return real.height},set(v){return real.height=v}});
  preCanvas.__nodeCanvas = real;
}

// Load app.js code
let src = fs.readFileSync('/workspace/app.js','utf8');
src = src.replace(/^const /gm, 'var ');
src += `
; (function(){
  ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne',
   'analyzeSourceVisualFacts','drawAbstractMarksFromFacts','pickCueTypeForBlob','kmeansQuantize',
   'pickSourceAccentFromPalette','drawArchiveMicrotype','pickStickerColorForCloud','drawStarMark',
   'mulberry32','seedFromImg','ccx','cloudCanvas','stickerLayer','cloudEmpty','cloudStage','bgImg',
   'cloudDrop','posts','matchStickerByBlob','applySemanticLUTInRect','PROMPT_LUTS','rgbToHsl','hslToRgb',
   'drawPromptCaption','renderThumbs','postThumbs','postCount','stickerTools'
  ].forEach(k => { try { window[k] = eval(k); } catch(e){} });
  window.__bgImgRef = bgImg;
  window.__ccxRef = ccx;
  window.__cloudCanvasRef = cloudCanvas;
})();
`;

W.eval(src);
console.log('ccx exists on W:', typeof W.ccx, typeof W.__ccxRef, 'canvas:', typeof W.cloudCanvas, typeof W.__cloudCanvasRef);

(async function(){
  const img = await loadImage('/workspace/test_clouds.png');
  console.log('loaded', img.width, img.height);

  // Set bgImg on window
  W.eval(`bgImg = null;`); // clear
  // Trick: attach an HTMLImageElement src
  const htmlImg = W.document.createElement('img');
  const buf = fs.readFileSync('/workspace/test_clouds.png');
  htmlImg.src = 'data:image/png;base64,'+buf.toString('base64');
  htmlImg.onload = ()=>{};
  await new Promise(r=>{ const i=setInterval(()=>{ if(htmlImg.naturalWidth>0){clearInterval(i); r();} }, 30); setTimeout(r,2000); });
  console.log('htmlImg size:', htmlImg.naturalWidth, htmlImg.naturalHeight);

  // Prepare canvas & bgImg for autoAdapt
  const script2 = `
    (function(){
      const cCanvas = cloudCanvas;
      // Use attached htmlImg as bgImg
      bgImg = (function(){ return this; }).call(htmlImg);
      return 'nope';
    })();
  `;
  // Simpler: just call pipeline directly via eval and use WINDOW variables
  const res = W.eval(`
    (function(){
      // Set bgImg directly via the passed HTMLImageElement copy we load via dataURL below
      return {
        cloudCanvasSize: cloudCanvas.width+'x'+cloudCanvas.height,
        ccxExists: !!ccx
      };
    })();
  `);
  console.log('before setup:', res);

  // We'll pass and set everything using the node-canvas backed cloudCanvas
  const cCanvas = W.cloudCanvas;
  cCanvas.width = img.width;
  cCanvas.height = img.height;
  const ccx = cCanvas.getContext('2d');
  ccx.drawImage(img, 0, 0);
  console.log('After drawImage: canvas is', cCanvas.width, cCanvas.height);
  // sample corner
  console.log('orig-ish pixel 0,0 via ccx.getImageData =', ccx.getImageData(0,0,1,1).data);

  // Assign to global inside eval scope via window properties
  W.__ccx = ccx;
  W.__cCanvas = cCanvas;
  W.__img = img;
  // Re-bind app.js inner vars to our objects (app.js `ccx` is scoped; we use indirect call through function args)
  // Better: just invoke pipeline by passing everything explicitly (avoid app.js globals confusion)
  const pipeline = W.eval(`
    (function(ccx, cCanvas, bgImgIm, W, H){
      // reset
      ccx.save(); ccx.setTransform(1,0,0,1,0,0); ccx.clearRect(0,0,W,H);
      ccx.drawImage(bgImgIm, 0, 0, W, H);
      ccx.restore();
      console = W.console || console;
      try { console.log('drawImage done via explicit ccx'); } catch(e){}
      const {mask} = binarizeClouds(ccx, W, H);
      const blobs = findBlobs(mask, W, H, 0.004);
      const N = Math.min(5, Math.max(1, Math.min(blobs.length, 2 + Math.floor(blobs.length/2))));
      const pick = blobs.slice(0, N);
      pick.forEach((b,i)=> drawCueFaceOnBlob(b, i));
      return {blobs: blobs.length, picked: pick.length, cues: pick.map(b=>pickCueTypeForBlob(b))};
    })
  `);
  const r = pipeline(ccx, cCanvas, img, W, img.width, img.height);
  console.log('pipeline result:', JSON.stringify(r));

  // sample post-process
  console.log('after Q-ify: pixel(0,0)=', ccx.getImageData(0,0,1,1).data);
  // Sample blob0 center area (eyes should be dark): blob[0] center ~ cx, cy
  const blobs = W.eval(`findBlobs(binarizeClouds(ccx2||null||( (function(){const cc=__ccx; const w=__img.width,h=__img.height; return binarizeClouds(cc,w,h)})() ).mask, __img.width, __img.height, 0.004)`);
  // Instead, re-run on same canvas to get centers
  const bin2 = W.binarizeClouds ? W.binarizeClouds(ccx, img.width, img.height) : 
    (fn=>fn(ccx, img.width, img.height))(W.eval('binarizeClouds'));
  const blobs2 = (W.findBlobs || W.eval('findBlobs'))(bin2.mask, img.width, img.height, 0.004);
  console.log('re-found blobs:', blobs2.slice(0,4).map(b=>({cx:b.cx.toFixed(0),cy:b.cy.toFixed(0), bw:b.bw, bh:b.bh, cue: (W.pickCueTypeForBlob||W.eval('pickCueTypeForBlob'))(b)})));

  // Inspect around blob 0 center area for DARK pixels that were NOT in original
  const b0 = blobs2[0];
  const {cx, cy, bw, bh} = b0;
  const before = ccx.getImageData(0, 0, 1, 1);  // before? No, canvas was already drawn. Load scratch.
  const scratch = createCanvas(img.width, img.height);
  const sg = scratch.getContext('2d'); sg.drawImage(img, 0, 0);
  let darkAdded = 0, pinkAdded = 0;
  const x0=Math.max(0, cx-bw*0.6|0), x1=Math.min(img.width-1, cx+bw*0.6|0);
  const y0=Math.max(0, cy-bh*0.8|0), y1=Math.min(img.height-1, cy+bh*0.8|0);
  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const p1 = sg.getImageData(x,y,1,1).data;
      const p2 = ccx.getImageData(x,y,1,1).data;
      const l1 = 0.299*p1[0]+0.587*p1[1]+0.114*p1[2];
      const l2 = 0.299*p2[0]+0.587*p2[1]+0.114*p2[2];
      if (l1-l2>50 && l2<120) darkAdded++;
      // pink blush: reddish higher than both green/blue significantly vs original
      if ((p2[0] > p2[1]+40 && p2[0] > p2[2]+40) && !(p1[0] > p1[1]+40 && p1[0] > p1[2]+40)) pinkAdded++;
    }
  }
  console.log(`Blob[0] face area: NEW dark pixels (eyes/nose/mouth/ears): ${darkAdded} | NEW pink pixels (blush): ${pinkAdded}`);

  // Save PNG
  const bufOut = cCanvas.__nodeCanvas.toBuffer('image/png');
  fs.writeFileSync('/workspace/result_cloud_factory_debug.png', bufOut);
  console.log('Saved debug result. Size =', bufOut.length);
})().catch(e=>console.error('err:', e.message, e.stack));
