/* =========================================================
   云邮四海 · Clouds & Postcards Worldwide  —  前端主逻辑
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
    {name:'奶凶Q猫',
     svg:`<svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 身体：圆润坐姿 + 尾巴 + 两只腿 -->
       <path d="M72 200 C58 198 48 180 52 158 C30 148 26 112 52 98 L62 94 C60 80 58 64 70 52 L92 68 C96 52 108 38 122 38 C136 38 148 52 152 68 L174 52 C186 64 184 80 182 94 L192 98 C218 112 214 148 192 158 C196 180 186 198 172 200 L158 216 L144 200 L98 200 L84 216 Z" stroke-linejoin="round"/>
       <!-- 耳朵内廓 -->
       <path d="M72 58 L82 74 L68 72 Z M170 58 L160 74 L174 72 Z" stroke-linejoin="round"/>
       <!-- 尾巴 S 形 -->
       <path d="M176 156 C204 150 218 130 210 110 C204 96 188 94 184 106" stroke-linecap="round"/>
       <!-- 前爪 -->
       <path d="M86 188 C86 196 80 200 76 200 C72 200 72 194 72 188 C72 182 78 182 86 188 Z M166 188 C166 196 160 200 156 200 C152 200 152 194 152 188 C152 182 158 182 166 188 Z" stroke-linejoin="round"/>
       <!-- 斑纹：额头三道 -->
       <path d="M102 56 Q108 48 114 56 M118 54 Q122 46 126 54 M94 60 Q96 54 100 58 M144 60 Q144 54 148 58" stroke-linecap="round"/>
       <!-- 眼睛：大眼高光 -->
       <path d="M90 104 C88 122 72 122 74 104 C74 90 90 90 90 104 Z M152 104 C150 122 134 122 136 104 C136 90 152 90 152 104 Z" fill="currentColor"/>
       <circle cx="84" cy="100" r="4" fill="#fff"/>
       <circle cx="146" cy="100" r="4" fill="#fff"/>
       <!-- 腮红 -->
       <ellipse cx="64" cy="126" rx="10" ry="7" fill="currentColor" opacity=".25"/>
       <ellipse cx="162" cy="126" rx="10" ry="7" fill="currentColor" opacity=".25"/>
       <!-- 鼻子 + 嘴 -->
       <path d="M112 128 L122 128 L117 134 Z" fill="currentColor"/>
       <path d="M117 134 L117 142 M117 142 C108 150 96 144 90 140 M117 142 C126 150 138 144 144 140" stroke-linecap="round"/>
       <!-- 胡须 -->
       <path d="M60 140 L44 136 M58 148 L42 152 M174 140 L190 136 M176 148 L192 152" stroke-linecap="round"/>
     </svg>`},
    {name:'柴犬面包',
     svg:`<svg viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 身体 -->
       <path d="M46 170 C34 166 28 140 36 120 C20 106 22 78 44 72 L60 68 L80 46 L104 66 L136 66 L160 46 L180 68 L196 72 C218 78 220 106 204 120 C212 140 206 166 194 170 L190 198 L174 198 L172 178 L70 178 L68 198 L52 198 Z" stroke-linejoin="round"/>
       <!-- 垂耳（内侧） -->
       <path d="M78 58 C76 82 92 88 96 70 M162 58 C164 82 148 88 144 70" stroke-linejoin="round"/>
       <!-- 眉毛 + 眉心 -->
       <path d="M88 90 Q92 84 98 90 M142 90 Q146 84 152 90 M118 82 L122 76 L126 82" stroke-linecap="round"/>
       <!-- 圆眼睛 -->
       <ellipse cx="96" cy="108" rx="6" ry="8" fill="currentColor"/>
       <ellipse cx="144" cy="108" rx="6" ry="8" fill="currentColor"/>
       <circle cx="98" cy="104" r="2" fill="#fff"/>
       <circle cx="146" cy="104" r="2" fill="#fff"/>
       <!-- 黑鼻子 -->
       <ellipse cx="120" cy="126" rx="10" ry="7" fill="currentColor"/>
       <!-- 笑嘴 -->
       <path d="M120 132 L120 138 M120 138 C108 150 92 148 84 140 M120 138 C132 150 148 148 156 140" stroke-linecap="round"/>
       <!-- 腮红 -->
       <ellipse cx="72" cy="136" rx="12" ry="8" fill="currentColor" opacity=".28"/>
       <ellipse cx="168" cy="136" rx="12" ry="8" fill="currentColor" opacity=".28"/>
       <!-- 爪子 -->
       <path d="M74 188 C74 196 68 200 64 200 C60 200 60 194 60 188 C60 182 66 182 74 188 Z M178 188 C178 196 172 200 168 200 C164 200 164 194 164 188 C164 182 170 182 178 188 Z" stroke-linejoin="round"/>
       <!-- 小卷尾 -->
       <path d="M202 140 C222 132 222 104 202 112 C196 118 200 128 208 128" stroke-linecap="round"/>
     </svg>`},
    {name:'长耳兔兔',
     svg:`<svg viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 长耳朵 L -->
       <path d="M78 110 C56 86 58 28 84 18 C102 12 112 36 108 72 L104 112" stroke-linejoin="round"/>
       <path d="M82 90 C74 74 78 40 88 36 C94 34 98 60 96 86" stroke-linecap="round"/>
       <!-- 长耳朵 R -->
       <path d="M142 110 C164 86 162 28 136 18 C118 12 108 36 112 72 L116 112" stroke-linejoin="round"/>
       <path d="M138 90 C146 74 142 40 132 36 C126 34 122 60 124 86" stroke-linejoin="round"/>
       <!-- 圆头 -->
       <circle cx="110" cy="140" r="62"/>
       <!-- 额前刘海毛 -->
       <path d="M86 92 Q100 78 114 92 Q128 80 140 94" stroke-linecap="round"/>
       <!-- 大眼 -->
       <ellipse cx="88" cy="144" rx="9" ry="12" fill="currentColor"/>
       <ellipse cx="132" cy="144" rx="9" ry="12" fill="currentColor"/>
       <circle cx="91" cy="138" r="3.2" fill="#fff"/>
       <circle cx="135" cy="138" r="3.2" fill="#fff"/>
       <!-- 下睫毛 -->
       <path d="M80 158 L82 164 M88 160 L88 166 M96 158 L94 164 M124 158 L126 164 M132 160 L132 166 M140 158 L138 164" stroke-linecap="round"/>
       <!-- 小粉鼻 -->
       <path d="M104 170 L116 170 L110 176 Z" fill="currentColor"/>
       <!-- 小嘴 -->
       <path d="M110 176 L110 184 M110 184 C100 194 90 190 84 184 M110 184 C120 194 130 190 136 184" stroke-linecap="round"/>
       <!-- 腮红 -->
       <ellipse cx="66" cy="172" rx="12" ry="8" fill="currentColor" opacity=".3"/>
       <ellipse cx="154" cy="172" rx="12" ry="8" fill="currentColor" opacity=".3"/>
       <!-- 胡须 -->
       <path d="M56 180 L40 176 M54 190 L38 194 M164 180 L180 176 M166 190 L182 194" stroke-linecap="round"/>
     </svg>`},
    {name:'胖达团团',
     svg:`<svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 耳朵（填充黑色） -->
       <circle cx="66" cy="62" r="24" fill="currentColor" opacity=".9"/>
       <circle cx="174" cy="62" r="24" fill="currentColor" opacity=".9"/>
       <!-- 大圆头 -->
       <circle cx="120" cy="130" r="84"/>
       <!-- 黑眼圈 -->
       <path d="M76 118 C60 112 52 140 70 152 C88 160 96 132 82 120 Z M164 118 C180 112 188 140 170 152 C152 160 144 132 158 120 Z" fill="currentColor"/>
       <!-- 黑眼睛（在眼圈里） -->
       <ellipse cx="78" cy="130" rx="5" ry="7" fill="#fff"/>
       <ellipse cx="162" cy="130" rx="5" ry="7" fill="#fff"/>
       <ellipse cx="79" cy="132" rx="3" ry="4" fill="currentColor"/>
       <ellipse cx="163" cy="132" rx="3" ry="4" fill="currentColor"/>
       <!-- 黑鼻子 + 嘴 -->
       <path d="M112 160 L128 160 L120 168 Z" fill="currentColor"/>
       <path d="M120 168 L120 178 M120 178 C110 186 96 182 90 174 M120 178 C130 186 144 182 150 174" stroke-linecap="round"/>
       <!-- 脸中部的小白脸区域（只画两撇边毛） -->
       <path d="M76 172 Q66 186 86 192 M164 172 Q174 186 154 192" stroke-linecap="round"/>
       <!-- 两撇小黑手 -->
       <ellipse cx="50" cy="200" rx="22" ry="14" fill="currentColor" opacity=".85"/>
       <ellipse cx="190" cy="200" rx="22" ry="14" fill="currentColor" opacity=".85"/>
       <!-- 腮红 -->
       <ellipse cx="62" cy="156" rx="8" ry="5" fill="currentColor" opacity=".25"/>
       <ellipse cx="178" cy="156" rx="8" ry="5" fill="currentColor" opacity=".25"/>
     </svg>`},
    {name:'萌狐小七',
     svg:`<svg viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 三角耳朵 + 内廓 -->
       <path d="M44 86 L30 40 L86 72 Z M196 86 L210 40 L154 72 Z" stroke-linejoin="round"/>
       <path d="M50 70 L48 58 L62 66 Z M190 70 L192 58 L178 66 Z" stroke-linejoin="round"/>
       <!-- 头部（宽脸） -->
       <path d="M54 108 C34 92 32 64 60 56 C82 50 106 60 120 62 C134 60 158 50 180 56 C208 64 206 92 186 108 C194 130 182 158 156 164 C144 184 120 192 100 184 C80 176 68 158 60 146 C44 146 40 124 54 108 Z" stroke-linejoin="round"/>
       <!-- 眉心纹 -->
       <path d="M112 72 Q120 64 128 72 M108 82 L114 76 L120 82 L126 76 L132 82" stroke-linecap="round"/>
       <!-- 琥珀大眼 -->
       <path d="M80 110 C76 128 60 128 62 110 C62 96 80 96 80 110 Z M172 110 C176 128 160 128 158 110 C158 96 176 96 172 110 Z" fill="currentColor"/>
       <circle cx="68" cy="106" r="3.2" fill="#fff"/>
       <circle cx="166" cy="106" r="3.2" fill="#fff"/>
       <!-- 黑鼻尖 + 嘴 -->
       <ellipse cx="120" cy="134" rx="9" ry="6" fill="currentColor"/>
       <path d="M120 140 L120 148 M120 148 C108 158 94 152 88 146 M120 148 C132 158 146 152 152 146" stroke-linecap="round"/>
       <!-- 脸部白色区域线条 -->
       <path d="M88 142 Q120 164 152 142 Q152 154 142 166 Q120 176 98 166 Q88 154 88 142 Z" stroke-linejoin="round"/>
       <!-- 大尾巴 -->
       <path d="M182 150 C220 148 232 120 218 98 C234 100 242 130 222 154 C220 164 206 172 196 166" stroke-linejoin="round"/>
       <!-- 尾尖白 -->
       <path d="M226 106 C240 112 240 128 228 130" stroke-linecap="round" stroke-width="5"/>
     </svg>`},
    {name:'企鹅团子',
     svg:`<svg viewBox="0 0 210 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 身体 -->
       <path d="M105 24 C60 24 34 74 42 134 C38 180 66 216 105 218 C144 216 172 180 168 134 C176 74 150 24 105 24 Z" stroke-linejoin="round"/>
       <!-- 白肚 -->
       <path d="M70 90 C64 128 74 190 105 200 C136 190 146 128 140 90 C130 84 118 88 105 90 C92 88 80 84 70 90 Z" stroke-linejoin="round"/>
       <!-- 头顶毛撮 -->
       <path d="M96 28 Q105 8 114 28 Q110 24 105 24 Q100 24 96 28 Z" stroke-linejoin="round"/>
       <!-- 圆眼 -->
       <ellipse cx="88" cy="78" rx="8" ry="10" fill="currentColor"/>
       <ellipse cx="122" cy="78" rx="8" ry="10" fill="currentColor"/>
       <circle cx="90" cy="74" r="2.6" fill="#fff"/>
       <circle cx="124" cy="74" r="2.6" fill="#fff"/>
       <!-- 嘴 -->
       <path d="M94 100 L116 100 L124 112 L86 112 Z" stroke-linejoin="round" fill="currentColor" opacity=".08"/>
       <path d="M94 100 L116 100 L124 112 L86 112 Z M92 106 L128 106" stroke-linejoin="round"/>
       <!-- 腮红 -->
       <ellipse cx="66" cy="110" rx="10" ry="6" fill="currentColor" opacity=".3"/>
       <ellipse cx="144" cy="110" rx="10" ry="6" fill="currentColor" opacity=".3"/>
       <!-- 翅膀 -->
       <path d="M48 130 C30 140 30 178 56 190 L60 140 Z M162 130 C180 140 180 178 154 190 L150 140 Z" stroke-linejoin="round"/>
       <!-- 脚 -->
       <path d="M82 216 L76 230 L94 230 L90 216 Z M128 216 L122 230 L140 230 L136 216 Z" stroke-linejoin="round"/>
     </svg>`},
    {name:'柯基屁屁',
     svg:`<svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 屁屁 -->
       <path d="M60 120 C40 120 28 150 48 178 C30 192 40 216 66 208 C70 216 88 216 90 206 C96 212 110 214 116 204 C122 214 136 212 142 206 C144 216 162 216 166 208 C192 216 202 192 184 178 C204 150 192 120 172 120 C162 100 140 92 130 92 L130 118 L114 118 L114 92 C104 92 82 100 72 120 Z" stroke-linejoin="round"/>
       <!-- 白肚中线 -->
       <path d="M122 118 L122 202 M118 198 Q122 206 126 198" stroke-linecap="round"/>
       <!-- 两条短腿 -->
       <path d="M76 206 C70 220 54 220 50 210 C50 198 66 196 76 206 Z M184 206 C190 220 206 220 210 210 C210 198 194 196 184 206 Z" stroke-linejoin="round"/>
       <!-- 心形腮红（代替真实脸） -->
       <path d="M72 152 C68 144 82 138 84 146 C86 138 100 144 96 152 C92 162 76 162 72 152 Z M168 152 C164 144 178 138 180 146 C182 138 196 144 192 152 C188 162 172 162 168 152 Z" fill="currentColor" opacity=".3"/>
       <!-- 卷尾巴 -->
       <path d="M122 92 C108 82 104 64 122 58 C138 56 142 74 132 82" stroke-linecap="round"/>
       <!-- 两只耳朵在脑袋边缘 -->
       <path d="M60 118 L50 100 L78 104 Z M172 118 L182 100 L154 104 Z" stroke-linejoin="round"/>
     </svg>`},
    {name:'海豹球球',
     svg:`<svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 身体 -->
       <ellipse cx="130" cy="112" rx="110" ry="58"/>
       <!-- 头 -->
       <circle cx="72" cy="92" r="48"/>
       <!-- 尾巴 -->
       <path d="M238 112 C252 100 258 88 254 72 C252 86 242 96 232 98 M238 112 C252 124 258 136 254 152 C252 138 242 128 232 126" stroke-linejoin="round"/>
       <!-- 鳍 -->
       <path d="M108 144 C98 164 118 172 124 158 L120 140 Z M170 146 C164 166 186 174 192 160 L184 144 Z" stroke-linejoin="round"/>
       <!-- 大眼 + 睫毛 -->
       <ellipse cx="58" cy="84" rx="8" ry="10" fill="currentColor"/>
       <circle cx="60" cy="80" r="2.8" fill="#fff"/>
       <path d="M50 74 L48 66 L56 70 M62 70 L62 62 L68 66" stroke-linecap="round"/>
       <!-- 鼻子 -->
       <ellipse cx="30" cy="94" rx="8" ry="6" fill="currentColor"/>
       <!-- 胡须 + 嘴 -->
       <path d="M30 102 L30 108 M20 108 Q30 116 40 108" stroke-linecap="round"/>
       <path d="M18 94 L2 92 M18 102 L2 106 M40 94 L56 90 M40 102 L56 104" stroke-linecap="round"/>
       <!-- 背部斑点 -->
       <path d="M130 78 Q140 72 148 80 M172 86 Q182 80 192 90 M206 112 Q214 106 220 116" stroke-linecap="round"/>
     </svg>`},
    {name:'小猪布丁',
     svg:`<svg viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 身体 -->
       <ellipse cx="120" cy="150" rx="96" ry="62"/>
       <!-- 头 -->
       <circle cx="120" cy="94" r="66"/>
       <!-- 耳朵 -->
       <path d="M72 56 Q60 40 78 42 Q86 52 82 62 Z M168 56 Q180 40 162 42 Q154 52 158 62 Z" stroke-linejoin="round"/>
       <!-- 猪鼻子 -->
       <ellipse cx="120" cy="108" rx="26" ry="18"/>
       <circle cx="112" cy="108" r="3.2" fill="currentColor"/>
       <circle cx="128" cy="108" r="3.2" fill="currentColor"/>
       <!-- 眼睛 -->
       <ellipse cx="92" cy="82" rx="6" ry="8" fill="currentColor"/>
       <ellipse cx="148" cy="82" rx="6" ry="8" fill="currentColor"/>
       <circle cx="94" cy="78" r="2" fill="#fff"/>
       <circle cx="150" cy="78" r="2" fill="#fff"/>
       <!-- 笑嘴 -->
       <path d="M90 138 C100 148 140 148 150 138" stroke-linecap="round"/>
       <!-- 腮红 -->
       <ellipse cx="60" cy="118" rx="14" ry="9" fill="currentColor" opacity=".3"/>
       <ellipse cx="180" cy="118" rx="14" ry="9" fill="currentColor" opacity=".3"/>
       <!-- 四只蹄子 -->
       <path d="M62 198 L56 212 L72 212 L70 198 Z M108 198 L104 212 L120 212 L118 198 Z M136 198 L134 212 L150 212 L146 198 Z M182 198 L176 212 L192 212 L190 198 Z" stroke-linejoin="round"/>
       <!-- 卷尾巴 -->
       <path d="M214 142 C228 134 232 118 220 112 C208 108 204 124 216 130 C208 132 206 142 214 142 Z" stroke-linejoin="round"/>
     </svg>`},
  ],
  fairy: [
    {name:'Q版仙女',
     svg:`<svg viewBox="0 0 220 280" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 双丸子头发 -->
       <circle cx="58" cy="62" r="22" fill="currentColor" opacity=".2"/>
       <circle cx="162" cy="62" r="22" fill="currentColor" opacity=".2"/>
       <path d="M58 48 Q50 28 78 36 M162 48 Q170 28 142 36" stroke-linecap="round"/>
       <!-- 脸 + 头发外轮廓 -->
       <path d="M54 92 Q54 40 110 34 Q166 40 166 92 L166 116 Q166 130 150 130 L142 120 Q136 118 130 120 L124 130 L96 130 L90 120 Q84 118 78 120 L70 130 Q54 130 54 116 Z" stroke-linejoin="round"/>
       <!-- 齐刘海 -->
       <path d="M62 78 Q74 64 92 70 Q110 58 128 70 Q146 64 158 78 Q152 88 138 82 Q128 90 120 84 Q112 90 102 84 Q90 90 82 82 Q74 88 62 78 Z" stroke-linejoin="round"/>
       <!-- 大眼 -->
       <ellipse cx="84" cy="102" rx="8" ry="11" fill="currentColor"/>
       <ellipse cx="136" cy="102" rx="8" ry="11" fill="currentColor"/>
       <circle cx="86" cy="97" r="2.8" fill="#fff"/>
       <circle cx="138" cy="97" r="2.8" fill="#fff"/>
       <path d="M78 116 Q84 120 90 116 M130 116 Q136 120 142 116" stroke-linecap="round"/>
       <!-- 鼻子 + 嘴 -->
       <path d="M108 114 Q110 120 112 114" stroke-linecap="round"/>
       <path d="M98 132 Q110 142 122 132" stroke-linecap="round"/>
       <!-- 花钿 -->
       <path d="M108 52 Q110 46 112 52 Q116 50 114 58 Q110 62 106 58 Q104 50 108 52 Z" fill="currentColor" opacity=".7"/>
       <!-- 腮红 -->
       <ellipse cx="68" cy="120" rx="10" ry="6" fill="currentColor" opacity=".3"/>
       <ellipse cx="152" cy="120" rx="10" ry="6" fill="currentColor" opacity=".3"/>
       <!-- 汉服襦裙 -->
       <path d="M60 136 Q30 160 26 220 Q22 260 52 270 L168 270 Q198 260 194 220 Q190 160 160 136 Q140 126 110 128 Q80 126 60 136 Z" stroke-linejoin="round"/>
       <!-- 交领 -->
       <path d="M88 136 L110 164 L132 136 L140 140 L118 172 L102 172 L80 140 Z" stroke-linejoin="round"/>
       <!-- 裙腰 -->
       <path d="M46 200 L174 200" stroke-linecap="round"/>
       <!-- 裙褶 -->
       <path d="M66 210 L60 264 M90 212 L88 266 M110 212 L110 266 M130 212 L132 266 M154 210 L160 264" stroke-linecap="round"/>
       <!-- 飘带 -->
       <path d="M156 148 Q186 158 194 184 Q196 208 172 210" stroke-linecap="round"/>
       <path d="M162 160 Q172 172 174 188" stroke-linecap="round" stroke-dasharray="3 5"/>
       <!-- 发饰 -->
       <circle cx="110" cy="36" r="4" fill="currentColor"/>
       <path d="M102 32 L98 22 L110 24 L122 22 L118 32" stroke-linejoin="round"/>
     </svg>`},
    {name:'古风背影少女',
     svg:`<svg viewBox="0 0 220 290" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 发髻 + 簪子 -->
       <path d="M82 62 Q78 28 110 22 Q142 28 138 62 Q152 66 144 96 L130 112" stroke-linejoin="round"/>
       <path d="M82 62 Q86 84 70 110 L86 104 Q88 90 86 78 Z" stroke-linejoin="round"/>
       <path d="M90 46 Q110 38 130 46" stroke-linecap="round"/>
       <!-- 簪子 -->
       <path d="M110 24 L112 6 Q108 2 104 4 L102 0 M124 34 L140 30 L136 38 L146 40 L134 46" stroke-linecap="round"/>
       <!-- 脖子 + 衣领 -->
       <path d="M94 106 Q110 116 126 106 L130 118 Q110 126 90 118 Z" stroke-linejoin="round"/>
       <!-- 广袖外袍 -->
       <path d="M42 126 Q14 150 14 202 Q10 248 40 276 Q76 268 94 276 L126 276 Q144 268 180 276 Q210 248 206 202 Q206 150 178 126 Q150 112 110 114 Q70 112 42 126 Z" stroke-linejoin="round"/>
       <!-- 内层 -->
       <path d="M60 150 Q110 140 160 150 M46 186 Q110 172 174 186 M54 228 Q110 216 166 228" stroke-linecap="round"/>
       <!-- 腰带 -->
       <path d="M52 204 L168 204 L168 218 L52 218 Z" stroke-linejoin="round"/>
       <path d="M94 210 L110 226 L126 210" stroke-linecap="round"/>
       <!-- 飘袖 -->
       <path d="M14 202 Q2 218 10 238 Q18 248 40 236" stroke-linejoin="round"/>
       <path d="M206 202 Q218 218 210 238 Q202 248 180 236" stroke-linejoin="round"/>
       <!-- 披帛 -->
       <path d="M46 140 Q10 180 26 228 Q36 248 56 236" stroke-linecap="round" stroke-dasharray="4 6"/>
       <path d="M174 140 Q210 180 194 228 Q184 248 164 236" stroke-linecap="round" stroke-dasharray="4 6"/>
     </svg>`},
    {name:'提灯少女',
     svg:`<svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 灯笼 -->
       <path d="M46 120 L46 104 L88 104 L88 120" stroke-linecap="round"/>
       <path d="M30 120 Q24 150 38 180 Q52 200 67 200 Q82 200 96 180 Q110 150 104 120 Z" stroke-linejoin="round"/>
       <path d="M30 140 L104 140 M28 160 L106 160 M36 180 L98 180" stroke-linecap="round"/>
       <path d="M67 104 L67 90 L61 90 M67 200 L67 220 L54 232 L80 232 Z" stroke-linecap="round"/>
       <!-- 提灯杆 -->
       <path d="M88 112 L140 124" stroke-linecap="round"/>
       <!-- 头 + 头发 -->
       <path d="M146 52 Q144 20 180 18 Q216 20 214 52 Q224 60 218 86 L212 108 Q212 122 200 122 L194 116 L178 114 Q172 108 166 114 L160 122 Q146 122 146 108 L148 86 Q142 60 146 52 Z" stroke-linejoin="round"/>
       <!-- 刘海 -->
       <path d="M156 66 Q170 54 180 62 Q192 52 204 66 Q202 76 190 72 Q180 82 172 74 Q166 82 156 76 Q152 72 156 66 Z" stroke-linejoin="round"/>
       <!-- 脸 -->
       <path d="M158 74 Q158 114 180 116 Q202 114 202 74" fill="none" stroke="currentColor"/>
       <!-- 眼 -->
       <path d="M170 92 Q172 98 178 96 M188 92 Q190 98 196 96" stroke-linecap="round"/>
       <!-- 嘴 -->
       <path d="M178 108 Q182 112 186 108" stroke-linecap="round"/>
       <!-- 发饰花 -->
       <path d="M208 40 L214 32 L220 42 L228 40 L224 50 L230 56 L218 56 L214 64 L210 56 L198 56 L204 50 L200 40 Z" stroke-linejoin="round" fill="currentColor" opacity=".2"/>
       <!-- 汉服 -->
       <path d="M136 122 Q108 142 102 204 Q96 262 132 272 L228 272 Q264 262 258 204 Q252 142 224 122 Q204 114 180 116 Q156 114 136 122 Z" stroke-linejoin="round"/>
       <!-- 交领 -->
       <path d="M160 124 L180 164 L200 124 L206 132 L186 170 L174 170 L154 132 Z" stroke-linejoin="round"/>
       <!-- 手持灯笼的手 -->
       <path d="M136 136 Q124 132 126 124 Q130 116 142 118" stroke-linejoin="round"/>
       <!-- 裙摆花纹 -->
       <path d="M130 210 Q180 200 230 210 M122 240 Q180 228 238 240" stroke-linecap="round" stroke-dasharray="4 5"/>
     </svg>`},
    {name:'天使少女',
     svg:`<svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 翅膀 L -->
       <path d="M86 108 Q30 72 18 130 Q18 170 58 162 Q46 176 66 188 Q78 180 88 170 Q80 188 104 188 Q98 172 102 154 Q100 134 86 108 Z" stroke-linejoin="round"/>
       <path d="M38 124 Q58 110 74 124 M40 144 Q64 130 82 146 M62 168 Q84 158 96 172" stroke-linecap="round"/>
       <!-- 翅膀 R -->
       <path d="M174 108 Q230 72 242 130 Q242 170 202 162 Q214 176 194 188 Q182 180 172 170 Q180 188 156 188 Q162 172 158 154 Q160 134 174 108 Z" stroke-linejoin="round"/>
       <path d="M222 124 Q202 110 186 124 M220 144 Q196 130 178 146 M198 168 Q176 158 164 172" stroke-linecap="round"/>
       <!-- 头 -->
       <circle cx="130" cy="72" r="42"/>
       <!-- 短发 -->
       <path d="M98 62 Q96 30 130 26 Q164 30 162 62 Q168 56 160 46 Q174 52 168 70 Q178 68 174 88 L162 86 Q162 78 156 74 Q156 82 148 82 Q148 74 140 72 Q140 80 132 80 Q132 72 124 74 Q124 82 116 82 Q116 74 110 74 Q104 78 104 86 L92 88 Q88 68 98 62 Z" stroke-linejoin="round"/>
       <!-- 眼（闭着微笑线眼） -->
       <path d="M110 78 Q116 84 122 78 M140 78 Q146 84 152 78" stroke-linecap="round"/>
       <!-- 小鼻子 + 嘴 -->
       <path d="M128 88 L132 88 L130 92 Z M124 100 Q130 106 136 100" stroke-linecap="round"/>
       <!-- 光环 -->
       <circle cx="130" cy="24" r="22" fill="none" stroke="currentColor"/>
       <path d="M114 16 L110 6 L118 10 M130 14 L130 4 M146 16 L150 6 L142 10" stroke-linecap="round"/>
       <!-- 身体裙 -->
       <path d="M90 116 Q70 136 64 190 Q58 238 94 246 L166 246 Q202 238 196 190 Q190 136 170 116 Q152 108 130 110 Q108 108 90 116 Z" stroke-linejoin="round"/>
       <!-- 胸前蝴蝶结 -->
       <path d="M116 120 L100 110 L104 130 L116 124 M144 120 L160 110 L156 130 L144 124 M126 122 L134 122 L130 130 Z" stroke-linejoin="round"/>
       <!-- 裙摆星星 -->
       <path d="M88 210 L90 216 L96 218 L90 220 L88 226 L86 220 L80 218 L86 216 Z M172 206 L174 212 L180 214 L174 216 L172 222 L170 216 L164 214 L170 212 Z" stroke-linejoin="round"/>
     </svg>`},
    {name:'小鹿铃铃',
     svg:`<svg viewBox="0 0 240 260" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 鹿角 L -->
       <path d="M84 64 Q74 36 52 30 Q44 14 56 18 Q58 6 70 16 Q76 2 82 16 Q88 12 92 28" stroke-linejoin="round"/>
       <!-- 鹿角 R -->
       <path d="M156 64 Q166 36 188 30 Q196 14 184 18 Q182 6 170 16 Q164 2 158 16 Q152 12 148 28" stroke-linejoin="round"/>
       <!-- 头（偏大Q） -->
       <ellipse cx="120" cy="110" rx="70" ry="62"/>
       <!-- 耳朵 -->
       <path d="M64 82 L52 64 L78 76 Z M176 82 L188 64 L162 76 Z" stroke-linejoin="round"/>
       <!-- 额头斑点 -->
       <circle cx="112" cy="72" r="3"/>
       <circle cx="128" cy="68" r="4"/>
       <circle cx="140" cy="80" r="3"/>
       <circle cx="104" cy="86" r="2.5"/>
       <!-- 大眼 -->
       <ellipse cx="96" cy="112" rx="8" ry="11" fill="currentColor"/>
       <ellipse cx="144" cy="112" rx="8" ry="11" fill="currentColor"/>
       <circle cx="98" cy="107" r="3" fill="#fff"/>
       <circle cx="146" cy="107" r="3" fill="#fff"/>
       <!-- 睫毛 -->
       <path d="M86 102 L82 94 M92 100 L90 92 M102 102 L104 94 M138 102 L136 94 M148 100 L150 92 M154 102 L158 94" stroke-linecap="round"/>
       <!-- 鹿鼻 + 嘴 -->
       <ellipse cx="120" cy="142" rx="12" ry="8" fill="currentColor"/>
       <circle cx="115" cy="141" r="1.6" fill="#fff"/>
       <circle cx="125" cy="141" r="1.6" fill="#fff"/>
       <path d="M120 150 L120 158 M120 158 C110 166 98 160 92 154 M120 158 C130 166 142 160 148 154" stroke-linecap="round"/>
       <!-- 腮红 -->
       <ellipse cx="70" cy="142" rx="12" ry="8" fill="currentColor" opacity=".3"/>
       <ellipse cx="170" cy="142" rx="12" ry="8" fill="currentColor" opacity=".3"/>
       <!-- 脖子铃铛 -->
       <path d="M102 172 L138 172 L144 182 L96 182 Z" stroke-linejoin="round"/>
       <circle cx="120" cy="196" r="12"/>
       <path d="M120 184 L120 192 M116 204 L118 208 L122 208 L124 204" stroke-linecap="round"/>
       <!-- 身体 -->
       <path d="M72 186 C52 200 44 232 62 250 C54 258 62 266 72 260 L82 248 L92 260 L102 248 L112 260 L122 248 L132 260 L142 248 L152 260 L162 248 L172 260 C182 266 190 258 182 250 C200 232 192 200 172 186 C158 178 140 180 130 186 C120 180 102 178 88 184 C82 184 76 186 72 186 Z" stroke-linejoin="round"/>
       <!-- 背斑 -->
       <circle cx="102 210" r="4"/>
       <circle cx="130 204" r="5"/>
       <circle cx="152 214" r="4"/>
       <circle cx="118 226" r="3"/>
       <!-- 小尾巴 -->
       <circle cx="192" cy="210" r="7"/>
     </svg>`},
    {name:'魔法少女',
     svg:`<svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 星星权杖 -->
       <path d="M28 36 L80 112 M76 68 L88 68 M72 74 L72 86" stroke-linecap="round"/>
       <path d="M28 36 L22 24 L32 24 L28 12 L34 24 L44 24 L38 36 L44 48 L34 46 L28 58 L26 46 L16 48 L22 36 Z" stroke-linejoin="round" fill="currentColor" opacity=".15"/>
       <!-- 双马尾 -->
       <path d="M62 110 Q30 120 22 170 Q18 204 46 198 Q30 224 56 232 Q54 210 68 200 Q60 180 66 162" stroke-linejoin="round"/>
       <path d="M178 110 Q210 120 218 170 Q222 204 194 198 Q210 224 184 232 Q186 210 172 200 Q180 180 174 162" stroke-linejoin="round"/>
       <!-- 头 + 脸 -->
       <path d="M76 96 Q76 44 120 40 Q164 44 164 96 Q164 128 144 130 L136 118 L120 120 L104 118 L96 130 Q76 128 76 96 Z" stroke-linejoin="round"/>
       <!-- 发箍 + 蝴蝶结 -->
       <path d="M76 74 Q120 62 164 74" stroke-linecap="round"/>
       <path d="M150 56 L136 46 L138 64 L150 60 M170 56 L184 46 L182 64 L170 60 M158 56 L162 56 L160 62 Z" stroke-linejoin="round"/>
       <!-- 齐刘海 -->
       <path d="M84 72 Q100 62 120 66 Q140 60 156 72 Q150 82 140 78 Q128 86 120 78 Q112 86 100 78 Q90 82 84 72 Z" stroke-linejoin="round"/>
       <!-- 星星眼 -->
       <path d="M94 98 L96 106 L104 108 L96 110 L94 118 L92 110 L84 108 L92 106 Z M146 98 L148 106 L156 108 L148 110 L146 118 L144 110 L136 108 L144 106 Z" fill="currentColor"/>
       <!-- 小嘴 + 腮红 -->
       <path d="M112 120 Q120 128 128 120" stroke-linecap="round"/>
       <ellipse cx="80" cy="118" rx="10" ry="6" fill="currentColor" opacity=".3"/>
       <ellipse cx="160" cy="118" rx="10" ry="6" fill="currentColor" opacity=".3"/>
       <!-- 短裙 -->
       <path d="M76 134 Q46 160 40 218 Q36 250 72 250 L168 250 Q204 250 200 218 Q194 160 164 134 Q144 126 120 128 Q96 126 76 134 Z" stroke-linejoin="round"/>
       <!-- 领口丝带 -->
       <path d="M100 134 L120 156 L140 134 L146 140 L124 162 L116 162 L94 140 Z" stroke-linejoin="round"/>
       <!-- 百褶 -->
       <path d="M58 192 L48 248 M92 196 L88 248 M120 198 L120 248 M148 196 L152 248 M182 192 L192 248" stroke-linecap="round"/>
       <!-- 星星点缀 -->
       <circle cx="38" cy="196" r="2" fill="currentColor"/>
       <circle cx="202" cy="200" r="2" fill="currentColor"/>
       <path d="M216 158 L218 164 L224 166 L218 168 L216 174 L214 168 L208 166 L214 164 Z" stroke-linejoin="round"/>
     </svg>`},
  ],
  mix: [
    {name:'弯月云朵',
     svg:`<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M180 30 Q132 30 118 80 Q106 130 148 162 Q190 192 220 156 Q190 172 158 148 Q126 120 136 74 Q150 36 188 26 Q186 28 180 30Z" stroke-linejoin="round"/>
       <!-- 星星 -->
       <circle cx="60" cy="40" r="3" fill="currentColor" opacity=".6"/>
       <circle cx="40" cy="80" r="2" fill="currentColor" opacity=".5"/>
       <circle cx="74" cy="150" r="2.5" fill="currentColor" opacity=".6"/>
       <circle cx="52" cy="130" r="1.5" fill="currentColor" opacity=".45"/>
       <!-- 云 -->
       <path d="M40 120 Q20 118 18 140 Q6 148 18 162 Q18 180 44 176 Q44 190 64 186 Q72 170 86 176 Q100 170 98 154 Q112 150 104 134 Q90 120 70 124 Q56 120 40 120Z" stroke-linejoin="round"/>
     </svg>`},
    {name:'许愿星',
     svg:`<svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M120 22 L142 90 L214 94 L158 140 L178 212 L120 174 L62 212 L82 140 L26 94 L98 90 Z" stroke-linejoin="round"/>
       <!-- 内部十字纹 -->
       <path d="M120 44 L120 196 M50 112 L190 112" stroke-linecap="round" opacity=".5"/>
       <!-- 小星星伴舞 -->
       <path d="M36 50 L39 62 L51 65 L39 68 L36 80 L33 68 L21 65 L33 62 Z M200 170 L203 180 L213 183 L203 186 L200 196 L197 186 L187 183 L197 180 Z M204 60 L206 68 L214 70 L206 72 L204 80 L202 72 L194 70 L202 68 Z M42 198 L44 206 L52 208 L44 210 L42 218 L40 210 L32 208 L40 206 Z" stroke-linejoin="round" opacity=".8"/>
     </svg>`},
    {name:'彩虹热气球',
     svg:`<svg viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 气囊 -->
       <ellipse cx="120" cy="100" rx="84" ry="96"/>
       <!-- 彩虹横条 -->
       <path d="M38 96 Q120 70 202 96" stroke-linecap="round"/>
       <path d="M40 120 Q120 92 200 120" stroke-linecap="round"/>
       <path d="M46 144 Q120 116 194 144" stroke-linecap="round"/>
       <path d="M58 168 Q120 140 182 168" stroke-linecap="round"/>
       <!-- 竖条 -->
       <path d="M120 6 L120 190 M70 30 Q120 110 170 30 M70 170 Q120 90 170 170" stroke-linecap="round" opacity=".5"/>
       <!-- 绳索 -->
       <path d="M66 188 L78 236 M96 196 L100 236 M120 200 L120 236 M144 196 L140 236 M174 188 L162 236" stroke-linecap="round"/>
       <!-- 吊篮 -->
       <path d="M74 236 L68 280 L172 280 L166 236 Z" stroke-linejoin="round"/>
       <path d="M82 240 L78 276 L162 276 L158 240 Z" stroke-linejoin="round"/>
       <!-- 吊篮条纹 -->
       <path d="M92 248 L90 276 L150 276 L148 248 Z M110 248 L108 276 L132 276 L130 248 Z" stroke-linecap="round"/>
       <!-- 心形旗 -->
       <path d="M204 28 L208 22 L214 26 L218 22 L222 30 L214 40 Z" stroke-linejoin="round"/>
       <path d="M120 6 L120 0 M204 34 L196 40" stroke-linecap="round"/>
     </svg>`},
    {name:'蘑菇小屋',
     svg:`<svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 菇伞 -->
       <path d="M24 96 Q24 32 120 28 Q216 32 216 96 Q216 112 200 114 L40 114 Q24 112 24 96 Z" stroke-linejoin="round"/>
       <!-- 斑点 -->
       <circle cx="70" cy="72" r="12"/>
       <circle cx="120" cy="56" r="16"/>
       <circle cx="170" cy="78" r="11"/>
       <circle cx="50" cy="100" r="7"/>
       <circle cx="190" cy="100" r="8"/>
       <!-- 菇身 -->
       <path d="M72 114 L64 212 L176 212 L168 114 Z" stroke-linejoin="round"/>
       <!-- 门 -->
       <path d="M104 212 L104 170 Q120 154 136 170 L136 212 Z" stroke-linejoin="round"/>
       <circle cx="128" cy="192" r="2" fill="currentColor"/>
       <!-- 窗户 -->
       <circle cx="84" cy="152" r="10"/>
       <path d="M74 152 L94 152 M84 142 L84 162" stroke-linecap="round"/>
       <circle cx="158" cy="152" r="10"/>
       <path d="M148 152 L168 152 M158 142 L158 162" stroke-linecap="round"/>
       <!-- 烟囱 + 烟 -->
       <path d="M156 32 L156 0 L176 0 L176 32" stroke-linejoin="round"/>
       <path d="M162 -2 Q150 -16 162 -26 Q178 -32 170 -46 M172 -8 Q186 -14 180 -24 Q176 -36 192 -42" stroke-linecap="round"/>
       <!-- 小草 -->
       <path d="M10 218 Q8 204 14 200 Q14 210 18 218 M44 222 Q42 210 48 206 Q48 214 52 222 M190 220 Q188 208 194 204 Q194 212 198 220 M224 218 Q222 204 228 200 Q228 210 232 218" stroke-linecap="round"/>
     </svg>`},
    {name:'海上灯塔',
     svg:`<svg viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 海浪 -->
       <path d="M0 200 Q40 186 80 200 T160 200 T240 200 L260 200 L260 240 L0 240 Z" stroke-linejoin="round"/>
       <path d="M0 218 Q40 208 80 218 T160 218 T240 218" stroke-linecap="round"/>
       <!-- 礁石 -->
       <path d="M72 204 Q94 190 120 196 Q144 186 172 204 L176 218 L68 218 Z" stroke-linejoin="round"/>
       <!-- 塔身 -->
       <path d="M108 200 L110 130 L150 130 L152 200 Z" stroke-linejoin="round"/>
       <path d="M104 170 L156 170 M106 150 L154 150" stroke-linecap="round"/>
       <!-- 灯室 -->
       <path d="M100 130 L160 130 L162 108 L98 108 Z" stroke-linejoin="round"/>
       <path d="M104 108 L104 128 L156 128 L156 108" stroke-linecap="round" stroke-dasharray="3 4"/>
       <!-- 顶 -->
       <path d="M96 108 L164 108 L156 90 L104 90 Z" stroke-linejoin="round"/>
       <path d="M130 90 L130 60 L134 60 M130 72 L150 68 M130 78 L110 74" stroke-linecap="round"/>
       <!-- 光柱 -->
       <path d="M98 118 L20 82 L28 120 Z" stroke-linejoin="round" fill="currentColor" opacity=".12"/>
       <path d="M162 118 L240 82 L232 120 Z" stroke-linejoin="round" fill="currentColor" opacity=".12"/>
       <!-- 海鸥 -->
       <path d="M38 44 Q46 36 54 44 Q62 36 70 44 M182 36 Q192 28 202 36 Q212 28 222 36" stroke-linecap="round"/>
       <!-- 日月 -->
       <circle cx="220" cy="62" r="20" fill="none" stroke="currentColor"/>
     </svg>`},
    {name:'软萌恐龙',
     svg:`<svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
       <!-- 背刺 -->
       <path d="M90 60 L82 40 L100 52 Z M116 50 L108 28 L126 42 Z M142 50 L134 28 L152 42 Z M168 60 L160 40 L178 52 Z" stroke-linejoin="round"/>
       <!-- 身体 -->
       <path d="M70 132 Q54 102 74 80 Q86 66 112 72 Q130 58 156 66 Q186 74 198 100 Q220 104 228 128 Q234 154 210 170 L204 192 L186 192 L184 178 L134 180 L130 196 L112 196 L110 182 L78 180 L76 198 L58 198 L60 172 Q42 168 42 150 Q40 138 58 136 Q62 132 70 132 Z" stroke-linejoin="round"/>
       <!-- 肚子白 -->
       <path d="M78 138 Q130 148 192 140 Q192 162 168 170 L96 170 Q78 162 78 138 Z" stroke-linejoin="round"/>
       <!-- 大眼 -->
       <ellipse cx="160" cy="96" rx="8" ry="11" fill="currentColor"/>
       <circle cx="162" cy="91" r="3" fill="#fff"/>
       <path d="M150 92 L146 86 M158 90 L158 82 M166 92 L170 86" stroke-linecap="round"/>
       <!-- 小鼻孔 + 嘴 -->
       <circle cx="188" cy="108" r="1.6" fill="currentColor"/>
       <circle cx="196" cy="108" r="1.6" fill="currentColor"/>
       <path d="M178 124 Q196 130 210 118" stroke-linecap="round"/>
       <!-- 腮红 -->
       <ellipse cx="138" cy="116" rx="10" ry="6" fill="currentColor" opacity=".3"/>
       <!-- 小短手 -->
       <path d="M92 132 Q80 138 86 154 L98 148 Z M208 122 Q222 128 218 146 L204 140 Z" stroke-linejoin="round"/>
       <!-- 爪爪 -->
       <path d="M78 180 L74 194 L90 194 L86 180 Z M120 182 L118 196 L134 196 L132 182 Z M172 178 L170 192 L186 192 L184 178 Z" stroke-linejoin="round"/>
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
  const ratio = p.img.height / p.img.width;
  canvas.width = 1200; canvas.height = Math.round(1200 * ratio);
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = true;
  // 等待较长时间的 AI 级算法处理
  if(style==='abstract-editorial') await drawAbstractEditorial(g, p.img, canvas);
  else if(style==='zine') await drawZine(g, p.img, canvas);
  else await drawPrompt(g, p.img, canvas);
  p.canvas = canvas;
  p.processed = true;
}

/* =========================================================
   高级图像处理算法（AI 级客户端风格引擎）
   ========================================================= */

/* —— 工具：获取/放回 ImageData 像素数组 —— */
function getPixels(g, w, h){
  return g.getImageData(0,0,w,h);
}
function putPixels(g, imgData){
  g.putImageData(imgData, 0, 0);
}

/* —— K-means 色彩量化：把图像压缩到 K 个主色大色块 —— */
async function kmeansQuantize(g, w, h, K=7, iters=6){
  // 采样像素（提速）
  const imgData = getPixels(g, w, h);
  const d = imgData.data;
  const N = w*h;
  const step = Math.max(1, Math.floor(N/12000));
  const samples = [];
  for(let i=0;i<N;i+=step){
    const o = i*4;
    samples.push([d[o], d[o+1], d[o+2]]);
  }
  // K-means++ 初始化中心
  const centers = [];
  centers.push(samples[Math.floor(Math.random()*samples.length)].slice());
  for(let k=1;k<K;k++){
    const dists = samples.map(s=>{
      let mn = Infinity;
      for(const c of centers){
        const dr=s[0]-c[0], dg=s[1]-c[1], db=s[2]-c[2];
        const dd = dr*dr+dg*dg+db*db;
        if(dd<mn) mn=dd;
      }
      return mn;
    });
    const sum = dists.reduce((a,b)=>a+b,0);
    let r = Math.random()*sum, idx=0;
    for(let i=0;i<dists.length;i++){ r-=dists[i]; if(r<=0){ idx=i; break; } }
    centers.push(samples[idx].slice());
  }
  // 迭代
  const labels = new Int32Array(samples.length);
  for(let it=0;it<iters;it++){
    // assign
    for(let i=0;i<samples.length;i++){
      const s=samples[i]; let mn=Infinity, bj=0;
      for(let j=0;j<K;j++){
        const c=centers[j];
        const dr=s[0]-c[0], dg=s[1]-c[1], db=s[2]-c[2];
        const dd=dr*dr+dg*dg+db*db;
        if(dd<mn){mn=dd;bj=j;}
      }
      labels[i]=bj;
    }
    // update
    const sums = Array.from({length:K}, ()=>[0,0,0,0]);
    for(let i=0;i<samples.length;i++){
      const l=labels[i], s=samples[i];
      sums[l][0]+=s[0]; sums[l][1]+=s[1]; sums[l][2]+=s[2]; sums[l][3]++;
    }
    for(let j=0;j<K;j++){
      if(sums[j][3]>0){
        centers[j][0] = Math.round(sums[j][0]/sums[j][3]);
        centers[j][1] = Math.round(sums[j][1]/sums[j][3]);
        centers[j][2] = Math.round(sums[j][2]/sums[j][3]);
      }
    }
    await new Promise(r=>setTimeout(r,0));
  }
  // 映射回全部像素：找最近中心
  for(let i=0;i<N;i++){
    const o=i*4;
    const r=d[o], gg=d[o+1], b=d[o+2];
    let mn=Infinity, bj=0;
    for(let j=0;j<K;j++){
      const c=centers[j];
      const dr=r-c[0], dg=gg-c[1], db=b-c[2];
      const dd=dr*dr+dg*dg+db*db;
      if(dd<mn){mn=dd;bj=j;}
    }
    d[o]=centers[bj][0]; d[o+1]=centers[bj][1]; d[o+2]=centers[bj][2];
  }
  putPixels(g, imgData);
  return centers;
}

/* —— Sobel 边缘检测：提取线条叠加艺术描边 —— */
function sobelEdges(g, w, h, color='rgba(30,28,56,0.55)', threshold=30){
  const src = getPixels(g, w, h);
  const sd = src.data;
  // 转灰度
  const gray = new Float32Array(w*h);
  for(let i=0;i<w*h;i++){
    const o=i*4;
    gray[i] = 0.299*sd[o] + 0.587*sd[o+1] + 0.114*sd[o+2];
  }
  const gx = new Float32Array(w*h);
  const gy = new Float32Array(w*h);
  for(let y=1;y<h-1;y++){
    for(let x=1;x<w-1;x++){
      const i=y*w+x;
      const tl=gray[i-w-1], tc=gray[i-w], tr=gray[i-w+1];
      const ml=gray[i-1],              mr=gray[i+1];
      const bl=gray[i+w-1], bc=gray[i+w], br=gray[i+w+1];
      gx[i] = -tl -2*ml -bl + tr + 2*mr + br;
      gy[i] = -tl -2*tc -tr + bl + 2*bc + br;
    }
  }
  // 叠加边缘线条
  const dst = document.createElement('canvas');
  dst.width=w; dst.height=h;
  const dg = dst.getContext('2d');
  const out = dg.createImageData(w,h);
  const od = out.data;
  const [cr,cg,cb,ca] = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16), parseFloat(color.split(',')[3])||0.55];
  for(let i=0;i<w*h;i++){
    const mag = Math.min(255, Math.sqrt(gx[i]*gx[i]+gy[i]*gy[i]));
    const o=i*4;
    if(mag > threshold){
      const a = Math.min(255, (mag/threshold)*255) * ca;
      od[o]=cr; od[o+1]=cg; od[o+2]=cb; od[o+3]=a;
    } else { od[o]=0;od[o+1]=0;od[o+2]=0;od[o+3]=0; }
  }
  dg.putImageData(out,0,0);
  g.drawImage(dst,0,0);
}

/* —— 胶片颗粒：乘性随机颗粒叠加 —— */
function filmGrain(g, w, h, amount=14){
  const imgData = getPixels(g, w, h);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const n = (Math.random()-0.5)*amount*2;
    d[i]   = Math.max(0,Math.min(255, d[i]+n));
    d[i+1] = Math.max(0,Math.min(255, d[i+1]+n*0.9));
    d[i+2] = Math.max(0,Math.min(255, d[i+2]+n*0.8));
  }
  putPixels(g, imgData);
}

/* —— Bayer 有序抖动矩阵（4x4 -> 8x8 升级）：印刷半色调网点 —— */
const BAYER8 = new Uint8Array([
  0,32,8,40,2,34,10,42,
  48,16,56,24,50,18,58,26,
  12,44,4,36,14,46,6,38,
  60,28,52,20,62,30,54,22,
  3,35,11,43,1,33,9,41,
  51,19,59,27,49,17,57,25,
  15,47,7,39,13,45,5,37,
  63,31,55,23,61,29,53,21
]);
function bayerDither(g, w, h, levels=2, dotSize=2){
  const imgData = getPixels(g, w, h);
  const d = imgData.data;
  const step = 255/(levels-1);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i=(y*w+x)*4;
      const t = (BAYER8[(y%8)*8+(x%8)]+0.5)/64 - 0.5;
      const thr = t*255/levels*1.0;
      for(let c=0;c<3;c++){
        let v = d[i+c] + thr;
        v = Math.round(Math.round(v/step)*step);
        d[i+c] = Math.max(0,Math.min(255,v));
      }
    }
  }
  putPixels(g, imgData);
}

/* —— Floyd-Steinberg 误差扩散抖动：黑白杂志感 —— */
function floydSteinbergMono(g, w, h){
  const imgData = getPixels(g, w, h);
  const d = imgData.data;
  const gray = new Float32Array(w*h);
  for(let i=0;i<w*h;i++){
    const o=i*4;
    gray[i] = 0.299*d[o] + 0.587*d[o+1] + 0.114*d[o+2];
  }
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i=y*w+x;
      const old = gray[i];
      const nw = old<128?0:255;
      gray[i] = nw;
      const err = old - nw;
      if(x+1<w) gray[i+1] += err*7/16;
      if(y+1<h){
        if(x>0)   gray[i+w-1] += err*3/16;
                    gray[i+w]   += err*5/16;
        if(x+1<w) gray[i+w+1] += err*1/16;
      }
    }
  }
  for(let i=0;i<w*h;i++){
    const o=i*4;
    const v = gray[i];
    d[o]=v; d[o+1]=v; d[o+2]=v;
  }
  putPixels(g, imgData);
}

/* —— 色温/色相映射 LUT：根据语义关键词调整 —— */
const PROMPT_LUTS = {
  '日落|夕阳|黄昏|暖|橙|橘':   {hue:12, sat:1.18, lum:1.04, tint:[255,140,60]},
  '海|海洋|蓝|冷|清|冰|冰川':  {hue:-18, sat:1.12, lum:1.0, tint:[80,180,255]},
  '森林|森|绿|自然|草地|山':    {hue:-10, sat:1.08, lum:1.02, tint:[110,200,120]},
  '梦|幻|紫|粉|浪漫|少女|甜':   {hue:28, sat:1.22, lum:1.06, tint:[220,140,230]},
  '复古|胶片|老|旧|80|90|港':   {hue:8, sat:0.9, lum:0.98, tint:[220,160,90]},
  '赛博|朋克|霓虹|未来|科技':   {hue:-100, sat:1.4, lum:1.0, tint:[180,80,255]},
  '黑白|单色|灰度|极简|暗':      {hue:0, sat:0, lum:0.95, tint:[128,128,128]},
  '日系|清新|奶油|白|过曝|轻':   {hue:6, sat:0.88, lum:1.12, tint:[240,230,210]},
  '暗|黑|暗调|电影|cinema|夜':   {hue:-12, sat:0.9, lum:0.86, tint:[60,50,90]},
};
function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
  let h,s,l=(mx+mn)/2;
  if(mx===mn){h=s=0;}
  else{
    const d=mx-mn;
    s=l>0.5?d/(2-mx-mn):d/(mx+mn);
    switch(mx){
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      case b: h=(r-g)/d+4; break;
    }
    h/=6;
  }
  return [h*360,s,l];
}
function hslToRgb(h,s,l){
  h/=360; let r,g,b;
  if(s===0){r=g=b=l;}
  else{
    const hue2rgb=(p,q,t)=>{
      if(t<0)t+=1; if(t>1)t-=1;
      if(t<1/6)return p+(q-p)*6*t;
      if(t<1/2)return q;
      if(t<2/3)return p+(q-p)*(2/3-t)*6;
      return p;
    };
    const q=l<0.5?l*(1+s):l+s-l*s;
    const p=2*l-q;
    r=hue2rgb(p,q,h+1/3);
    g=hue2rgb(p,q,h);
    b=hue2rgb(p,q,h-1/3);
  }
  return [Math.round(r*255),Math.round(g*255),Math.round(b*255)];
}
function applySemanticLUT(g, w, h, prompt){
  if(!prompt) return null;
  const pl = prompt.toLowerCase();
  let matched = null;
  for(const key in PROMPT_LUTS){
    if(new RegExp(key.split('|').map(k=>k.replace(/[.*+?^${}()[\]\\]/g,'\\$&')).join('|'),'i').test(pl)){
      matched = PROMPT_LUTS[key]; break;
    }
  }
  if(!matched) return null;
  const {hue, sat, lum, tint} = matched;
  const imgData = getPixels(g, w, h);
  const d = imgData.data;
  const tr = tint[0]/255, tg=tint[1]/255, tb=tint[2]/255;
  for(let i=0;i<d.length;i+=4){
    let [h,s,l] = rgbToHsl(d[i],d[i+1],d[i+2]);
    h = (h + hue + 360)%360;
    s = Math.max(0,Math.min(1, s*sat));
    l = Math.max(0,Math.min(1, l*lum));
    let [r,g,b] = hslToRgb(h,s,l);
    // 与 tint 做 soft light 叠加
    r = Math.round(r*(1-0.18) + tr*255*0.18);
    g = Math.round(g*(1-0.18) + tg*255*0.18);
    b = Math.round(b*(1-0.18) + tb*255*0.18);
    d[i]=r; d[i+1]=g; d[i+2]=b;
  }
  putPixels(g, imgData);
  return matched;
}

/* =========================================================
   三大风格重绘：AI 级效果
   ========================================================= */

/* 风格 A：Photo Abstract Editorial —— K-means 大色块 + Sobel 艺术描边 + 画报排版 */
async function drawAbstractEditorial(g, img, c){
  const w = c.width, h = c.height;
  const rand = mulberry32(seedFromImg(img));
  // 1. 绘制原图
  g.save();
  g.filter = 'saturate(1.12) contrast(1.1) brightness(1.02)';
  g.drawImage(img,0,0,w,h);
  g.restore();

  // 2. K-means 色彩量化（7 色）→ 真正的大色块抽象感
  await kmeansQuantize(g, w, h, 7, 5);

  // 3. Sobel 边缘艺术描边
  sobelEdges(g, w, h, 'rgba(30,28,56,0.5)', 35);

  // 4. 胶片颗粒
  filmGrain(g, w, h, 12);

  // 5. 渐变氛围叠层
  const mist = g.createLinearGradient(0,0,w,h);
  mist.addColorStop(0,'rgba(255,170,100,.20)');
  mist.addColorStop(0.5,'rgba(180,80,220,.08)');
  mist.addColorStop(1,'rgba(80,60,220,.22)');
  g.fillStyle = mist; g.fillRect(0,0,w,h);

  // ========== 画报级排版 ==========
  const palette = ['#ff4d8d','#7c6cf7','#ffc75f','#00c2a8','#1e1c38','#ffffff','#ff6b6b'];
  const barH = Math.round(h*0.13);
  // 顶部刊头
  g.fillStyle = '#ffffff';
  g.fillRect(0,0,w,barH);
  g.fillStyle = '#1e1c38';
  g.font = "600 16px Fredoka, sans-serif";
  g.textBaseline = 'middle';
  g.fillText('ABSTRACT  EDITORIAL  ·  抽  象  画  报', 30, barH*0.28);
  g.font = '800 ' + Math.max(30, Math.round(barH*0.5)) + 'px "ZCOOL KuaiLe", sans-serif';
  g.fillText('旅 途 · 色 彩 启 示 录', 30, barH*0.7);
  g.textAlign = 'right';
  g.font = '700 14px Fredoka, sans-serif';
  g.fillText('VOL. ' + String(Math.floor(rand()*88)+1) + '  ·  ISSUE No.' + String(Math.floor(rand()*9000)+1000), w-30, barH*0.28);
  g.fillText(new Date().toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'}), w-30, barH*0.7);
  g.textAlign='left';
  // 细线
  g.strokeStyle='#1e1c38'; g.lineWidth=2;
  g.beginPath(); g.moveTo(30, barH-4); g.lineTo(w-30, barH-4); g.stroke();
  g.strokeStyle = palette[Math.floor(rand()*palette.length)]; g.lineWidth=6;
  g.beginPath(); g.moveTo(30, barH-1); g.lineTo(30+rand()*(w*0.25), barH-1); g.stroke();

  // 抽象几何拼贴（从调色板取色）
  const shapes = Math.floor(6 + rand()*5);
  for(let i=0;i<shapes;i++){
    const col = palette[Math.floor(rand()*palette.length)];
    const alpha = 0.2 + rand()*0.3;
    g.fillStyle = hexA(col, alpha);
    const kind = Math.floor(rand()*4);
    const x = rand()*w, y = barH + rand()*(h-barH)*0.82;
    const r = 50 + rand()*180;
    if(kind===0){
      g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill();
    } else if(kind===1){
      g.save(); g.translate(x,y); g.rotate((rand()-.5)*.7);
      g.fillRect(-r/2, -r/4, r, r*0.5);
      g.restore();
    } else if(kind===2){
      g.beginPath();
      g.moveTo(x,y); g.lineTo(x+r, y+r*0.55); g.lineTo(x-r*0.38, y+r);
      g.closePath(); g.fill();
    } else {
      g.strokeStyle = col; g.lineWidth = 2 + rand()*6; g.globalAlpha = alpha;
      g.beginPath(); g.moveTo(x-r, y+r*0.3); g.quadraticCurveTo(x, y-r*0.6, x+r, y+r*0.2); g.stroke();
      g.globalAlpha = 1;
    }
  }

  // 底部色带
  const bandH = 22;
  palette.slice(0,6).forEach((col,i)=>{
    g.fillStyle = hexA(col, 0.58 + rand()*0.3);
    g.fillRect(0, h-bandH*(6-i), w, bandH);
  });

  // 左下角大块文字卡片
  const cardX = 36, cardY = h - bandH*6 - 220;
  const cardW = w*0.58, cardH = 180;
  g.fillStyle = 'rgba(255,255,255,.94)';
  roundRect(g, cardX, cardY, cardW, cardH, 18); g.fill();
  g.strokeStyle='#1e1c38'; g.lineWidth=1.8;
  roundRect(g, cardX, cardY, cardW, cardH, 18); g.stroke();
  g.fillStyle='#1e1c38';
  g.font = `700 ${Math.max(14, Math.round(cardH*0.09))}px Fredoka, sans-serif`;
  g.textBaseline = 'top';
  g.fillText('COLOR  OF  THE  JOURNEY  ·  某  帧  色  彩', cardX+24, cardY+22);
  g.font = `italic 500 ${Math.max(14, Math.round(cardH*0.09))}px Georgia, serif`;
  g.fillStyle='#4a4a55';
  const quotes = [
    'We collect colors the way others collect stamps — each one postmarked from a different sky.',
    'Between the mountain and the tide, we found a hue that no paint could ever copy.',
    'Somewhere on the road, the world turned into a poster, and we walked right into it.'
  ];
  const q = quotes[Math.floor(rand()*quotes.length)];
  wrapText(g, q, 'Georgia, serif', Math.round(cardH*0.088), cardW-48).forEach((ln,i)=>{
    g.fillText(ln, cardX+24, cardY+62 + i*24);
  });
  // 印章
  drawStamp(g, w-120, cardY + 30, 'ART', '#b23b81');
  // 页码条
  g.fillStyle='#1e1c38';
  g.fillRect(0, barH+18, 6, 44);
  g.font = '700 14px Fredoka, sans-serif';
  g.textBaseline='top';
  g.fillText('P.' + (1+Math.floor(rand()*99)), 18, barH+28);
}

/* 风格 B：极简杂志 —— 黑白 + 半色调网点 + 衬线排版 + 颗粒 */
async function drawZine(g, img, c){
  const w = c.width, h = c.height;
  const margin = 90;
  const pw = w - margin*2;
  const ph = h - margin*3;
  // 纸底色 + 纤维感
  g.fillStyle = '#f6f2ea';
  g.fillRect(0,0,w,h);
  // 纹理噪点（纸浆感）
  const paper = g.getImageData(0,0,w,h);
  const pd = paper.data;
  for(let i=0;i<pd.length;i+=4){
    const n = (Math.random()-0.5)*16;
    pd[i]=Math.max(0,Math.min(255,pd[i]+n));
    pd[i+1]=Math.max(0,Math.min(255,pd[i+1]+n*1.02));
    pd[i+2]=Math.max(0,Math.min(255,pd[i+2]+n*0.98));
  }
  g.putImageData(paper,0,0);

  // 标题
  g.fillStyle = '#0b0b0b';
  g.font = '700 60px "ZCOOL KuaiLe", Georgia, serif';
  g.textBaseline='top';
  g.fillText('旅 途 小 志', margin, 36);
  g.font = 'italic 600 16px Georgia, serif';
  g.fillStyle = '#555';
  g.fillText('THE  JOURNAL  ·  VOL.01  ·  ' + new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'}).toUpperCase(), margin, 98);
  // 右上角三条细线
  g.strokeStyle='#0b0b0b'; g.lineWidth=2;
  g.beginPath(); g.moveTo(w-margin-170, 60); g.lineTo(w-margin, 60); g.stroke();
  g.beginPath(); g.moveTo(w-margin-130, 82); g.lineTo(w-margin, 82); g.stroke();
  g.strokeStyle='#888'; g.lineWidth=1;
  g.beginPath(); g.moveTo(w-margin-90, 100); g.lineTo(w-margin, 100); g.stroke();

  // 先在临时 canvas 画照片做处理
  const tmp = document.createElement('canvas');
  tmp.width=pw; tmp.height=ph;
  const tg = tmp.getContext('2d');
  tg.imageSmoothingEnabled = true;
  tg.save();
  tg.filter = 'grayscale(1) contrast(1.12) brightness(0.98)';
  tg.drawImage(img,0,0,pw,ph);
  tg.restore();

  // Bayer 4x4 有序抖动 → 半色调网点
  bayerDither(tg, pw, ph, 3, 2);
  // 暗角
  const vg = tg.createRadialGradient(pw/2,ph/2,Math.min(pw,ph)*.42, pw/2,ph/2, Math.max(pw,ph)*.78);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.45)');
  tg.fillStyle=vg; tg.fillRect(0,0,pw,ph);
  // 颗粒
  filmGrain(tg, pw, ph, 10);
  // 绘制到主画布
  g.drawImage(tmp, margin, margin*2, pw, ph);

  // 照片细边框
  g.strokeStyle='#0b0b0b'; g.lineWidth=1.2;
  g.strokeRect(margin+.5, margin*2+.5, pw-1, ph-1);
  // 左下角小角标
  g.fillStyle='#0b0b0b';
  g.fillRect(margin, margin*2+ph-28, 100, 28);
  g.fillStyle='#f6f2ea';
  g.font = '700 12px Georgia, serif';
  g.textBaseline='middle';
  g.fillText('  FIG. 0' + (1+Math.floor(Math.random()*9)), margin, margin*2+ph-14);

  // 图片说明
  g.font = '700 14px Georgia, serif';
  g.fillStyle='#111';
  g.textBaseline='alphabetic';
  const capts = [
    '— A MOMENT ON THE ROAD, CAPTURED & PRINTED.',
    '— FRAMES WE STOLE FROM THE PASSING LANDSCAPE.',
    '— WHAT THE EYE REMEMBERS, THE JOURNAL KEEPS.'
  ];
  g.fillText(capts[Math.floor(Math.random()*capts.length)], margin, margin*2+ph+28);
  // 分隔线
  g.strokeStyle='#0b0b0b'; g.lineWidth=0.8;
  g.beginPath(); g.moveTo(margin, margin*2+ph+42); g.lineTo(margin+320, margin*2+ph+42); g.stroke();

  // 引言：竖排英文 + 中文大字
  g.fillStyle='#111';
  g.font = 'italic 700 22px Georgia, serif';
  g.textBaseline='bottom';
  const ly = h - margin + 20;
  const lines = [
    '"We travel not to escape life,',
    'but for life not to escape us."'
  ];
  lines.forEach((ln,i)=> g.fillText(ln, margin, ly + i*28));
  // 右下角中文
  g.textAlign='right';
  g.font = '700 34px "ZCOOL KuaiLe", serif';
  g.fillStyle = '#111';
  g.fillText('「 人 在 途 中 」', w-margin, h-margin+30);
  g.font = '700 14px Georgia, serif';
  g.fillText('— ' + (1+Math.floor(Math.random()*88)) + ' —', w-margin, h-margin+64);
  g.textAlign='left';
  // 印章
  drawStamp(g, margin+40, margin*2+40, 'ZINE', '#0b0b0b');
}

/* 风格 C：自定义提示词 —— 语义色调映射 LUT + 滤镜 + 高质量文字排版 */
async function drawPrompt(g, img, c){
  const w = c.width, h = c.height;
  // 原图基础
  g.save();
  g.filter = 'saturate(1.1) contrast(1.06)';
  g.drawImage(img,0,0,w,h);
  g.restore();

  // —— 根据提示词语义应用 LUT 色调映射 ——
  const text = ($('#promptInput').value || '').trim();
  const theme = text || '默认清新';
  const applied = applySemanticLUT(g, w, h, theme);
  if(applied){
    // 标记匹配成功：轻微 glow
    g.save();
    g.fillStyle = 'rgba(255,255,255,.04)';
    g.fillRect(0,0,w,h);
    g.restore();
  }
  // 额外胶片颗粒
  filmGrain(g, w, h, 9);
  // 电影感暗角
  const vg = g.createRadialGradient(w/2,h/2,Math.min(w,h)*.38, w/2,h/2, Math.max(w,h)*.74);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.4)');
  g.fillStyle=vg; g.fillRect(0,0,w,h);

  // —— 文字排版 ——
  const display = text || '写一句属于自己的话，\n把旅途的心情装进去。';
  const font = $('#promptFont').value;
  const pos = $('#promptPos').value;
  const color = ($$('#promptColors .swatch.is-active')[0] || $$('#promptColors .swatch')[0] || document.createElement('span')).dataset.c || '#ffffff';
  const maxWidth = w*0.8;
  const baseSize = Math.max(32, Math.round(w/20));

  g.save();
  const lines = display.split(/\n+/).flatMap(line=>wrapText(g, line, font, baseSize, maxWidth));
  const lineH = baseSize*1.4;
  const textH = lines.length*lineH;
  const padX = 32, padY = 28;
  let boxY;
  if(pos==='top') boxY = 64;
  else if(pos==='center') boxY = (h - (textH+padY*2))/2;
  else boxY = h - textH - padY*2 - 70;
  const boxX = (w - (maxWidth + padX*2))/2;
  const boxW = maxWidth + padX*2;
  const boxH = textH + padY*2;
  // 玻璃拟态背板
  const bgLight = color==='#fff' || color==='#ffffff';
  g.fillStyle = bgLight ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.28)';
  roundRect(g, boxX, boxY, boxW, boxH, 22);
  g.fill();
  // 描边
  g.strokeStyle = bgLight ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.18)';
  g.lineWidth = 1.2;
  roundRect(g, boxX, boxY, boxW, boxH, 22);
  g.stroke();
  // 文字
  g.fillStyle = color;
  g.textBaseline = 'top';
  g.shadowColor = 'rgba(0,0,0,.32)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
  lines.forEach((ln,i)=>{
    g.fillText(ln, boxX+padX, boxY+padY + i*lineH);
  });
  g.restore();

  // 角落 LOGO + 主题色标签
  g.save();
  g.fillStyle = bgLight ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.75)';
  g.font = '600 14px Fredoka, sans-serif';
  g.textBaseline='alphabetic';
  g.fillText('✈  云邮四海  ·  JOURNEY WORLDWIDE', 24, h-26);
  g.textAlign='right';
  g.fillText(new Date().toLocaleDateString('zh-CN'), w-24, h-26);
  // 匹配到的 LUT 标签
  if(applied){
    g.fillStyle = bgLight ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.65)';
    roundRect(g, w-250, h-70, 226, 30, 12); g.fill();
    g.fillStyle = bgLight ? '#111' : '#fff';
    g.textAlign = 'right';
    g.font = '600 12px Fredoka, sans-serif';
    g.textBaseline='middle';
    g.fillText('🎨 已匹配风格色调 · 语义 LUT 处理', w-36, h-55);
  }
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
