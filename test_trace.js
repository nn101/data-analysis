// Trace pixel changes exactly
const fs = require('fs');
const { createCanvas, loadImage, ImageData } = require('canvas');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body>
<div id="toast"></div><div id="stickerGrid"></div>
<canvas id="cloudCanvas"></canvas><canvas id="stickerLayer"></canvas><div id="cloudEmpty"></div>
<div id="stickerTools">
  <input id="scaleRange" type="range" value="100" /><span id="scaleVal"></span>
  <input id="rotRange" type="range" value="0" /><span id="rotVal"></span>
  <input id="opRange" type="range" value="100" /><span id="opVal"></span>
  <input id="strokeW" value="3" /><span id="strokeVal"></span>
  <div id="strokeColors"></div><button id="delSticker"></button><button id="bringFront"></button><button id="sendBack"></button>
</div>
<div id="cloudStage"></div>
<div id="cloudDrop" class="dropzone"><input id="cloudFile" type="file"/></div>
<button id="cloudClear"></button><button id="cloudDownload"></button><button id="cloudReAnalyze"></button>
<div id="stickerGallery"></div>
<button class="chip is-active" data-cat="auto"></button>
<button class="chip" data-cat="animal"></button>
<button class="chip" data-cat="fairy"></button>
<button class="chip" data-cat="mix"></button>
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
<button id="postDownloadAll"></button><div id="postSaveRow"></div><style></style>
</body></html>`, {pretendToBeVisual:true});
const W = dom.window;
global.window = W;
global.document = W.document;
const origCreate = W.document.createElement.bind(W.document);
const reg = new WeakMap();
function hookCanvas(el){
  let real = reg.get(el);
  if(!real){ real = createCanvas(300,150); reg.set(el,real); }
  const orig = el.getContext ? el.getContext.bind(el) : null;
  el.getContext = function(type,opts){ return String(type).toLowerCase()==='2d' ? real.getContext('2d',opts):orig?orig(type,opts):null; };
  Object.defineProperty(el,'width',{configurable:true,enumerable:true,get(){return real.width},set(v){return real.width=v}});
  Object.defineProperty(el,'height',{configurable:true,enumerable:true,get(){return real.height},set(v){return real.height=v}});
  el.__nodeCanvas = real;
}
W.document.createElement = function(t){
  const el = origCreate(t);
  if(String(t).toLowerCase()==='canvas') hookCanvas(el);
  return el;
};
W.ImageData = ImageData;
W.requestAnimationFrame = fn => setTimeout(fn, 16);
for(const c of [...W.document.querySelectorAll('canvas')]) hookCanvas(c);

let src = fs.readFileSync('/workspace/app.js','utf8');
src = src.replace(/^const /gm, 'var ');
src += `
; (function(){
  var _keys = ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne',
   'analyzeSourceVisualFacts','drawAbstractMarksFromFacts','pickCueTypeForBlob','kmeansQuantize',
   'pickSourceAccentFromPalette','drawArchiveMicrotype','pickStickerColorForCloud','drawStarMark',
   'mulberry32','seedFromImg','ccx','cloudCanvas','stickerLayer','cloudEmpty','cloudStage','bgImg',
   'cueStyleHint'];
  for(var _i=0;_i<_keys.length;_i++){ try { window[_keys[_i]] = eval(_keys[_i]); } catch(_e){} }
})();`;
W.eval(src);

(async function(){
  const img = await loadImage('/workspace/test_clouds.png');
  const cCanvas = W.document.getElementById('cloudCanvas');
  cCanvas.width = img.width; cCanvas.height = img.height;
  const ccx = cCanvas.getContext('2d');
  ccx.drawImage(img, 0, 0);
  // Snapshot before Q features
  const before = Buffer.from(cCanvas.__nodeCanvas.toBuffer('image/png'));
  console.log('Before PNG bytes:', before.length);

  // Run autoAdapt explicitly with our objects
  // First, make sure ccx etc. are SAME objects as evaluated function closures use
  const script = W.eval(`
    (function(extCcx, extCanvas, extBgImg, extStickerLayer, extStage, extEmpty){
      ccx = extCcx;
      cloudCanvas = extCanvas;
      stickerLayer = extStickerLayer;
      cloudStage = extStage;
      cloudEmpty = extEmpty;
      bgImg = extBgImg;
      cueStyleHint = 'auto';
      try {
        const w = cloudCanvas.width, h = cloudCanvas.height;
        ccx.save(); ccx.setTransform(1,0,0,1,0,0); ccx.clearRect(0,0,w,h); ccx.drawImage(extBgImg,0,0,w,h); ccx.restore();
        const {mask} = binarizeClouds(ccx, w, h);
        const blobs = findBlobs(mask, w, h, 0.004);
        const N = Math.min(5, Math.max(1, Math.min(blobs.length, 2 + Math.floor(blobs.length/2))));
        const pick = blobs.slice(0, N);
        const logs = [];
        pick.forEach((b, i) => {
          const cue = pickCueTypeForBlob(b);
          logs.push({i, cue, cx:b.cx.toFixed(0), cy:b.cy.toFixed(0), bw:b.bw, bh:b.bh});
          drawCueFaceOnBlob(b, i);
        });
        // Sanity: sample blob 0 center's pixel
        const b0 = pick[0];
        const sample = b0 ? ccx.getImageData((b0.cx)|0, (b0.cy)|0, 1, 1).data : null;
        return {status: 'ok', pickCount: pick.length, logs, sample};
      } catch(e) {
        return {err: String(e), stack: e.stack ? e.stack.slice(0,500):''};
      }
    })
  `);
  const res = script(
    ccx, cCanvas, img,
    W.document.getElementById('stickerLayer'),
    W.document.getElementById('cloudStage'),
    W.document.getElementById('cloudEmpty')
  );
  console.log('\nPipeline result:', JSON.stringify(res, null, 2));

  const after = Buffer.from(cCanvas.__nodeCanvas.toBuffer('image/png'));
  console.log('\nAfter PNG bytes:', after.length, 'changed?', before.compare(after) !== 0);

  // Count pixel deltas
  const a1 = cCanvas.getContext('2d').getImageData(0,0,img.width,img.height).data;
  const orig = createCanvas(img.width, img.height);
  const og = orig.getContext('2d'); og.drawImage(img, 0, 0);
  const d1 = og.getImageData(0,0,img.width,img.height).data;
  let delta = 0, darkDelta = 0, pinkDelta = 0;
  for(let i=0;i<a1.length;i+=4){
    if(a1[i]!==d1[i] || a1[i+1]!==d1[i+1] || a1[i+2]!==d1[i+2]){
      delta++;
      const r=a1[i],g=a1[i+1],b=a1[i+2];
      const lum=0.299*r+0.587*g+0.114*b;
      const oR=d1[i],oG=d1[i+1],oB=d1[i+2];
      const oLum=0.299*oR+0.587*oG+0.114*oB;
      if(oLum>220 && lum<130) darkDelta++;
      if(oLum>220 && r>g+30 && r>b+30 && g>150 && (r-oR>15||oG-g>5)) pinkDelta++;
    }
  }
  console.log('\nTotal changed pixel count:', delta);
  console.log('云像素上 暗线新增:', darkDelta, '粉色新增:', pinkDelta);
  fs.writeFileSync('/workspace/result_cloud_factory.png', after);
})().catch(e=>console.error('ERR:', e.message, e.stack));
