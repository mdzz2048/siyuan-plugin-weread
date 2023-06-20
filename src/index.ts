import { Plugin, showMessage, Dialog, Menu, isMobile, openTab, adaptHotkey } from "siyuan";

import "./index.scss";
import Settings from "./setting/Setting.svelte";
import deepmerge from "deepmerge";

import { checkCookie, refreshCookie, getCookieBykey } from "./utils/cookie";
import { syncNotebook, syncNotebooks } from "./weread/syncNotebooks";
import { DEFAULT_CONFIG } from "./config/default";
import CardView from "./cardview/CardView.svelte";

export default class Weread extends Plugin {
    static readonly GLOBAL_CONFIG_NAME = "config";
    
    protected config: any;

    constructor(options: any) {
        super(options);
    }

    async onload() {

        const topBarElement = this.addTopBar({
            icon: '<svg t="1686192115019" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="642" width="200" height="200"><path d="M204.078 0h615.845q202.07 0 202.07 202.07v615.845q0 202.07-202.07 202.07H204.077q-202.07 0-202.07-202.07V202.069Q2.008 0 204.078 0z" fill="#4496D3" p-id="643"></path><path d="M616.087 869.276a106.657 106.657 0 0 0-102.641 77.663 106.657 106.657 0 0 0-102.641-77.663H7.63A202.11 202.11 0 0 0 204.077 1024h615.846a202.11 202.11 0 0 0 196.447-154.724z m255.437-128.14c-44.654 44.172-99.026 54.934-157.816 35.217-19.356-6.506-35.258-8.032-52.204 3.212a73.326 73.326 0 0 1-11.324 3.775c15.46-26.865 4.015-43.65-9.036-62.685-28.993-42.285-23.09-96.738 11.405-136.051 56.22-64.251 166.731-64.251 223.112 0 40.96 46.662 40.076 112.64-4.137 156.531z" fill="#FFFFFF" p-id="644"></path><path d="M818.96 611.187a20.078 20.078 0 0 0-20.883 19.276 19.516 19.516 0 0 0 18.473 21.444 20.078 20.078 0 0 0 22.006-18.03 20.68 20.68 0 0 0-19.597-22.69z m-108.906 0a20.078 20.078 0 0 0-20.079 22.207 19.556 19.556 0 0 0 21.404 18.472 20.078 20.078 0 0 0 19.275-20.921 20.922 20.922 0 0 0-20.6-19.758z" fill="#4496D3" p-id="645"></path></svg>',
            title: 'weread',
            position: "left",
            callback: async () => {
                // 点击图标时 Cookie 可能过期，需要重新检查
                showMessage('正在检查 Cookie 可用性，请稍等……');
                await this.checkCookieConifg(this.config);

                if (this.config.siyuan.notebook !== '') {
                    // 同步所有笔记
                    await syncNotebooks(this.config);
                } else {
                    showMessage('请先设置导入笔记本')
                }
            }});

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
                click: async () => {
                    this.openSetting();
                }
            });
            menu.addItem({
                icon: 'iconDownload', 
                label: '导入预览', 
                click: async () => {
                    const config = this.config;
                    const tab = this.addTab({
                        type: 'weread-tag', 
                        init() {
                            this.element.innerHTML = '<div id="CardView"></div>';
                            new CardView({
                                target: this.element.querySelector('#CardView'),
                                props: {
                                    config: config, 
                                    plugin: this, 
                                }
                            })
                        }
                    })

                    openTab({
                        custom: {
                            title: '导入预览', 
                            icon: 'iconDownload', 
                            fn: tab
                        }, 
                        position: 'right', 
                        keepCursor: true
                    })
                }
            })

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

    async openSetting() {
        // 打开设置时 Cookie 可能过期，需要重新检查
        showMessage('正在检查 Cookie 可用性，请稍等……');
        await this.checkCookieConifg(this.config);

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

    async cardView() {
        await this.checkCookieConifg(this.config);
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

    public async checkCookieConifg(config: any) {
        let cookie = await checkCookie();
        if (cookie === '') {
            cookie = await refreshCookie();
            if (cookie === '') {
                showMessage('微信读书鉴权失败，请重新登录');
                config.Cookie = '';
                this.updateConfig(config);
                console.log('Cookie check failed!');
                return;
            }
        }
        console.log('Cookie check success!');
        config.Cookie = cookie;
        config.weread.userName = getCookieBykey(cookie, 'wr_name');
        config.weread.userVid = getCookieBykey(cookie, 'wr_vid');
        await this.updateConfig(config);
    }
}

export function merge(...args: any[]): Object {
    return deepmerge.all(args);
}