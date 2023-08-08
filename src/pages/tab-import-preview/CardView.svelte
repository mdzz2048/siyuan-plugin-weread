<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    import BookCard from "./item/BookCard.svelte";
    import NoteCard from "./item/NoteCard.svelte";
    import CardGroup from "./item/CardGroup.svelte";
    import Input from "../pannel-setting/item/Input.svelte";
    import { ItemType } from "../pannel-setting/item/item";
    
    import Weread from "../..";
    import { showMessage } from "siyuan";
    import { isAttrsExist, syncBestNotes, syncNotes } from "../../syncNotebooks";
    import { 
        getMetadatas,
        getChapterHighlights, 
        getChapterReviews, 
        getChapterNotes, 
        parseTimeStamp,
        getHighlights,
        getReviews,
        getMetadata,
        getChapterBestHighlights,
        getBestHighlights, 
    } from "../../utils/parseResponse";

    export let config: any;
    export let plugin: Weread;

    let book_id = config.weread.bookId;
    let cards = [];
    let metadatas = [];
    let select_all = true;

    async function updated() {
        await plugin.updateConfig(config);
    }

    /* ------------------------ 界面工具函数 ------------------------ */
    // REF: https://c.runoob.com/codedemo/5359/
    type checkboxType = 'checkall' | 'uncheckall' | 'reversecheck';
    function selectCheckboxByName(name: string, type: checkboxType){
        let elementList = document.getElementsByName(name);
        if(null != elementList){
            for(let i = 0; i < elementList.length; i++){  
                if (elementList[i]['checked'] == true) {
                    if(type != 'checkall') {  // 非全选
                        elementList[i]['checked'] = false;
                    }       
                } else {
                    if(type != 'uncheckall') {  // 非取消全选
                        elementList[i]['checked'] = true;
                    }
                }
            }  
        }
    }

    function updateHeaderSelect(chapterCards, chapterCardsCount) {
        let checked_list = [];
        // 检查有无选择的项
        for (const card of chapterCards) {
            let id = card['key'];
            let checkbox = document.getElementById(id);
            if (checkbox['checked']) {
                checked_list.push(checkbox);
            }
        }
        if (checked_list.length == chapterCardsCount) {
            // 若全选，则取消全选
            for (const card of chapterCards) {
                let id = card['key'];
                let checkbox = document.getElementById(id);
                checkbox['checked'] = false;
            }
        } else if (0 < checked_list.length < chapterCardsCount) {
            // 若未全选，则全选
            for (const card of chapterCards) {
                let id = card['key'];
                let checkbox = document.getElementById(id);
                checkbox['checked'] = true;
            }
        } else if (checked_list.length == 0) {
            // 若未选，则全选
            for (const card of chapterCards) {
                let id = card['key'];
                let checkbox = document.getElementById(id);
                checkbox['checked'] = true;
            }
        }
    }

    function updateCardGroupFold(chapterUid: string) {
        // 更新按钮的 before 部分，展示折叠状态
        let fold = document.getElementById('fold-' + chapterUid);
        fold.classList.toggle('header-open');
        // 更新 CardGroup 的高度，实现折叠效果
        let cardgroup = document.getElementById('cardgroup-' + chapterUid);
        if (cardgroup.style.height) {
            cardgroup.style.height = null;
        } else {
            cardgroup.style.height = '0px';
        }
    }

    async function checkImportedBestCard(book_id: string) {
        // 选中所有以导入内容，防止误删
        let root_id = await isAttrsExist('custom', book_id, 'custom-book-id-best-highlight');
        // 不存在热门标注文档，不用进行后续查找操作
        if (!root_id) {
            return;
        }
        let best_highlights = await getBestHighlights(book_id);
        for (let highlight of best_highlights) {
            let block_id = await isAttrsExist('bookmark', highlight.bookmarkId);
            // 已导入，则选中卡片
            if (block_id) {
                let checkbox = document.getElementById(highlight.bookmarkId);
                checkbox['checked'] = true;
            }
        }
    }

    /* ------------------------ 流程函数 ------------------------ */
    async function getMetadatasCards() {
        let metadatas = await getMetadatas();
        let metadata_card_list = [];
        for (const metadata of metadatas) {
            let note_count = metadata.noteCount + metadata.reviewCount + metadata.bookmarkCount;
            let card = {
                title: `${note_count} 个笔记`, 
                text: metadata.title, 
                info: metadata.readUpdateTime, 
                url: metadata.cover, 
                key: metadata.bookId, 
                value: metadata.bookId
            }
            metadata_card_list.push(card);
        }
        // 根据阅读时间排序（倒序）
        metadata_card_list.sort((a, b) => a.info - b. info);
        metadata_card_list = metadata_card_list.map((metedata) => {
            metedata.info = parseTimeStamp(metedata.info);
            return metedata;
        })
        metadata_card_list.reverse();
        return metadata_card_list;
    }

    async function getChapterHighlightCards(book_id: string) {
        let chapter_highlights = await getChapterHighlights(book_id);
        let chapter_highlight_card_list = [];
        for (const chapter of chapter_highlights) {
            let highlights = [];
            const chapterTitle = chapter.chapterTitle;
            const chapterUid = chapter.chapterUid;
            const chapterHighlights = chapter.chapterHighlights;
            const chapterHighlightCount = chapter.chapterHighlightCount;

            for (const highlight of chapterHighlights) {
                let card = {
                    title: '', 
                    text: highlight.markText, 
                    info: parseTimeStamp(highlight.createTime), 
                    key: highlight.bookmarkId, 
                    value: highlight.bookmarkId
                }
                highlights.push(card);
            }
            highlights.reverse();   // 逆序列表，符合时间序列
            let card = {
                chapterTitle: chapterTitle, 
                chapterUid: chapterUid, 
                chapterCards: highlights, 
                chapterCardsCount: chapterHighlightCount
            }
            chapter_highlight_card_list.push(card);
        }
        chapter_highlight_card_list.reverse();  // 逆序列表，符合章节顺序
        return chapter_highlight_card_list;
    }

    async function getChapterReviewsCards(book_id: string) {
        let chapter_reviews = await getChapterReviews(book_id);
        let chapter_review_card_list = [];
        for (const chapter of chapter_reviews) {
            let reviews = [];
            const chapterTitle = chapter.chapterTitle;
            const chapterUid = chapter.chapterUid;
            const chapterReviews = chapter.chapterReviews;
            const chapterReviewCount = chapter.chapterReviewCount;

            for (const review of chapterReviews) {
                let card = {
                    title: review.content, 
                    text: review.abstract, 
                    info: parseTimeStamp(review.createTime), 
                    key: review.reviewId, 
                    value: review.reviewId
                }
                reviews.push(card)
            }
            reviews.reverse();   // 逆序列表，符合时间序列
            let card = {
                chapterTitle: chapterTitle, 
                chapterUid: chapterUid, 
                chapterCards: reviews, 
                chapterCardsCount: chapterReviewCount
            }
            chapter_review_card_list.push(card);
        }
        chapter_review_card_list.reverse();  // 逆序列表，符合章节顺序
        return chapter_review_card_list;
    }

    async function getChapterNoteCards(book_id: string) {
        let chapter_notes = await getChapterNotes(book_id);
        let chapter_note_card_list = [];
        for (const chapter of chapter_notes) {
            let crads = [];
            const chapterTitle = chapter.chapterTitle;
            const chapterUid = chapter.chapterUid;
            const chapterNotes = chapter.chapterNotes;
            const chapterNoteCount = chapter.chapterNoteCount;

            for (const note of chapterNotes) {
                let card = {
                    title: note.note, 
                    text: note.text, 
                    info: parseTimeStamp(note.createTime), 
                    key: note.id, 
                    value: note.id
                }
                crads.push(card)
            }
            // crads.reverse();   // 逆序列表，符合时间序列
            let card = {
                chapterTitle: chapterTitle, 
                chapterUid: chapterUid, 
                chapterCards: crads, 
                chapterCardsCount: chapterNoteCount
            }
            chapter_note_card_list.push(card);
        }
        // chapter_note_card_list.reverse();  // 逆序列表，符合章节顺序
        return chapter_note_card_list;
    }

    async function getChapterBestHighlightCards(book_id: string) {
        let chapter_highlights = await getChapterBestHighlights(book_id);
        let chapter_highlight_card_list = [];
        for (const chapter of chapter_highlights) {
            let highlights = [];
            const chapterTitle = chapter.chapterTitle;
            const chapterUid = chapter.chapterUid;
            const chapterHighlights = chapter.chapterHighlights;
            const chapterHighlightCount = chapter.chapterHighlightCount;

            for (const highlight of chapterHighlights) {
                let card = {
                    title: '', 
                    text: highlight.markText, 
                    info: `热度：${highlight.totalCount}`, 
                    key: highlight.bookmarkId, 
                    value: highlight.bookmarkId
                }
                highlights.push(card);
            }
            highlights.reverse();   // 逆序列表，符合时间序列
            let card = {
                chapterTitle: chapterTitle, 
                chapterUid: chapterUid, 
                chapterCards: highlights, 
                chapterCardsCount: chapterHighlightCount
            }
            chapter_highlight_card_list.push(card);
        }
        // chapter_highlight_card_list.reverse();  // 逆序列表，符合章节顺序
        return chapter_highlight_card_list;
    }

    async function getCardsByFilter(book_id: string) {
        let filter = config.weread.filterHighlight;
        if (filter == 1) {
            cards = await getChapterReviewsCards(book_id);
        } else if (filter == 2) {
            cards = await getChapterHighlightCards(book_id);
        } else if (filter == 3) {
            cards = await getChapterNoteCards(book_id);
        } else if (filter == 4) {
            if (book_id.startsWith('CB_') || book_id.startsWith('MP_')) {
                showMessage('导入的书籍和公众号没有热门标注哦！');
            } else {
                cards = await getChapterBestHighlightCards(book_id);
                await checkImportedBestCard(book_id);
            }
        }
        return cards;
    }

    onMount(async () => {
        cards = await getCardsByFilter(book_id);
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
                            updated()
                            // 重新加载界面
                            await getCardsByFilter(book_id);
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
                        updated()
                        // 重新加载界面
                        await getCardsByFilter(book_id)
                    }}
                    options={[
                        { key: "1", text: "想法" },
                        { key: "2", text: "标注" },
                        { key: "3", text: "想法和标注" }, 
                        { key: "4", text: "热门标注"}
                    ]}
                />
                <button on:click={async () => {
                    // 获取所有选中卡片
                    let marks_and_reviews_id = [];
                    let checkbox = document.getElementsByName('card-name');
                    for (let i = 0; i < checkbox.length; i++) {
                        if (checkbox[i]['checked']) {
                            marks_and_reviews_id.push(checkbox[i]['value']);
                        }
                    }

                    // 获取书籍信息
                    let metadata = await getMetadata(book_id);
                    let highlights = await getHighlights(book_id);
                    let highlights_checked = [];
                    let reviews =  await getReviews(book_id);
                    let reveiws_checked = [];
                    let bestHighlights = await getBestHighlights(book_id);
                    let bestHighlights_checked = [];

                    for (const id of marks_and_reviews_id) {
                        let highlight = highlights.filter(highlight => highlight.bookmarkId === id)[0];
                        let review = reviews.filter(review => review.reviewId === id)[0];
                        let bestHighlight = bestHighlights.filter(highlight => highlight.bookmarkId === id)[0];
                        if (highlight) {
                            highlights_checked.push(highlight);
                        }
                        if (review) {
                            reveiws_checked.push(review);
                        }
                        if (bestHighlight) {
                            bestHighlights_checked.push(bestHighlight);
                        }
                    }

                    // 导入文档
                    if (bestHighlights) {
                        await syncBestNotes(book_id, metadata, bestHighlights_checked, config);
                    } else {
                        await syncNotes(book_id, metadata, highlights_checked, reveiws_checked, config);
                    }
                    showMessage('导入完成！');
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