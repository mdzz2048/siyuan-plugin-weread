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
    // todo: https://github.com/zhaohongxuan/obsidian-weread-plugin/blob/6764a114134d4e20e696d3ebef59f2989236a6b2/src/api.ts#L19
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