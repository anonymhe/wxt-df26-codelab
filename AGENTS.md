# Workshop: 使用 Chrome Built-in AI 构建一个端侧运行的侧边栏助手

> 当前项目是用于“福州 2026 （人工智能）开发者节”活动中的工作坊（Workshop）环节的模板项目。
>
> 当前项目所采用的技术栈为: `wxt` + `react` + `tailwindcss` + `shadcn/ui` 

## 0. 检查是否拥有合适的辅助 skills (必要)

> 本文档面向 workshop 环境，参与者多为**第一次使用 vibe coding**，其本地环境**未必已安装**下列 skills / MCP。
> 因此「先确认技能是否就绪」是必要步骤，不能默认它们已经存在。

在开始任何工作前，**必须**先执行 `find-skills` skill，检索并确认当前环境可用的辅助 skills；缺失的应安装或寻找等价替代，避免遗漏能直接提升本次任务质量的关键能力。

> `find-skills` 的核心用法是 **`npx -y skills`**：部分 harness 并未内置 `find-skills` skill，此时直接在终端运行该命令即可完成技能检索与安装（不确定具体子命令时可先加 `--help` 查看）。

- [ ] [skills] find-skills（**必须首先执行**：用于发现、安装本次任务所需的技能；未内置时用 `npx -y skills` 调用）
- [ ] [mcp] context7 -> https://mcp.context7.com/mcp
- [ ] [skills] modern-web-guidance
- [ ] [skills] chrome-extensions
- [ ] **以下三选一（也可用具备同等能力的功能替代）**，核心目标是**准备一个能让 agent 自行简单验证「是否可用」的能力**：
  - [ ] [computer-use] orca
  - [ ] [browser-use] ego-browser
  - [ ] [chrome] chrome-devtools-mcp@latest

## 1. 环境检查

### 1.1. 检查软件是否安装

需要安装的软件：

- [ ] Google Chrome 148+
- [ ] Node.js 22+
- [ ] 任意 AI 编程辅助工具

### 1.2. 检查硬件是否符合 Chrome Built-in AI 的最低要求

- [ ] 安装有 Chrome 的磁盘剩余至少 22GB 的存储空间
- [ ] 正在使用 Windows 10+ / macOS 13+ / Linux 系统
- [ ] 硬件性能符合最低要求
  - GPU: VRAM 至少为 4GB
  - CPU: RAM 至少为 16GB，核心数 >= 4（即至少 4 核）

### 1.3. 包管理器与依赖安装（npm / pnpm）

- **默认使用 `pnpm`** 管理本项目：**安装依赖、运行脚本、执行构建等一律用 pnpm**（对应命令为 `pnpm install`、`pnpm run build`、`pnpm run compile` 等）。
- 若本机没有 `pnpm`，先用 `npm` 全局安装：`npm install -g pnpm`；安装成功后，后续所有与包管理相关的命令都改用 `pnpm`。
- **安装卡住/缓慢时的处理（重要）**：
  - **完全无输出**：`pnpm` 在缺少可用网络连接时通常**不会产生任何终端输出**。若某条安装命令**静默超过 5 分钟**、始终没有任何新增输出，说明大概率是网络不通，**不要持续重试**。
  - **只有少量输出但速度极慢**：先提示参与者/用户检查网络状况，并**询问是否继续等待**，由其决定。
  - 上述两种情况都应主动汇报可能存在网络问题，并询问是否需要寻找合适的镜像源（如中国大陆地区可考虑 npmmirror 淘宝镜像等），得到确认后再继续。

## 2. 从头开始构建

### 2.1. 构建 popup

popup 内容应含有以下内容：

- [ ] 一个检查 LanguageModel / Built-in AI APIs 能否正常使用的总结性卡片
- [ ] 关于检查各个 API 是否可用且支持点击下载的列表
- [ ] 打开侧边栏的按钮（前往核心功能页面）

#### ⚠️ popup 高度陷阱（高频踩坑，务必先读）

Chrome 扩展 popup 的尺寸规则与普通网页不同：**弹窗高度由内容撑开，上限约 600px，超出后整个弹窗滚动**。因此：

- **不要**给 `html / body / #root` 设置 `height: 100%`。popup 初始视口很小，`height:100%` 会解析成这个很小的视口高度，导致内部 `flex-1 / h-full` 的列表被压扁、"点击可下载…"等文字被底部按钮盖住——这正是本项目初期遇到并已修复的问题。
- **正确做法**：让根容器使用**内容自然高度**（不写 `h-full`/`height:100%`），仅固定宽度（如 `#root { width: 380px; }`），并在 `body` 上保留 `overflow-y: auto` 作为兜底；内部列表不要用 `flex-1 min-h-0` 去"填满"高度。
- **验收标准**：内容自然高度（`document.documentElement.scrollHeight`）应等于真实内容高度；当内容 < 600px 时全部可见，> 600px 时整窗可滚动，底部 CTA 按钮始终在内容之后而非浮盖。可参考 `entrypoints/popup/style.css` 顶部的注释。

### 2.2. 构建 sidepanel

- [ ] 模仿 popup 的结构构建 sidepanel 入口
- [ ] 模块化的构建各个功能模块和界面模块，构建一个可以正常渲染 markdown 的对话框
  - [ ] markdown 模块组件化，便于复用
- [ ] 输入框内上下布局：上半部分是 textarea 可输入；下半部分是按钮行，包含「查看上下文占用 + compact」「附加图片（或从当前页面截图）」「附加当前页面上下文」「发送」四类操作
  - 优先复用工作区已有组件：`components/chat/composer.tsx`（输入框整体布局）、`components/context-usage-ring.tsx` 与 `components/context-usage-tooltip.tsx`（上下文占用与 compact）、`components/ui/textarea.tsx`、`components/ui/button.tsx`；大部分情况下 agent 直接复用即可，无需重写
- [ ] 标题栏带有控制当前会话参数的设置 dialog 并可修改和重置当前会话（可复用 `components/chat/settings-dialog.tsx`）

### 2.3. 构建注入到当前（任意前台）页面的脚本，使得 侧边栏 可以获取到页面内信息

- [ ] 模块化的脚本
- [ ] 覆盖提取页面信息和截图等功能
- 注入方式为**常驻 content script**（随页面加载自动注入、长期驻留），而不是只在需要时临时执行一次。

### 2.4. 打包并引导用户在实际安装的 Chrome 内以手动形式加载开发中的插件

记得提供用户完整的路径和准确的指引。直接通过 dev 使用 wxt 拉起的浏览器并不支持 Built-in AI APIs。

推荐的手动加载流程（务必在向用户的最终回答中给出**完整绝对路径**，路径以**实际工作区/当前项目所在目录**为准）：

- [ ] `pnpm run build` 生成产物到 `.output/chrome-mv3`（给出实际绝对路径，例如
      `<项目根目录>\.output\chrome-mv3`，其中项目根目录请用 `pwsh` 的 `Get-Location` 或等价方式确认后填写，不要照抄示例）
- [ ] 打开 `chrome://extensions/` → 打开右上角「开发者模式」
- [ ] 点「加载已解压的扩展程序」→ 选择上面的 `.output\chrome-mv3` 目录
- [ ] 点工具栏图标 → 弹窗内检测 Built-in AI 能力；若为「需下载模型」则点下载等待 Gemini Nano 就绪
- [ ] 若全部显示「不支持」，提示用户在 `chrome://flags` 开启内置 AI 实验特性后重启 Chrome
      （Prompt API 自 Chrome 138 起仅对 Chrome 扩展开放）

> 注意：命令行 `--load-extension` 在 Chrome 较新稳定版可能被策略忽略；**以 `chrome://extensions` 手动加载为准**。

### 2.5. 常见陷阱与验证流程

> 本节条目主要来自既往 runs 的踩坑记录，**以实际 runs 与当前工作区内容为准**；若工作区实现与之不同（例如已采用常驻 content script），应结合现状判断，不要机械照做。

- [ ] **popup 高度**：见 2.1 的「popup 高度陷阱」，先确认 `document.documentElement.scrollHeight`
      与内容一致、底部 CTA 不被浮盖。
- [ ] **service worker 里没有 Built-in AI**：`LanguageModel` 等全局只在扩展页面（popup / sidepanel / options）
      存在，不要在 background 里做能力检测；检测应放在 UI 页面，通过消息让 background 只做注入/截图。
- [ ] **页面提取要走常驻 content script**：本项目采用常驻注入（`entrypoints/content.ts`），页面提取逻辑放在 content script 中，
      由 background 通过消息转发，不要依赖一次性 `scripting.executeScript` 注入。
- [ ] **sidePanel.open() 的用户手势**：`chrome.sidePanel.open()` **必须在用户点击的同一同步调用栈里直接调用**。
      常见错误是「popup 按钮 → `runtime.sendMessage` → background 里调 `sidePanel.open()`」，此时手势已丢失，
      Chrome 会抛 `sidePanel.open() may only be called in response to a user gesture`，表现为「点了打不开侧边栏」。
      正确做法：**在 popup / 侧边栏等扩展页面里直接调用** `sidePanel.open({ windowId })`
      （可用 `chrome.windows.WINDOW_ID_CURRENT`，失败再回退到当前活动标签页的 `tab.windowId`）。
      另外：若 manifest 配了 `action.default_popup`，点击工具栏图标只会弹 popup，`action.onClicked` 不会触发——
      「点图标直接开侧栏」需移除 popup 并调用 `sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`。
- [ ] **中文输入法回车**：`textarea` 的 Enter 发送需判断 `event.nativeEvent.isComposing`，否则会误发。
- [ ] **类型检查 + 构建**：提交前跑 `pnpm run compile`（tsc --noEmit）与 `pnpm run build`，二者都必须零错误。
- [ ] **无本地模型时的自测（仅建议做法，由 agent 自行完成）**：可用「静态服务 + 注入 mock `LanguageModel`」的方式在 headless Chrome 中
      驱动真实构建产物，验证检测→下载→流式对话→compact 全链路（无需真的下载模型）。
      mock 至少应覆盖 `LanguageModel.availability()`、`LanguageModel.create()`、`session.prompt()`、`session.promptStreaming()`、`session.destroy()`。
      > 参与者**无需**完成此步骤，只需学习并使用 DeepSeek Harness；自测环节全部由 agent 完成。
