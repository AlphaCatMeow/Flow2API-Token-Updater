// ==UserScript==
// @name         Flow2API Token Updater
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  自动提取Google Labs cookie并更新到Flow2API系统
// @author       You
// @match        https://labs.google/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_cookie
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // 配置键名
    const CONFIG_KEYS = {
        API_URL: 'flow2api_api_url',
        API_TOKEN: 'flow2api_api_token',
        LAST_UPDATE: 'flow2api_last_update',
        AUTO_UPDATE: 'flow2api_auto_update'
    };

    // 注册菜单命令
    GM_registerMenuCommand('⚙️ 设置配置', configureSettings);
    GM_registerMenuCommand('🔄 立即更新Token', () => extractAndSendToken(true));
    GM_registerMenuCommand('📝 查看日志', showLogs);

    // 简单的日志系统
    const logs = [];
    function log(msg, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const entry = `[${time}] [${type.toUpperCase()}] ${msg}`;
        console.log(`[Flow2API] ${msg}`);
        logs.unshift(entry);
        if (logs.length > 50) logs.pop();
    }

    function showLogs() {
        alert(logs.join('\n'));
    }

    // 设置配置
    function configureSettings() {
        const currentUrl = GM_getValue(CONFIG_KEYS.API_URL, '');
        const currentToken = GM_getValue(CONFIG_KEYS.API_TOKEN, '');

        const apiUrl = prompt('请输入 Flow2API 接口地址 (API URL):', currentUrl);
        if (apiUrl === null) return; // 用户取消

        const apiToken = prompt('请输入 Flow2API 连接 Token (Connection Token):', currentToken);
        if (apiToken === null) return; // 用户取消

        if (apiUrl && apiToken) {
            GM_setValue(CONFIG_KEYS.API_URL, apiUrl);
            GM_setValue(CONFIG_KEYS.API_TOKEN, apiToken);
            GM_setValue(CONFIG_KEYS.AUTO_UPDATE, true);
            alert('✅ 配置已保存！');
            extractAndSendToken(true);
        } else {
            alert('❌ 配置无效，请确保两项都已填写。');
        }
    }

    // 获取Cookie
    function getSessionToken(callback) {
        // 尝试使用 GM_cookie (支持 HttpOnly)
        if (typeof GM_cookie !== 'undefined' && GM_cookie.list) {
            GM_cookie.list({ name: '__Secure-next-auth.session-token' }, (cookies, error) => {
                if (!error && cookies && cookies.length > 0) {
                    log('通过 GM_cookie 获取到 Token');
                    callback(cookies[0].value);
                } else {
                    log('GM_cookie 未找到 Token，尝试 document.cookie');
                    callback(getFromDocument());
                }
            });
        } else {
            // Fallback to document.cookie
            callback(getFromDocument());
        }
    }

    function getFromDocument() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === '__Secure-next-auth.session-token') {
                return value;
            }
        }
        return null;
    }

    // 提取并发送Token
    function extractAndSendToken(force = false) {
        const apiUrl = GM_getValue(CONFIG_KEYS.API_URL);
        const apiToken = GM_getValue(CONFIG_KEYS.API_TOKEN);

        if (!apiUrl || !apiToken) {
            if (force) {
                alert('⚠️ 请先配置 API URL 和 Token (点击插件菜单进行设置)');
                configureSettings();
            }
            return;
        }

        getSessionToken((sessionToken) => {
            if (!sessionToken) {
                log('未找到 session-token，请确保已登录 (如果是 HttpOnly Cookie，请确保油猴脚本拥有 Cookie 权限)', 'error');
                if (force) alert('❌ 未找到 session-token。注意：如果 Token 是 HttpOnly 的，可能需要 Tampermonkey Beta 版本或在设置中开启 "高级" 模式并允许 Cookie 访问。');
                return;
            }

            // 检查是否需要更新 (例如: 每小时更新一次，或者强制更新)
            const lastUpdate = GM_getValue(CONFIG_KEYS.LAST_UPDATE, 0);
            const now = Date.now();
            // 自动模式下，如果距离上次更新不足1小时，则跳过（除非强制）
            if (!force && (now - lastUpdate < 3600000)) {
                log('Token 最近已更新，跳过本次自动更新');
                return;
            }

            log('正在发送 Token 到服务器...');

            GM_xmlhttpRequest({
                method: 'POST',
                url: apiUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                data: JSON.stringify({
                    session_token: sessionToken
                }),
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            const result = JSON.parse(response.responseText);
                            log(`Token同步成功: ${result.message || 'OK'}`, 'success');
                            GM_setValue(CONFIG_KEYS.LAST_UPDATE, now);
                            
                            if (force || result.action === 'updated' || result.action === 'added') {
                                GM_notification({
                                    title: 'Flow2API Token Updater',
                                    text: `✅ Token 同步成功\n${result.message || ''}`,
                                    timeout: 3000
                                });
                            }
                        } catch (e) {
                            log('解析响应失败', 'error');
                        }
                    } else {
                        log(`服务器返回错误: ${response.status} ${response.statusText}`, 'error');
                        if (force) alert(`❌ 同步失败: ${response.status}\n${response.responseText}`);
                    }
                },
                onerror: function(error) {
                    log(`请求失败: ${error}`, 'error');
                    if (force) alert('❌ 网络请求失败，请检查 API 地址是否可访问');
                }
            });
        });
    }

    // 页面加载后自动尝试
    window.addEventListener('load', () => {
        // 延迟一点执行，确保cookie已就绪
        setTimeout(() => {
            extractAndSendToken(false);
        }, 2000);
    });

})();
