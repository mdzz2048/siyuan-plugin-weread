import { showMessage } from "siyuan";

export default class WereadLogin {
    private BroserWindow: any;
    private Window: any;

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
}