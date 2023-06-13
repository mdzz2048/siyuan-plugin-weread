import { showMessage } from "siyuan";
import { parseCookies, getCookieString } from "../utils/cookie";

export default class WereadLogin {
    public BroserWindow: any;
    public Window: any;

    constructor() {
        const { BrowserWindow} = globalThis.require("@electron/remote");
        
        this.BroserWindow = BrowserWindow;
        this.Window = new this.BroserWindow({ 
            width:800, 
            height:600 
        });

        this.Window.once('ready-to-show', () => {
            this.Window.show()
        })
    }

    openWereadTab() {
        try {
            this.Window.loadURL('https://weread.qq.com/')
        } catch {
            showMessage('加载微信读书界面失败')
        }
    }

    closeWereadTab() {
        this.Window.close()
    }

    async getWereadCookie() {
        let cookie = await this.Window.webContents.session.cookies.get({ url: 'https://weread.qq.com/' });
        cookie = parseCookies(cookie);
        let wr_vid = cookie.filter((item: { name: string; }) => item.name === 'wr_vid')[0];
        let wr_skey = cookie.filter((item: { name: string; }) => item.name === 'wr_skey')[0];
        return wr_vid && wr_skey ? getCookieString(cookie) : '';
    }
}