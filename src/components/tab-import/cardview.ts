import Weread from "../..";
import { showMessage } from "siyuan";
import { isAttrsExist, syncBestNotes, syncNotes } from "../../syncNotebooks";
import { WereadConfig } from "../../types/config";
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

async function updateConfig(config: WereadConfig, plugin?: Weread) {
    await plugin.updateConfig(config);
}

/* ------------------------ 界面工具函数 ------------------------ */
// REF: https://c.runoob.com/codedemo/5359/
// todo: 修复导入测试面板选中交互不符合预期情况
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

async function checkImportedBestCard(book_id: string, config: WereadConfig) {
    // 选中所有已导入内容，防止误删
    let filter = config.weread.filterHighlight;
    let root_id = await isAttrsExist('custom', book_id, 'custom-book-id-best-highlight');
    // 不进行后续查找操作: 1. 不存在热门标注文档; 2. 没有展示热门标注
    if (!root_id || filter != '4') {
        return;
    }
    let best_highlights = await getBestHighlights(book_id);
    console.log(best_highlights)
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

async function getCardsByFilter(book_id: string, config?: WereadConfig, cards?: any[]) {
    let filter = config.weread.filterHighlight;
    if (filter == '1') {
        cards = await getChapterReviewsCards(book_id);
    } else if (filter == '2') {
        cards = await getChapterHighlightCards(book_id);
    } else if (filter == '3') {
        cards = await getChapterNoteCards(book_id);
    } else if (filter == '4') {
        if (book_id.startsWith('CB_') || book_id.startsWith('MP_')) {
            showMessage('导入的书籍和公众号没有热门标注哦！');
        } else {
            cards = await getChapterBestHighlightCards(book_id);
        }
    }
    return cards;
}

// 

async function syncSelectCards(book_id?: string, config?: WereadConfig) {
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
}

export {
    checkImportedBestCard, 
    getCardsByFilter, 
    getMetadatasCards, 
    updateConfig, 
    selectCheckboxByName, 
    syncSelectCards, 
    updateCardGroupFold,
    updateHeaderSelect, 
}