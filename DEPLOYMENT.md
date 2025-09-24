# GitHub Pages 部署指南

## 步骤1：创建GitHub仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `logistics-calculator`
   - **Description**: `智能物流费用计算器 - 支持多物流公司价格对比和利润计算`
   - **Visibility**: 选择 "Public"（GitHub Pages需要公开仓库）
   - **不要**勾选 "Add a README file"（我们已经有了）
   - **不要**勾选 "Add .gitignore"（我们已经有了）
   - **不要**勾选 "Choose a license"（可选）
4. 点击 "Create repository"

## 步骤2：推送代码到GitHub

在终端中运行以下命令（将 `yourusername` 替换为你的GitHub用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/yourusername/logistics-calculator.git

# 推送代码到GitHub
git push -u origin main
```

## 步骤3：启用GitHub Pages

1. 在GitHub仓库页面，点击 "Settings" 标签
2. 在左侧菜单中找到 "Pages"
3. 在 "Source" 部分：
   - 选择 "GitHub Actions"
4. 保存设置

## 步骤4：配置GitHub Actions权限

1. 在仓库的 "Settings" 页面
2. 在左侧菜单中找到 "Actions" > "General"
3. 在 "Workflow permissions" 部分：
   - 选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"
4. 点击 "Save"

## 步骤5：触发部署

1. 推送代码后，GitHub Actions会自动开始构建和部署
2. 在仓库页面点击 "Actions" 标签查看部署进度
3. 部署完成后，你的应用将在以下地址可用：
   `https://yourusername.github.io/logistics-calculator`

## 步骤6：更新README中的链接

部署成功后，记得更新 `README.md` 文件中的链接：

```markdown
访问地址：https://yourusername.github.io/logistics-calculator
```

## 故障排除

### 如果部署失败：
1. 检查 GitHub Actions 日志
2. 确保仓库是公开的
3. 确保 GitHub Actions 权限已正确设置
4. 检查 `next.config.js` 中的配置

### 如果页面无法访问：
1. 等待几分钟让GitHub Pages生效
2. 检查URL是否正确
3. 清除浏览器缓存

## 自定义域名（可选）

如果你想使用自定义域名：
1. 在仓库根目录创建 `CNAME` 文件
2. 在文件中写入你的域名
3. 在域名服务商处配置CNAME记录指向 `yourusername.github.io`

## 自动更新

每次你推送代码到 `main` 分支时，GitHub Actions会自动重新部署你的应用。