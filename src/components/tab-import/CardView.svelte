<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    import BookCard from "./BookCard.svelte";
    import NoteCard from "./NoteCard.svelte";
    import CardGroup from "../base/layout/CardGroup.svelte";
    import Input from "../siyuan/item/Input.svelte";
    import { ItemType } from "../siyuan/item/item";
    
    import Weread from "../..";
    import { showMessage } from "siyuan";
    import { WereadConfig } from "../../types/weread";
    import {
        checkImportedBestCard, 
        getCardsByFilter, 
        getMetadatasCards, 
        selectCheckboxByName, 
        syncSelectCards, 
        updateConfig, 
        updateCardGroupFold, 
        updateHeaderSelect, 
    } from './cardview'

    export let config: WereadConfig;
    export let plugin: Weread;

    let book_id = config.weread.bookId;
    let cards = [];
    let metadatas = [];
    let select_all = true;

    onMount(async () => {
        // [反应性更新需要先赋值](https://www.svelte.cn/docs#2_%E5%8F%8D%E5%BA%94%E6%80%A7_reactive_%E5%88%86%E9%85%8D)
        cards = await getCardsByFilter(book_id, config, cards);
        await checkImportedBestCard(book_id, config);

        metadatas = await getMetadatasCards();

        console.log("Setting panel opened");
    });
    onDestroy(() => {
        console.log("Setting panel closed");
    });
</script>

<div class="body">
    <aside class="aside">
        <div class="select-book">
            <h2>当前正在查看：</h2>
            {#each metadatas as metadata}
                {#if metadata.key == book_id}
                    <!-- 书籍卡片样式 -->
                    <CardGroup>
                        <BookCard
                            type={ItemType.button}
                            title={metadata.title}
                            text={metadata.text}
                            info={metadata.info}
                            url={metadata.url}
                        >
                        </BookCard>
                    </CardGroup>
                {/if}
            {/each}
        </div>
        <div class="other-books">
            <h2>最近读过：</h2>
            <CardGroup title="">
                {#each metadatas as metadata}
                    <BookCard
                        type={ItemType.button}
                        title={metadata.title}
                        text={metadata.text}
                        info={metadata.info}
                        url={metadata.url}
                        settingKey={metadata.key}
                        settingValue={metadata.value}
                        on:clicked={async (event) => {
                            showMessage('正在获取书籍信息……')
                            book_id = event.detail.key;
                            // 更新配置信息
                            config.weread.bookId = event.detail.key;
                            updateConfig(config, plugin)
                            // 重新加载界面，并自动选中已导入卡片
                            cards = await getCardsByFilter(book_id, config, cards);
                            await checkImportedBestCard(book_id, config);
                        }}
                    >
                    </BookCard>
                {/each}
            </CardGroup>
            <div>下拉查看更多...</div>
        </div>
    </aside>
    <!-- 笔记章节样式 -->
    <div class="main">
        <div class="filter">
            <!-- 顶部工具栏 -->
            {#if select_all}
                <span>
                    <input type="checkbox" id="selectAll" on:click={ () => { 
                        select_all = false;
                        selectCheckboxByName('card-name', 'checkall');
                    }}>
                    <label for="selectAll">全选</label>
                </span>
            {:else}
                <span>
                    <input type="checkbox" id="selectAll" on:click={ () => { 
                        select_all = true;
                        selectCheckboxByName('card-name', 'uncheckall');
                    }}>
                    <label for="selectAll">取消全选</label>
                </span>
            {/if}
            <div>
                <Input
                    type={ItemType.select}
                    settingKey="filterHighlight"
                    settingValue={config.weread.filterHighlight}
                    on:changed={ async e => {
                        // 更新配置信息
                        config.weread.filterHighlight = e.detail.value;
                        updateConfig(config, plugin)
                        // 重新加载界面，并自动选中已导入卡片
                        cards = await getCardsByFilter(book_id, config, cards);
                        await checkImportedBestCard(book_id, config);
                    }}
                    options={[
                        { key: "1", text: "想法" },
                        { key: "2", text: "标注" },
                        { key: "3", text: "想法和标注" }, 
                        { key: "4", text: "热门标注"}
                    ]}
                />
                <button on:click={async () => {
                    await syncSelectCards(book_id, config)
                }}>导入</button>
            </div>
        </div>
        <div class="chapter-group">
            {#each cards as {chapterTitle, chapterUid, chapterCards, chapterCardsCount}}
                <!-- 笔记章节工具栏 -->
                <div class="header">
                    <button class="header-fold header-open" id="fold-{chapterUid}" on:click={ () => {
                        updateCardGroupFold(chapterUid);
                    }}></button>
                    <h2 class="header-title" id="title-{chapterUid}">{chapterTitle}</h2>
                    <div class="header-select">
                        <input type="checkbox" id="header-select" on:click={() => {
                            updateHeaderSelect(chapterCards, chapterCardsCount);
                        }}>
                    </div>
                </div>
                <!-- 笔记卡片样式 -->
                <CardGroup id='cardgroup-{chapterUid}'>
                    {#each chapterCards as card}
                        <NoteCard
                            text={card.text}
                            note={card.title}
                            info={card.info}
                            settingKey={card.key}
                            settingValue={card.value}
                        >
                        </NoteCard>
                    {/each}
                </CardGroup>
            {/each}
        </div>
    </div>
</div>


<style lang="css">
    .body {
        display: flex;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    /* 侧边栏 */
    .aside {
        max-width: 250px;
        min-width: 200px;
        border-right: 1px solid rgb(190, 193, 197);
        /* flex 布局 */
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        /* 固定在右侧 */
        position: sticky;
        top: 0;
    }
    .aside .select-book {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .aside .other-books {
        border-top: 1px solid rgb(190, 193, 197);
        /* flex 布局 */
        display: flex;
        flex-direction: column;
        align-items: center;
        /* 显示 5-6 个卡片 */
        min-height: 415px;
        max-height: 500px;
    }

    /* 主界面 */
    .main {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        overflow-y: auto;
        flex-wrap: nowrap;
        flex-direction: column;

        position: relative;
    }

    .filter {
        box-sizing: border-box;
        padding: 0 24px;
        width: 100%;
        height: 30px;
        border-top: 1px solid rgb(190, 190, 190);
        border-bottom: 1px solid rgb(190, 190, 190);
        background-color: #f6f6f6;
        /* 固定在顶部 */
        position: sticky;
        top: 0;
        z-index: 1;
        /* flex 布局 */
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .chapter-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
    }

    .header {
        box-sizing: border-box;
        padding: 0 24px;
        width: 100%;
        /* flex 布局 */
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .header h2 {
        padding: 16px 0;
    }
    .header .header-fold {
        height: max-content;
    }
    .header .header-fold::before {
        /* Unicode 字符 + 号 */
        content: '\002B';
    }
    .header .header-open::before {
        /* Unicode 字符 - 号 */
        content: '\2212';
    }

    /* 适配小尺寸屏幕 */
    @media (max-width: 1024px) {
        .aside {
            height: 150px;
            max-width: 100%;
            overflow: hidden;
            /* flex 布局 */
            flex-direction: row;
            align-items: normal;
            /* 固定在顶部 */
            position: absolute;
            top: 0;
        }
        .aside .select-book {
            min-width: 180px;
            max-width: 300px;
        }
        .aside .other-books {
            border-top: none;
            border-left: 1px solid rgb(190, 193, 197);
            display: flex;
            min-height: 100px;
            max-height: 100%;
        }

        .main {
            margin-top: 150px;
        }
    }
</style>