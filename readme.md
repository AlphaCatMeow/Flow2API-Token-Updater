# 使用说明

需要配合 [Flow2api](https://github.com/TheSmallHanCat/flow2api) 服务使用。

## 一、 Chrome 安装步骤

1.  **打开扩展程序页面**
    在 Chrome 浏览器地址栏输入并访问：
    `chrome://extensions/`

2.  **开启开发者模式**
    点击页面右上角的 **“开发者模式”** 开关。
    ![开启开发者模式](image.png)

3.  **载入插件**
    将解压后的插件目录直接 **拖拽** 到浏览器页面中，或点击“加载已解压的扩展程序”选择该目录。
    ![安装插件](image-1.png)

## 二、 Firefox 安装指南

1.  **准备 manifest 文件**
    由于 Firefox 和 Chrome 的配置文件格式略有不同，请先将项目根目录下的 `manifest.firefox.json` 重命名为 `manifest.json`（建议先备份原有的 `manifest.json`）。

2.  **打开调试页面**
    在 Firefox 浏览器地址栏输入并访问：
    `about:debugging#/runtime/this-firefox`

3.  **载入临时扩展**
    点击 **“临时载入附加组件...”** (Load Temporary Add-on...)，选择项目目录下的 `manifest.json` 文件。

## 三、 油猴脚本 (Tampermonkey) 安装

如果您不想安装浏览器扩展，可以使用油猴脚本（功能略受限，需要打开 Google Labs 页面才能触发更新）。

1.  **安装 Tampermonkey 插件**
    请确保您的浏览器已安装 Tampermonkey (油猴) 插件。

2.  **安装脚本**
    - 打开 Tampermonkey 管理面板。
    - 点击 "添加新脚本" (+)。
    - 将项目中的 `flow2api_updater.user.js` 文件内容复制并粘贴到编辑器中。
    - 点击 "文件" -> "保存"。

3.  **使用方法**
    - 访问 `https://labs.google/`。
    - 脚本会自动检测并在菜单中提供配置选项。
    - 点击油猴插件图标，在 "Flow2API Token Updater" 菜单下点击 "⚙️ 设置配置"。
    - 输入 API URL 和 Token。
    - 脚本会在页面加载时自动尝试提取并同步 Token。

## 四、 配置指南 (扩展程序版)

1.  **设置接口与 Token**
    点击插件图标，在弹出窗口中配置 **连接接口 (API URL)** 和 **连接 Token**，时间默认60分钟，一般情况下建议6小时左右即可。
    ![配置界面](image-2.png)

2.  **获取配置信息**
    如果您不知道如何填写，请登录 **Flow2api 后台** 查看相关的接口地址和访问密钥。
    ![后台查看配置](image-3.png)
