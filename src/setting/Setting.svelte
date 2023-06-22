<!--
REF: https://github.com/siyuan-note/plugin-sample-vite-svelte/blob/main/src/libs/setting-panel.svelte
-->

<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    import { showMessage } from "siyuan";
    import { lsNotebooks } from "../api";
    import { ItemType, type IOptions } from "./item/item";
    import { ITab } from "./tab";
    
    import Panel from "./panel/Panel.svelte";
    import Panels from "./panel/Panels.svelte";
    import Group from "./item/Group.svelte";
    import MiniItem from "./item/MiniItem.svelte";
    import Item from "./item/Item.svelte";
    import Input from "./item/Input.svelte";
    import Card from "./item/Card.svelte";
    import CardGroup from "./item/CardGroup.svelte";
    
    import Weread from "..";
    import WereadLogin from "../weread/login";
    import { Metadata } from "../weread/models";
    import { checkCookie } from "../utils/cookie";
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
    let cards = [];
    let login = false;
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
            let card = {
                title: '', 
                text: highlight.markText, 
                info: parseTimeStamp(highlight.createTime), 
                key: highlight.bookmarkId, 
                value: highlight.bookmarkId
            }
            highlight_card_list.push(card)
        }
        return highlight_card_list;
    }

    async function getReviewsCards(book_id: string) {
        reviews = await getReviews(book_id);
        let review_card_list = [];
        for (const review of reviews) {
            let card = {
                title: review.content, 
                text: review.abstract, 
                info: parseTimeStamp(review.createTime), 
                key: review.reviewId, 
                value: review.reviewId
            }
            review_card_list.push(card)
        }
        return review_card_list;
    }

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

        for (var i = 0; i < response.notebooks.length; i++) {
            let id = response.notebooks[i].id;
            let name = response.notebooks[i].name;
            options_notebook.push({ key: id, text: name });
        }

        return options_notebook;
    }

    async function isLogin() {
        let cookie = await checkCookie();
        return cookie === '' ? false : true;
    }

    onMount(async () => {
        login = await isLogin();
        options_notebook = await get_notebook();
        if (login) {
            // 没有登录就不加载书单列表了
            options_books = await get_books();
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
                    on:clicked={async () => {
                        const login = new WereadLogin();
                        login.openWereadTab();
                        login.Window.on('close', async (event) => {
                            // REF: https://www.electronjs.org/docs/latest/api/web-contents/#event-will-prevent-unload
                            // 拦截默认关闭设置，保存配置
                            event.preventDefault();
                            let cookie = await login.getWereadCookie();
                            config.Cookie = cookie;
                            updated()
                            console.log('正在关闭');
                        })
                    }}
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
                    on:clicked={async () => {
                        const login = new WereadLogin();
                        login.openWereadTab();
                        login.Window.on('close', async (event) => {
                            // 拦截默认关闭设置，保存配置
                            event.preventDefault();
                            let cookie = await login.getWereadCookie();
                            config.Cookie = cookie;
                            updated()
                            console.log('正在登录');
                        })
                    }}
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
            {#each cards as card}
                <Card
                    title={card.title}
                    text={card.text}
                    info={card.info}
                    settingKey={card.key}
                    settingValue={card.value}
                >
                </Card>
            {/each}
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
                        let review_card_list = await getReviewsCards(book_id);

                        let filter = config.weread.filterHighlight;
                        if (filter == 1) {
                            cards = review_card_list;
                        } else if (filter == 2) {
                            cards = highlight_card_list;
                        } else if (filter == 3) {
                            cards = highlight_card_list.concat(review_card_list);
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
                        let checkbox = document.getElementsByName('card-name');
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
                        console.log(marks_and_reviews_id)
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
