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
                <Input type="select" :options="notebookOption" 
                    setting-key="importNotebook" :setting-value="config.siyuan.notebook" 
                    @changed="(_, value) => config.siyuan.notebook = value"
                />
            </Item>
            <Item :title="i18n.setting.savePathTitle" :text="i18n.setting.savePathDesc">
                <Input type="text"
                    setting-key="savePath" :setting-value="config.siyuan.savePath"
                    @changed="(_, value) => config.siyuan.savePath = value"
                />
            </Item>
            <Item :title="i18n.setting.saveTypeTitle" :text="i18n.setting.saveTypeDesc">
                <Input type="select" :options="saveTypeOption" 
                    setting-key="saveType" :setting-value="config.siyuan.importType"
                    @changed="(_, value) => config.siyuan.importType = value"
                />
            </Item>
            <Item :title="i18n.setting.saveDocTitle" :text="i18n.setting.saveDocDesc">
                <Input type="select" :options="saveDocOption"
                    setting-key="docName" :setting-value="config.siyuan.docName"
                    @changed="(_, value) => config.siyuan.docName = value"
                />
            </Item>
        </Panel>
        <Panel :name="panels[1].name" :display="panels[1].key === focusPanel">
            <Item title="文档模板" :text="metadataTips">
                <Input type="textarea"
                    setting-key="docTemplate" :setting-value="config.siyuan.docTemplate"
                    @changed="(_, value) => config.siyuan.docTemplate = value"
                />
            </Item>
            <Item title="标注模板" :text="highlightTips">
                <Input type="textarea"
                    setting-key="highlightTemplate" :setting-value="config.siyuan.highlightTemplate"
                    @changed="(_, value) => config.siyuan.highlightTemplate = value"
                />
            </Item>
            <Item title="笔记模板" :text="reviewTips">
                <Input type="textarea"
                    setting-key="noteTemplate" :setting-value="config.siyuan.noteTemplate"
                    @changed="(_, value) => config.siyuan.noteTemplate = value"
                />
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
import { createApp, onMounted,  ref, watch } from 'vue';
import { useSiyuanNotebookStore } from '../store';
import { Dialog } from 'siyuan';
import { ElLoading } from 'element-plus';
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
const loadingInstance = ElLoading.service({
    target: "#WereadSetting",
})

const config = ref(props.config)
const isLogin = ref(false)
const focusPanel = ref(panels[0].key)
const notebookOption = ref()

const metadataTips = `<ul>
    <li>{{title}} - 文档标题</li>
    <li>{{author}} - 作者</li>
    <li>{{cover}} - 封面</li>
    <li>{{intro}} - 书籍简介</li>
    <li>{{bookId}} - 微信图书ID</li>
    <li>{{publishTime}} - 出版时间</li>
    <li>{{reviewCount}} - 笔记数量</li>
    <li>{{noteCount}} - 划线数量</li>
    <li>{{isbn}} - ISBN</li>
    <li>{{category}} - 书籍分类</li>
    <li>{{publisher}} - 出版社</li>
    <li>{{totalWords}} - 书籍总字数</li>
</ul>`
const highlightTips = `<ul>
    <li>{{chapterUid}} - 章节 ID</li>
    <li>{{chapterTitle}} - 章节标题</li>
    <li>{{createTime}} - 创建时间</li>
    <li>{{range}} - 划线范围</li>
    <li>{{markText}} - 划线文本</li>
    <li>{{markRowText}} - 划线文本原始内容</li>
</ul>`
const reviewTips = `<ul>
    <li>{{chapterUid}} - 章节 ID</li>
    <li>{{chapterTitle}} - 章节标题</li>
    <li>{{createTime}} -创建时间</li>
    <li>{{range}} - 划线范围</li>
    <li>{{abstract}} - 摘录内容</li>
    <li>{{content}} - 笔记内容</li>
</ul>`

onMounted(async () => {
    isLogin.value = await getLoginInfo()
    notebookOption.value = await notebookStore.getNotebooksOption()
    loadingInstance.close()
})

watch(config, () => {
    plugin.updateConfig(config.value)
})

function panelChanged(panel: ITab) {
    focusPanel.value = panel.key
}

// function updatePath(old_path: string, new_path: string) {
//     // todo: 使用 flushTransaction 判断是否写入
//     // [Add internal kernel API `/api/sqlite/flushTransaction` · Issue #10005 · siyuan-note/siyuan](https://github.com/siyuan-note/siyuan/issues/10005)
//     const toNotebook = props.config.siyuan.notebook
//     console.log(toNotebook, old_path, new_path)
// }

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
            config.value.Cookie = ""
            console.log('正在关闭')
        })
    } else {
        config.value.Cookie = ""
    }
    // 更新登录状态
    isLogin.value = false
}
</script>