import { showMessage, Plugin } from "siyuan";
import WereadLogin from "./login";

export default class Cookie extends Plugin {
    private session: any;

    constructor(options) {
        super(options)

        const { session } = globalThis.require("@electron/remote");

        this.session = session;
    }

    checkCookie() {
        this.session.defaultSession.cookies.get({ url: 'https://weread.qq.com/' })
            .then(async (cookies: any[]) => {
                cookies = this.parseCookies(cookies);

                if (cookies.length < 10) {
                    showMessage('获取微信读书 Cookie，请重新登录')

                    const wereadLogin = new WereadLogin(this);
                    wereadLogin.openWereadTab()
                } else {
                    let cookies_str: string;

                    cookies_str = this.getCookieString(cookies)
                    console.log(cookies_str)

                    // cookie 数据保存
                    let config = await this.loadData('config.json')
                    if (config === '') {
                        config = {'Cookie': cookies_str}
                    } else {
                        config.Cookie = cookies_str
                    }
                    this.saveData('config.json', config)
                }
            }).catch((error) => {
                console.log(error)
            })
    }
    
    refreshCookie() {
        // todo: https://github.com/zhaohongxuan/obsidian-weread-plugin/blob/6764a114134d4e20e696d3ebef59f2989236a6b2/src/api.ts#L19

    }

    parseCookies(cookieInput: any[]) {
        const cookieArr = cookieInput.map((pair) => {
            return {
                name: decodeURIComponent(pair.name),
                value: decodeURIComponent(pair.value)
            };
        });
        return cookieArr;
    };

    getCookieString(cookies: any[]) {
        return cookies
            .map((cookie) => {
                const key = cookie.name;
                const value = cookie.value;
                return key + "=" + value;
            })
            .join('; ')
    }
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