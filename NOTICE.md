# NOTICE

## 关于角色与游戏
爱弥斯（Aemeath）、深空联合（Spacetrek Collective）、「永远的启明星」等名称与设定属于《鸣潮》（Wuthering Waves，库洛游戏 Kuro Games）。
本项目是**非官方、非商业的同人主题**，与库洛游戏无关，也未获其授权或背书。界面里的少量短台词与技能名引用自游戏，仅作致敬。
如权利方认为有不妥，请提 issue，我们会尽快修改或移除。

`assets/dsu-emblem.webp`、`assets/favicon.png` 是根据「深空联合」组织标志（来源：萌娘百科图片页）重新描绘、上色的徽记，同样属于上述同人致敬范围，不适用本项目的 MIT 许可。

## 第三方代码与素材

| 文件 | 来源 | 许可 |
|---|---|---|
| `assets/pet-half.webp`、`assets/pet-run-*.webp`、`assets/doll-pet.webp`（像素小爱弥斯，由原图缩放/裁帧） | aemeath-mini-codex-pet（源自 gitee lzy-buaa-jdi/ameath） | MIT，见 `vendor/aemeath-mini-codex-pet.LICENSE` |
| `assets/pixel-font.woff2` | 缝合像素字体 Fusion Pixel Font（10px proportional zh_hans） | SIL OFL 1.1，见 `vendor/fusion-pixel-font.OFL.txt` |
| `src/client/icons.js` 中的图标路径 | pixelarticons（Gerrit Halfmann） | MIT，见 `vendor/pixelarticons.LICENSE` |
| `assets/btn-*.png`（九宫格按键，重新着色） | Kenney Pixel UI Pack | CC0，见 `vendor/kenney-pixel-ui.LICENSE.txt` |
| `assets/heart-pulse.png`、`assets/gem-shine.png` | SpritePilot free animated pickup sprites | CC0 1.0，见 `vendor/spritepilot-CC0.txt` |
| `vendor/mobile-nav.client.js`（手机抽屉布局） | @dsh-external/dsh-mobile-nav 1.0.0（mexiaosqwq） | MIT，见 `vendor/mobile-nav.LICENSE` |
| `vendor/dsh-mobile-header-fix.client.js`、`vendor/dsh-mobile-touch-fix.client.js`、`vendor/dsh-wallpaper-engine-mobile-layout.client.js` | 对应同名 DeepSeek Harness 社区插件 | MIT |
| `src/client/polestar.js` 中的光柱辐射绘制算法 | HanaAyane/dsh-reasoning-effort → @hytime/dsh-thinking-effort | MIT |

## 本项目原创素材
- `assets/bg-night.webp`、`assets/bg-night-dim.webp`：用 NovelAI 生成后像素化处理的星夜背景。
- `assets/doll-cat.png`（黑猫玩偶）、`assets/polestar-tag*.png`（启明星像素标签）：本项目手绘像素图，`scripts/gen-dolls.py` 可重新生成黑猫。
