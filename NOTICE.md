# NOTICE

## 关于角色与游戏
爱弥斯（Aemeath）、深空联合（Spacetrek Collective）、「永远的启明星」等名称与设定属于《鸣潮》（Wuthering Waves，库洛游戏 Kuro Games）。
本项目是**非官方、非商业的同人主题**，与库洛游戏无关，也未获其授权或背书。界面里的少量短台词与技能名引用自游戏，仅作致敬。
如权利方认为有不妥，请提 issue，我们会尽快修改或移除。

`assets/dsu-emblem.webp`、`assets/favicon.png` 是根据「深空联合」组织标志（来源：萌娘百科图片页）重新描绘、上色的徽记，同样属于上述同人致敬范围，不适用本项目的 MIT 许可。

## 第三方代码与素材

本项目打包或改编了下列作者的作品，在此致谢。各项原始许可证全文保存在 `vendor/`。

### 内置的插件代码（原样打包，未改动）
| 文件 | 原作品与作者 | 许可 |
|---|---|---|
| `vendor/mobile-nav.client.js`（手机抽屉、头部重排、分页、输入框收起） | @dsh-external/dsh-mobile-nav 1.0.0，作者 mexiaosqwq（https://github.com/mexiaosqwq/dsh-web-mobile） | MIT，见 `vendor/mobile-nav.LICENSE` |
| `vendor/dsh-mobile-header-fix.client.js` | dsh-mobile-header-fix 1.3.0，DeepSeek Harness 社区插件（原包未注明作者） | MIT |
| `vendor/dsh-mobile-touch-fix.client.js` | dsh-mobile-touch-fix 1.0.0，DeepSeek Harness 社区插件（原包未注明作者） | MIT |
| `vendor/dsh-wallpaper-engine-mobile-layout.client.js` | dsh-wallpaper-engine-mobile-layout，dsh-plugin-wallpaper-engine 的手机布局补丁（原包未注明作者） | MIT |

上面三个未注明作者的插件，如果你是原作者，请提 issue，我们会补上署名和链接。

### 移植的算法
| 文件 | 原作品与作者 | 许可 |
|---|---|---|
| `src/client/polestar.js` 中的光柱辐射绘制（`drawRadiation`） | @hytime/dsh-thinking-effort（hytime，https://github.com/hytime/dsh-thinking-effort），其算法源自 HanaAyane/dsh-reasoning-effort（https://github.com/HanaAyane/dsh-reasoning-effort）。本项目改了配色并加了粒子 | MIT |

`@hytime/dsh-thinking-effort` 本身没有打包进来。本主题只给它换皮，需要用户自行安装。

### 美术与字体
| 文件 | 原作品与作者 | 许可 |
|---|---|---|
| `assets/pet-half.webp`、`assets/pet-run-*.webp`、`assets/doll-pet.webp`（像素小爱弥斯，经缩放和裁帧） | aemeath-mini-codex-pet，作者 sinlatansen（https://github.com/cuNuo/aemeath-mini-codex-pet），源自 lzy-buaa-jdi/ameath（https://gitee.com/lzy-buaa-jdi/ameath） | MIT，见 `vendor/aemeath-mini-codex-pet.LICENSE` |
| `assets/pixel-font.woff2` | 缝合像素字体 Fusion Pixel Font 10px proportional zh_hans，作者 TakWolf（https://github.com/TakWolf/fusion-pixel-font） | SIL OFL 1.1，见 `vendor/fusion-pixel-font.OFL.txt` |
| `src/client/icons.js` 中的图标路径 | pixelarticons，作者 Gerrit Halfmann（https://github.com/halfmage/pixelarticons） | MIT，见 `vendor/pixelarticons.LICENSE` |
| `assets/btn-*.png`（九宫格按键，经重新着色） | Kenney Pixel UI Pack，作者 Kenney（https://kenney.nl） | CC0，见 `vendor/kenney-pixel-ui.LICENSE.txt` |
| `assets/heart-pulse.png`、`assets/gem-shine.png` | SpritePilot free animated pickup sprites | CC0 1.0，见 `vendor/spritepilot-CC0.txt` |

### 只作参考、未复制代码或素材
- dsh-aemeath-pet（culture-flask，https://github.com/culture-flask/dsh-aemeath-pet，Apache-2.0）：参考了 DSH 桌宠读取会话状态的方式。
- dsh-aemeath-skin（@dsh-external/dsh-client-ui-skin-aemeath，CC BY-NC-SA 4.0）：参考了爱弥斯配色思路，没有使用其素材和样式代码。
- 《星落》《忘却前夜》等游戏界面：参考了设置页的翻页与布局交互。

## 本项目原创素材
- `assets/bg-night.webp`、`assets/bg-night-dim.webp`：用 NovelAI 生成后像素化处理的星夜背景。
- `assets/doll-cat.png`（黑猫玩偶）、`assets/polestar-tag*.png`（启明星像素标签）：本项目手绘像素图，`scripts/gen-dolls.py` 可重新生成黑猫。
