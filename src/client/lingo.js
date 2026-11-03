"use strict";
// 鸣潮 / 爱弥斯 flavoured display names for the chat's process rows and tool
// rows (Chinese UI only). Only the shown text changes: tool names, events and
// behaviour stay untouched. Implemented as an in-place overlay on the shipped
// `conversation` / `chat` zh dictionaries; every replaced value is restored
// when the option is turned off or the plugin unloads.
const store = require('./store.js');

// Done-state labels keep the "已" prefix so the shipped "A并B" joiner still
// drops the repeated prefix ("已解读声痕并唤醒声骸").
const CHAT = {
  'message.stepProcess.thinking': '正在调谐频率',
  'message.stepProcess.read': '正在解读声痕',
  'message.stepProcess.readImage': '正在凝视残像',
  'message.stepProcess.write': '正在谱写乐章',
  'message.stepProcess.search': '正在追踪频率',
  'message.stepProcess.edit': '正在变奏修订',
  'message.stepProcess.commands': '正在释放共鸣技能',
  'message.stepProcess.code': '正在运转终端',
  'message.stepProcess.webSearch': '正在扫描索拉里斯',
  'message.stepProcess.webFetch': '正在接收远方回响',
  'message.stepProcess.subagents': '正在召集共鸣者',
  'message.stepProcess.plan': '正在规划航线',
  'message.stepProcess.questions': '等待漂泊者回应',
  'message.stepProcess.tools': '正在唤醒声骸',
  'message.stepProcess.prepare.read': '准备解读声痕',
  'message.stepProcess.prepare.readImage': '准备凝视残像',
  'message.stepProcess.prepare.write': '准备谱写乐章',
  'message.stepProcess.prepare.search': '准备追踪频率',
  'message.stepProcess.prepare.edit': '准备变奏修订',
  'message.stepProcess.prepare.commands': '准备释放共鸣技能',
  'message.stepProcess.prepare.code': '准备运转终端',
  'message.stepProcess.prepare.webSearch': '准备扫描索拉里斯',
  'message.stepProcess.prepare.webFetch': '准备接收远方回响',
  'message.stepProcess.prepare.subagents': '准备召集共鸣者',
  'message.stepProcess.prepare.plan': '准备规划航线',
  'message.stepProcess.prepare.questions': '准备向漂泊者发问',
  'message.stepProcess.prepare.tools': '准备唤醒声骸',
  'message.stepProcess.done.thinking': '已完成调谐',
  'message.stepProcess.done.read': '已解读声痕',
  'message.stepProcess.done.readImage': '已凝视残像',
  'message.stepProcess.done.write': '已谱写乐章',
  'message.stepProcess.done.search': '已追踪频率',
  'message.stepProcess.done.edit': '已完成变奏',
  'message.stepProcess.done.commands': '已释放共鸣技能',
  'message.stepProcess.done.code': '已运转终端',
  'message.stepProcess.done.webSearch': '已扫描索拉里斯',
  'message.stepProcess.done.webFetch': '已接收远方回响',
  'message.stepProcess.done.subagents': '已召集共鸣者',
  'message.stepProcess.done.plan': '已规划航线',
  'message.stepProcess.done.questions': '已向漂泊者发问',
  'message.stepProcess.done.tools': '已唤醒声骸',
};

const CONVERSATION = {
  'tool.title.bash': '共鸣技能',
  'tool.title.pwsh': '共鸣技能',
  'tool.title.generic': '声骸技能',
  'tool.title.search': '频率追踪',
  'tool.title.read': '声痕解读',
  'tool.title.write': '谱写乐章',
  'tool.title.edit': '变奏修订',
  'tool.title.code': '终端运算',
  'tool.title.readImage': '残像凝视',
  'tool.title.grep': '声纹检索',
  'tool.title.glob': '坐标搜寻',
  'tool.title.webSearch': '索拉里斯搜寻',
  'tool.title.webFetch': '远方回响',
  'tool.title.subagent': '召唤共鸣者',
  'tool.title.waitAgent': '等待共鸣者',
  'tool.title.workflow': '协奏编排',
  'tool.title.listJobs': '查看后台声骸',
  'tool.title.readJob': '读取声骸回响',
  'tool.title.killJob': '收回声骸',
};

// Mode (agent preset) names — descriptions stay stock on purpose.
const PRESETS = {
  presetStandardName: '共鸣模式',
  presetPtcName: '协奏模式',
  presetMinimalName: '独奏模式',
  presetCordisName: '幽灵工坊',
};
// Background-job chip in the session header.
const JOBS = {
  'count.live.one': '{count} 声骸巡航',
  'count.live.other': '{count} 声骸巡航',
  'count.idle.one': '{count} 声骸待命',
  'count.idle.other': '{count} 声骸待命',
};
// "深度求索中，用时 N 秒" row above the composer.
Object.assign(CHAT, {
  'message.think': '救世中',
  'chat.deepDiving': '爱弥斯调谐中',
  // 0.2.x: "chat.deepDivingFor" carries {duration}; "turnProcess.took" is a
  // bare prefix the duration is appended to (no placeholder), so keep ours a
  // prefix too or "{duration}" leaks into the row.
  'chat.deepDivingFor': '爱弥斯调谐中 · {duration} ···',
  'message.turnProcess.deepDivingFor': '爱弥斯调谐中 · {duration}',
  'message.turnProcess.took': '乐章完成 · 用时 ',
  'message.turnProcess.worked': '乐章已完成',
  'message.turnProcess.failed': '共鸣中断',
  'message.turnProcess.thoughtForAWhile': '已调谐频率',
  'message.turnProcess.toolCalls.one': '{count} 次共鸣技能',
  'message.turnProcess.toolCalls.other': '{count} 次共鸣技能',
  'message.turnProcess.subagents.one': '{count} 个声骸',
  'message.turnProcess.subagents.other': '{count} 个声骸',
});

/** Tables to overlay for the current prefs: ns -> {key: value}. */
function tables(p) {
  const t = {};
  const add = (ns, obj) => { t[ns] = Object.assign(t[ns] || {}, obj); };
  if (p.wwLingo) { add('chat', CHAT); add('conversation', CONVERSATION); add('settings.agentPreset', PRESETS); add('job', JOBS); }
  if (p.brand) {
    const { NAMES } = require('./brand.js');
    add('conversation', { 'hero.headline': (NAMES[p.brandName] || NAMES.spacetrek).title });
  }
  return t;
}

function install(ctx) {
  let locale;
  try { locale = ctx.get('locale'); } catch { locale = null; }
  if (!locale) return () => {};
  const saved = []; // [dict, key, original]

  const bump = () => {
    try { locale.publish(locale.getLocale().active, false); } catch { /* revision bump is best effort */ }
  };
  const restore = () => {
    for (const [dict, key, orig] of saved.splice(0).reverse()) if (dict[key] !== undefined) dict[key] = orig;
  };
  const applyOverlay = () => {
    restore();
    const dicts = locale.dicts;
    if (!(dicts instanceof Map)) { bump(); return; }
    for (const [ns, table] of Object.entries(tables(store.get()))) {
      const perLocale = dicts.get(ns);
      if (!(perLocale instanceof Map)) continue;
      for (const [loc, dict] of perLocale) {
        if (!/^zh/.test(loc) || !dict) continue;
        for (const [key, value] of Object.entries(table)) {
          if (typeof dict[key] !== 'string') continue;
          saved.push([dict, key, dict[key]]);
          dict[key] = value;
        }
      }
    }
    bump();
  };

  // Dictionaries register lazily (job / agent-preset come late); re-apply
  // whenever a namespace we care about shows up, for the first 30 s.
  const WANT = ['chat', 'conversation', 'settings.agentPreset', 'job'];
  let seen = '';
  let tries = 0;
  const timer = setInterval(() => {
    const d = locale.dicts;
    const now = d instanceof Map ? WANT.filter((n) => d.has(n)).join(',') : '';
    if (now !== seen) { seen = now; applyOverlay(); }
    if (++tries > 60) clearInterval(timer);
  }, 500);
  const sig = (p) => `${p.wwLingo}|${p.brand}|${p.brandName}`;
  let last = sig(store.get());
  const off = store.subscribe((p) => { const k = sig(p); if (k !== last) { last = k; applyOverlay(); } });
  return () => { clearInterval(timer); off(); restore(); bump(); };
}

module.exports = { install, CHAT, CONVERSATION, PRESETS, JOBS };
