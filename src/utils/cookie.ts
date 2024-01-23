import { fetchSyncPost, IWebSocketData, showMessage } from "siyuan";
import { WereadConfig } from "../types/config";
import { getConfigBlob, updatePluginConfig } from "./config";

/* ------------------------ 检测 Cookie 是否可用 ------------------------ */

export async function checkCookie(cookie: string) {
    // todo: 检查 Cookie 还要根据弹窗里的登录状态来
    // 检测 Cookie 可用性
    let url = '/api/network/forwardProxy';
    let data = {
        "url": "https://weread.qq.com",
        "method": "GET",
        "timeout": 5000,
        "contentType": "application/json",
        "headers": [
          {
              'Cookie': cookie
          }
        ],
        "payload": {}
    }
    let response: IWebSocketData = await fetchSyncPost(url, data);
    let set_cookie = response.data['headers']['Set-Cookie'];
    let wr_skey = getCookieBykey(cookie, 'wr_skey');
    if (!set_cookie && !wr_skey) {
        return '';
    }
    if (!set_cookie && wr_skey) {
        // 没有返回 Set-Cookie，且 Cookie 存在 wr_skey，则 Cookie 有效
        return cookie;
    }
    for (let set_str of set_cookie) {
        // 更新 Cookie
        if (set_str.includes('wr_skey')) {
            let wr_skey = set_str.split(';')[0];
            let cookie_arr = cookie.split(';');
            let new_cookie = cookie_arr.map((str) => { 
                if(str.includes('wr_skey')) { 
                    str = wr_skey
                }
                return str;
            }).join('; ');
            return new_cookie;
        }
    }
}

export async function checkConfigCookie(config: WereadConfig) {
    showMessage('正在检查 Cookie 可用性，请稍等……');
    const cookie = await checkCookie(config.Cookie);
    const pluginName = "siyuan-plugin-weread";
    const storageName = "config";
    if (cookie === '') {
        showMessage('微信读书鉴权失败，请重新登录');
        config.Cookie = '';
        updatePluginConfig(pluginName, storageName, getConfigBlob(config));
        console.log('Cookie check failed!');
        return;
    }
    console.log('Cookie check success!');
    config.Cookie = cookie;
    config.weread.userName = getCookieBykey(cookie, 'wr_name');
    config.weread.userVid = getCookieBykey(cookie, 'wr_vid');
    updatePluginConfig(pluginName, storageName, getConfigBlob(config));
}

/* ------------------------ Cookie 处理 ------------------------ */

export function parseCookies(cookieInput: any[]) {
    const cookieArr = cookieInput.map((pair) => {
        return {
            name: decodeURIComponent(pair.name),
            value: decodeURIComponent(pair.value)
        };
    });
    return cookieArr;
};

export function getCookieString(cookies: any[]) {
    return cookies
        .map((cookie) => {
            const key = cookie.name;
            const value = cookie.value;
            return key + "=" + value;
        })
        .join('; ')
}

export function getCookieBykey(cookies: string, key: string) {
    let cookies_arr = cookies.split('; ');
    for (let i = 0; i < cookies_arr.length; i++) {
        let arr = cookies_arr[i].split('=');
        if (key === arr[0].trim()) {
            return arr[1];
        }
    }
    return '';
}