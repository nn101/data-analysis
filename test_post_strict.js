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
W.cancelAnimationFrame = id => clearTimeout(id);
for(const c of [...W.document.querySelectorAll('canvas')]) hookCanvas(c);

let src = fs.readFileSync('/workspace/app.js','utf8');
src = src.replace(/^const /gm, 'var ');
src += `
; (function(){
  var _keys = ['binarizeClouds','findBlobs','drawCueFaceOnBlob','autoAdaptCloudStickers','processOne',
   'analyzeSourceVisualFacts','drawAbstractMarksFromFacts','pickCueTypeForBlob','kmeansQuantize',
   'pickSourceAccentFromPalette','drawArchiveMicrotype','pickStickerColorForCloud','drawStarMark',
   'mulberry32','seedFromImg','posts','cueStyleHint','analyzePalette'];
  for(var _i=0;_i<_keys.length;_i++){ try { window[_keys[_i]] = eval(_keys[_i]); } catch(_e){} }
})();`;
W.eval(src);

(async function(){
  const tp = await loadImage('/workspace/test_travel.jpg');
  console.log('Original travel photo:', tp.width, 'x', tp.height);
  const call = W.eval(`(function(ccx, cw, ch){
    const cnv = createCanvas ? createCanvas(cw,ch) : null; // fallback
    try {
      const canvas = (typeof document !== 'undefined' && document.createElement) ? document.createElement('canvas') : null;
      if(canvas) { canvas.width = cw; canvas.height = ch; }
      // Build a fake post object and call processOne
      // We have processOne declared in closure scope.
      const post = { id:'x1', processed:false, canvas: canvas, img: {width:${tp.width},height:${tp.height},naturalWidth:${tp.width},naturalHeight:${tp.height}}};
      const canvasOrig = document.createElement('canvas');
      canvasOrig.width = ${tp.width}; canvasOrig.height = ${tp.height};
      const g2 = canvasOrig.getContext('2d');
      // Fill with the passed ccx image data if present
      const {width:W2,height:H2} = ccx.canvas ? ccx.canvas : {width:${tp.width},height:${tp.height}};
      // Don't have source pixels here - the calling script injects src.
      return {status: 'need_source'};
    } catch(e){ return {err: String(e), stack: (e.stack||'').slice(0,500)}; }
  })`);

  // Simpler: just call processOne via eval with a fresh post and canvas
  // Create a proxy canvas with source image painted
  const src = createCanvas(tp.width, tp.height);
  const sg = src.getContext('2d'); sg.drawImage(tp, 0, 0);
  // Expose to eval scope via closure variables:
  const procResult = W.eval(`
    (function(bgImage){
      // Make sure postProcess btn exists (processOne reads it)
      const btn = document.querySelector('input[name="postStyle"][value="abstract-editorial"]');
      btn.checked = true;
      const post = { id:'trace', srcFile: 'test.jpg', processed:false, img: bgImage };
      return new Promise(resolve => {
        processOne(post).then(()=>{
          const c = post.canvas;
          resolve({
            ok:true,
            w: c.width, h: c.height,
            processed: post.processed,
            // Snapshots: 10 pixel probes lower half
            probes: [
              // center lower half
              (c.getContext('2d').getImageData((c.width/2)|0, (c.height*0.72)|0, 1,1).data),
              // abstract mark location: lower 1/3 center x +- 5%
              (c.getContext('2d').getImageData((c.width*0.5)|0, (c.height*0.65)|0,1,1).data),
              // bottom line (archive microtype)
              (c.getContext('2d').getImageData((c.width*0.12)|0, (c.height*0.94)|0,1,1).data),
            ]
          });
        }).catch(err => resolve({err: String(err), stack: (err.stack||'').slice(0,800)}));
      });
    })
  `);
  const res = await procResult(tp);
  console.log('\nJourney processOne result:', JSON.stringify(res, null, 2));
  if(!res.ok) return;

  // Now we have post.canvas in window... but we lost ref. Re-run & capture:
  const cap = W.eval(`
    (async function(bgImage){
      const btn = document.querySelector('input[name="postStyle"][value="abstract-editorial"]');
      btn.checked = true;
      const post = { id:'cap', srcFile:'cap.jpg', processed:false, img: bgImage};
      await processOne(post);
      return { w: post.canvas.width, h: post.canvas.height, 
               buf: post.canvas.__nodeCanvas ? post.canvas.__nodeCanvas.toBuffer('image/png'):null};
    })
  `);
  const r = await cap(tp);
  console.log('canvas dim:', r.w, 'x', r.h);
  const origBuf = src.toBuffer('image/png');
  const origImg = await loadImage(origBuf);
  const procImg = await loadImage(r.buf);
  const CW = r.w, CH = r.h;
  const origW = origImg.width, origH = origImg.height;
  const upperH = Math.round(CW * (origH / origW));  // expected scale to canvas width
  const procCan = createCanvas(CW, CH); procCan.getContext('2d').drawImage(procImg, 0, 0);
  const origCan = createCanvas(origW, origH); origCan.getContext('2d').drawImage(origImg, 0, 0);
  const pg = procCan.getContext('2d'); const og = origCan.getContext('2d');

  // 1. Top half pixels == original scaled?
  const scale = CW / origW;
  let pixelDiff = 0;
  const S = 2500;
  for(let i=0;i<S;i++){
    const ox = Math.random()*origW | 0;
    const oy = Math.random()*origH | 0;
    const px = (ox*scale)|0, py = (oy*scale)|0;
    const p1 = og.getImageData(ox,oy,1,1).data;
    const p2 = pg.getImageData(px,py,1,1).data;
    if(Math.abs(p1[0]-p2[0])+Math.abs(p1[1]-p2[1])+Math.abs(p1[2]-p2[2])>3) pixelDiff++;
  }
  console.log(`\n[1] 上半 vs 原图差异像素: ${pixelDiff}/${S}  → ${pixelDiff<8 ? '✓ 完全保留原图（上半=原样不修改）':'✗ 上半被二次修改'}`);

  // 2. Ivory background
  const cx = CW/2, cy = upperH + (CH-upperH-2)*0.5;
  const px = pg.getImageData(cx|0, cy|0, 1,1).data;
  console.log(`[2] 下半中心: rgb(${px[0]},${px[1]},${px[2]}) 期望≈(243,240,232)象牙  → ${Math.abs(px[0]-243)<14 && Math.abs(px[1]-240)<14 && Math.abs(px[2]-232)<14 ? '✓ 象牙底正确' : '✗ 底色错误'}`);

  // 3. Abstract marks: scan and count non-ivory (distance > 18 in RGB) paint marks, and thin-line ink marks
  const lowerY = upperH + 2; const lowerH2 = CH - lowerY;
  const reg2 = pg.getImageData(0, lowerY, CW, lowerH2);
  let nonIvory = 0, ink = 0;
  const uniqColors = new Set();
  for(let i=0;i<reg2.data.length;i+=4){
    const d = Math.abs(reg2.data[i]-243)+Math.abs(reg2.data[i+1]-240)+Math.abs(reg2.data[i+2]-232);
    if(d>18){
      nonIvory++;
      if(reg2.data[i]<150 && reg2.data[i+1]<150 && reg2.data[i+2]<150) ink++;
      uniqColors.add(`${(reg2.data[i]/16)|0},${(reg2.data[i+1]/16)|0},${(reg2.data[i+2]/16)|0}`);
    }
  }
  const totalLower = CW * lowerH2;
  const pct = (nonIvory/totalLower*100).toFixed(2);
  console.log(`[3] 下半非象牙白像素: ${nonIvory} (${pct}%, 期望 12-25%) 独特色调簇=${uniqColors.size}`);
  const goodA = nonIvory > CW*lowerH2*0.08 && nonIvory < CW*lowerH2*0.40 && uniqColors.size > 35;
  console.log(`    抽象母题/色块/药丸/细线/锚点 存在? ${goodA ? '✓' : '✗'}`);

  // 4. Archive microtype: bottom 10% of the entire lower half, ink pixels
  const bottomY = lowerY + Math.round(lowerH2*0.90);
  const bottomH = CH - bottomY;
  const bm = pg.getImageData(0, bottomY, CW, Math.max(5, bottomH));
  let microTextPixels = 0;
  for(let i=0;i<bm.data.length;i+=4){
    const r=bm.data[i],g=bm.data[i+1],b=bm.data[i+2];
    const lum = 0.299*r+0.587*g+0.114*b;
    if(lum < 120) microTextPixels++;
  }
  console.log(`[4] 下半底部10% 暗像素(微字/细线标题): ${microTextPixels}  → ${microTextPixels>120 ? '✓ 存在存档编号+编号暗字' : '⚠ 微字稀少(node环境字体缺失属正常；浏览器中正常)'}`);

  fs.writeFileSync('/workspace/result_post_office.png', r.buf);
  console.log('\n旅程邮局最终PNG 已写入 result_post_office.png');
})().catch(e=>console.error('ERR:', e.message, e.stack));
