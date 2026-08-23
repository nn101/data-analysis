// Lightweight cloud debug: skip dataURL wait, use window-scoped draw directly.
const fs = require('fs');
const { createCanvas, loadImage, ImageData } = require('canvas');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {pretendToBeVisual:true});
const W = dom.window;
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

W.document.body.innerHTML = `
<div id="toast"></div><div id="stickerGrid"></div>
<canvas id="cloudCanvas"></canvas><canvas id="stickerLayer"></canvas>
<div id="cloudEmpty"></div>
<div id="stickerTools">
  <input id="scaleRange" type="range" value="100" /><span id="scaleVal"></span>
  <input id="rotRange" type="range" value="0" /><span id="rotVal"></span>
  <input id="opRange" type="range" value="100" /><span id="opVal"></span>
  <input id="strokeW" value="3" /><span id="strokeVal"></span>
  <div id="strokeColors"></div>
  <button id="delSticker"></button><button id="bringFront"></button><button id="sendBack"></button>
</div>
<div id="cloudStage"></div>
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
<button id="postDownloadAll"></button><div id="postSaveRow"></div><style></style>`;

for (const c of [...W.document.querySelectorAll('canvas')]) {
  let real = reg.get(c);
  if(!real){ real = createCanvas(300,150); reg.set(c,real); }
  const orig = c.getContext ? c.getContext.bind(c) : null;
  c.getContext = function(type,opts){ return String(type).toLowerCase()==='2d' ? real.getContext('2d',opts):orig?orig(type,opts):null; };
  Object.defineProperty(c,'width',{configurable:true,enumerable:true,get(){return real.width},set(v){return real.width=v}});
  Object.defineProperty(c,'height',{configurable:true,enumerable:true,get(){return real.height},set(v){return real.height=v}});
  c.__nodeCanvas = real;
}

// Evaluate app.js
let src = fs.readFileSync('/workspace/app.js','utf8');
src = src.replace(/^const /gm, 'var ');
src += `
; (function(){
  var _keys = ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne',
   'analyzeSourceVisualFacts','drawAbstractMarksFromFacts','pickCueTypeForBlob','kmeansQuantize',
   'pickSourceAccentFromPalette','drawArchiveMicrotype','pickStickerColorForCloud','drawStarMark',
   'mulberry32','seedFromImg','ccx','cloudCanvas','stickerLayer','cloudEmpty','cloudStage','bgImg',
   'cloudDrop','posts','PROMPT_LUTS','rgbToHsl','hslToRgb','stickerTools'];
  for(var _i=0;_i<_keys.length;_i++){ try { window[_keys[_i]] = eval(_keys[_i]); } catch(_e){} }
})();`;
try { W.eval(src); }
catch(e) { console.log('EVAL ERR:', e.message); process.exit(1); }

(async function(){
  const img = await loadImage('/workspace/test_clouds.png');
  console.log('loaded img:', img.width, img.height);
  // Explicit setup: set size, draw background
  const cCanvas = W.document.getElementById('cloudCanvas');
  cCanvas.width = img.width; cCanvas.height = img.height;
  const ccx = cCanvas.getContext('2d');
  ccx.drawImage(img, 0, 0);
  console.log('drew cloud background to ccx (corner pixel):', ccx.getImageData(0,0,1,1).data);

  // Run blob detection from node-side window functions
  console.time('pipeline');
  const bin = W.binarizeClouds(ccx, img.width, img.height);
  console.log('threshold:', bin.thr);
  const blobs = W.findBlobs(bin.mask, img.width, img.height, 0.004);
  console.log('blob count:', blobs.length);

  // Dump pixel BEFORE drawing cue face on blob[0]
  const b0 = blobs[0];
  const x0 = Math.max(0, (b0.cx - b0.bw*0.6)|0);
  const y0 = Math.max(0, (b0.cy - b0.bh*0.8)|0);
  const sw = Math.min(img.width-x0, (b0.bw*1.2)|0);
  const sh = Math.min(img.height-y0, (b0.bh*1.6)|0);
  const before = ccx.getImageData(x0,y0,sw,sh).data;
  let beforeDark = 0;
  for(let i=0;i<before.length;i+=4){
    const lum = 0.299*before[i]+0.587*before[i+1]+0.114*before[i+2];
    if(lum<120) beforeDark++;
  }

  // Set app.js internal variables via eval assignments to current ccx/cloudCanvas/bgImg (needed for pickStickerColorForCloud etc.)
  // Expose our objects through the JSDOM's window object so eval can see them directly
  W.__ccxRef = ccx;
  W.__cCanvasRef = cCanvas;
  W.__stickerLRef = W.document.getElementById('stickerLayer');
  W.__stageRef = W.document.getElementById('cloudStage');
  W.eval(`ccx = window.__ccxRef; cloudCanvas = window.__cCanvasRef; stickerLayer = window.__stickerLRef; cloudStage = window.__stageRef; cloudEmpty = document.getElementById('cloudEmpty');`);
  W.eval(`bgImg = {width:${img.width}, height:${img.height}, naturalWidth:${img.width}, naturalHeight:${img.height}};`);

  // Now draw
  for(let i=0;i<Math.min(5,blobs.length);i++){
    const cue = W.drawCueFaceOnBlob(blobs[i], i);
    console.log(`  blob[${i}] cue=`, cue, 'center=', blobs[i].cx.toFixed(0), ',', blobs[i].cy.toFixed(0));
  }
  console.timeEnd('pipeline');

  // After stats
  const after = ccx.getImageData(x0,y0,sw,sh).data;
  let afterDark = 0, afterPink = 0;
  for(let i=0;i<after.length;i+=4){
    const r=after[i],g=after[i+1],b=after[i+2];
    const lum = 0.299*r+0.587*g+0.114*b;
    if(lum<120) afterDark++;
    if(r>g+40 && r>b+40 && r>150 && g>60) afterPink++;
  }
  // Count delta vs before (ignore dark that was already there)
  let newDark = 0, newPink = 0;
  for(let i=0;i<after.length;i+=4){
    const r=after[i],g=after[i+1],b=after[i+2];
    const br=before[i],bg2=before[i+1],bb=before[i+2];
    const l1 = 0.299*br+0.587*bg2+0.114*bb;
    const l2 = 0.299*r+0.587*g+0.114*b;
    if(l2<120 && l1-l2>40) newDark++;
    const wasPink = br>bg2+40 && br>bb+40 && br>150 && bg2>60;
    const isPink  = r>g+40 && r>b+40 && r>150 && g>60;
    if(isPink && !wasPink) newPink++;
  }
  console.log('\n=== Results for blob[0] face area ===');
  console.log(`  Dark pixels before Q-face = ${beforeDark}, after = ${afterDark}, NEW (linework/eyes) = ${newDark}  →  ${newDark>200?'五官存在 ✓':'五官缺失 ✗'}`);
  console.log(`  New pink pixels (blush) = ${newPink}  →  ${newPink>50?'腮红存在 ✓':'腮红缺失 ✗'}`);
  console.log(`  Sample blob[0] center color after = `, ccx.getImageData((b0.cx)|0, (b0.cy)|0, 1, 1).data);

  // Save
  fs.writeFileSync('/workspace/result_cloud_factory_v2.png', cCanvas.__nodeCanvas.toBuffer('image/png'));
  console.log('\nSaved result_cloud_factory_v2.png');
})();
