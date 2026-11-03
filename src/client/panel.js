"use strict";
// Theme control panel (vanilla DOM so the same panel mounts in the Settings
// section and in the floating sheet opened from the dock / by long-pressing
// the pet). Every control writes through the store and applies live.
const store = require('./store.js');
const { PALETTES, TEXT_COLORS } = require('./palette.js');
const { NAMES } = require('./brand.js');
const icons = require('./icons.js');
const { asset } = require('./assets.js');

const ACTION_LABELS = {
  newSession: '新会话', sidebar: '会话列表', composer: '收起/展开输入框', scrollBottom: '回到最新',
  scrollTop: '回到顶部', rightbar: '右侧面板', pet: '隐藏爱弥斯', scheme: '深色/浅色', settings: '主题设置',
};
const ACTION_ICONS = {
  newSession: 'plus', sidebar: 'menu', composer: 'message', scrollBottom: 'bar-down', scrollTop: 'bar-up',
  rightbar: 'layout', pet: 'eye-closed', scheme: 'moon', settings: 'sliders',
};
const ico = (n, s = 16) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${icons[n] || ''}</svg>`;

const CSS = `
.ae-panel{--pk:var(--ae-pink,#ff69b7);--cy:var(--ae-cyan,#77e8ff);color:var(--dsw-alias-label-primary,#f7f4ff);font-size:14px;line-height:1.45;display:flex;flex-direction:column;gap:14px}
.ae-panel *{box-sizing:border-box}
.ae-panel .ae-hero{display:flex;align-items:center;gap:12px;padding:10px 12px;border:2px solid var(--pk);background:linear-gradient(135deg,rgba(var(--ae-pink-rgb,255,105,183),.22),rgba(var(--ae-violet-rgb,142,114,255),.14));box-shadow:3px 3px 0 rgba(13,9,27,.8)}
.ae-panel .ae-hero-pet{width:58px;height:63px;flex:none;background-image:url("${asset('pet-half.webp')}");background-size:464px 567px;background-position:0 -63px;image-rendering:auto;animation:ae-hero-wave .9s steps(1) infinite}
@keyframes ae-hero-wave{0%{background-position:0 -189px}25%{background-position:-58px -189px}50%{background-position:-116px -189px}75%{background-position:-174px -189px}}
.ae-panel .ae-hero h3{margin:0;font:20px/1.2 var(--ae-font-px,monospace);color:var(--ae-pink-soft,#ffb3da);letter-spacing:1px}
.ae-panel .ae-hero p{margin:2px 0 0;font-size:12px;color:var(--dsw-alias-label-tertiary,#a8a5bc)}
.ae-panel .ae-sec{border:1px solid rgba(var(--ae-pink-rgb,255,105,183),.32);background:rgba(13,9,27,.28);padding:4px 12px 8px}
html[style*="color-scheme: light"] .ae-panel .ae-sec{background:rgba(255,255,255,.55)}
.ae-panel .ae-sec h4{margin:6px 0 2px;font:20px var(--ae-font-px,monospace);color:var(--pk);display:flex;align-items:center;gap:6px;letter-spacing:.5px}
.ae-panel .ae-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:4px 0;border-top:1px dashed rgba(var(--ae-pink-rgb,255,105,183),.16)}
.ae-panel .ae-sec h4 + .ae-row{border-top:0}
.ae-panel .ae-row > span{min-width:0;flex:1}
.ae-panel .ae-row small{display:block;font-size:11.5px;color:var(--dsw-alias-label-tertiary,#a8a5bc)}
.ae-panel button.ae-sw.ae-sw{position:relative !important;min-width:46px;min-height:24px;border-radius:0 !important;overflow:hidden;width:46px;height:24px;flex:none;border:2px solid var(--pk);background:rgba(13,9,27,.5);cursor:pointer;padding:0}
.ae-panel button.ae-sw.ae-sw::after{display:block !important;opacity:1 !important;content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;background:#a8a5bc;transition:left .12s steps(3)}
.ae-panel button.ae-sw.ae-sw[aria-checked="true"]{background:rgba(var(--ae-pink-rgb,255,105,183),.35)}
.ae-panel button.ae-sw.ae-sw[aria-checked="true"]::after{left:24px;background:var(--pk);box-shadow:0 0 6px var(--pk)}
.ae-panel .ae-row:has(.ae-seg){flex-wrap:wrap}
.ae-panel .ae-seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;flex:none;max-width:100%;border:2px solid var(--pk);gap:0}
.ae-panel .ae-row:has(.ae-seg > :nth-child(4)) .ae-seg{flex:1 0 100%;grid-auto-flow:row;grid-template-columns:repeat(auto-fit,minmax(64px,1fr))}
.ae-panel .ae-row:has(.ae-seg > :nth-child(4)) .ae-seg button{border-left:0;border-top:0;box-shadow:inset -2px 0 0 var(--pk)}
.ae-panel .ae-swatches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:2px 0 8px}
.ae-panel .ae-swatch{display:flex;align-items:center;gap:8px;min-height:44px;padding:4px 8px;border:2px solid rgba(255,255,255,.12);background:rgba(13,9,27,.35);color:inherit;font:inherit;font-size:13px;cursor:pointer;text-align:left}
.ae-panel .ae-swatch i{width:26px;height:26px;flex:none;box-shadow:inset 0 0 0 2px rgba(0,0,0,.35)}
.ae-panel .ae-swatch[aria-checked="true"]{border-color:var(--pk);background:rgba(var(--ae-pink-rgb,255,105,183),.18);box-shadow:2px 2px 0 rgba(0,0,0,.4)}
.ae-panel .ae-seg button{min-width:44px;min-height:32px;padding:0 9px;border:0;border-left:2px solid var(--pk);background:transparent;color:inherit;font:inherit;font-size:13px;cursor:pointer}
.ae-panel .ae-seg button:first-child{border-left:0}
.ae-panel .ae-seg button[aria-pressed="true"]{background:var(--pk);color:#2a0b20}
.ae-panel input[type=range]{flex:none;width:min(46%,180px);accent-color:var(--pk);height:28px}
.ae-panel .ae-btn{min-height:36px;padding:0 12px;border-style:solid;border-width:4px;border-color:transparent;border-image:url("${asset('btn-plum.png')}") 4 fill / 8px / 0 stretch;image-rendering:pixelated;background:none;color:#ffd5ea;font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.ae-panel .ae-btn.ae-pink{border-image-source:url("${asset('btn-pink.png')}");color:#3a0f2a}
.ae-panel .ae-btn:active{border-image-source:url("${asset('btn-pink-pressed.png')}");color:#3a0f2a}
.ae-panel .ae-btns{display:flex;flex-wrap:wrap;gap:8px;padding:8px 0 4px}
.ae-panel .ae-list{display:flex;flex-direction:column;gap:4px;padding:6px 0}
.ae-panel .ae-item{display:flex;align-items:center;gap:8px;min-height:44px;padding:2px 6px;border:1px solid rgba(var(--ae-pink-rgb,255,105,183),.25);background:rgba(13,9,27,.25)}
.ae-panel .ae-item[data-off]{opacity:.55}
.ae-panel .ae-item .ae-name{flex:1;display:flex;align-items:center;gap:8px;min-width:0}
.ae-panel .ae-item .ae-mini{width:36px;height:36px;border:2px solid rgba(var(--ae-pink-rgb,255,105,183),.5);background:transparent;color:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.ae-panel .ae-item .ae-mini:disabled{opacity:.3}
.ae-panel .ae-note{font-size:11.5px;color:var(--dsw-alias-label-tertiary,#a8a5bc);margin:4px 0}
.ae-panel .ae-credit{font-size:11px;color:var(--dsw-alias-label-tertiary,#a8a5bc);line-height:1.5}
#aemeath-sheet{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,3,12,.55)}
#aemeath-sheet .ae-sheet-card{--ae-x:1;width:min(560px,100vw);max-height:min(86dvh,860px);overflow:auto;overscroll-behavior:contain;padding:12px 14px calc(16px + env(safe-area-inset-bottom));background:rgba(17,19,38,.97);border:2px solid var(--ae-pink,#ff69b7);border-bottom:0;box-shadow:0 -6px 30px rgba(var(--ae-pink-rgb,255,105,183),.25)}
html[style*="color-scheme: light"] #aemeath-sheet .ae-sheet-card{background:rgba(255,248,252,.98)}
#aemeath-sheet .ae-sheet-top{position:sticky;top:-12px;z-index:1;display:flex;justify-content:space-between;align-items:center;margin:-12px -14px 8px;padding:10px 14px;background:inherit;border-bottom:2px dashed rgba(var(--ae-pink-rgb,255,105,183),.4);font:20px var(--ae-font-px,monospace);color:var(--ae-pink-soft,#ffb3da)}
#aemeath-sheet .ae-sheet-top button{width:40px;height:40px;border:2px solid var(--ae-pink,#ff69b7);background:transparent;color:var(--ae-pink-soft,#ffb3da);display:flex;align-items:center;justify-content:center;cursor:pointer}
@media (min-width:760px){#aemeath-sheet{align-items:center}#aemeath-sheet .ae-sheet-card{border-bottom:2px solid #ff69b7}}
`;

function ensureStyle() {
  if (document.querySelector('style[data-plugin-css="dsh-aemeath-theme/panel.css"]')) return () => {};
  const s = document.createElement('style');
  s.dataset.plugin = 'dsh-aemeath-theme';
  s.dataset.pluginCss = 'dsh-aemeath-theme/panel.css';
  s.textContent = CSS;
  document.head.appendChild(s);
  return () => s.remove();
}

function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}

/** Downscale an image file to a JPEG data URL that fits localStorage. */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1440;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let q = 0.86, out = c.toDataURL('image/jpeg', q);
      while (out.length > 2400000 && q > 0.4) { q -= 0.12; out = c.toDataURL('image/jpeg', q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
    img.src = url;
  });
}

/**
 * Mount the panel into `host`.
 * @param host - container element.
 * @param ctx - client context (theme service for scheme / font size).
 */
const settingsSplit = () => require('./settings-split.js');

function mountPanel(host, ctx) {
  const offStyle = ensureStyle();
  let theme = null;
  try { theme = ctx.get('theme'); } catch { theme = null; }
  const root = h('div', { class: 'ae-panel' });
  host.appendChild(root);

  const sw = (key, label, note) => h('div', { class: 'ae-row' },
    h('span', null, label, note ? h('small', null, note) : null),
    h('button', { type: 'button', class: 'ae-sw', role: 'switch', 'aria-checked': String(!!store.get()[key]), 'aria-label': label, onclick: () => store.set({ [key]: !store.get()[key] }) }));
  const seg = (label, opts, cur, onPick, note) => h('div', { class: 'ae-row' },
    h('span', null, label, note ? h('small', null, note) : null),
    h('div', { class: 'ae-seg', role: 'group', 'aria-label': label },
      opts.map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(cur === v), onclick: () => onPick(v) }, t))));
  const range = (key, label, min, max, step, fmt) => {
    const out = h('small', null, fmt(store.get()[key]));
    const inp = h('input', { type: 'range', min, max, step, value: store.get()[key], 'aria-label': label });
    inp.addEventListener('input', () => { out.textContent = fmt(Number(inp.value)); });
    inp.addEventListener('change', () => store.set({ [key]: Number(inp.value) }));
    return h('div', { class: 'ae-row' }, h('span', null, label, out), inp);
  };
  const sec = (icon, title, ...rows) => h('section', { class: 'ae-sec' }, h('h4', { html: `${ico(icon, 16)}<span>${title}</span>` }), ...rows);

  function render() {
    const p = store.get();
    const snap = theme?.getTheme?.();
    const pref = snap?.preference || 'dark';
    const fs = snap?.fontSize || 15;
    root.innerHTML = '';

    root.append(h('div', { class: 'ae-hero' },
      h('div', { class: 'ae-hero-pet', 'aria-hidden': 'true' }),
      h('div', null, h('h3', null, '爱弥斯 · 星夜主题'), h('p', null, '像素小爱弥斯、星空背景、像素按键与可移动快捷键。所有改动即时生效。'))));

    root.append(sec('sparkle', '外观',
      sw('skin', '爱弥斯配色', '粉紫夜色 + 青色星芒，覆盖全局配色'),
      sw('pixelCorners', '像素按键', '发送 / 新会话 / 添加 等改成像素九宫格按键'),
      seg('明暗', [['dark', '深色'], ['light', '浅色'], ['system', '跟随']], pref, (v) => { try { theme?.setTheme(v); } catch (e) { console.warn(e); } render(); }),
      seg('字号', [[14, '小'], [15, '中'], [16, '大'], [17, '特大']], fs, (v) => { try { theme?.setFontSize(v); } catch (e) { console.warn(e); } render(); }),
      range('glass', '面板不透明度', 0.3, 0.95, 0.05, (v) => `${Math.round(v * 100)}%`)));

    // colour presets as swatches
    const sw4 = h('div', { class: 'ae-swatches', role: 'radiogroup', 'aria-label': '配色方案' },
      Object.entries(PALETTES).map(([id, P]) => h('button', {
        type: 'button', role: 'radio', 'aria-checked': String(p.palette === id), class: 'ae-swatch', onclick: () => store.set({ palette: id }),
        html: `<i style="background:linear-gradient(135deg,${P.pink},${P.violet} 60%,${P.accent})"></i><span>${P.label}</span>`,
      })));
    root.append(sec('heart', '配色与字体',
      h('p', { class: 'ae-note' }, '配色方案（整套强调色 / 背景色同步切换）：'), sw4,
      seg('文字颜色', Object.entries(TEXT_COLORS).map(([k, v]) => [k, v.label]), p.textColor, (v) => store.set({ textColor: v }), '正文与标题的主色'),
      seg('字体样式', [['pixel-title', '像素标题'], ['system', '系统字体'], ['mono', '等宽']], p.uiFont, (v) => store.set({ uiFont: v }), '像素标题 = 标题/标签用像素字，正文保持清晰'),
      sw('pixelIcons', '像素图标', '顶部按钮、侧栏按钮换成像素图标')));

    root.append(sec('star', '品牌与标识',
      sw('brand', '深空联合标识', '左上角虎鲸 → 深空联合徽记，名称、浏览器标签页标题与图标同步'),
      seg('显示名称', Object.entries(NAMES).map(([k, v]) => [k, v.title]), p.brandName, (v) => store.set({ brandName: v }))));

    const bgFile = h('input', { type: 'file', accept: 'image/*', hidden: true });
    bgFile.addEventListener('change', async () => {
      const f = bgFile.files && bgFile.files[0];
      if (!f) return;
      try { store.setCustomBg(await fileToDataUrl(f)); store.set({ background: 'custom' }); }
      catch (e) { alert(e.message || String(e)); }
    });
    root.append(sec('image', '背景',
      seg('背景图', [['night', '星夜'], ['night-dim', '暗夜'], ['custom', '自定义'], ['none', '无']], p.background, (v) => {
        if (v === 'custom' && !store.getCustomBg()) { bgFile.click(); return; }
        store.set({ background: v });
      }),
      range('bgDim', '背景暗化', 0, 0.85, 0.05, (v) => `${Math.round(v * 100)}%`),
      range('bgBlur', '背景模糊', 0, 16, 1, (v) => `${v}px`),
      sw('stars', '闪烁星星'),
      sw('scanlines', '扫描线', 'CRT 复古扫描线'),
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => bgFile.click(), html: `${ico('image')}<span>上传背景</span>` }),
        store.getCustomBg() ? h('button', { type: 'button', class: 'ae-btn', onclick: () => { store.setCustomBg(''); if (store.get().background === 'custom') store.set({ background: 'night' }); }, html: `${ico('close')}<span>删除自定义</span>` }) : null,
        bgFile)));

    root.append(sec('pet', '像素爱弥斯',
      sw('pet', '显示爱弥斯', '可拖到任意位置；点一下弹出快捷菜单，双击盯着你，连点会晕，在她头上左右来回摸摸她会开心，长按打开本面板'),
      range('petScale', '大小', 0.5, 1.5, 0.05, (v) => `${Math.round(v * 100)}%`),
      sw('petBubbles', '台词气泡'),
      sw('petFollowAgent', '跟随 Agent 状态', '工作时戴墨镜忙碌，出错会懵，完成会欢呼'),
      sw('petIdle', '空闲小动作', '没事时会伸懒腰、哼歌、看星星、东张西望、偷笑、散步，久了会打瞌睡（点她会醒）'),
      h('div', { class: 'ae-row' }, h('span', null, '好感度', h('small', null, '摸头会增加')), h('small', null, `${(() => { try { return Number(localStorage.getItem('dsh-aemeath-theme:affection')) || 0; } catch { return 0; } })()} ♥`)),
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => store.set({ petPos: null }), html: `${ico('reload')}<span>放回默认位置</span>` }))));

    const list = h('div', { class: 'ae-list' });
    p.dockActions.forEach((a, i) => {
      const move = (d) => {
        const arr = store.get().dockActions.slice();
        const j = i + d;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        store.set({ dockActions: arr });
      };
      list.append(h('div', { class: 'ae-item', 'data-off': !a.on },
        h('span', { class: 'ae-name', html: `${ico(ACTION_ICONS[a.id], 18)}<span>${ACTION_LABELS[a.id] || a.id}</span>` }),
        h('button', { type: 'button', class: 'ae-mini', 'aria-label': '上移', disabled: i === 0, onclick: () => move(-1), html: ico('chevron-up', 18) }),
        h('button', { type: 'button', class: 'ae-mini', 'aria-label': '下移', disabled: i === p.dockActions.length - 1, onclick: () => move(1), html: ico('chevron-down', 18) }),
        h('button', { type: 'button', class: 'ae-sw', role: 'switch', 'aria-checked': String(!!a.on), 'aria-label': `显示 ${ACTION_LABELS[a.id]}`, onclick: () => {
          const arr = store.get().dockActions.map((x) => (x.id === a.id ? { id: x.id, on: !x.on } : x));
          store.set({ dockActions: arr });
        } })));
    });
    root.append(sec('grip', '快捷菜单',
      sw('dock', '点按爱弥斯弹出快捷菜单', '菜单只在点爱弥斯时出现，点空白处 / 再点她 / 执行操作后自动收起；拖动爱弥斯即可改变菜单位置'),
      sw('dockLabels', '按键显示文字'),
      seg('按键大小', [['s', '小'], ['m', '中'], ['l', '大']], p.dockSize, (v) => store.set({ dockSize: v })),
      h('p', { class: 'ae-note' }, '按键与顺序（上下箭头调整顺序，开关决定是否显示）：'),
      list,
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => store.reset(['dockActions', 'dockLabels', 'dockSize']), html: `${ico('reload')}<span>恢复默认按键</span>` }))));

    root.append(sec('message', '对话页',
      sw('keyboardGuard', '只在点输入框时弹键盘', '点「+」、发送、切换会话等按钮不再弹出手机键盘（仅触屏生效）'),
      sw('hideNotifyBell', '隐藏右上角通知铃铛', '记忆插件的站内通知小铃铛（关闭后恢复显示）'),
      sw('wwLingo', '鸣潮风格的过程名称', '「运行命令」→「共鸣技能」、「已调用工具」→「已唤醒声骸」、「执行了命令」→「已释放共鸣技能」等，仅改显示文字')));

    root.append(sec('cog', '设置页（0.2 新版）',
      sw('settingsSplit', '拆成两个入口', '侧栏底部出现「系统设置」和「插件中心」：前者只显示 DeepSeek Harness 自带的设置，后者只显示第三方插件加的设置页'),
      sw('settingsSkin', '设置页新皮肤', '官方设置弹窗换成爱弥斯「频段柱」布局'),
      seg('设置页风格', [['resonance', '共鸣·频段柱'], ['classic', '经典列表']], p.settingsStyle, (v) => store.set({ settingsStyle: v }), '共鸣：一排频段竖柱，选中项展开点亮，底部切换 系统/模组，可左右滑动翻页；经典：保留官方侧边导航'),
      seg('翻页效果', [['glitch', '电子幽灵·乱码'], ['scan', '共鸣扫描'], ['slide', '平移'], ['none', '关闭']], p.settingsFlip, (v) => store.set({ settingsFlip: v }), '切换设置页时的转场：选「电子幽灵」时新页面会先乱码解密再显形'),
      sw('settingsSwipe', '左右滑动翻页', '在设置内容区左右轻扫可切换上/下一页'),
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => settingsSplit().openSettings('official'), html: `${ico('cog')}<span>打开系统设置</span>` }),
        h('button', { type: 'button', class: 'ae-btn', onclick: () => settingsSplit().openSettings('plugins'), html: `${ico('androids')}<span>打开插件中心</span>` }))));

    root.append(sec('zap', '模型选择胶囊',
      sw('capsuleSkin', '爱弥斯胶囊皮肤', '像素字体 + 粉色发光边框，思考强度颜色保留'),
      sw('chatChrome', '舰桥式聊天界面', '顶栏两行重排、输入框宝石按键、底部状态条与收起把手统一样式'),
      sw('compactSidebar', '紧凑侧栏', '顶部入口收成一排图标、底部按钮收成两排，会话列表更长'),
      sw('polestarSlider', '启明星光刃滑块', '思考强度滑块换成「永远的启明星」粉青光刃与像素星屑粒子'),
      sw('capsuleClamp', '手机面板防溢出', '窄屏下模型面板左右贴边、加大点按行高')));

    root.append(sec('layout', '手机布局',
      sw('mobileNav', '移动端抽屉布局', '内置 dsh-mobile-nav：左右滑动切换会话列表/聊天、头部重排、输入框折叠'),
      sw('mobileFixes', '头部与触控修复', '内置 header-fix / touch-fix / 壁纸面板适配')));

    root.append(h('div', { class: 'ae-btns' },
      h('button', { type: 'button', class: 'ae-btn ae-pink', onclick: () => { if (confirm('把爱弥斯主题的全部设置恢复默认？')) store.reset(); }, html: `${ico('reload')}<span>全部恢复默认</span>` })));

    root.append(h('p', { class: 'ae-credit' },
      '爱弥斯是《鸣潮》（库洛游戏）角色，本主题为同人非商用。像素小人：aemeath-mini-codex-pet（MIT）；像素字体：缝合像素 Fusion Pixel（OFL）；图标：pixelarticons（MIT）；按键底图：Kenney Pixel UI（CC0）；手机布局：dsh-mobile-nav（MIT）。'));
  }

  render();
  const off = store.subscribe(render);
  const onTheme = setInterval(() => {
    const snap = theme?.getTheme?.();
    const key = snap ? `${snap.preference}|${snap.fontSize}` : '';
    if (key !== onTheme.key) { if (onTheme.key !== undefined) render(); onTheme.key = key; }
  }, 1000);
  return () => { off(); clearInterval(onTheme); root.remove(); offStyle(); };
}

/** Floating sheet hosting the panel (dock settings button / pet long press). */
function openSheet(ctx) {
  if (document.getElementById('aemeath-sheet')) return;
  const sheet = h('div', { id: 'aemeath-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': '爱弥斯主题设置' });
  const card = h('div', { class: 'ae-sheet-card' });
  const close = () => { unmount(); sheet.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  card.append(h('div', { class: 'ae-sheet-top' }, h('span', null, '✦ 爱弥斯主题'),
    h('button', { type: 'button', 'aria-label': '关闭', onclick: close, html: ico('close', 20) })));
  sheet.append(card);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(sheet);
  const unmount = mountPanel(card, ctx);
  openSheet.close = close;
}

module.exports = { mountPanel, openSheet };
