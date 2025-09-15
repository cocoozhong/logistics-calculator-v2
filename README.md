# 智能物流与利润计算器（GitHub Pages 部署）

在线地址：
- https://cocoozhong.github.io/logistics-calculator-v2/
- https://cocoozhong.github.io/logistics-calculator-v2/profit/

## 本地预览（与 Pages 前缀一致）

```bash
python3 -m http.server 3000 --bind 127.0.0.1
# 如页面资源 404，确保存在 logistics-calculator-v2 目录软链：
mkdir -p logistics-calculator-v2
ln -sf ../_next logistics-calculator-v2/_next
ln -sf ../manifest.json logistics-calculator-v2/manifest.json
ln -sf ../icon.svg logistics-calculator-v2/favicon.ico
ln -snf ../profit logistics-calculator-v2/profit
```

## GitHub Pages 发布

- 分支：`gh-pages`
- 需要 `.nojekyll`，确保 `_next` 目录可被 Pages 静态服务。
- 推送即发布：

```bash
git add -A
git commit -m "chore: update site"
git push origin gh-pages
```

## 说明
- 站点以二级路径 `/logistics-calculator-v2` 为前缀，`/` 与 `/profit/` 在同一域名下切换。
- 若改用 Vercel 部署，可移除前缀并使用根路径，SSR/SEO 更佳。
