@echo off
echo ========================================
echo n8n企业微信机器人节点 - 发布脚本
echo ========================================

echo.
echo 发布前检查清单：
echo [ ] 已更新package.json个人信息
echo [ ] 已创建GitHub仓库并推送代码
echo [ ] 已注册并登录npm账户
echo [ ] 插件功能测试通过
echo.

set /p confirm=确认以上步骤已完成？(y/n):
if /i "%confirm%" neq "y" (
    echo 请完成上述步骤后再运行此脚本
    pause
    exit /b
)

echo.
echo 开始发布流程...

echo 1. 清理旧构建文件...
if exist dist rmdir /s /q dist

echo 2. 安装依赖...
npm install

echo 3. 运行代码检查...
call npm run lint
if %ERRORLEVEL% neq 0 (
    echo 代码检查失败，请修复后重试
    pause
    exit /b
)

echo 4. 构建项目...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo 构建失败，请检查错误信息
    pause
    exit /b
)

echo 5. 验证构建结果...
if not exist "dist\nodes\WechatBot\WechatBot.node.js" (
    echo 构建失败：找不到主要文件
    pause
    exit /b
)

echo 6. 检查npm登录状态...
npm whoami >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 请先登录npm: npm login
    pause
    exit /b
)

echo 7. 检查包名可用性...
npm view n8n-nodes-wechat-enterprise-bot >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo 警告：包名已存在，需要更换包名或更新版本号
    set /p continue=是否继续发布？(y/n):
    if /i "%continue%" neq "y" exit /b
)

echo 8. 预览将要发布的内容...
npm pack --dry-run

echo.
echo 即将发布到npm...
set /p publish=确认发布？(y/n):
if /i "%publish%" neq "y" (
    echo 取消发布
    pause
    exit /b
)

echo 9. 发布到npm...
npm publish

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo 🎉 发布成功！
    echo ========================================
    echo.
    echo 用户现在可以通过以下方式安装你的插件：
    echo.
    echo 方式1 - n8n界面安装：
    echo 1. 打开n8n
    echo 2. 进入 Settings ^> Community Nodes
    echo 3. 点击 Install
    echo 4. 输入: n8n-nodes-wechat-enterprise-bot
    echo 5. 点击 Install
    echo.
    echo 方式2 - npm安装：
    echo npm install n8n-nodes-wechat-enterprise-bot
    echo.
    echo 方式3 - Docker运行：
    echo docker run -it --rm \
    echo   -p 5678:5678 \
    echo   -e N8N_CUSTOM_EXTENSIONS="n8n-nodes-wechat-enterprise-bot" \
    echo   n8nio/n8n
    echo.
    echo npm包地址: https://www.npmjs.com/package/n8n-nodes-wechat-enterprise-bot
    echo GitHub地址: 记得更新你的GitHub仓库链接
    echo.
    echo 接下来建议：
    echo 1. 在n8n社区论坛发布你的节点
    echo 2. 更新GitHub仓库的README
    echo 3. 为节点添加更多功能和改进
    echo.
) else (
    echo 发布失败，请检查错误信息
)

echo ========================================
pause