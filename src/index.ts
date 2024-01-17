import { Plugin, showMessage, Dialog, Menu, openTab, getFrontend } from "siyuan";
import { checkConfigCookie } from "./utils/cookie";
import { syncNotebooks } from "./syncNotebooks";
import { Setting, DialogSync, CardView } from "./components";
import { DEFAULT_CONFIG } from "./config/default";
import { WereadConfig } from "./types/config";
import { createApp } from "vue";
import { usePlugin } from "./utils/config";
import { createPinia } from "pinia";

const GLOBAL_CONFIG_NAME = "config";
const pinia = createPinia()

// todo: 重构菜单添加方式、

/**
 * 获取元素的 DOMRect 信息
 * @param element HTML 元素
 * @returns DOMRect
 */
function getDOMRect(element: HTMLElement): DOMRect {
    let rect = element.getBoundingClientRect();
    // 如果被隐藏，则使用更多按钮
    if (rect.width === 0) {
        rect = document.querySelector("#barMore").getBoundingClientRect();
    }
    if (rect.width === 0) {
        rect = document.querySelector("#barPlugins").getBoundingClientRect();
    }
    return rect;
}

export default class Weread extends Plugin {
    private config: WereadConfig;
    private isMobile: boolean;

    async onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        const topBarElement = this.addTopBar({
            icon: '<svg t="1686192115019" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="642" width="200" height="200"><path d="M204.078 0h615.845q202.07 0 202.07 202.07v615.845q0 202.07-202.07 202.07H204.077q-202.07 0-202.07-202.07V202.069Q2.008 0 204.078 0z" fill="#4496D3" p-id="643"></path><path d="M616.087 869.276a106.657 106.657 0 0 0-102.641 77.663 106.657 106.657 0 0 0-102.641-77.663H7.63A202.11 202.11 0 0 0 204.077 1024h615.846a202.11 202.11 0 0 0 196.447-154.724z m255.437-128.14c-44.654 44.172-99.026 54.934-157.816 35.217-19.356-6.506-35.258-8.032-52.204 3.212a73.326 73.326 0 0 1-11.324 3.775c15.46-26.865 4.015-43.65-9.036-62.685-28.993-42.285-23.09-96.738 11.405-136.051 56.22-64.251 166.731-64.251 223.112 0 40.96 46.662 40.076 112.64-4.137 156.531z" fill="#FFFFFF" p-id="644"></path><path d="M818.96 611.187a20.078 20.078 0 0 0-20.883 19.276 19.516 19.516 0 0 0 18.473 21.444 20.078 20.078 0 0 0 22.006-18.03 20.68 20.68 0 0 0-19.597-22.69z m-108.906 0a20.078 20.078 0 0 0-20.079 22.207 19.556 19.556 0 0 0 21.404 18.472 20.078 20.078 0 0 0 19.275-20.921 20.922 20.922 0 0 0-20.6-19.758z" fill="#4496D3" p-id="645"></path></svg>',
            title: 'weread',
            position: "left",
            callback: async () => {
                const rect = getDOMRect(topBarElement);
                this.addClickMenu(rect);
            }});

        // 添加右键菜单
        topBarElement.addEventListener('contextmenu', () => {
            const rect = getDOMRect(topBarElement);
            this.addContextMenu(rect);
        })

        // 绑定插件对象
        usePlugin(this)

        this.addTab({
            type: 'weread-import', 
            init() {
                this.element.innerHTML = '<div id="CardView" style="height: 100%"></div>'
            }
        })
    }

    async onLayoutReady() {
        this.config = await this.loadData(GLOBAL_CONFIG_NAME);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        showMessage("Goodbye SiYuan Plugin");
        console.log("onunload");
    }

    addClickMenu(rect?: DOMRect) {
        const menu = new Menu("wereadIconMenu");
        menu.addItem({
            icon: 'iconDownload',
            label: '单本导入',
            click: async () => {
                this.openImportPanel();
            }
        })
        menu.addItem({
            icon: 'iconDownload',
            label: '全部导入',
            click: async () => {
                // 同步所有笔记
                if (this.config.siyuan.notebook === "") {
                    showMessage('请先设置导入笔记本')
                    return;
                }                
                await checkConfigCookie(this.config);   // Cookie 可能过期，需要重新检查
                await syncNotebooks(this.config);
            }
        })
        if (this.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }

    addContextMenu(rect?: DOMRect) {
        const menu = new Menu("wereadIconContextMenu");
        menu.addItem({
            icon: 'iconSettings', 
            label: '设置', 
            click: async () => {
                this.openSetting();
            }
        });
        menu.addItem({
            icon: 'iconDownload', 
            label: '导入预览', 
            click: async () => {
                this.openImportTab();
            }
        });
        if (this.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }

    async openSetting() {
        await checkConfigCookie(this.config);   // Cookie 可能过期，需要重新检查

        new Dialog({
            title: "设置",
            content: `<div id="WereadSetting" class="fn__flex-column"></div>`,
            width: "720px",
            height: "640px", 
            destroyCallback: (options) => {
                console.log("destroyCallback", options);
                // You must destroy the component when the dialog is closed
                // pannel.$destroy();
            }
        });
        const app = createApp(Setting, {
            config: this.config
        })
        app.use(pinia)
        app.mount("#WereadSetting")
    }

    private async openImportPanel() {
        await checkConfigCookie(this.config);   // Cookie 可能过期，需要重新检查
        new Dialog({
            title: "导入",
            content: `<div id="WereadImport"></div>`,
            width: "420px",
            height: "640px",
            destroyCallback(options) {
                console.log("destroyCallback", options);
                // You must destroy the component when the dialog is closed
                // pannel.$destroy();
            },
        })
        const app = createApp(DialogSync)
        app.mount("#WereadImoprt")
    }

    private async openImportTab() {
        // await checkConfigCookie(this.config);   // Cookie 可能过期，需要重新检查
        const openedTab = await openTab({
            app: this.app, 
            custom: {
                title: '导入预览', 
                icon: 'iconDownload', 
                id: this.name + "weread-import",
            }, 
            position: 'right', 
            keepCursor: true
        })
        console.log(openedTab)
        const app = createApp(CardView)
        app.use(pinia)
        app.mount(openedTab.panelElement.firstElementChild)
    }

    public async resetConfig() {
        this.updateConfig(DEFAULT_CONFIG);
    }

    public async updateConfig(config: WereadConfig) {
        this.saveData(GLOBAL_CONFIG_NAME, config);
    }
}