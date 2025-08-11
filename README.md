# 彩腾电子说明书（GitHub Pages 版）

本项目是一个可直接部署到 GitHub Pages 的静态网站，用于向客户展示产品电子说明书，并收集客户联系方式以便进行安装指导/售后支持。项目移动端优先设计，适合手机扫码直接查看。

## 功能概览
- 手机扫码直达对应产品说明书页面（基于 `id` 查询参数）
- 弹窗线索收集表单（姓名、电话、邮箱、社交平台、账号、留言）
- 提交后提示：我们将在 24 小时内联系您，并提供 WhatsApp 一键联系技术支持
- 售后视频位（可放 YouTube/MP4）
- 后续可轻松新增产品：新增一条配置 + 一份 Markdown 说明书

## 目录结构
```
.
├── index.html                 # 首页（测试/产品列表入口）
├── p/index.html               # 产品说明书模板页（通过 ?id=xxx 渲染）
├── assets/
│   ├── styles.css             # 全站样式（移动优先）
│   ├── app.js                 # 公共逻辑：弹窗、表单提交、Toast 等
│   └── product.js             # 产品页逻辑：读取 id、加载产品与说明书、渲染视频
├── data/
│   └── products.json          # 产品清单（可自行扩展字段）
├── manuals/
│   ├── ct-100.md              # 示例产品 CT-100 说明书（Markdown）
│   └── ct-200.md              # 示例产品 CT-200 说明书（Markdown）
├── site.config.json           # 全站配置：站点名、WhatsApp 链接、表单端点
└── 404.html                   # 404 友好页（可选）
```

## 快速开始
1. 将本项目推送到你的 GitHub 仓库。
2. 在仓库 Settings → Pages 中，将构建来源设置为 `Deploy from a branch`，并选择 `main` 分支和根目录。
3. 保存后等待 GitHub Pages 部署完成，即可通过给定的 URL 访问网站。

## 全站配置（site.config.json）
`site.config.json` 用于集中配置：
- `siteName`: 站点名称
- `whatsAppLink`: 技术支持 WhatsApp 链接（例如 `https://wa.me/15551234567`）
- `formEndpoint`: 线索收集表单的提交端点（推荐使用 Formspree）

示例：
```json
{
  "siteName": "彩腾电子说明书",
  "whatsAppLink": "https://wa.me/15551234567",
  "formEndpoint": "https://formspree.io/f/your_form_id"
}
```

### 表单端点说明（Formspree 推荐）
- 打开 `https://formspree.io/` 注册并创建一个表单，复制其 `Endpoint URL`，填入 `site.config.json` 的 `formEndpoint`。
- 本站使用 `FormData` 提交，支持跨域；若需改为其他服务（如 Getform、Basin、Google Forms），请根据其要求调整 `assets/app.js` 内的提交逻辑。

## 新增一个产品
1. 在 `data/products.json` 中新增一条产品记录：
   - `id`：产品唯一标识（建议与二维码绑定）
   - `name`：产品名称
   - `sku`：SKU/型号
   - `heroImage`：头图 URL（可选）
   - `videoUrl`：售后视频链接（可选，支持 YouTube 链接或 .mp4）
   - 你也可以自由扩展字段（如 `pdfUrl` 等），并在前端渲染处使用
2. 在 `manuals/` 目录下新增与 `id` 同名的 Markdown 文件，如 `manuals/your-id.md`，编写说明书内容。
3. 生成二维码，指向如下 URL：
   - `https://<你的GitHub用户名>.github.io/<仓库名>/p/?id=<产品id>`
   - 例：`https://example.github.io/caiteng/p/?id=ct-100`

客户扫码后即可直达该产品说明书页面，且无需看到其他产品。

## 本地预览
可使用任意静态服务器本地预览，如：
```bash
python3 -m http.server 5500
```
然后访问 `http://localhost:5500/`。

## 文案与样式
- 所有中文文案均可在 `index.html`、`p/index.html` 或 JS 文件中直接修改
- 样式集中在 `assets/styles.css`，支持自定义品牌色、按钮样式、排版等

## 常见问题
- GitHub Pages 二级路径问题：本项目的链接均使用相对路径，适配 `https://<用户>.github.io/<仓库>/` 的 Pages 站点。
- 表单无法提交：请确认 `site.config.json` 中的 `formEndpoint` 已替换为有效地址（如 Formspree 的表单 URL）。
- YouTube 视频：请使用嵌入式链接（如 `https://www.youtube.com/embed/<视频ID>`），或直接使用 `.mp4` 链接。

## 许可证
本项目基于 MIT 许可证开源，你可以自由修改和商用。 

## 生成产品二维码
已内置二维码生成工具：`tools/qr.html`

使用方法：
1. 打开 `tools/qr.html`（在本地预览时访问 `http://localhost:5500/tools/qr.html`）
2. 填写你的 GitHub Pages 站点根地址（如 `https://<用户名>.github.io/<仓库名>`）
3. 勾选是否“打开即弹出线索窗口（lead=1）”
4. 点击“生成二维码”，随后可分别下载每个产品的 PNG 图片

二维码将直达：`/p/?id=<产品id>`；若勾选引导，则为：`/p/?id=<产品id>&lead=1` 