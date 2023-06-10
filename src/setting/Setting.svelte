<!--
 Copyright (C) 2023 Zuoqiu Yingyi
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<!--
REF: https://github.com/siyuan-note/plugin-sample-vite-svelte/blob/main/src/libs/setting-panel.svelte
-->

<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    import { showMessage } from "siyuan";
    import { lsNotebooks } from "../api";
    import { getNotebooks } from "../weread/api";
    import { ItemType, type IOptions } from "./item/item";
    import { ITab } from "./tab";

    import Panels from "./panel/Panels.svelte";
    import Panel from "./panel/Panel.svelte";
    import Group from "./item/Group.svelte";
    import MiniItem from "./item/MiniItem.svelte";
    import Item from "./item/Item.svelte";
    import Input from "./item/Input.svelte";
    import CardGroup from "./item/CardGroup.svelte";
    // import Card from "./item/Card.svelte";

    import Weread from "..";

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
        },
        {
            key: 2,
            text: "导入预览",
            name: "导入预览",
            icon: "#iconDownload",
        },
    ];

    let options_books: IOptions = [];
    let options_notebook: IOptions = [];
    let card_list = [];
    
    function updated() {
        plugin.updateConfig(config);
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

    async function getHighlight() {
        // let card = "<Card title='1' text='1' settingKey='22' settingValue='666' />";
        let card = setCardStyle('value', 'title', 'text');
        card_list.push(card);

        return card_list
    }

    function setCardStyle(value: string, title: any, text: any) {
        return `<div class="weread-card" style=" flex: auto; height: 100px; width: 100%; border-radius: 5px; background-color: var(--b3-menu-background); box-shadow: 1px var(--b3-theme-on-background); padding: 5px 0; margin: 5px 0;">
                    <input
                        id="weread-card-checkbox"
                        name="weread-card-name"
                        type="checkbox"
                        value=${value}
                    />
                    <label for="weread-card-checkbox">
                        <div class="weread-card-title" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0px 0px 5px 0px; padding: 0px 0px 0px 6.5px;">
                            <slot name="title">${title}</slot>
                        </div>
                        <div class="weread-card-text" style="background-color: #ebeaf075; border-left: 1.5px solid var(--b3-scroll-color); padding: 0px 5px; /* 隐藏多余文字 */ display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden;">
                            <slot name="text">${text}</slot>
                        </div>
                    </label>
                </div>`
    }

    onMount(async () => {
        // options_books = await get_books();
        // options_notebook = await get_notebook();

        async function get_books() {
            let response = await getNotebooks();

            for (var i = 1; i < response.books.length; i++) {
                let name = response.books[i].book['title'];
                // 处理过长的书名
                name = name.length > 30 ? name.substr(0, 30) + '...' : name;
                options_books.push({ key: i, text: name})
            }

            return options_books;
        }

        async function get_notebook() {
            let response = await lsNotebooks();

            for (var i = 1; i < response.notebooks.length; i++) {
                let id = response.notebooks[i].id;
                let name = response.notebooks[i].name;
                options_notebook.push({ key: id, text: name });
            }

            return options_notebook;
        }

        showMessage("Setting panel opened");
    });
    onDestroy(() => {
        showMessage("Setting panel closed");
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
                on:clicked={() => {
                    showMessage("正在打开登录界面");
                }}
            />
        </Item>

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
                <span slot="title">文档模板<br>title-书名<br>author-作者<br>cover-封面<br>intro-书籍简介</span>
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
                <span slot="title">标注模板</span>
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
                <span slot="title">想法模板</span>
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

    <Panel display={panels[1].key === panel_focus}>
        <Item
            {block}
            title="导入书籍"
            text="选择需要导入的书"
        >
            <Input
                slot="input"
                type={ItemType.select}
                settingKey="importBook"
                settingValue=1
                on:changed={ e => {
                    showMessage(`选择: ${e.detail.value}`)
                    // todo: 更新卡片视图
                }}
                options={options_books}
            />
        </Item>
        <Item
            {block}
            title="筛选条件"
            text="选择条件以筛选想法和标注"
        >
            <Input
                slot="input"
                type={ItemType.select}
                settingKey="filterHighlight"
                settingValue={config.weread.filterHighlight}
                on:changed={ e => {
                    config.weread.filterHighlight = e.detail.value;
                    updated()
                }}
                options={[
                    { key: "1", text: "想法" },
                    { key: "2", text: "标注" },
                    { key: "3", text: "想法和标注" }
                ]}
            />
        </Item>
        <CardGroup title="">         
            {@html card_list}                                                                                           
        </CardGroup>
        <Group title="" style=""> 
            <MiniItem>
                <Input
                    slot="input"
                    type={ItemType.button}
                    settingKey="getInfo"
                    settingValue="获取信息"
                    on:clicked={() => {
                        let checkbox = document.getElementsByName('weread-card-name');
                        let checkedbox = [];
                        for (let i = 0; i < checkbox.length; i++) {
                            if (checkbox[i]['checked']) {
                                checkedbox.push(checkbox[i]['value']);
                            }
                        }
                        console.log(checkedbox);
                        // showMessage("正在获取书籍信息");
                    }}
                />
            </MiniItem>
            <MiniItem>
                <Input
                    slot="input"
                    type={ItemType.button}
                    settingKey="importTest"
                    settingValue="导入测试"
                    on:clicked={async () => {
                        card_list = await getHighlight();
                        // showMessage("正在导入");
                    }}
                />
            </MiniItem>
        </Group>
    </Panel>
</Panels>
