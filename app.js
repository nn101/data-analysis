/* =========================================================
   云邮小铺 · Cloud & Post Studio  —  前端主逻辑
   纯原生 JS：无框架。
   ========================================================= */
/* ---------- 通用工具 ---------- */
const $ = (s, el=document)=>el.querySelector(s);
const $$ = (s, el=document)=>[...el.querySelectorAll(s)];
const uid = (p='id')=>`${p}_${Math.random().toString(36).slice(2,8)}`;
const toBlob = (canvas, type='image/png', quality=0.92) => new Promise(res => canvas.toBlob(b=>res(b), type, quality));

function toast(msg, ms=1800){
  const t = $('#toast'); t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), ms);
}

function readAsDataURL(file){
  return new Promise((res,rej)=>{
    const fr = new FileReader();
    fr.onload = ()=>res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}
function loadImg(src){
  return new Promise((res,rej)=>{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = ()=>res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/* =========================================================
   Tabs 切换
   ========================================================= */
$$('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    $$('.tab').forEach(t=>{t.classList.remove('is-active'); t.setAttribute('aria-selected','false')});
    tab.classList.add('is-active'); tab.setAttribute('aria-selected','true');
    const target = tab.dataset.target;
    $$('.panel').forEach(p=>p.classList.toggle('is-active', p.id===target));
  });
});

/* =========================================================
   第一部分：云朵工厂
   ========================================================= */
const STICKERS = {
  animal: [
    {name:'坐姿猫',
     svg:`<svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M50 80 L35 45 L65 65 M150 80 L165 45 L135 65" stroke-linecap="round" stroke-linejoin="round"/>
       <ellipse cx="100" cy="100" rx="60" ry="50"/>
       <circle cx="80" cy="95" r="3" fill="currentColor"/>
       <circle cx="120" cy="95" r="3" fill="currentColor"/>
       <path d="M92 112 Q100 120 108 112" stroke-linecap="round"/>
       <path d="M100 106 L100 112" stroke-linecap="round"/>
       <path d="M70 108 Q58 104 55 110 M130 108 Q142 104 145 110" stroke-linecap="round"/>
       <path d="M100 150 Q90 170 70 170 M100 150 Q110 170 130 170" stroke-linecap="round"/>
     </svg>`},
    {name:'侧脸猫',
     svg:`<svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M40 110 L20 70 L60 90 M60 70 L66 40 L85 70" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M60 130 Q40 120 40 100 Q40 70 90 60 Q130 60 150 85 Q168 110 155 130 Q145 145 120 140 L70 140 Q60 140 60 130Z" stroke-linejoin="round"/>
       <circle cx="82" cy="95" r="2.5" fill="currentColor"/>
       <circle cx="118" cy="92" r="2.5" fill="currentColor"/>
       <path d="M98 112 Q104 118 110 112" stroke-linecap="round"/>
       <path d="M102 107 L102 112" stroke-linecap="round"/>
       <path d="M175 130 Q200 120 200 100 Q200 85 185 78" stroke-linecap="round"/>
       <path d="M70 140 L60 170 M95 140 L95 170 M125 138 L130 170 M150 135 L160 168" stroke-linecap="round"/>
     </svg>`},
    {name:'歪头小狗',
     svg:`<svg viewBox="0 0 220 190" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M55 70 Q30 70 45 110 L62 100 Z" stroke-linejoin="round"/>
       <path d="M165 70 Q190 70 175 110 L158 100 Z" stroke-linejoin="round"/>
       <ellipse cx="110" cy="110" rx="65" ry="58"/>
       <circle cx="88" cy="105" r="3" fill="currentColor"/>
       <circle cx="132" cy="105" r="3" fill="currentColor"/>
       <ellipse cx="110" cy="125" rx="8" ry="6" fill="currentColor"/>
       <path d="M110 131 L110 140 Q100 148 88 142 M110 140 Q120 148 132 142" stroke-linecap="round"/>
       <path d="M110 80 Q115 60 130 55 Q145 52 150 60" stroke-linecap="round"/>
       <path d="M80 168 L70 186 M140 168 L150 186" stroke-linecap="round"/>
     </svg>`},
    {name:'兔子',
     svg:`<svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M70 80 Q55 30 78 20 Q92 20 95 60" stroke-linejoin="round"/>
       <path d="M130 80 Q145 30 122 20 Q108 20 105 60" stroke-linejoin="round"/>
       <ellipse cx="100" cy="130" rx="55" ry="50"/>
       <circle cx="82" cy="125" r="3" fill="currentColor"/>
       <circle cx="118" cy="125" r="3" fill="currentColor"/>
       <path d="M96 142 L104 142 L100 148 Z" fill="currentColor"/>
       <path d="M100 148 Q92 156 86 152 M100 148 Q108 156 114 152" stroke-linecap="round"/>
       <circle cx="100" cy="162" r="7" fill="currentColor" opacity=".6"/>
     </svg>`},
    {name:'小狐狸',
     svg:`<svg viewBox="0 0 220 190" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M45 80 L35 40 L80 70 Z" stroke-linejoin="round"/>
       <path d="M175 80 L185 40 L140 70 Z" stroke-linejoin="round"/>
       <path d="M55 90 Q40 110 60 140 Q80 160 110 155 Q140 160 160 140 Q180 110 165 90 Q145 70 110 70 Q75 70 55 90Z" stroke-linejoin="round"/>
       <circle cx="88" cy="105" r="3" fill="currentColor"/>
       <circle cx="132" cy="105" r="3" fill="currentColor"/>
       <path d="M104 128 L116 128 L110 136 Z" fill="currentColor"/>
       <path d="M90 142 Q110 150 130 142" stroke-linecap="round"/>
       <path d="M180 150 Q210 160 210 130 Q210 118 195 115" stroke-linecap="round"/>
     </svg>`},
    {name:'小熊',
     svg:`<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
       <circle cx="55" cy="60" r="20"/>
       <circle cx="145" cy="60" r="20"/>
       <circle cx="100" cy="110" r="62"/>
       <circle cx="80" cy="105" r="3" fill="currentColor"/>
       <circle cx="120" cy="105" r="3" fill="currentColor"/>
       <ellipse cx="100" cy="128" rx="10" ry="7" fill="currentColor"/>
       <path d="M100 135 L100 142 M100 142 Q90 150 84 144 M100 142 Q110 150 116 144" stroke-linecap="round"/>
     </svg>`},
    {name:'鲸鱼',
     svg:`<svg viewBox="0 0 260 150" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M20 100 Q10 70 45 65 Q90 60 140 70 Q200 80 225 60 Q240 50 248 72 Q255 95 220 105 Q170 120 110 118 Q55 118 20 100Z" stroke-linejoin="round"/>
       <path d="M248 72 L260 50 L235 62 Z" stroke-linejoin="round"/>
       <circle cx="195" cy="82" r="3" fill="currentColor"/>
       <path d="M90 60 Q95 40 105 45 Q108 38 114 48 Q120 40 122 55" stroke-linecap="round"/>
       <path d="M90 110 Q110 118 140 112" stroke-linecap="round" stroke-dasharray="4 4"/>
     </svg>`},
    {name:'小鸭子',
     svg:`<svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
       <ellipse cx="100" cy="120" rx="55" ry="42"/>
       <circle cx="140" cy="72" r="30"/>
       <path d="M168 70 L190 65 L170 80 Z" stroke-linejoin="round"/>
       <circle cx="148" cy="65" r="2.5" fill="currentColor"/>
       <path d="M60 155 L55 175 M80 160 L78 178 M115 160 L115 178 M135 155 L140 175" stroke-linecap="round"/>
       <path d="M50 118 Q30 112 30 122 Q30 132 50 130" stroke-linecap="round"/>
     </svg>`},
    {name:'水豚',
     svg:`<svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M40 110 Q40 80 80 70 Q120 60 170 72 Q215 85 215 110 Q215 135 175 138 L70 138 Q40 138 40 110Z" stroke-linejoin="round"/>
       <circle cx="75" cy="62" r="14"/>
       <circle cx="130" cy="58" r="14"/>
       <circle cx="90" cy="95" r="2.5" fill="currentColor"/>
       <circle cx="135" cy="95" r="2.5" fill="currentColor"/>
       <path d="M105 115 L120 115 L112 122 Z" fill="currentColor"/>
       <path d="M100 125 Q112 132 125 125" stroke-linecap="round"/>
       <path d="M50 138 L45 160 M80 140 L80 162 M160 140 L160 162 M195 138 L200 160" stroke-linecap="round"/>
       <circle cx="185" cy="100" r="4" fill="currentColor" opacity=".6"/>
       <circle cx="190" cy="108" r="3" fill="currentColor" opacity=".5"/>
     </svg>`},
  ],
  fairy: [
    {name:'仙气少女',
     svg:`<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M60 75 Q60 40 100 38 Q140 38 140 75 L140 100 Q140 110 130 110 L70 110 Q60 110 60 100 Z" stroke-linejoin="round"/>
       <path d="M60 78 Q45 50 70 55 Q75 45 85 55 Q90 42 100 52 Q108 40 115 55 Q126 46 130 58 Q150 48 145 80" stroke-linecap="round"/>
       <circle cx="85" cy="85" r="2.5" fill="currentColor"/>
       <circle cx="115" cy="85" r="2.5" fill="currentColor"/>
       <path d="M92 100 Q100 104 108 100" stroke-linecap="round"/>
       <path d="M100 92 Q97 96 100 100 Q103 96 100 92Z" fill="currentColor" opacity=".4"/>
       <path d="M65 112 Q40 135 35 190 Q30 235 60 245 L140 245 Q170 235 165 190 Q160 135 135 112" stroke-linejoin="round"/>
       <path d="M65 140 Q100 130 135 140" stroke-linecap="round"/>
       <path d="M55 170 Q100 160 145 170 M50 200 Q100 190 150 200" stroke-linecap="round" stroke-dasharray="3 5"/>
       <path d="M150 120 Q175 105 185 120 Q195 140 170 150 Q160 140 150 120Z" stroke-linejoin="round" opacity=".7"/>
       <path d="M170 125 L176 130 M178 122 L183 128" stroke-linecap="round"/>
     </svg>`},
    {name:'Q版少女',
     svg:`<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <circle cx="100" cy="90" r="52"/>
       <path d="M48 82 Q50 50 100 42 Q150 50 152 82 Q158 70 150 55 Q170 60 165 88 Q180 80 175 105 Q170 122 148 118" stroke-linejoin="round"/>
       <path d="M48 82 Q42 60 50 52 Q30 60 35 88 Q20 82 25 108 Q32 122 52 118" stroke-linejoin="round"/>
       <path d="M65 70 Q75 58 90 60 Q100 54 110 60 Q125 58 135 70 Q130 50 100 48 Q70 50 65 70Z" fill="currentColor" opacity=".08"/>
       <ellipse cx="82" cy="95" rx="5" ry="7" fill="currentColor"/>
       <ellipse cx="118" cy="95" rx="5" ry="7" fill="currentColor"/>
       <circle cx="84" cy="92" r="1.4" fill="#fff"/>
       <circle cx="120" cy="92" r="1.4" fill="#fff"/>
       <path d="M92 115 Q100 122 108 115" stroke-linecap="round"/>
       <circle cx="72" cy="108" r="5" fill="currentColor" opacity=".25"/>
       <circle cx="128" cy="108" r="5" fill="currentColor" opacity=".25"/>
       <path d="M60 140 Q55 160 65 180 Q50 210 62 230 L138 230 Q150 210 135 180 Q145 160 140 140 Q120 130 100 130 Q80 130 60 140Z" stroke-linejoin="round"/>
       <path d="M75 160 Q100 152 125 160" stroke-linecap="round"/>
     </svg>`},
    {name:'古风背影',
     svg:`<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M70 45 Q65 15 100 14 Q135 15 130 45 Q145 48 140 78 L130 90" stroke-linejoin="round"/>
       <path d="M70 45 L72 62 L60 90 L72 82 L70 72 Z" stroke-linejoin="round"/>
       <path d="M80 70 Q100 62 120 70 L122 82 Q100 88 78 82 Z" stroke-linejoin="round"/>
       <path d="M50 92 Q30 110 30 140 Q28 170 45 200 Q48 230 70 246 L130 246 Q152 230 155 200 Q172 170 170 140 Q170 110 150 92 Q128 80 100 82 Q72 80 50 92Z" stroke-linejoin="round"/>
       <path d="M55 115 Q100 105 145 115 M50 150 Q100 140 150 150 M58 188 Q100 178 142 188" stroke-linecap="round"/>
       <path d="M30 140 Q10 160 18 185 Q22 200 42 190" stroke-linejoin="round" opacity=".85"/>
       <path d="M170 140 Q190 160 182 185 Q178 200 158 190" stroke-linejoin="round" opacity=".85"/>
       <path d="M100 20 L102 8 Q98 4 94 6 L92 0" stroke-linecap="round"/>
     </svg>`},
    {name:'莲花少女',
     svg:`<svg viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M110 40 Q90 12 70 22 Q52 38 66 60 Q40 60 40 84 Q40 108 70 110 L84 90 Q94 82 110 82 Q126 82 136 90 L150 110 Q180 108 180 84 Q180 60 154 60 Q168 38 150 22 Q130 12 110 40Z" stroke-linejoin="round"/>
       <circle cx="110" cy="110" r="36"/>
       <circle cx="98" cy="108" r="2.2" fill="currentColor"/>
       <circle cx="122" cy="108" r="2.2" fill="currentColor"/>
       <path d="M105 122 Q110 126 115 122" stroke-linecap="round"/>
       <path d="M70 150 Q60 200 80 225 L140 225 Q160 200 150 150 Q130 140 110 140 Q90 140 70 150Z" stroke-linejoin="round"/>
       <path d="M62 155 Q30 170 20 200 Q22 224 46 220" stroke-linejoin="round"/>
       <path d="M158 155 Q190 170 200 200 Q198 224 174 220" stroke-linejoin="round"/>
     </svg>`},
    {name:'月兔仙子',
     svg:`<svg viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <circle cx="160" cy="60" r="28" opacity=".7"/>
       <path d="M172 55 Q165 48 162 55" stroke-linecap="round" opacity=".7"/>
       <path d="M80 40 Q70 5 92 12 Q100 0 108 12 Q130 5 120 40" stroke-linejoin="round"/>
       <circle cx="100" cy="85" r="34"/>
       <circle cx="88" cy="82" r="2.2" fill="currentColor"/>
       <circle cx="112" cy="82" r="2.2" fill="currentColor"/>
       <path d="M95 98 Q100 102 105 98" stroke-linecap="round"/>
       <path d="M60 120 Q40 140 42 180 Q44 220 80 228 L120 228 Q156 220 158 180 Q160 140 140 120 Q120 112 100 112 Q80 112 60 120Z" stroke-linejoin="round"/>
       <path d="M70 145 Q100 138 130 145" stroke-linecap="round"/>
       <circle cx="40" cy="40" r="2" fill="currentColor" opacity=".5"/>
       <circle cx="30" cy="70" r="1.5" fill="currentColor" opacity=".4"/>
       <circle cx="200" cy="140" r="2" fill="currentColor" opacity=".5"/>
       <circle cx="210" cy="180" r="1.5" fill="currentColor" opacity=".4"/>
     </svg>`},
    {name:'羽扇',
     svg:`<svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M110 160 L60 80 Q60 40 110 25 Q160 40 160 80 Z" stroke-linejoin="round"/>
       <path d="M110 160 L80 50 M110 160 L110 30 M110 160 L140 50" stroke-linecap="round"/>
       <path d="M70 68 Q90 60 110 55 Q130 60 150 68" stroke-linecap="round" opacity=".6"/>
       <path d="M60 90 Q40 100 42 118 Q48 135 66 132" stroke-linejoin="round"/>
       <path d="M160 90 Q180 100 178 118 Q172 135 154 132" stroke-linejoin="round"/>
       <circle cx="110" cy="165" r="4" fill="currentColor"/>
       <path d="M110 170 Q108 178 110 180 Q112 178 110 170Z" fill="currentColor"/>
     </svg>`},
  ],
  mix: [
    {name:'月亮',
     svg:`<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M140 50 Q100 50 90 90 Q80 130 110 155 Q140 180 170 160 Q140 170 115 150 Q90 128 98 92 Q108 55 145 45 Q145 48 140 50Z" stroke-linejoin="round"/>
       <circle cx="60" cy="55" r="1.5" fill="currentColor" opacity=".7"/>
       <circle cx="40" cy="90" r="1" fill="currentColor" opacity=".6"/>
       <circle cx="70" cy="150" r="1.3" fill="currentColor" opacity=".7"/>
       <circle cx="45" cy="130" r="1" fill="currentColor" opacity=".5"/>
     </svg>`},
    {name:'星星',
     svg:`<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M100 25 L115 80 L175 82 L127 118 L145 175 L100 142 L55 175 L73 118 L25 82 L85 80 Z" stroke-linejoin="round"/>
       <path d="M30 50 L33 60 L43 63 L33 66 L30 76 L27 66 L17 63 L27 60 Z" stroke-linejoin="round" opacity=".7"/>
       <path d="M170 150 L172 158 L180 160 L172 162 L170 170 L168 162 L160 160 L168 158 Z" stroke-linejoin="round" opacity=".7"/>
     </svg>`},
    {name:'热气球',
     svg:`<svg viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg">
       <ellipse cx="110" cy="90" rx="70" ry="80"/>
       <path d="M40 90 Q110 70 180 90 M110 10 L110 170 M60 40 Q110 100 160 40 M60 150 Q110 100 160 150" stroke-linecap="round" opacity=".5"/>
       <path d="M90 168 L85 220 L135 220 L130 168" stroke-linejoin="round"/>
       <path d="M95 170 L90 200 L130 200 L125 170" stroke-linejoin="round"/>
       <path d="M88 172 L82 188 M132 172 L138 188" stroke-linecap="round"/>
       <path d="M110 170 L110 188" stroke-linecap="round" opacity=".5"/>
     </svg>`},
    {name:'小蘑菇',
     svg:`<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M30 90 Q30 40 100 40 Q170 40 170 90 Q170 100 160 102 L40 102 Q30 100 30 90Z" stroke-linejoin="round"/>
       <circle cx="65" cy="70" r="8"/>
       <circle cx="110" cy="60" r="10"/>
       <circle cx="140" cy="78" r="7"/>
       <path d="M70 102 L65 160 L135 160 L130 102Z" stroke-linejoin="round"/>
       <path d="M85 130 Q100 125 115 130" stroke-linecap="round"/>
       <circle cx="88" cy="122" r="2" fill="currentColor"/>
       <circle cx="112" cy="122" r="2" fill="currentColor"/>
     </svg>`},
    {name:'城堡',
     svg:`<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M40 180 L40 100 L55 100 L55 85 L72 85 L72 100 L120 100 L120 50 L105 50 L105 35 L135 35 L135 50 L120 50 L120 100 L168 100 L168 85 L185 85 L185 100 L200 100 L200 180 Z" stroke-linejoin="round"/>
       <path d="M110 180 L110 140 Q110 128 120 128 Q130 128 130 140 L130 180" stroke-linejoin="round"/>
       <path d="M70 120 L90 120 L90 140 L70 140 Z M150 120 L170 120 L170 140 L150 140 Z" stroke-linejoin="round"/>
       <path d="M120 35 L120 15 L126 12 L120 10 L118 4" stroke-linecap="round"/>
     </svg>`},
    {name:'独角兽',
     svg:`<svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M120 40 L112 10 L106 40 Z" stroke-linejoin="round"/>
       <path d="M60 110 Q40 90 55 65 Q70 50 95 55 Q110 45 130 60 Q160 60 165 90 Q175 92 185 105 Q200 115 195 135 L180 140 L180 175 L170 175 L170 148 L105 148 L105 175 L95 175 L95 150 L70 150 L70 180 L60 180 L60 150 Q45 148 50 130 Q52 118 60 110Z" stroke-linejoin="round"/>
       <circle cx="115" cy="85" r="2.2" fill="currentColor"/>
       <path d="M75 95 Q55 100 60 115" stroke-linecap="round"/>
       <path d="M145 60 Q165 40 190 42 Q215 45 220 65 Q228 80 210 92 Q195 92 180 80" stroke-linecap="round" opacity=".7"/>
       <path d="M160 62 L170 55 M172 58 L180 52" stroke-linecap="round" opacity=".6"/>
     </svg>`},
  ]
};

/* ---------- 渲染贴纸选择面板 ---------- */
const stickerGrid = $('#stickerGrid');
let currentCat = 'animal';

function renderStickers(cat){
  currentCat = cat;
  stickerGrid.innerHTML = '';
  STICKERS[cat].forEach((s,i)=>{
    const div = document.createElement('div');
    div.className = 'sticker';
    div.title = s.name;
    div.innerHTML = s.svg;
    // 统一 SVG 样式
    const svg = div.querySelector('svg');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '3');
    svg.setAttribute('fill', 'none');
    svg.style.color = '#1d1d1f';
    div.addEventListener('click', ()=>addSticker(s));
    stickerGrid.appendChild(div);
  });
}
renderStickers('animal');

$$('.chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    $$('.chip').forEach(c=>c.classList.remove('is-active'));
    chip.classList.add('is-active');
    renderStickers(chip.dataset.cat);
  });
});

/* ---------- Canvas：背景图 ---------- */
const cloudCanvas = $('#cloudCanvas');
const ccx = cloudCanvas.getContext('2d');
const stickerLayer = $('#stickerLayer');
const cloudEmpty = $('#cloudEmpty');
const stickerTools = $('#stickerTools');

let bgImg = null;      // HTMLImageElement
let bgRatio = 1;       // canvas css width / natural width

function fitStage(img){
  const stage = $('#cloudStage');
  const maxW = stage.clientWidth - 24;
  const maxH = Math.min(window.innerHeight*0.7, stage.clientHeight - 24);
  let w = img.naturalWidth, h = img.naturalHeight;
  const r = Math.min(maxW/w, maxH/h);
  w = Math.round(w*r); h = Math.round(h*r);
  cloudCanvas.width = img.naturalWidth;
  cloudCanvas.height = img.naturalHeight;
  ccx.clearRect(0,0,cloudCanvas.width,cloudCanvas.height);
  ccx.drawImage(img,0,0);
  cloudCanvas.style.width = w+'px';
  cloudCanvas.style.height = h+'px';
  bgRatio = w / img.naturalWidth;
  stickerLayer.style.width = w+'px';
  stickerLayer.style.height = h+'px';
  stickerLayer.style.left = `calc(50% - ${w/2}px)`;
  stickerLayer.style.top = `calc(50% - ${h/2}px)`;
  stickerLayer.style.position = 'absolute';
  cloudEmpty.hidden = true;
}

function handleCloudFiles(files){
  if(!files || !files.length) return;
  const f = files[0];
  if(!/^image\//.test(f.type)) return toast('请上传图片文件');
  readAsDataURL(f).then(src=>loadImg(src)).then(img=>{
    bgImg = img;
    fitStage(img);
    clearAllStickers();
    toast('云朵照已就位～');
  });
}

['cloudDrop','cloudFile'].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener('change', e=>handleCloudFiles(e.target.files));
  el.addEventListener('dragover', e=>{e.preventDefault(); $('#cloudDrop').classList.add('dragover')});
  el.addEventListener('dragleave', ()=>$('#cloudDrop').classList.remove('dragover'));
  el.addEventListener('drop', e=>{
    e.preventDefault(); $('#cloudDrop').classList.remove('dragover');
    handleCloudFiles(e.dataTransfer?.files);
  });
});

window.addEventListener('resize', ()=>{ if(bgImg) fitStage(bgImg); });

/* ---------- Sticker Layer 管理 ---------- */
let stickers = [];   // {id, el, x, y, scale, rot, opacity, color, stroke}
let selectedId = null;

function addSticker(s){
  if(!bgImg) return toast('请先上传一张云朵照片～');
  const id = uid('sk');
  const cssW = stickerLayer.clientWidth;
  const cssH = stickerLayer.clientHeight;
  const size = Math.min(cssW, cssH) * 0.38;
  const data = {
    id,
    x: (cssW - size)/2 + (Math.random()*40-20),
    y: (cssH - size)/2 + (Math.random()*40-20),
    size,
    scale: 100,
    rot: 0,
    opacity: 100,
    color: '#1d1d1f',
    stroke: 3,
    svgDef: s.svg,
    name: s.name,
  };
  const el = document.createElement('div');
  el.className = 'sticker-item';
  el.dataset.id = id;
  el.style.width = size+'px';
  el.style.height = size+'px';
  el.innerHTML = s.svg;
  const svg = el.querySelector('svg');
  svg.setAttribute('width','100%');
  svg.setAttribute('height','100%');
  svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 100 100');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke-width', '3');
  svg.setAttribute('stroke-linecap','round');
  svg.setAttribute('stroke-linejoin','round');
  svg.style.color = data.color;
  stickerLayer.appendChild(el);
  data.el = el;
  stickers.push(data);
  applyStickerTransform(data);
  attachStickerDrag(data);
  selectSticker(id);
}

function applyStickerTransform(d){
  const el = d.el;
  el.style.left = d.x+'px';
  el.style.top = d.y+'px';
  const s = d.size * (d.scale/100);
  el.style.width = s+'px';
  el.style.height = s+'px';
  el.style.transform = `rotate(${d.rot}deg)`;
  el.style.opacity = (d.opacity/100).toFixed(2);
  const svg = el.querySelector('svg');
  svg.style.color = d.color;
  svg.setAttribute('stroke-width', d.stroke);
  el.classList.toggle('is-selected', d.id===selectedId);
}

function selectSticker(id){
  selectedId = id;
  stickers.forEach(d=>d.el.classList.toggle('is-selected', d.id===id));
  const d = stickers.find(x=>x.id===id);
  if(d){
    stickerTools.hidden = false;
    $('#scaleRange').value = d.scale; $('#scaleVal').textContent = d.scale+'%';
    $('#rotRange').value = d.rot;   $('#rotVal').textContent = d.rot+'°';
    $('#opRange').value  = d.opacity; $('#opVal').textContent = d.opacity+'%';
    $('#strokeW').value  = d.stroke;  $('#strokeVal').textContent = d.stroke;
    $$('#strokeColors .swatch').forEach(s=>s.classList.toggle('is-active', s.dataset.c===d.color));
  } else {
    stickerTools.hidden = true;
  }
}

stickerLayer.addEventListener('click', e=>{
  const item = e.target.closest('.sticker-item');
  if(item) selectSticker(item.dataset.id);
  else selectSticker(null);
});

function attachStickerDrag(d){
  const el = d.el;
  let sx=0, sy=0, ox=0, oy=0, dragging=false;
  const onDown = e=>{
    e.preventDefault();
    const p = getPoint(e);
    sx=p.x; sy=p.y; ox=d.x; oy=d.y; dragging=true;
    selectSticker(d.id);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    el.setPointerCapture?.(e.pointerId);
  };
  const onMove = e=>{
    if(!dragging) return;
    const p = getPoint(e);
    d.x = Math.max(-40, Math.min(stickerLayer.clientWidth-40, ox + (p.x-sx)));
    d.y = Math.max(-40, Math.min(stickerLayer.clientHeight-40, oy + (p.y-sy)));
    applyStickerTransform(d);
  };
  const onUp = ()=>{dragging=false; document.removeEventListener('pointermove',onMove); document.removeEventListener('pointerup',onUp)};
  el.addEventListener('pointerdown', onDown);
}
function getPoint(e){
  if(e.touches && e.touches[0]) return {x:e.touches[0].clientX, y:e.touches[0].clientY};
  return {x:e.clientX, y:e.clientY};
}

/* ---------- 控件：调整选中贴纸 ---------- */
function withSelected(cb){
  const d = stickers.find(x=>x.id===selectedId);
  if(!d){ toast('先选一枚轮廓再调整哦'); return; }
  cb(d); applyStickerTransform(d);
}
$('#scaleRange').addEventListener('input', e=>withSelected(d=>{d.scale=+e.target.value; $('#scaleVal').textContent=d.scale+'%'}));
$('#rotRange').addEventListener('input',   e=>withSelected(d=>{d.rot=+e.target.value;   $('#rotVal').textContent=d.rot+'°'}));
$('#opRange').addEventListener('input',    e=>withSelected(d=>{d.opacity=+e.target.value;$('#opVal').textContent=d.opacity+'%'}));
$('#strokeW').addEventListener('input',    e=>withSelected(d=>{d.stroke=+e.target.value; $('#strokeVal').textContent=d.stroke}));

$('#strokeColors').addEventListener('click', e=>{
  const sw = e.target.closest('.swatch'); if(!sw) return;
  $$('#strokeColors .swatch').forEach(s=>s.classList.remove('is-active'));
  sw.classList.add('is-active');
  withSelected(d=>d.color = sw.dataset.c);
});

$('#delSticker').addEventListener('click', ()=>{
  const idx = stickers.findIndex(d=>d.id===selectedId);
  if(idx<0) return;
  stickers[idx].el.remove();
  stickers.splice(idx,1);
  selectSticker(null);
});
$('#bringFront').addEventListener('click', ()=>withSelected(d=>{ stickerLayer.appendChild(d.el); }));
$('#sendBack').addEventListener('click', ()=>withSelected(d=>{ stickerLayer.insertBefore(d.el, stickerLayer.firstChild); }));

$('#cloudClear').addEventListener('click', ()=>{
  bgImg = null;
  ccx.clearRect(0,0,cloudCanvas.width, cloudCanvas.height);
  cloudCanvas.removeAttribute('style');
  stickerLayer.removeAttribute('style');
  cloudEmpty.hidden = false;
  clearAllStickers();
});

function clearAllStickers(){
  stickers.forEach(d=>d.el.remove());
  stickers = [];
  selectSticker(null);
}

/* ---------- 保存云朵工厂作品 ---------- */
$('#cloudDownload').addEventListener('click', async ()=>{
  if(!bgImg) return toast('还没有上传作品哦');
  const out = document.createElement('canvas');
  out.width = cloudCanvas.width; out.height = cloudCanvas.height;
  const ctx = out.getContext('2d');
  ctx.drawImage(cloudCanvas,0,0);

  // 把贴纸从 DOM 坐标换算到 canvas 像素坐标
  const r = out.width / stickerLayer.clientWidth;
  for(const d of stickers){
    const px = d.x * r;
    const py = d.y * r;
    const sz = (d.size * (d.scale/100)) * r;
    // 将 SVG 转图片
    const svg = d.el.querySelector('svg');
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    clone.setAttribute('width', sz);
    clone.setAttribute('height', sz);
    clone.setAttribute('stroke', d.color);
    clone.setAttribute('stroke-width', d.stroke);
    clone.style.color = d.color;
    const svgStr = new XMLSerializer().serializeToString(clone);
    const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    try{
      const img = await loadImg(src);
      ctx.save();
      ctx.globalAlpha = d.opacity/100;
      ctx.translate(px + sz/2, py + sz/2);
      ctx.rotate(d.rot * Math.PI/180);
      ctx.drawImage(img, -sz/2, -sz/2, sz, sz);
      ctx.restore();
    }catch(err){
      console.warn('sticker render failed', err);
    }
  }
  const blob = await toBlob(out, 'image/png');
  saveAs(blob, `cloud-factory-${Date.now()}.png`);
  toast('已保存到本地～');
});

/* =========================================================
   第二部分：旅途邮局
   ========================================================= */
const MAX = 5;
const postThumbs = $('#postThumbs');
const postCount = $('#postCount');
let posts = []; // {id, file, src, img, canvas, processed}

/* 选中风格 */
$$('.style').forEach(el=>{
  el.addEventListener('click', ()=>{
    $$('.style').forEach(s=>s.classList.remove('is-active'));
    el.classList.add('is-active');
    const val = el.dataset.style;
    el.querySelector('input').checked = true;
    $('#promptCard').hidden = (val!=='prompt');
  });
});
/* 提示词颜色 */
$('#promptColors').addEventListener('click', e=>{
  const sw = e.target.closest('.swatch'); if(!sw) return;
  $$('#promptColors .swatch').forEach(s=>s.classList.remove('is-active'));
  sw.classList.add('is-active');
});

/* 上传 */
function handlePostFiles(files){
  files = [...files].filter(f=>/^image\//.test(f.type));
  if(posts.length + files.length > MAX){
    toast(`一次最多处理 ${MAX} 张，已自动截取`);
    files = files.slice(0, MAX - posts.length);
  }
  files.forEach(async f=>{
    const id = uid('p');
    const rec = {id, file:f, name:f.name, src:null, img:null, canvas:null, processed:false};
    posts.push(rec);
    renderThumbs();
    try{
      rec.src = await readAsDataURL(f);
      rec.img = await loadImg(rec.src);
      renderThumbs();
    }catch(e){ toast('图片读取失败') }
  });
}
['postDrop','postFile'].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener('change', e=>handlePostFiles(e.target.files));
  el.addEventListener('dragover', e=>{e.preventDefault(); $('#postDrop').classList.add('dragover')});
  el.addEventListener('dragleave', ()=>$('#postDrop').classList.remove('dragover'));
  el.addEventListener('drop', e=>{
    e.preventDefault(); $('#postDrop').classList.remove('dragover');
    handlePostFiles(e.dataTransfer?.files || []);
  });
});
$('#postClear').addEventListener('click', ()=>{ posts=[]; renderThumbs(); });
$('#postDemo').addEventListener('click', async ()=>{
  // 用 canvas 生成 4 张示例风景图
  const demos = [
    {label:'海岸', grad:['#a6e1fa','#ffd6a5'], accent:'#ff8fab'},
    {label:'山脉', grad:['#cfd7ff','#a0c4ff'], accent:'#6d6875'},
    {label:'森林', grad:['#caffbf','#a7e7c7'], accent:'#403939'},
    {label:'都市', grad:['#ffd6a5','#ffadad'], accent:'#3a0ca3'},
  ];
  const add = async (d)=>{
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 1500;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0,0,0,c.height);
    grd.addColorStop(0, d.grad[0]); grd.addColorStop(1, d.grad[1]);
    g.fillStyle = grd; g.fillRect(0,0,c.width,c.height);
    // 一些抽象形状
    g.fillStyle = d.accent; g.globalAlpha = .25;
    g.beginPath(); g.arc(c.width*.2, c.height*.25, 180, 0, Math.PI*2); g.fill();
    g.beginPath(); g.moveTo(0,c.height*.65); g.bezierCurveTo(c.width*.3, c.height*.5, c.width*.6, c.height*.8, c.width, c.height*.6); g.lineTo(c.width,c.height); g.lineTo(0,c.height); g.closePath(); g.globalAlpha=.3; g.fill();
    g.globalAlpha = 1;
    c.toBlob(b=>{
      const f = new File([b], `demo-${d.label}.png`, {type:'image/png'});
      handlePostFiles([f]);
    }, 'image/png');
  };
  demos.slice(0, MAX - posts.length).forEach(add);
});

/* 渲染缩略图区 */
function renderThumbs(){
  postCount.textContent = `已选 ${posts.length} / ${MAX} 张`;
  postThumbs.innerHTML = '';
  if(!posts.length){
    postThumbs.innerHTML = `<div class="empty-hint big"><div class="big-emoji">🏝️</div><p>上传你在旅途中的照片，我们来把它们做成明信片～</p></div>`;
    $('#postSaveRow').hidden = true;
    return;
  }
  posts.forEach(p=>{
    const wrap = document.createElement('div');
    wrap.className = 'thumb';
    wrap.dataset.id = p.id;
    wrap.innerHTML = `
      <div class="media ${p.processed?'':'processing'}">
        ${p.canvas?'':'<img alt=""/>'.replace('>',' src="'+(p.src||'')+'">')}
      </div>
      <div class="meta">
        <div class="name" title="${p.name}">${p.name}</div>
        <div class="status">${p.processed?'✅ 已处理':'⏳ 待处理'}</div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-act="remove">移除</button>
        <button class="btn ghost" data-act="single">单独重绘</button>
        <button class="btn primary" data-act="save" ${p.processed?'':'disabled'}>保存</button>
      </div>
    `;
    const media = wrap.querySelector('.media');
    if(p.canvas){
      media.appendChild(p.canvas);
      media.querySelector('img')?.remove();
    } else {
      const img = media.querySelector('img');
      if(img && p.src) img.src = p.src;
    }
    wrap.querySelector('[data-act=remove]').addEventListener('click', ()=>{
      posts = posts.filter(x=>x.id!==p.id); renderThumbs();
    });
    wrap.querySelector('[data-act=single]').addEventListener('click', ()=>processOne(p).then(renderThumbs));
    wrap.querySelector('[data-act=save]').addEventListener('click', ()=>savePost(p));
    postThumbs.appendChild(wrap);
  });
  $('#postSaveRow').hidden = !posts.some(p=>p.processed);
}

/* 单张处理 */
async function processOne(p){
  if(!p.img) await loadImg(p.src).then(i=>p.img=i);
  const style = document.querySelector('input[name=postStyle]:checked').value;
  const canvas = document.createElement('canvas');
  // 输出尺寸：按比例缩放到最大 1600 宽
  const ratio = p.img.height / p.img.width;
  canvas.width = 1200; canvas.height = Math.round(1200 * ratio);
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = true;
  if(style==='abstract-editorial') drawAbstractEditorial(g, p.img, canvas);
  else if(style==='zine') drawZine(g, p.img, canvas);
  else drawPrompt(g, p.img, canvas);
  p.canvas = canvas;
  p.processed = true;
}

/* 风格 A：Photo Abstract Editorial —— 画报抽象：大色块 + 分层色阶 + 刊头排版 */
function drawAbstractEditorial(g, img, c){
  const w = c.width, h = c.height;
  // 1. 先 drawImage 原图（微调色彩）
  g.save();
  g.filter = 'saturate(1.05) contrast(1.08) brightness(1.02)';
  g.drawImage(img,0,0,w,h);
  g.restore();
  // 2. 色阶量化，更硬朗的大色块（6-7 级）
  try{
    const data = g.getImageData(0,0,w,h);
    const d = data.data;
    const levels = 7;
    const step = 255/(levels-1);
    for(let i=0;i<d.length;i+=4){
      d[i]   = Math.round(Math.round(d[i]/step)*step);
      d[i+1] = Math.round(Math.round(d[i+1]/step)*step);
      d[i+2] = Math.round(Math.round(d[i+2]/step)*step);
    }
    g.putImageData(data,0,0);
  }catch(e){}
  // 3. 叠两层渐变雾：暖 + 紫，营造画报胶片感
  const mist = g.createLinearGradient(0,0,w,h);
  mist.addColorStop(0,'rgba(255,190,130,.18)');
  mist.addColorStop(0.55,'rgba(255,140,200,.05)');
  mist.addColorStop(1,'rgba(120,90,255,.16)');
  g.fillStyle = mist; g.fillRect(0,0,w,h);

  const palette = [
    ['#ff7eb9',.42], ['#7c6cf7',.34], ['#ffd38a',.42],
    ['#00b894',.28], ['#1e1c38',.14], ['#ffffff',.18], ['#ff6b6b',.30]
  ];

  // 4. 画刊头：顶部白底大横条 + 大标题 + 英文副标
  const barH = Math.round(h*0.12);
  g.fillStyle = '#ffffff';
  g.fillRect(0,0,w,barH);
  g.fillStyle = '#1e1c38';
  g.font = "700 18px Fredoka, sans-serif";
  g.textBaseline = 'middle';
  g.fillText('VOL.  ABSTRACT  ·  EDITORIAL', 30, barH*0.32);
  g.font = '800 ' + Math.max(26, Math.round(barH*0.44)) + 'px "ZCOOL KuaiLe", serif';
  g.fillText('旅途 · 画 · 报', 30, barH*0.72);
  // 右上：编号 + 日期
  g.textAlign = 'right';
  g.font = '700 14px Fredoka, sans-serif';
  g.fillText('ISSUE No.' + String(Math.floor(Math.random()*9000)+1000), w-30, barH*0.32);
  g.fillText(new Date().toLocaleDateString(), w-30, barH*0.68);
  g.textAlign='left';
  // 分隔线
  g.strokeStyle = '#1e1c38'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(30, barH-2); g.lineTo(w-30, barH-2); g.stroke();

  // 5. 抽象几何拼贴
  const rand = mulberry32(seedFromImg(img));
  const shapes = Math.floor(5 + rand()*6);
  for(let i=0;i<shapes;i++){
    const col = palette[Math.floor(rand()*palette.length)];
    g.fillStyle = hexA(col[0], col[1]);
    const kind = Math.floor(rand()*3);
    const x = rand()*w, y = barH + rand()*(h-barH)*0.86;
    const r = 40 + rand()*160;
    if(kind===0){ // 圆形
      g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill();
    } else if(kind===1){ // 矩形
      g.save();
      g.translate(x,y); g.rotate((rand()-.5)*.6);
      g.fillRect(-r/2, -r/4, r, r*0.5);
      g.restore();
    } else { // 三角
      g.beginPath();
      g.moveTo(x,y);
      g.lineTo(x+r, y+r*0.6);
      g.lineTo(x-r*0.4, y+r);
      g.closePath(); g.fill();
    }
  }

  // 6. 底部色带条（杂志风格）
  const bandH = 22;
  palette.slice(0,6).forEach((col,i)=>{
    g.fillStyle = hexA(col[0], Math.min(.8, col[1]+.25));
    g.fillRect(0, h-bandH*(6-i), w, bandH);
  });

  // 7. 左下角大块标题卡片
  const cardX = 36, cardY = h - bandH*6 - 210;
  const cardW = w*0.56, cardH = 170;
  g.fillStyle = 'rgba(255,255,255,.92)';
  roundRect(g, cardX, cardY, cardW, cardH, 16); g.fill();
  g.strokeStyle = '#1e1c38'; g.lineWidth = 1.5;
  roundRect(g, cardX, cardY, cardW, cardH, 16); g.stroke();

  g.fillStyle = '#1e1c38';
  g.font = `700 ${Math.max(14, Math.round(cardH*0.09))}px Fredoka, sans-serif`;
  g.textBaseline = 'top';
  g.fillText('A  B S T R A C T  ·  某  一  帧', cardX+22, cardY+20);
  g.font = `500 ${Math.max(13, Math.round(cardH*0.085))}px Georgia, serif`;
  g.fillStyle = '#4a4a55';
  const quote = 'Somewhere between the road and the sky, we found a color of our own.';
  wrapText(g, quote, 'Georgia, serif', Math.round(cardH*0.085), cardW-44).forEach((ln,i)=>{
    g.fillText(ln, cardX+22, cardY+62 + i*24);
  });

  // 8. 右下角印章
  drawStamp(g, w-110, cardY + 30, 'EDIT', '#b23b81');

  // 9. 左侧页码条
  g.fillStyle = '#1e1c38';
  g.fillRect(0, barH+16, 6, 40);
  g.font = '700 14px Fredoka, sans-serif';
  g.textBaseline = 'top';
  g.fillText('P.' + (1+Math.floor(rand()*99)), 18, barH+26);
}

/* 风格 B：极简杂志 —— 黑白 / 留白 / 衬线字排版 */
function drawZine(g, img, c){
  const w = c.width, h = c.height;
  // 白边画布：把图放到内部
  const margin = 90;
  const pw = w - margin*2;
  const ph = h - margin*3;
  // 背景
  g.fillStyle = '#fbfaf6';
  g.fillRect(0,0,w,h);
  // 顶部标题
  g.fillStyle = '#111';
  g.font = '700 56px "ZCOOL KuaiLe", Georgia, serif';
  g.textBaseline = 'top';
  g.fillText('旅 途 小 志', margin, 40);
  g.font = 'italic 16px Georgia, serif';
  g.fillStyle = '#555';
  g.fillText('THE JOURNAL · VOL.01 · ISSUE OF TODAY', margin, 96);
  // 右上角一条细线
  g.strokeStyle='#111'; g.lineWidth=2;
  g.beginPath(); g.moveTo(w-margin-160, 66); g.lineTo(w-margin, 66); g.stroke();
  g.beginPath(); g.moveTo(w-margin-120, 82); g.lineTo(w-margin, 82); g.stroke();
  g.strokeStyle='#aaa'; g.lineWidth=1;
  g.beginPath(); g.moveTo(w-margin-80, 98); g.lineTo(w-margin, 98); g.stroke();

  // 照片（加灰调+略暗角）
  g.save();
  g.filter = 'grayscale(.85) contrast(1.08) brightness(1.02) sepia(.08)';
  g.drawImage(img, margin, margin*2, pw, ph);
  g.restore();
  // 暗角
  const vg = g.createRadialGradient(margin+pw/2, margin*2+ph/2, Math.min(pw,ph)*.4, margin+pw/2, margin*2+ph/2, Math.max(pw,ph)*.75);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.35)');
  g.fillStyle = vg; g.fillRect(margin, margin*2, pw, ph);
  // 照片边框
  g.strokeStyle='#111'; g.lineWidth=1.2;
  g.strokeRect(margin+.5, margin*2+.5, pw-1, ph-1);

  // 图片编号
  g.font = '700 14px Georgia, serif';
  g.fillStyle = '#222';
  g.textBaseline = 'alphabetic';
  g.fillText('FIG. 0' + (1 + Math.floor(Math.random()*9)) + ' — A MOMENT ON THE ROAD', margin, margin*2+ph+28);

  // 底部引言
  g.font = 'italic 22px Georgia, serif';
  g.fillStyle = '#222';
  g.textBaseline = 'bottom';
  const lines = [
    '"We travel not to escape life,',
    'but for life not to escape us."',
  ];
  let ly = h - margin + 20;
  lines.forEach((line,i)=>{
    g.fillText(line, margin, ly + i*28);
  });
  // 页码
  g.font = '700 14px Georgia, serif';
  g.fillStyle = '#111';
  g.textAlign = 'right';
  g.fillText('— ' + (1+Math.floor(Math.random()*88)) + ' —', w-margin, h-margin+70);
  g.textAlign = 'left';

  // 小印章
  drawStamp(g, margin+30, margin*2+30, 'JRNL', '#111');
}

/* 风格 C：自定义提示词 —— 原图 + 柔和滤镜 + 文字叠加 */
function drawPrompt(g, img, c){
  const w = c.width, h = c.height;
  g.drawImage(img,0,0,w,h);
  // 轻微电影质感
  g.filter = 'saturate(1.05) contrast(1.03)';
  g.drawImage(img,0,0,w,h);
  g.filter = 'none';
  // 柔和暗角
  const vg = g.createRadialGradient(w/2,h/2,Math.min(w,h)*.35, w/2,h/2, Math.max(w,h)*.7);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.35)');
  g.fillStyle = vg; g.fillRect(0,0,w,h);

  // 文字
  const text = ($('#promptInput').value || '写一句属于自己的话，\n把旅途的心情装进去。').trim();
  const font = $('#promptFont').value;
  const pos = $('#promptPos').value;
  const color = ($$('#promptColors .swatch.is-active')[0] || $$('#promptColors .swatch')[0] || document.createElement('span')).dataset.c || '#ffffff';
  const maxWidth = w*0.78;
  const baseSize = Math.max(30, Math.round(w/22));

  // 文字底板
  g.save();
  const lines = text.split(/\n+/).flatMap(line=>wrapText(g, line, font, baseSize, maxWidth));
  const lineH = baseSize*1.35;
  const textH = lines.length*lineH;
  const padX = 28, padY = 24;
  let boxY;
  if(pos==='top') boxY = 60;
  else if(pos==='center') boxY = (h - (textH+padY*2))/2;
  else boxY = h - textH - padY*2 - 60;
  const boxX = (w - (maxWidth + padX*2))/2;
  const boxW = maxWidth + padX*2;
  const boxH = textH + padY*2;
  // 半透明背板
  g.fillStyle = color==='#fff' ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.25)';
  roundRect(g, boxX, boxY, boxW, boxH, 18);
  g.fill();
  // 文字
  g.fillStyle = color;
  g.textBaseline = 'top';
  g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 6; g.shadowOffsetY=2;
  lines.forEach((ln,i)=>{
    g.fillText(ln, boxX+padX, boxY+padY + i*lineH);
  });
  g.restore();

  // 角落 LOGO
  g.save();
  g.fillStyle = color==='#fff' ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.7)';
  g.font = '500 14px Fredoka, sans-serif';
  g.fillText('JOURNEY · POST · 旅途邮局', 24, h-28);
  g.textAlign='right';
  g.fillText(new Date().toLocaleDateString(), w-24, h-28);
  g.restore();
}

/* ---------- 绘图辅助 ---------- */
function wrapText(ctx, text, fontFace, size, maxWidth){
  ctx.font = `500 ${size}px ${fontFace}`;
  const chars = [...text];
  const lines = [];
  let cur = '';
  for(const ch of chars){
    const test = cur + ch;
    if(ctx.measureText(test).width > maxWidth && cur){
      lines.push(cur); cur = ch;
    } else cur = test;
  }
  if(cur) lines.push(cur);
  return lines;
}
function roundRect(g,x,y,w,h,r){
  r = Math.min(r, w/2, h/2);
  g.beginPath();
  g.moveTo(x+r,y);
  g.lineTo(x+w-r,y); g.quadraticCurveTo(x+w,y,x+w,y+r);
  g.lineTo(x+w,y+h-r); g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  g.lineTo(x+r,y+h); g.quadraticCurveTo(x,y+h,x,y+h-r);
  g.lineTo(x,y+r); g.quadraticCurveTo(x,y,x+r,y);
  g.closePath();
}
function hexA(hex, a){
  const h = hex.replace('#','');
  const bigint = parseInt(h.length===3 ? h.split('').map(x=>x+x).join('') : h, 16);
  const r = (bigint>>16)&255, g = (bigint>>8)&255, b = bigint&255;
  return `rgba(${r},${g},${b},${a})`;
}
function drawStamp(g, x, y, word, color='#b23b81'){
  g.save();
  g.translate(x,y); g.rotate(-.18);
  g.strokeStyle = color; g.lineWidth = 4;
  const r = 42;
  g.beginPath(); g.arc(0,0,r,0,Math.PI*2); g.stroke();
  g.beginPath(); g.arc(0,0,r-6,0,Math.PI*2); g.strokeStyle = color; g.globalAlpha=.6; g.lineWidth=1.5; g.stroke();
  g.globalAlpha=1;
  g.fillStyle = color;
  g.font = `700 ${Math.max(14, r/2.6)}px Fredoka, sans-serif`;
  g.textAlign='center'; g.textBaseline='middle';
  g.fillText(word.toUpperCase().slice(0,5), 0, 2);
  g.restore();
}
function seedFromImg(img){
  let s = 0;
  const str = (img.naturalWidth+'_'+img.naturalHeight+'_'+(img.currentSrc?.length||0));
  for(let i=0;i<str.length;i++) s = (s*31 + str.charCodeAt(i))>>>0;
  return s || 1;
}
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/* ---------- 批量处理按钮 ---------- */
$('#postProcess').addEventListener('click', async ()=>{
  if(!posts.length) return toast('请先上传照片～');
  for(const p of posts){
    const wrap = postThumbs.querySelector(`[data-id="${p.id}"]`);
    wrap?.querySelector('.media')?.classList.add('processing');
  }
  toast('处理中…请稍候');
  await Promise.all(posts.map(p=>processOne(p)));
  renderThumbs();
  toast('处理完成 ✨');
});

/* ---------- 保存 ---------- */
async function savePost(p){
  if(!p.canvas) return toast('请先处理照片');
  const blob = await toBlob(p.canvas, 'image/jpeg', 0.92);
  const base = (p.name||'photo').replace(/\.[^.]+$/,'');
  saveAs(blob, `journey-${base}.jpg`);
}

$('#postDownloadAll').addEventListener('click', async ()=>{
  const done = posts.filter(p=>p.processed && p.canvas);
  if(!done.length) return toast('没有可下载的成品哦');
  toast('正在打包…');
  const zip = new JSZip();
  const folder = zip.folder('journey-post');
  await Promise.all(done.map(async (p,i)=>{
    const blob = await toBlob(p.canvas, 'image/jpeg', 0.92);
    const base = (p.name||`photo-${i+1}`).replace(/\.[^.]+$/,'');
    folder.file(`${base}.jpg`, blob);
  }));
  const content = await zip.generateAsync({type:'blob'});
  saveAs(content, `journey-post-${Date.now()}.zip`);
  toast('打包下载完成 📦');
});

  const swatches = $$('#promptColors .swatch');
  if(!swatches.some(s=>s.classList.contains('is-active')) && swatches[0]){
    swatches[0].classList.add('is-active');
  }
