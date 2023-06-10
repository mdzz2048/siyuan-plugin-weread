import { showMessage, Plugin } from "siyuan";

export default class WereadLogin extends Plugin {
    private BroserWindow: any;
    private Window: any;

    constructor(options) {
        super(options)

        const { BrowserWindow} = globalThis.require("@electron/remote");
        
        this.BroserWindow = BrowserWindow;
        this.Window = new this.BroserWindow({ 
            width:800, 
            height:600 
        });
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