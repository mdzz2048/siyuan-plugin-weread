/* ------------------------ 检测 Cookie 是否可用 ------------------------ */

export async function checkCookie() {
    const { session } = globalThis.require("@electron/remote");

    let web = session;
    let cookie = await web.defaultSession.cookies.get({ url: 'https://weread.qq.com/' });
    cookie = parseCookies(cookie);
    let wr_vid = cookie.filter((item: { name: string; }) => item.name === 'wr_vid')[0];
    let wr_skey = cookie.filter((item: { name: string; }) => item.name === 'wr_skey')[0];
    return wr_vid && wr_skey ? getCookieString(cookie) : '';
}

export async function refreshCookie() {
    const { BrowserWindow} = globalThis.require("@electron/remote");
    
    // 刷新 Cookie 用的窗口默认隐藏，避免影响使用体验
    let window = new BrowserWindow({ show: false });
    await window.loadURL('https://weread.qq.com/');
    let cookie = await window.webContents.session.cookies.get({ url: 'https://weread.qq.com/' });
    cookie = parseCookies(cookie);
    let wr_vid = cookie.filter((item: { name: string; }) => item.name === 'wr_vid')[0];
    let wr_skey = cookie.filter((item: { name: string; }) => item.name === 'wr_skey')[0];

    if (wr_vid && wr_skey) {
        // 检测 Cookie 可用性
        let res = await fetch('https://i.weread.qq.com/user/notebooks', {
            headers: {
                'accessToken': wr_skey['value'], 
                'vid': wr_vid['value']
            }
        });
        if (res.ok) {
            return getCookieString(cookie);
        }
    }
    window.close();
    return '';
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