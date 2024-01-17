<template>
    <Panels :panels="panels" @panel-changed="panelChanged">
        <Panel :name="panels[0].name" :display="panels[0].key === focusPanel">
            <template v-if="!isLogin">
                <Item :title="i18n.setting.logoutTitle" text="">
                    <Input type="button" 
                        setting-key="wereadLogin" :setting-value="i18n.setting.loginButton" 
                        @clicked="async () => loginWeread()"
                    />
                </Item>
            </template>
            <template v-else>
                <Item :title="i18n.setting.loginTitle" 
                    :text="i18n.setting.userName + ': ' + props.config.weread.userName"
                >
                    <Input type="button"
                        setting-key="wereadLogout" :setting-value="i18n.setting.logoutButton"
                        @clicked="async () => logoutWerad()"
                    />
                </Item>
            </template>
            <Item :title="i18n.setting.saveNotebookTitle" :text="i18n.setting.saveNotebookDesc">
                <Input 
                    type="select" 
                    :options="notebookOption" 
                    setting-key="importNotebook" 
                    :setting-value="config.siyuan.notebook" 
                />
            </Item>
            <Item :title="i18n.setting.savePathTitle" :text="i18n.setting.savePathDesc">
                <Input type="text"
                    setting-key="savePath" :setting-value="config.siyuan.savePath"
                />
            </Item>
            <Item :title="i18n.setting.saveTypeTitle" :text="i18n.setting.saveTypeDesc">
                <Input type="select" :options="saveTypeOption" 
                    setting-key="saveType" :setting-value="config.siyuan.importType"
                />
            </Item>
            <Item :title="i18n.setting.saveDocTitle" :text="i18n.setting.saveDocDesc">
                <Input type="select" :options="saveDocOption"
                    setting-key="docName" :setting-value="config.siyuan.docName"
                />
            </Item>
        </Panel>
        <Panel :name="panels[1].name" :display="panels[1].key === focusPanel">
            <Item title="文档模板" text="文档">

            </Item>
            <Item title="笔记模板" text="笔记模板">

            </Item>
            <Item title="想法模板" text="想法模板">

            </Item>
        </Panel>
    </Panels>
</template>

<script setup lang="ts">
import Panels from './siyuan/siyuan/setting/Panels.vue';
import Panel from './siyuan/siyuan/setting/Panel.vue';
import Item from './siyuan/siyuan/setting/Item.vue';
import Input from './siyuan/siyuan/setting/Input.vue';
import type { IOption, ITab } from './siyuan/siyuan/setting';
import { createApp, onMounted,  ref } from 'vue';
import { useSiyuanNotebookStore } from '../store';
import { Dialog } from 'siyuan';

import { usePlugin } from "../utils/config"
import { checkCookie } from '../utils/cookie';
import { WereadConfig } from '../types/config';
import { isElectron } from '../utils/front-end';
import WereadLogin from '../utils/login';
import InputCookie from './dialog/InputCookie.vue';

const panels: ITab[] = [
    { key: "常规配置", text: "常规配置", "name": "common" },
    { key: "模板配置", text: "模板配置", "name": "template" },
]
const saveTypeOption: IOption[] = [
    { key: "1", text: "按章节导入" }, 
    { key: "2", text: "按类型导入" }, 
]
const saveDocOption: IOption[] = [
    { key: "1", text: "书名" },
    { key: "2", text: "书名-作者" },
    { key: "3", text: "书名-ID" },
]
const plugin = usePlugin()
const i18n = plugin.i18n
const notebookStore = useSiyuanNotebookStore()
const props = defineProps<{
    config: WereadConfig,
}>()

const config = ref(props.config)
const isLogin = ref(false)
const focusPanel = ref(panels[0].key)
const notebookOption = ref()

onMounted(async () => {
    isLogin.value = await getLoginInfo()
    notebookOption.value = await notebookStore.getNotebooksOption()
})

function panelChanged(panel: ITab) {
    focusPanel.value = panel.key
}

function updatePath(old_path: string, new_path: string) {
    // todo: 使用 flushTransaction 判断是否写入
    // [Add internal kernel API `/api/sqlite/flushTransaction` · Issue #10005 · siyuan-note/siyuan](https://github.com/siyuan-note/siyuan/issues/10005)
    const toNotebook = props.config.siyuan.notebook
    console.log(toNotebook, old_path, new_path)

}

async function getLoginInfo() {
    const cookie = await checkCookie(config.value.Cookie)
    return cookie === '' ? false : true;
}

async function loginWeread() {
    if (isElectron) {
        const weread = new WereadLogin()
        weread.openWereadTab()
        weread.Window.on("close", async (event) => {
            // 拦截默认关闭设置，保存配置
            event.preventDefault();
            const cookie = await weread.getWereadCookie();
            config.value.Cookie = cookie;
            plugin.updateConfig(config.value)
            // 更新登录状态
            isLogin.value = await getLoginInfo();
            console.log('正在登录');
        })
    } else {
        const dialog = new Dialog({
            title: "登录微信读书",
            content: `<div id="WereadInputCookie"></div>`,
            width: "520px",
            height: "auto",
            destroyCallback: async (options) => {
                console.log("正在登录", options)
            }
        })
        createApp(InputCookie, {
            dialog: dialog
        }).mount("WereadInputCookie")
    }
}

async function logoutWerad() {
    if (isElectron()) {
        const login = new WereadLogin();
        login.openWereadTab();
        login.Window.on('close', async (event: Event) => {
            // REF: https://www.electronjs.org/docs/latest/api/web-contents/#event-will-prevent-unload
            // 拦截默认关闭设置，保存配置
            event.preventDefault()
            let cookie = await login.getWereadCookie()
            config.value.Cookie = cookie
            plugin.updateConfig(config.value)
            console.log('正在关闭')
        })
    } else {
        config.value.Cookie = ""
        plugin.updateConfig(config.value)
    }
    // 更新登录状态
    isLogin.value = await getLoginInfo()
}

() => {
    getLoginInfo()
    updatePath("", "")
}
</script>../store