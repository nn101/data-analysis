// Minimal debug: run explicit pipeline and dump before/after pixel data. NO JSDOM html parsing shenanigans.
const fs = require('fs');
const { createCanvas, loadImage, ImageData } = require('canvas');

// Create jsdom with ONLY bare-minimum so app.js initialization doesn't touch any real elements,
// we'll manually run the needed functions.
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {pretendToBeVisual:true});
W = dom.window;
global.window = W;
global.document = W.document;

const origCreate = W.document.createElement.bind(W.document);
const reg = new WeakMap();
W.document.createElement = function(t){
  const el = origCreate(t);
  if(String(t).toLowerCase()==='canvas'){
    let real = reg.get(el);
    if(!real){ real = createCanvas(300,150); reg.set(el,real); }
    const orig = el.getContext.bind(el);
    el.getContext = function(type,opts){ return String(type).toLowerCase()==='2d' ? real.getContext('2d',opts):orig(type,opts); };
    Object.defineProperty(el,'width',{configurable:true,enumerable:true,get(){return real.width},set(v){return real.width=v}});
    Object.defineProperty(el,'height',{configurable:true,enumerable:true,get(){return real.height},set(v){return real.height=v}});
    el.__nodeCanvas = real;
  }
  return el;
};
W.ImageData = ImageData;
W.requestAnimationFrame = fn => setTimeout(fn, 16);
W.cancelAnimationFrame = id => clearTimeout(id);

// Before loading app.js, inject stub elements that app.js queries immediately
const stubHTML = `
<div id="toast"></div>
<div id="stickerGrid"></div>
<canvas id="cloudCanvas"></canvas>
<canvas id="stickerLayer"></canvas>
<div id="cloudEmpty"></div>
<div id="stickerTools">
  <input id="scaleRange" type="range" min="10" max="500" value="100" /><span id="scaleVal"></span>
  <input id="rotRange" type="range" min="-180" max="180" value="0" /><span id="rotVal"></span>
  <input id="opRange" type="range" min="10" max="100" value="100" /><span id="opVal"></span>
  <input id="strokeW" min="1" max="10" value="3" /><span id="strokeVal"></span>
  <div id="strokeColors"></div>
  <button id="delSticker"></button><button id="bringFront"></button><button id="sendBack"></button>
</div>
<div id="cloudStage" style="position:relative"></div>
<div id="cloudDrop" class="dropzone"><input id="cloudFile" type="file"/></div>
<button id="cloudClear"></button><button id="cloudDownload"></button>
<div id="stickerGallery"></div>
<div class="chip" data-sticker-group="animal"></div>
<div class="chip" data-sticker-group="fairy"></div>
<div class="chip" data-sticker-group="mix"></div>
<div class="tab is-active" data-target="cloudTab"></div>
<div class="tab" data-target="postTab"></div>
<div id="cloudTab" class="panel is-active"></div>
<div id="postTab" class="panel"></div>
<div id="postThumbs"></div><span id="postCount">0</span>
<div id="postDrop" class="dropzone"><input id="postFile" type="file" multiple/></div>
<input type="radio" name="postStyle" value="abstract-editorial" checked />
<input type="radio" name="postStyle" value="zine" />
<input type="radio" name="postStyle" value="prompt" />
<div id="promptCard" hidden>
  <input id="promptInput" value="" />
  <div id="promptColors"><span class="swatch is-active" data-c="#2E2C28"></span></div>
  <select id="promptFont"><option></option></select>
  <select id="promptPos"><option></option></select>
</div>
<button id="postProcess"></button><button id="postClear"></button><button id="postDemo"></button>
<button id="postDownloadAll"></button>
<div id="postSaveRow"></div>
<style></style>`;
W.document.body.innerHTML = stubHTML;

// Ensure retroactively apply canvas hook
for (const c of [...W.document.querySelectorAll('canvas')]) {
  let real = reg.get(c);
  if(!real){ real = createCanvas(300,150); reg.set(c,real); }
  const orig = c.getContext.bind(c);
  c.getContext = function(type,opts){ return String(type).toLowerCase()==='2d' ? real.getContext('2d',opts):orig?orig(type,opts):null; };
  Object.defineProperty(c,'width',{configurable:true,enumerable:true,get(){return real.width},set(v){return real.width=v}});
  Object.defineProperty(c,'height',{configurable:true,enumerable:true,get(){return real.height},set(v){return real.height=v}});
  c.__nodeCanvas = real;
}

// Load & evaluate transformed app.js
let src = fs.readFileSync('/workspace/app.js','utf8');
// Replace top-level const → var AND add error logging inside critical functions
src = src.replace(/^const /gm, 'var ');
// Export everything to window at end
src += `
; (function(){
  var _keys = ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne',
   'analyzeSourceVisualFacts','drawAbstractMarksFromFacts','pickCueTypeForBlob','kmeansQuantize',
   'pickSourceAccentFromPalette','drawArchiveMicrotype','pickStickerColorForCloud','drawStarMark',
   'mulberry32','seedFromImg','ccx','cloudCanvas','stickerLayer','cloudEmpty','cloudStage','bgImg',
   'cloudDrop','posts','matchStickerByBlob','applySemanticLUTInRect','PROMPT_LUTS','rgbToHsl','hslToRgb',
   'drawPromptCaption','renderThumbs','postThumbs','postCount','stickerTools','clearAllStickers',
   'addSticker','handleCloudFiles','fitStage','readAsDataURL','loadImg','toast'];
  for(var _i=0;_i<_keys.length;_i++){
    try { window[_keys[_i]] = eval(_keys[_i]); } catch(_e){}
  }
})();`;
try {
  W.eval(src);
  console.log('app.js evaluated successfully');
} catch(e){
  console.log('APP.JS EVAL ERROR:', e.message, '\nStack:\n', e.stack.split('\n').slice(0,12).join('\n'));
  process.exit(1);
}

console.log('\nKey functions after eval:');
for (const k of ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne','pickStickerColorForCloud']) {
  console.log(`  ${k}: ${typeof W[k]}`);
}

(async function main(){
  const img = await loadImage('/workspace/test_clouds.png');
  console.log('\nLoaded cloud test image', img.width, img.height);

  // Get canvas & context
  const cCanvas = W.cloudCanvas;
  console.log('cloudCanvas type:', Object.prototype.toString.call(cCanvas).slice(8,-1), 'w/h before:', cCanvas.width, cCanvas.height);
  cCanvas.width = img.width;
  cCanvas.height = img.height;
  const ccx = cCanvas.getContext('2d');
  console.log('ccx type:', Object.prototype.toString.call(ccx).slice(8,-1));
  ccx.drawImage(img, 0, 0);
  console.log('After drawImage → corner [0,0]:', ccx.getImageData(0,0,1,1).data);
  console.log('cloud blob-ish area pixel (corresponding to ~white cloud top area ~ 200, 200):', ccx.getImageData(200,200,1,1).data);

  // Set app.js bgImg to an image element with same pixels
  const htmlImg = W.document.createElement('img');
  htmlImg.src = 'data:image/png;base64,'+fs.readFileSync('/workspace/test_clouds.png').toString('base64');
  await new Promise(resolve => {
    const check = ()=>{ if(htmlImg.naturalWidth>0) resolve(); else setTimeout(check, 30); };
    setTimeout(check, 30);
  });
  console.log('htmlImg loaded:', htmlImg.naturalWidth, 'x', htmlImg.naturalHeight);
  // Attach as bgImg to window scope of app.js (app.js uses global bgImg)
  W.eval(`bgImg = arguments[0];`, [htmlImg]); // may not work, use explicit:
  W.eval(`
    try {
      var _newimg = (function(){ 
        var i = new Image();
        i.src = '${htmlImg.src}';
        return i;
      })();
      bgImg = _newimg;
      'bgImg set. waiting...';
    } catch(e) { String(e); }
  `);
  // Poll until bgImg is ready
  for(let i=0;i<20;i++){
    const ready = W.eval(`typeof bgImg !== 'undefined' && bgImg && bgImg.complete ? bgImg.naturalWidth : 0`);
    if(ready > 0){ console.log('app bgImg ready with w=', ready); break; }
    await new Promise(r => setTimeout(r, 100));
  }

  // Explicitly re-set app.js's ccx: create an assignment inside eval to our ccx object? No, we need to reference same
  // canvas as the one we drew on. ccx in app.js = document.getElementById('cloudCanvas').getContext('2d'),
  // which we hooked and already drew to. So they're actually pointing to the SAME node-canvas context,
  // except width/height are synced via defineProperty.
  // Let's verify by re-drawing with the same getContext call.
  const ccx2 = W.document.getElementById('cloudCanvas').getContext('2d');
  console.log('ccx === ccx2:', ccx === ccx2);
  console.log('ccx.canvas.nodeCanvas width from app.js getContext:', ccx2.canvas.width);

  // Check the top-left pixel again via ccx2 (same context returned by hook? or new?)
  console.log('corner via app ccx2:', ccx2.getImageData(0,0,1,1).data);
  console.log('cloud 200,200 via ccx2:', ccx2.getImageData(200,200,1,1).data);

  // Now run binarize → findBlobs → drawCueFaceOnBlob step by step in app context
  const step1 = W.eval(`
    (function(){
      try {
        const w = cloudCanvas.width, h = cloudCanvas.height;
        const bin = binarizeClouds(ccx, w, h);
        const blobs = findBlobs(bin.mask, w, h, 0.004);
        return { bin_thr: bin.thr, blobs_len: blobs.length, blob0: blobs[0] ? {cx:+blobs[0].cx.toFixed(1),cy:+blobs[0].cy.toFixed(1),bw:blobs[0].bw,bh:blobs[0].bh,cue:pickCueTypeForBlob(blobs[0])} : null };
      } catch(e) { return {err: String(e), stack: e.stack ? e.stack.slice(0,300):''}; }
    })();
  `);
  console.log('\nBinarize + findBlobs inside app.js scope:', JSON.stringify(step1, null, 2));

  // Now actually draw faces and verify by comparing pixel before/after snapshot
  const beforeSnap = W.eval(`
    (function(){
      const w = cloudCanvas.width, h = cloudCanvas.height;
      // Record pixels in a square around blob 0 center (if any)
      const bin = binarizeClouds(ccx, w, h);
      const blobs = findBlobs(bin.mask, w, h, 0.004);
      if(!blobs.length) return {noBlobs:true};
      const b = blobs[0];
      const x0 = Math.max(0, (b.cx - b.bw*0.6)|0);
      const y0 = Math.max(0, (b.cy - b.bh*0.8)|0);
      const sw = Math.min(w-x0, (b.bw*1.2)|0);
      const sh = Math.min(h-y0, (b.bh*1.6)|0);
      const imgD = ccx.getImageData(x0,y0,sw,sh);
      const arr = Array.from(imgD.data);
      // hash to confirm after
      let hash = 0;
      for(let i=0;i<arr.length;i+=4){ hash = (hash*31 + arr[i]*3 + arr[i+1]*5 + arr[i+2]*7) & 0xffffffff; }
      return {x0,y0,sw,sh,length:arr.length, hash, blob0Cue: pickCueTypeForBlob(b), bw:b.bw, bh:b.bh};
    })();
  `);
  console.log('\nBefore draw snapshot:', JSON.stringify(beforeSnap, null, 2));

  const drawRes = W.eval(`
    (function(){
      try {
        const w = cloudCanvas.width, h = cloudCanvas.height;
        const bin = binarizeClouds(ccx, w, h);
        const blobs = findBlobs(bin.mask, w, h, 0.004);
        const pick = blobs.slice(0,5);
        const details = [];
        pick.forEach((b,idx)=>{
          const cue = drawCueFaceOnBlob(b, idx);
          details.push({idx, cue, cx:b.cx.toFixed(0), cy:b.cy.toFixed(0), bw:b.bw, bh:b.bh});
        });
        return {ok:true, picked: pick.length, details};
      } catch(e) { return {err: String(e), stack: e.stack ? e.stack.slice(0,400):''}; }
    })();
  `);
  console.log('\ndrawCueFaceOnBlob result:', JSON.stringify(drawRes, null, 2));

  // After snapshot (same region)
  const afterSnap = W.eval(`
    (function(){
      const w = cloudCanvas.width, h = cloudCanvas.height;
      const x0 = ${beforeSnap.x0|0}, y0 = ${beforeSnap.y0|0}, sw = ${beforeSnap.sw|0}, sh = ${beforeSnap.sh|0};
      const imgD = ccx.getImageData(x0,y0,sw,sh);
      const arr = Array.from(imgD.data);
      // count dark+pink NEW pixels vs before hash we don't have here; just return full dump count stats
      let darkCount = 0, pinkCount = 0;
      for(let i=0;i<arr.length;i+=4){
        const r=arr[i],g=arr[i+1],b=arr[i+2];
        const lum = 0.299*r+0.587*g+0.114*b;
        if(lum < 120) darkCount++;
        if(r>g+40 && r>b+40 && r>150 && g>60) pinkCount++;
      }
      let hash = 0;
      for(let i=0;i<arr.length;i+=4){ hash = (hash*31 + arr[i]*3 + arr[i+1]*5 + arr[i+2]*7) & 0xffffffff; }
      return {hash, darkCount, pinkCount, totalPixels: arr.length/4, sample: [arr[0],arr[1],arr[2],arr[3], arr[arr.length-4],arr[arr.length-3],arr[arr.length-2],arr[arr.length-1]]};
    })();
  `);
  console.log('\nAfter draw snapshot:', JSON.stringify(afterSnap, null, 2));
  console.log('\nBefore hash =', beforeSnap.hash, '  After hash =', afterSnap.hash, '   Changed?', beforeSnap.hash !== afterSnap.hash);
  console.log('After: dark pixels =', afterSnap.darkCount, `(${afterSnap.totalPixels} total)`);

  // Save image
  const realCanvas = cCanvas.__nodeCanvas;
  fs.writeFileSync('/workspace/result_cloud_factory_v2.png', realCanvas.toBuffer('image/png'));
  console.log('\nSaved canvas to /workspace/result_cloud_factory_v2.png, bytes=', realCanvas.toBuffer('image/png').length);
})().catch(e=>console.error('main err:', e.message, e.stack));
