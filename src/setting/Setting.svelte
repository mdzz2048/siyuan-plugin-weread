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
    import { Metadata } from "../weread/models";
    import { getMetadatas, getHighlights, getReviews, parseTimeStamp } from "../utils/parseResponse";
    import { 
        parseMetadataTemplate, 
        parseHighlightTemplate, 
        parseReviewTemplate, 
        isAttrsExist, 
        creatDoc, 
        creatNote, 
        updateNote
    } from "../weread/syncNotebooks";

    export let config: any;
    export let plugin: Weread;

    let block = false;
    let normal = false;
    let book_id = '';

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

    let options_books: IOptions = [];
    let options_notebook: IOptions = [];
    let card = '';
    let highlights = [];
    let reviews = [];
    let metadata_list: Metadata[] = [];
    
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

    async function getHighlightCards(book_id: string) {
        highlights = await getHighlights(book_id);
        let highlight_card_list = [];
        for (const highlight of highlights) {
            let value = highlight.bookmarkId;
            let title = '';
            let text = highlight.markText;
            highlight_card_list.push(setCardStyle(value, title, text));
        }
        return highlight_card_list;
    }

    async function getReviewsCard(book_id: string) {
        reviews = await getReviews(book_id);
        let review_card_list = [];
        for (const review of reviews) {
            let value = review.reviewId;
            let title = review.content;
            let text = review.abstract;
            review_card_list.push(setCardStyle(value, title, text));
        }
        return review_card_list;
    }

    function setCardStyle(value: string, title: any, text: any) {
        return `<div class="weread-card" style=" flex: auto; height: 120px; width: 100%; border-radius: 5px; background-color: var(--b3-menu-background); box-shadow: 1px var(--b3-theme-on-background); padding: 5px 0; margin: 5px 0;">
                    <input
                        id="${value}"
                        name="weread-card-name"
                        type="checkbox"
                        value=${value}
                        style="box-sizing: border-box"
                    />
                    <label for="${value}">
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
        options_books = await get_books();
        options_notebook = await get_notebook();

        async function get_books() {
            metadata_list = await getMetadatas();
            for (const metadata of metadata_list) {
                let id = metadata.bookId;
                let name = metadata.title;
                // 处理过长的书名
                name = name.length > 30 ? name.substring(0, 30) + '...' : name;
                options_books.push({ key: id, text: name})
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
                    book_id = e.detail.value;
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
            {@html card}                                                                                           
        </CardGroup>
        <Group title="" style=""> 
            <MiniItem>
                <Input
                    slot="input"
                    type={ItemType.button}
                    settingKey="getInfo"
                    settingValue="获取信息"
                    on:clicked={async () => {
                        // 更新标注、想法数据
                        let highlight_card_list = await getHighlightCards(book_id);
                        let review_card_list = await getReviewsCard(book_id);

                        let filter = config.weread.filterHighlight;
                        if (filter == 1) {
                            card = review_card_list.join('');
                        } else if (filter == 2) {
                            card = highlight_card_list.join('');
                        } else if (filter == 3) {
                            card = highlight_card_list.join('') + review_card_list.join('');
                        }
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
                        let marks_and_reviews_id = [];
                        let checkbox = document.getElementsByName('weread-card-name');
                        for (let i = 0; i < checkbox.length; i++) {
                            if (checkbox[i]['checked']) {
                                marks_and_reviews_id.push(checkbox[i]['value']);
                            }
                        }

                        showMessage("正在导入……");

                        let metadata = metadata_list.filter(item => item.bookId === book_id)[0];
                        let root_id = await isAttrsExist('doc', book_id);
                        if (!root_id) {
                            // 需要新建微信读书文档（没有找到符合自定义属性的文档）
                            let docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata)
                            let path = '/' + metadata.title;
                            let docAttr = {
                                'custom-book-id': book_id
                            }
                            root_id = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
                        }
                        // 导入所有选择项
                        for (const id of marks_and_reviews_id ) {
                            if (highlights.some(item => item.bookmarkId === id)) {
                                let block_id = await isAttrsExist("bookmark", id);
                                let highlight = highlights.filter(item => item.bookmarkId === id)[0];
                                let highlightTemplate = parseHighlightTemplate(config.siyuan.highlightTemplate, highlight);
                                let highlightAttr = {
                                    'custom-bookmark-id': id, 
                                    'custom-created-time': parseTimeStamp(highlight.createTime)
                                }
                                if (block_id) { // 标注之前发送过（存在对应的自定义属性）
                                    await updateNote(block_id, highlightTemplate);
                                } else {
                                    block_id = await creatNote(root_id, highlightTemplate, highlightAttr);
                                }
                            }
                            if (reviews.some(item => item.reviewId === id)) {
                                let block_id = await isAttrsExist("review", id);
                                let review = reviews.filter(item => item.reviewId === id)[0];
                                let reviewTemplate = parseReviewTemplate(config.siyuan.noteTemplate, review);
                                let reviewAttr = {
                                    'custom-review-id': id, 
                                    'custom-created-time': parseTimeStamp(review.createTime)
                                }
                                if (block_id) { // 想法之前发送过（存在对应的自定义属性）
                                    await updateNote(block_id, reviewTemplate);
                                } else {
                                    block_id = await creatNote(root_id, reviewTemplate, reviewAttr); 
                                }
                            }
                        }

                        showMessage("导入完成！");
                    }}
                />
            </MiniItem>
        </Group>
    </Panel>
</Panels>
