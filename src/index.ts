import { Plugin, showMessage, confirm, Dialog, Menu, isMobile, openTab, adaptHotkey } from "siyuan";

import "./index.scss";
import Settings from "./setting/Setting.svelte";
import deepmerge from "deepmerge";

import WereadLogin from "./weread/login";
import Cookie from "./weread/cookie";
import { DEFAULT_CONFIG } from "./setting/config/default";

export default class Weread extends Plugin {
    static readonly GLOBAL_CONFIG_NAME = "config";
    
    protected config: any;

    constructor(options: any) {
        super(options);
    }

    async onload() {
        
        const topBarElement = this.addTopBar({
            // icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="m40.5 5.5h-33a2 2 0 0 0 -2 2v33a2 2 0 0 0 2 2h33a2 2 0 0 0 2-2v-33a2 2 0 0 0 -2-2z"/><path d="m5.5 36.526h15.5c1.7029 0 2.3445 1.4975 3 2.55.6449-1.0244 1.3027-2.55 3-2.55h15.5"/><path d="m39.654 28.3239c0 2.6134-3.0238 5.0115-6.4091 5.0115a5.0935 5.0935 0 0 1 -2.3859-.3718l-1.7487.8227.1638-1.7436c-1.45-.7249-1.9192-2.7859-1.8793-3.7187.1118-2.611 2.7444-4.7319 6.13-4.7319s6.13 2.1186 6.13 4.7319z"/></g><circle cx="32.3034" cy="27.575" r=".75"/><circle cx="35.5207" cy="27.575" r=".75"/></svg>',
            icon: '<svg t="1686192115019" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="642" width="200" height="200"><path d="M204.078 0h615.845q202.07 0 202.07 202.07v615.845q0 202.07-202.07 202.07H204.077q-202.07 0-202.07-202.07V202.069Q2.008 0 204.078 0z" fill="#4496D3" p-id="643"></path><path d="M616.087 869.276a106.657 106.657 0 0 0-102.641 77.663 106.657 106.657 0 0 0-102.641-77.663H7.63A202.11 202.11 0 0 0 204.077 1024h615.846a202.11 202.11 0 0 0 196.447-154.724z m255.437-128.14c-44.654 44.172-99.026 54.934-157.816 35.217-19.356-6.506-35.258-8.032-52.204 3.212a73.326 73.326 0 0 1-11.324 3.775c15.46-26.865 4.015-43.65-9.036-62.685-28.993-42.285-23.09-96.738 11.405-136.051 56.22-64.251 166.731-64.251 223.112 0 40.96 46.662 40.076 112.64-4.137 156.531z" fill="#FFFFFF" p-id="644"></path><path d="M818.96 611.187a20.078 20.078 0 0 0-20.883 19.276 19.516 19.516 0 0 0 18.473 21.444 20.078 20.078 0 0 0 22.006-18.03 20.68 20.68 0 0 0-19.597-22.69z m-108.906 0a20.078 20.078 0 0 0-20.079 22.207 19.556 19.556 0 0 0 21.404 18.472 20.078 20.078 0 0 0 19.275-20.921 20.922 20.922 0 0 0-20.6-19.758z" fill="#4496D3" p-id="645"></path></svg>',
            title: 'weread',
            position: "left",
            callback: async () => {
                // const weread = new WereadLogin(this);
                // weread.openWereadTab();

                // const cookie = new Cookie(this);
                // cookie.checkCookie()

                // const api = new WereadApi(this)
                // const book_id = '';
                // let response = await api.getNotebooks();
                // let response = await api.getRecentBooks();
                // let response = await api.getBookSync();
                // let response = await api.getBook(book_id);
                // let response = await api.getBookChapterInfos(book_id);
                // let response = await api.getNotebookHighlights(book_id);
                // let response = await api.getNotebookReviews(book_id);
                // console.log(response)

                console.log('books')
                }
            });

        // 添加右键菜单
        topBarElement.addEventListener('contextmenu', () => {
            let rect = topBarElement.getBoundingClientRect();
            // 如果获取不到宽度，则使用更多按钮的宽度
            if (rect.width === 0) {
                rect = document.querySelector("#barMore").getBoundingClientRect();
            }

            // 添加设置按钮
            const menu = new Menu('WereadContextMenu');
            menu.addItem({
                icon: 'iconSettings', 
                label: '设置', 
                click: () => {
                    this.openSetting();
                }
            });

            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true
            })
        })

        // 加载插件配置
        this.loadData(Weread.GLOBAL_CONFIG_NAME)
            .then(config => {
                this.config = merge(DEFAULT_CONFIG, config || {})
                console.log(this.config)
            })
            .catch(error => console.log(error))
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        showMessage("Goodbye SiYuan Plugin");
        console.log("onunload");
    }

    openSetting(): void {
        let dialog = new Dialog({
            title: "WereadSetting",
            content: `<div id="WereadSetting"></div>`,
            width: "720px",
            height: "640px", 
            destroyCallback: (options) => {
                console.log("destroyCallback", options);
                //You must destroy the component when the dialog is closed
                pannel.$destroy();
            }
        });
        let pannel = new Settings({
            target: dialog.element.querySelector("#WereadSetting"),
            props: {
                config: this.config,
                plugin: this,
            }
        });
    }

    public async resetConfig(): Promise<void> {
        return this.updateConfig(DEFAULT_CONFIG);
    }

    public async updateConfig(config: Object): Promise<void> {
        if (config && config !== this.config) {
            this.config = config;
        }
        return this.saveData(Weread.GLOBAL_CONFIG_NAME, this.config);
    }
}

export function merge(...args: any[]): Object {
    return deepmerge.all(args);
}