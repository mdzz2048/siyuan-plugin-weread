<!--
REF: https://github.com/siyuan-note/plugin-sample-vite-svelte/blob/main/src/libs/setting-panel.svelte
-->

<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    import { lsNotebooks } from "../api";
    import { ItemType, type IOptions } from "./item/item";
    import { ITab } from "./tab";
    
    import Panel from "./panel/Panel.svelte";
    import Panels from "./panel/Panels.svelte";
    import Group from "./item/Group.svelte";
    import MiniItem from "./item/MiniItem.svelte";
    import Item from "./item/Item.svelte";
    import Input from "./item/Input.svelte";
    import InputCookie from "./InputCookie.svelte";
    
    import Weread from "..";
    import WereadLogin from "../weread/login";
    import { checkCookie } from "../utils/cookie";
    import { isElectron } from "../utils/front-end";
    import { Dialog, showMessage } from "siyuan";

    export let config: any;
    export let plugin: Weread;

    let block = false;
    let normal = false;

    let panel_focus_key = 1;
    const panels: ITab[] = [
        {
            key: 1,
            text: "常规设置",
            name: "常规设置",
            icon: "#iconSettings",
        }
    ];
    const metadata_str = `<p>文档模板</p>
        <ul>
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
        </ul>`
    const highlight_str = `<p>标注模板</p>
        <ul>
            <li>{{chapterUid}} - 章节 ID</li>
            <li>{{chapterTitle}} - 章节标题</li>
            <li>{{createTime}} - 创建时间</li>
            <li>{{range}} - 划线范围</li>
            <li>{{markText}} - 划线文本</li>
        </ul>`
    const review_str = `<p>笔记模板</p>
        <ul>
            <li>{{chapterUid}} - 章节 ID</li>
            <li>{{chapterTitle}} - 章节标题</li>
            <li>{{createTime}} -创建时间</li>
            <li>{{range}} - 划线范围</li>
            <li>{{abstract}} - 摘录内容</li>
            <li>{{content}} - 笔记内容</li>
        </ul>`

    let options_notebook: IOptions = [];
    let login = false;
    
    function updated() {
        plugin.updateConfig(config);
    }
    
    async function loginWeread() {
        if (isElectron()) {
            const weread = new WereadLogin();
            weread.openWereadTab();
            weread.Window.on('close', async (event) => {
                // 拦截默认关闭设置，保存配置
                event.preventDefault();
                let cookie = await weread.getWereadCookie();
                config.Cookie = cookie;
                updated();
                // 更新登录状态
                login = await isLogin();
                console.log('正在登录');
            })
        } else {
            let dialog = new Dialog({
                title: '微信读书登录', 
                content: `<div id="WereadInputCookie"></div>`, 
                width: "520px",
                height: "auto", 
                destroyCallback: async (options) => {
                    console.log("正在登录", options);
                    // 更新登录状态
                    login = await isLogin();
                    //You must destroy the component when the dialog is closed
                    pannel.$destroy();
                }
            });
            let pannel = new InputCookie({
                target: dialog.element.querySelector("#WereadInputCookie"),
                props: {
                    config: config,
                    dialog: dialog
                }
            });
        }
    }

    async function logoutWeread() {
        if (isElectron()) {
            const login = new WereadLogin();
            login.openWereadTab();
            login.Window.on('close', async (event) => {
                // REF: https://www.electronjs.org/docs/latest/api/web-contents/#event-will-prevent-unload
                // 拦截默认关闭设置，保存配置
                event.preventDefault();
                let cookie = await login.getWereadCookie();
                config.Cookie = cookie;
                updated();
                console.log('正在关闭');
            })
        } else {
            config.Cookie = '';
            updated();
        }
        // 更新登录状态
        login = await isLogin();
    }

    // function resetOptions() {
    //     plugin.siyuan.confirm(
    //             i18n.settings.generalSettings.reset.title, // 标题
    //             i18n.settings.generalSettings.reset.description, // 文本
    //             async () => {
    //                     await plugin.resetConfig(); // 重置配置
    //                     globalThis.location.reload(); // 刷新页面
    //                 }, // 确认按钮回调
    //             );
    // }

    async function get_notebook() {
        let response = await lsNotebooks();

        for (var i = 0; i < response.notebooks.length; i++) {
            let id = response.notebooks[i].id;
            let name = response.notebooks[i].name;
            options_notebook.push({ key: id, text: name });
        }

        return options_notebook;
    }

    async function isLogin() {
        let cookie = await checkCookie(config.Cookie);
        return cookie === '' ? false : true;
    }

    onMount(async () => {
        login = await isLogin();
        options_notebook = await get_notebook();

        console.log("Setting panel opened");
    });
    onDestroy(() => {
        console.log("Setting panel closed");
    });
</script>

<!--
    You can use this template to quickly create a setting panel,
    with the same UI style in SiYuan
-->
<Panels
    {panels}
    focus={panel_focus_key}
    let:focus={panel_focus}
>
    <!-- 常规设置面板 -->
    <Panel display={panels[0].key === panel_focus}>
        <!-- 登录、注销 -->
        {#if login}
            <Item
                {block}
                title="微信读书已登录"
                text="用户名：{config.weread.userName}"
            >
                <Input
                    slot="input"
                    {block}
                    {normal}
                    type={ItemType.button}
                    settingKey="login"
                    settingValue="退出登录"
                    on:clicked={ async () => { await logoutWeread() }}
                />
            </Item>
        {:else}
            <Item
                {block}
                title="微信读书未登录"
                text="用户名："
            >
                <Input
                    slot="input"
                    {block}
                    {normal}
                    type={ItemType.button}
                    settingKey="login"
                    settingValue="登录"
                    on:clicked={ async () => { await loginWeread() }}
                />
            </Item>
        {/if}

        <!-- 笔记保存位置 -->
        <Item
            {block}
            title="保存位置"
            text="选择存放导入标注的笔记本"
        >
            <Input
                slot="input"
                type={ItemType.select}
                settingKey="saveNotebook"
                settingValue={config.siyuan.notebook}
                on:changed={ e => {
                    config.siyuan.notebook = e.detail.value;
                    updated()
                }}
                options={options_notebook}
            />
        </Item>

        <!-- 笔记保存路径 -->
        <!-- <Item
            {block}
            title="保存路径"
            text="以 / 开头，如：/微信读书"
        >
            <Input
                slot="input"
                type={ItemType.text}
                settingKey="savePath"
                settingValue={config.siyuan.savePath}
                on:changed={ e => {
                    config.siyuan.savePath = e.detail.value;
                    updated()
                }}
            />
        </Item> -->

        <!-- 保存模式 -->
        <Item
            {block}
            title="保存模式"
            text="<p>按章节导入：有章节标题，按内容排序</p><p>按类型导入：先导入标注，后导入想法</p>"
        >
            <Input
                slot="input"
                type={ItemType.select}
                settingKey="importType"
                settingValue={config.siyuan.importType}
                on:changed={ e => {
                    config.siyuan.importType = e.detail.value;
                    updated()
                }}
                options={[
                    { key: "1", text: "按章节导入" },
                    { key: "2", text: "按类型导入" }
                ]}
            />
        </Item>

        <!-- 文件名模板 -->
        <Item
            {block}
            title="文件名模板"
            text="选择你需要的文件名模板"
        >
            <Input
                slot="input"
                type={ItemType.select}
                settingKey="docName"
                settingValue={config.siyuan.docName}
                on:changed={event => {
                    config.siyuan.docName = event.detail.value;
                    updated()
                }}
                options={[
                    { key: "1", text: "书名" },
                    { key: "2", text: "书名-作者" },
                    { key: "3", text: "书名-ID" },
                ]}
            />
        </Item>

        <!-- 导入模板 -->
        <Group title="导入模板：根据可用变量，设置导入内容的模板" style="display: flex; flex-direction: column;"> 
            <MiniItem>
                <span slot="title">{@html metadata_str}</span>
                <Input
                    slot="input"
                    type={ItemType.textarea}
                    settingKey="docTemplate"
                    settingValue={config.siyuan.docTemplate}
                    placeholder="Input something"
                    on:changed={event => {
                        config.siyuan.docTemplate = event.detail.value;
                        updated()
                    }}
                />
            </MiniItem>
            <MiniItem>
                <span slot="title">{@html highlight_str}</span>
                <Input
                    slot="input"
                    type={ItemType.textarea}
                    settingKey="highlightTemplate"
                    settingValue={config.siyuan.highlightTemplate}
                    placeholder="Input something"
                    on:changed={event => {
                        config.siyuan.highlightTemplate = event.detail.value;
                        updated()
                    }}
                />
            </MiniItem>
            <MiniItem>
                <span slot="title">{@html review_str}</span>
                <Input
                    slot="input"
                    type={ItemType.textarea}
                    settingKey="noteTemplate"
                    settingValue={config.siyuan.noteTemplate}
                    placeholder="Input something"
                    on:changed={event => {
                        config.siyuan.noteTemplate = event.detail.value;
                        updated()
                    }}
                />
            </MiniItem>
        </Group>
    </Panel>
</Panels>
