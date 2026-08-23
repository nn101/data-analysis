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
<button id="cloudClear"></button><button id="cloudDownload"></button>
<button id="cloudReAnalyze"></button>
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
   'mulberry32','seedFromImg','ccx','cloudCanvas','stickerLayer','cloudEmpty','cloudStage','bgImg',
   'cloudDrop','posts','PROMPT_LUTS','rgbToHsl','hslToRgb','cueStyleHint','cloudReAnalyze'];
  for(var _i=0;_i<_keys.length;_i++){ try { window[_keys[_i]] = eval(_keys[_i]); } catch(_e){} }
})();`;
W.eval(src);

(async function(){
  // ============ 云朵工厂 ============
  const img = await loadImage('/workspace/test_clouds.png');
  const cCanvas = W.cloudCanvas;
  cCanvas.width = img.width; cCanvas.height = img.height;
  const ccx = cCanvas.getContext('2d');
  ccx.drawImage(img, 0, 0);
  // Sync scope vars in eval to these refs
  W.__scratchCCX = ccx; W.__scratchCC = cCanvas;
  W.__scratchSL = W.document.getElementById('stickerLayer');
  W.__scratchSt = W.document.getElementById('cloudStage');
  W.__scratchEm = W.document.getElementById('cloudEmpty');
  W.eval(`ccx = window.__scratchCCX; cloudCanvas = window.__scratchCC; stickerLayer = window.__scratchSL; cloudStage = window.__scratchSt; cloudEmpty = window.__scratchEm;
           bgImg = {width:${img.width},height:${img.height},naturalWidth:${img.width},naturalHeight:${img.height}};
           cueStyleHint = 'auto';`);

  W.autoAdaptCloudStickers();
  // Statistics using node-canvas pixel checks vs original
  const beforeImg = await loadImage('/workspace/test_clouds.png');
  const before = createCanvas(img.width, img.height);
  before.getContext('2d').drawImage(beforeImg, 0, 0);
  const bpx = before.getContext('2d').getImageData(0,0,img.width,img.height).data;
  const apix = ccx.getImageData(0,0,img.width,img.height).data;
  let cloudDark = 0, cloudPink = 0, leak = 0;
  for(let i=0,j=0;i<bpx.length;i+=4,j++){
    const x = j%img.width, y = (j/img.width)|0;
    const br=bpx[i],bg=bpx[i+1],bb=bpx[i+2];
    const r=apix[i],g=apix[i+1],b=apix[i+2];
    const bl = 0.299*br+0.587*bg+0.114*bb;
    const al = 0.299*r+0.587*g+0.114*b;
    if(bl > 220){ // on cloud originally
      if(bl-al>55 && al<130) cloudDark++; // eyes/mouth
      if(r>g+30 && r>b+30 && g>150 && (r-br>20 || bg-g>10 || bb-b>20)) cloudPink++; // blush added
    } else {
      // non-cloud. Darkening on sky from Q-outline fixed shape would indicate SVG outline sticker
      if(al < 100 && bl-al>80) leak++;
    }
  }
  console.log('========== 云朵工厂 ==========');
  console.log(`云区域新增 DARK 像素(五官线条/眼睛/耳朵): ${cloudDark}  → ${cloudDark>1500?'✓ Q版画五官正确画在云像素上':'✗ 五官缺失'}`);
  console.log(`云区域新增 PINK 像素(腮红):            ${cloudPink}  → ${cloudPink>100?'✓ 腮红画在云像素上':'✗ 腮红不足'}`);
  console.log(`天空区域暗像素(固定外轮廓 SVG 贴纸泄露): ${leak}   → ${leak<30?'✓ 无固定轮廓线，全部Q特征直接画在云上':'✗ 有固定轮廓贴在云外背景'}`);
  fs.writeFileSync('/workspace/result_cloud_factory.png', cCanvas.__nodeCanvas.toBuffer('image/png'));

  // ============ 旅途邮局 ============
  const tp = await loadImage('/workspace/test_travel.jpg');
  const p = {id:'t1', img: tp, processed: false, src:'test_travel.jpg'};
  await W.processOne(p);
  const g = p.canvas.__nodeCanvas.getContext('2d');
  const CW = p.canvas.width, CH = p.canvas.height;
  const upperH = Math.round(CW*(tp.height/tp.width));
  const lowerH = CH - upperH - 2;
  // Compare 5000 random pixels in upper half vs original
  const origScr = createCanvas(tp.width, tp.height);
  origScr.getContext('2d').drawImage(tp, 0, 0);
  const og = origScr.getContext('2d');
  const s = CW / tp.width;  // scale factor upper: CW/tp.width = 1.0 here
  let diff = 0;
  for(let i=0;i<5000;i++){
    const x = Math.random()*tp.width | 0;
    const y = Math.random()*tp.height | 0;
    const p1 = og.getImageData(x,y,1,1).data;
    const x2 = Math.round(x*s), y2 = Math.round(y*s);
    const p2 = g.getImageData(x2,y2,1,1).data;
    if(Math.abs(p1[0]-p2[0])+Math.abs(p1[1]-p2[1])+Math.abs(p1[2]-p2[2])>3) diff++;
  }
  console.log('\n========== 旅途邮局 ==========');
  console.log(`输出画布: ${CW} x ${CH} (上半:${upperH}px 分隔:2px 下半:${lowerH}px)`);
  console.log(`抽样 5000 点：上半照片 vs 原图 差异像素 = ${diff}/5000  → ${diff<10?'✓ 上半=原图像素完全保留（不加滤镜不重绘）':'✗ 上半被二次修改'}`);
  const px = g.getImageData(CW/2, upperH+10+lowerH/2, 1, 1).data;
  console.log(`下半面板中心像素 rgb(${px[0]},${px[1]},${px[2]}) 期望≈(243,240,232)象牙白  → ${Math.abs(px[0]-243)<15 && Math.abs(px[1]-240)<15 && Math.abs(px[2]-232)<15 ? '✓ 象牙白底正确':'✗ 底色错误'}`);
  // Check abstract marks (variety)
  const region = g.getImageData(0, upperH+10, CW, Math.max(10, lowerH-50)).data;
  const uniq = new Set();
  for(let i=0;i<region.length;i+=4*40){ uniq.add(`${region[i]},${region[i+1]},${region[i+2]}`); if(uniq.size>500) break; }
  console.log(`下半非象牙白区域独特色彩数：${uniq.size}  → ${uniq.size>80?'✓ 抽象母题(色块/药丸/细线/锚点)多样存在':'✗ 抽象符号不足'}`);
  fs.writeFileSync('/workspace/result_post_office.png', p.canvas.__nodeCanvas.toBuffer('image/png'));
  console.log('\n两个结果PNG已保存，就绪。');
})().catch(e=>console.error('ERR:', e.message, e.stack));
