const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, ImageData, Canvas } = require('canvas');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
  <div id="toast" class="toast"></div>
  <!-- tabs + panels -->
  <div class="tab is-active" data-target="cloudTab"></div>
  <div class="tab" data-target="postTab"></div>
  <!-- CLOUD TAB -->
  <div id="cloudTab" class="panel is-active">
    <div id="cloudDrop" class="dropzone">
      <input id="cloudFile" type="file" accept="image/*" />
    </div>
    <div id="cloudStage" style="position:relative">
      <canvas id="cloudCanvas"></canvas>
      <canvas id="stickerLayer" style="position:absolute"></canvas>
      <img id="bgImg" />
      <div id="cloudEmpty"></div>
    </div>
    <!-- sticker picker -->
    <div data-sticker-group="animal" class="chip is-active"></div>
    <div data-sticker-group="fairy" class="chip"></div>
    <div data-sticker-group="mix" class="chip"></div>
    <div id="stickerGrid"></div>
    <!-- sticker tools -->
    <div id="stickerTools">
      <input id="scaleRange" type="range" min="10" max="500" value="100" />
      <span id="scaleVal">100%</span>
      <input id="rotRange" type="range" min="-180" max="180" value="0" />
      <span id="rotVal">0°</span>
      <input id="opRange" type="range" min="10" max="100" value="100" />
      <span id="opVal">100%</span>
      <input id="strokeW" type="number" min="1" max="10" value="3" />
      <span id="strokeVal">3</span>
      <div id="strokeColors"></div>
      <button id="delSticker"></button>
      <button id="bringFront"></button>
      <button id="sendBack"></button>
    </div>
    <button id="cloudClear">清空画布</button>
    <button id="cloudDownload">⬇ 保存作品</button>
    <div id="stickerGallery"></div>
  </div>
  <!-- POST TAB -->
  <div id="postTab" class="panel">
    <div id="postDrop" class="dropzone">
      <input id="postFile" type="file" accept="image/*" multiple />
    </div>
    <div>
      <label><input type="radio" name="postStyle" value="abstract-editorial" checked /></label>
      <label><input type="radio" name="postStyle" value="zine" /></label>
      <label><input type="radio" name="postStyle" value="prompt" /></label>
    </div>
    <div id="promptCard" hidden>
      <input id="promptInput" value="" />
      <div id="promptColors"><span class="swatch is-active" data-c="#2E2C28"></span></div>
      <select id="promptFont"><option value="default"></option></select>
      <select id="promptPos"><option value="bottom"></option></select>
    </div>
    <div id="postThumbs"></div>
    <span id="postCount">0</span>
    <button id="postProcess"></button>
    <button id="postClear"></button>
    <button id="postDemo"></button>
    <div id="postSaveRow" style="display:none">
      <button id="postDownloadAll"></button>
    </div>
  </div>
  <style>.toast,.dropzone{}</style>
</body></html>`, {pretendToBeVisual: true, runScripts: 'dangerously', resources: 'usable'});

global.window = dom.window;
global.document = dom.window.document;

const origCreate = dom.window.document.createElement.bind(dom.window.document);
const canvasRegistry = new WeakMap();
const getOrCreateNodeCanvas = function(el){
  let real = canvasRegistry.get(el);
  if(!real){
    real = createCanvas(300, 150);
    canvasRegistry.set(el, real);
  }
  return real;
};
dom.window.document.createElement = function(tag){
  const el = origCreate(tag);
  if (tag && typeof tag === 'string' && tag.toLowerCase() === 'canvas') {
    const real = getOrCreateNodeCanvas(el);
    const origGetContext = el.getContext.bind(el);
    el.getContext = function(type, opts){
      if (String(type).toLowerCase() === '2d') {
        return real.getContext('2d', opts);
      }
      return origGetContext(type, opts);
    };
    Object.defineProperty(el, 'width', {
      configurable: true, enumerable: true,
      get(){ return real.width; },
      set(v){ return (real.width = v); }
    });
    Object.defineProperty(el, 'height', {
      configurable: true, enumerable: true,
      get(){ return real.height; },
      set(v){ return (real.height = v); }
    });
    el.toDataURL = function(type, opts){ return real.toDataURL(type, opts); };
    el.toBlob = function(cb, type, q){ cb(null); };
    el.__nodeCanvas = real;
  }
  return el;
};
dom.window.ImageData = ImageData;
dom.window.HTMLCanvasElement = function(){};

// Retroactive: patch canvases that were ALREADY created during JSDOM parse (before hook)
W = dom.window;
for (const preCanvas of [...W.document.querySelectorAll('canvas')]) {
  const real = getOrCreateNodeCanvas(preCanvas);
  // Copy hook behavior
  const origGetContext = preCanvas.getContext ? preCanvas.getContext.bind(preCanvas) : null;
  preCanvas.getContext = function(type, opts){
    if(String(type).toLowerCase() === '2d') return real.getContext('2d', opts);
    return origGetContext ? origGetContext(type, opts) : null;
  };
  Object.defineProperty(preCanvas, 'width', {configurable:true, enumerable:true,
    get(){ return real.width; }, set(v){ return (real.width = v); }});
  Object.defineProperty(preCanvas, 'height', {configurable:true, enumerable:true,
    get(){ return real.height; }, set(v){ return (real.height = v); }});
  preCanvas.__nodeCanvas = real;
  preCanvas.toDataURL = function(type, opts){ return real.toDataURL(type, opts); };
}
// Run app.js code using eval in window context (assign functions to window)
const appSrc = fs.readFileSync('/workspace/app.js', 'utf8');
// Replace top-level `const` declarations into `var` so they attach to eval's global scope,
// and ensure variables live on window (we eval transformed code with explicit window assignments at end).
let transformed = appSrc.replace(/^const /gm, 'var ');
transformed += `
; (function(){
  ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne',
   'analyzeSourceVisualFacts','drawAbstractMarksFromFacts','pickCueTypeForBlob','kmeansQuantize',
   'pickSourceAccentFromPalette','drawArchiveMicrotype','pickStickerColorForCloud','drawStarMark',
   'mulberry32','seedFromImg','ccx','cloudCanvas','stickerLayer','cloudEmpty','cloudStage','bgImg',
   'cloudDrop','postFile','cloudFile','posts','STICKERS','matchStickerByBlob','applySemanticLUTInRect',
   'PROMPT_LUTS','rgbToHsl','hslToRgb','drawPromptCaption','renderThumbs','postThumbs','postCount'
  ].forEach(k => { try { window[k] = eval(k); } catch(e){} });
})();
`;
try {
  const rep = W.eval(`(function(){ ${transformed}; return {binarizeClouds:typeof window.binarizeClouds, findBlobs:typeof window.findBlobs, drawCueFaceOnBlob:typeof window.drawCueFaceOnBlob, autoAdaptCloudStickers:typeof window.autoAdaptCloudStickers, processOne:typeof window.processOne, analyzeSourceVisualFacts:typeof window.analyzeSourceVisualFacts, pickCueTypeForBlob:typeof window.pickCueTypeForBlob}; })();`);
  console.log('Eval result (on window):', JSON.stringify(rep));
} catch(e) {
  console.log('eval ERR:', e.message, '\nStack:\n', e.stack.split('\n').slice(0,10).join('\n'));
}

// Aliases from window for convenience
const fns = ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne','analyzeSourceVisualFacts','drawAbstractMarksFromFacts','pickCueTypeForBlob','kmeansQuantize','pickSourceAccentFromPalette','drawArchiveMicrotype','pickStickerColorForCloud','drawStarMark','mulberry32','seedFromImg'];
console.log('\nWindow function status:');
const FN = {};
for(const f of fns){ FN[f] = W[f]; console.log(`  ${f}: ${typeof FN[f] === 'function' ? 'OK ✓' : 'MISSING ✗'}`); }

(async function run(){
  // ====== TEST 1 ======
  console.log('\n==== TEST 1: Cloud Factory ====');
  const img = await loadImage('/workspace/test_clouds.png');
  console.log('Cloud test image:', img.width, 'x', img.height);
  const cCanvas = W.document.getElementById('cloudCanvas');
  cCanvas.width = img.width; cCanvas.height = img.height;
  const ccx = cCanvas.getContext('2d');
  ccx.drawImage(img, 0, 0);
  W.bgImg = img;
  W.ccx = ccx;
  // Set stickerLayer too (needed by autoAdaptCloudStickers for clearAllStickers)
  W.stickerLayer = W.document.getElementById('stickerLayerWrap');
  try { W.cloudEmpty = W.document.getElementById('cloudEmpty'); } catch(e){}
  // fitStage would normally set these up, but we can mock
  W.cloudStage = W.document.getElementById('cloudStage');

  const bin = W.binarizeClouds(ccx, img.width, img.height);
  console.log('  binarize: threshold', bin.thr);
  const blobs = W.findBlobs(bin.mask, bin.w, bin.h, 0.005);
  console.log('  blobs found:', blobs.length);
  blobs.slice(0,8).forEach((b,i)=>console.log(`    [${i}] area=${b.area} bbox=${b.bw}x${b.bh} fill=${b.fill.toFixed(2)} ratio=${b.ratio.toFixed(2)} cue=${W.pickCueTypeForBlob(b)}`));

  try {
    W.autoAdaptCloudStickers();
    console.log('  autoAdaptCloudStickers() called successfully');
  } catch(e){
    console.log('  autoAdaptCloudStickers ERR:', e.message);
    console.log(e.stack.split('\n').slice(0,5).join('\n'));
  }

  const real = cCanvas.__nodeCanvas || cCanvas.getContext('2d').canvas || cCanvas;
  // node-canvas 2.x: 2d context exposes its real canvas via .canvas (in our hook it should be node canvas)
  let buf;
  try { buf = real.toBuffer('image/png'); }
  catch(e){
    // Try context's backing canvas
    const g = cCanvas.getContext('2d');
    buf = (g.canvas.toBuffer ? g.canvas : createCanvas(cCanvas.width, cCanvas.height)).toBuffer('image/png');
  }
  fs.writeFileSync('/workspace/result_cloud_factory.png', buf);
  console.log('  saved /workspace/result_cloud_factory.png (' + buf.length + ' bytes)');

  // ====== TEST 2 ======
  console.log('\n==== TEST 2: Journey Post Office (上下拼接) ====');
  const img2 = await loadImage('/workspace/test_travel.jpg');
  console.log('  travel photo:', img2.width, 'x', img2.height);
  const post = { id:'t1', src:'/workspace/test_travel.jpg', img: img2, processed: false };
  try {
    await W.processOne(post);
    console.log('  processOne() OK. processed=', post.processed);
    console.log('  output canvas:', post.canvas.width, 'x', post.canvas.height);
  } catch(e){
    console.log('  processOne ERR:', e.message);
    console.log(e.stack.split('\n').slice(0,10).join('\n'));
  }
  if(post.canvas){
    const gctx = post.canvas.getContext('2d');
    const real2 = post.canvas.__nodeCanvas || gctx.canvas || post.canvas;
    const g = real2.getContext ? real2.getContext('2d') : gctx;
    const CW = real2.width, CH = real2.height;
    const upperH = Math.round(CW * (img2.height/img2.width));
    const DIV = 2;
    const lowerH = CH - upperH - DIV;
    console.log(`  layout: upperH=${upperH} divider=${DIV} lowerH=${lowerH}  CH=${CH}`);

    // Ivory bg check
    const pxCenter = g.getImageData(CW/2, upperH + DIV + lowerH/2, 1, 1).data;
    console.log(`  lower-center pixel: rgb(${pxCenter[0]},${pxCenter[1]},${pxCenter[2]})  expected ~(243,240,232)`);
    console.log(`    ivory? ${Math.abs(pxCenter[0]-243)<20 && Math.abs(pxCenter[1]-240)<20 && Math.abs(pxCenter[2]-232)<20 ? 'YES ✓' : 'NO'}`);

    // Top pixel vs original (upper photo must be unmodified)
    const scratch = createCanvas(img2.width, img2.height);
    const sg = scratch.getContext('2d'); sg.drawImage(img2, 0, 0);
    const origCorner = sg.getImageData(0,0,1,1).data;
    const upperCorner = g.getImageData(0,0,1,1).data;
    const diff = Math.hypot(upperCorner[0]-origCorner[0], upperCorner[1]-origCorner[1], upperCorner[2]-origCorner[2]);
    console.log(`  upper-left corner original vs processed diff=${diff.toFixed(2)}`);
    console.log(`    upper area is original (no re-draw/filter): ${diff < 3.0 ? 'YES ✓' : 'NO — image was modified!'}`);

    // Count sampled unique colors in lower to confirm marks exist
    const smp = g.getImageData(0, upperH+DIV+10, CW, Math.max(5, lowerH-20));
    const sd = smp.data;
    let max = 0;
    const uniq = new Set();
    for(let i=0;i<sd.length;i+=40){
      const key = `${sd[i]},${sd[i+1]},${sd[i+2]}`;
      uniq.add(key);
      if (uniq.size > (max=400)) break;
    }
    console.log(`  lower panel: unique sampled colors=${uniq.size} (abstract marks have variety)`);
    console.log(`    abstract-marks exist? ${uniq.size>60 ? 'YES ✓' : 'weak/missing'}`);

    // Microtype ink check: bottom 12% scan for ink pixels
    const bottomH = Math.max(20, Math.round(CH*0.12));
    const bottom = g.getImageData(0, CH-bottomH, CW, bottomH);
    const bd = bottom.data;
    let inkCount = 0;
    for(let i=0;i<bd.length;i+=4){
      if(bd[i]<80 && bd[i+1]<80 && bd[i+2]<80) inkCount++;
    }
    console.log(`  bottom 12% ink-pixel count=${inkCount}  (microtype text count)`);
    console.log(`    archive microtype present? ${inkCount>80 ? 'YES ✓' : 'NO'}`);

    let buf2;
    try { buf2 = real2.toBuffer('image/png'); }
    catch(e){ buf2 = (gctx.canvas.toBuffer? gctx.canvas : createCanvas(CW, CH)).toBuffer('image/png'); }
    fs.writeFileSync('/workspace/result_post_office.png', buf2);
    console.log('  saved /workspace/result_post_office.png (' + buf2.length + ' bytes)');
  }
  console.log('\n==== TEST COMPLETE ====');
})().catch(e=>console.error('test suite err:', e.message, e.stack));
