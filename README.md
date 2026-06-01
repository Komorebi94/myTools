# 新年倒计时 · 生日祝福

Vue 3 + Vite 实现的跨年倒计时与生日祝福页面，支持烟花、弹幕、姓名分享与 GSAP 动画。

| 页面          | 地址                                          |
| ------------- | --------------------------------------------- |
| 跨年倒计时    | https://komorebi94.github.io/myTools/         |
| 生日祝福      | https://komorebi94.github.io/myTools/birthday |
| 健身存钱罐    | https://komorebi94.github.io/myTools/fitness  |
| LUJX 训练计划 | https://komorebi94.github.io/myTools/lujx     |

## 快速开始

```bash
npm install
npm run dev
```

本地访问：

- 跨年：http://localhost:5173/
- 生日：http://localhost:5173/birthday
- 健身存钱罐：http://localhost:5173/fitness
- LUJX 训练：http://localhost:5173/lujx

生产构建与本地预览：

```bash
npm run build
npm run preview
```

质量检查：

```bash
npm run lint
npm test
```

## 部署到 GitHub Pages

本仓库已配置 [GitHub Actions](.github/workflows/deploy.yml)，推送到 **`main`** 分支后会自动构建并发布（远程已统一使用 `main`，不再使用 `master`）。

### 首次启用（只需做一次）

1. 将代码推送到 GitHub 仓库（例如 `Komorebi94/myTools`）。
2. 打开仓库 **Settings → Pages**。
3. **Build and deployment → Source** 选择 **GitHub Actions**。
4. 等待 Actions 工作流 `Deploy to GitHub Pages` 跑绿。
5. 访问：**https://\<你的用户名\>.github.io/myTools/**

### 日常发布

```bash
git add .
git commit -m "your message"
git push origin main
```

推送后可在 **Actions** 页查看 **Deploy to GitHub Pages** 工作流（含 `build` + `deploy` 两个 job）；约 1–2 分钟后站点更新。

### 子路径说明（重要）

GitHub 项目页地址为 `https://<user>.github.io/<仓库名>/`，构建时必须设置：

```bash
VITE_BASE=/myTools/
```

- CI / Deploy 工作流里已写死上述变量，**推送即可**，无需本地再配。
- 若仓库名变更，请同时修改：
    - `.github/workflows/deploy.yml` 中的 `VITE_BASE`
    - `.env.example` 中的 `VITE_BASE` 示例

### 本地模拟 GitHub Pages 构建

```bash
# 复制环境变量示例（仓库名一致时可直接用）
cp .env.example .env

# 确保 .env 含：VITE_BASE=/myTools/
npm run build
npm run preview
```

预览地址一般为 http://localhost:4173/myTools/

### 部署到自己的域名（可选）

若使用自定义域名并部署在站点根路径，构建时设 `VITE_BASE=/`，并在 `public/` 下添加 `CNAME` 文件；Pages 设置里填写自定义域名。详见 [GitHub Pages 文档](https://docs.github.com/zh/pages)。

### 部署后黑屏？

1. 确认访问地址带仓库名：`https://<用户名>.github.io/myTools/`（不是站点根 `/`）。
2. 必须使用 **Deploy to GitHub Pages** 工作流（带 `VITE_BASE=/myTools/`），不要只跑 CI。
3. 强刷缓存（Ctrl+Shift+R）或无痕窗口；Network 里应能看到主 JS 请求成功且页面有倒计时 DOM。

### Fork 后部署

1. Fork 本仓库到你账号下。
2. 若仓库名变化，按上一节修改 `VITE_BASE` 与工作流。
3. 在 Fork 仓库中同样启用 **Pages → GitHub Actions**。
4. 你的地址为：`https://<你的用户名>.github.io/<仓库名>/`

## 页面说明

### 跨年倒计时 `/`

| 参数                     | 说明                       |
| ------------------------ | -------------------------- |
| `onlyShowFireWorks=true` | 仅展示烟花，不显示倒计时   |
| `testEffect=true`        | 15 秒测试倒计时            |
| `target`                 | 自定义目标时间（ISO 8601） |
| `messages`               | 自定义弹幕，逗号分隔       |
| `name`                   | 姓名，显示在祝福语与弹幕中 |

| 场景       | 链接                                                              |
| ---------- | ----------------------------------------------------------------- |
| 首页       | `https://komorebi94.github.io/myTools/`                           |
| 测试倒计时 | `https://komorebi94.github.io/myTools/?testEffect=true`           |
| 带姓名     | `https://komorebi94.github.io/myTools/?name=小明&testEffect=true` |

### 生日祝福 `/birthday`

霓虹渐变标题、飘气球、点燃蜡烛、粉金烟花、彩纸、弹幕与背景音乐（点燃蜡烛后播放，右下角可开关）。

| 参数          | 说明                            |
| ------------- | ------------------------------- |
| `name`        | 寿星姓名（标题与弹幕个性化）    |
| `age`         | 年龄（1–119），显示在祝福语中   |
| `messages`    | 自定义弹幕，逗号分隔            |
| `auto=false`  | 关闭进入页面约 1.4 秒后自动庆祝 |
| `music=false` | 关闭背景音乐与右下角音乐按钮    |

| 场景      | 链接                                                             |
| --------- | ---------------------------------------------------------------- |
| 生日页    | `https://komorebi94.github.io/myTools/birthday`                  |
| 带姓名    | `https://komorebi94.github.io/myTools/birthday?name=小红`        |
| 姓名+年龄 | `https://komorebi94.github.io/myTools/birthday?name=小红&age=18` |
| 手动庆祝  | `?auto=false`，进入后点「点燃蜡烛」                              |

右上角悬停 **分享链接** 可复制带 `name` 的当前页链接。两页通过地址路径区分（`/` 与 `/birthday`）。

### 健身存钱罐 `/fitness`

虚拟激励金 + 周期化自重训练打卡。支持 `?day=N` 预览第 N 课次计划（不写库）。

| 功能 | 说明                                     |
| ---- | ---------------------------------------- |
| 打卡 | 完成 / 未达标 / 缺席，影响余额与连续天数 |
| 台账 | 记录与兑换                               |
| 设置 | 规则说明、JSON 导出/导入、重置           |

### LUJX 训练计划 `/lujx`

四阶段自重进阶计划（周一二四六练），本地打卡与日历记录。

| 参数      | 说明                          |
| --------- | ----------------------------- |
| `tab`     | `today` / `plan` / `records`  |
| `mockDay` | 预览第 N 天计划（不写入打卡） |

「训练记录」页支持 JSON 备份导出/导入。数据仅存本机 `localStorage`。

环境变量见 [.env.example](.env.example)（`VITE_DEFAULT_TARGET`、`VITE_BASE`）。

生日页背景音乐来自 [Mixkit](https://mixkit.co/) 免版税曲库（`public/audio/happy-birthday.mp3`），可替换为自有音频文件。

## 项目结构

```
.github/workflows/   # CI 与 GitHub Pages 部署
public/              # 静态资源、manifest
src/
├── components/      # Barrage、CountdownDisplay、ShareButton 等
├── composables/     # 倒计时、烟花、路由参数等 hooks
├── constants/
├── styles/
├── utils/
└── views/
    ├── HappyNewYear/
    ├── Birthday/
    ├── FitnessDiscipline/
    └── LujxPlan/
```

## 多端适配

| 设备 | 断点       | 特性                                           |
| ---- | ---------- | ---------------------------------------------- |
| 手机 | &lt; 768px | 卡片倒计时、较少烟花粒子、轻触放烟花、震动反馈 |
| 平板 | 768–1023px | 中等字号与弹幕密度                             |
| 桌面 | ≥ 1024px   | 固定根字号、鼠标点击/移动触发烟花              |

其他：`100dvh`、safe-area、最后 10 秒全屏倒数、减弱动效降级、标签页重新可见时校准倒计时、Web App Manifest 支持添加到主屏幕。

## 说明

- 默认目标时间为下一个元旦 0 点（本地时区，`YYYY-01-01T00:00:00`，兼容 Safari）。
- 若打开页面时新年已过，会自动播放烟花、弹幕与「新年快乐」动画。

## License

MIT
