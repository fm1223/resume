# HTML 简历

一个基于 Vite、原生 HTML 和 SCSS 的轻量简历项目，支持网页预览、浏览器打印和自动导出 PDF。运行环境为 Node.js 22。

## 使用方式

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

简历正文位于 `src/index.html`，样式位于 `src/main.scss`。页面右上角的“导出 PDF”按钮会打开浏览器打印窗口，可选择“另存为 PDF”。

## 构建与导出

生成静态网站：

```bash
npm run build
```

自动生成 PDF：

```bash
npm run pdf
```

PDF 输出到 `output/pdf/resume.pdf`。导出脚本优先使用本机 Google Chrome；如果没有安装 Chrome，可先执行：

```bash
npx playwright install chromium
```

然后重新运行 `npm run pdf`。
