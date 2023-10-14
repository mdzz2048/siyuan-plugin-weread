import Weread from "../..";
import { showMessage } from "siyuan";
import { isAttrsExist, syncBestNotes, syncNotes } from "../../syncNotebooks";
import { WereadConfig } from "../../types/config";
import { getNotebookBestHighlights } from "../../api/weread";
import { 
    getMetadata, 
    getCardMetadataList, 
    getChapterBookmarkCardList, 
    getChapterBestBookmarkCardList, 
    getChapterReviewCardList, 
    getChapterNoteCardList,
} from "../../utils/parse";
import { ChapterNoteCard } from "../../types/card";

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
    let best_highlights = await getNotebookBestHighlights(book_id);
    console.log(best_highlights)
    for (let highlight of best_highlights.items) {
        let block_id = await isAttrsExist('bookmark', highlight.bookmarkId);
        // 已导入，则选中卡片
        if (block_id) {
            let checkbox = document.getElementById(highlight.bookmarkId);
            checkbox['checked'] = true;
        }
    }
}

/* ------------------------ 流程函数 ------------------------ */

async function getCardsByFilter(book_id: string, config?: WereadConfig, cards?: ChapterNoteCard[]): Promise<ChapterNoteCard[]> {
    switch (config.weread.filterHighlight) {
        case "1":
            cards = await getChapterReviewCardList(book_id);
            console.log(cards);
            break;
        case "2":
            cards = await getChapterBookmarkCardList(book_id);
            console.log(cards);
            break;
        case "3":
            cards = await getChapterNoteCardList(book_id);
            break;
        case "4":
            const isMp = book_id.startsWith('CB_') || book_id.startsWith('MP_')
            if (isMp) { showMessage('导入的书籍和公众号没有热门标注哦！'); break; }
            cards = await getChapterBestBookmarkCardList(book_id);
            break;
        default:
            console.log(`筛选模式有误: ${config.weread.filterHighlight}`);
            break;
    }
    return cards;
}

// 

async function syncSelectCards(bookId?: string, config?: WereadConfig) {
    // 获取所有选中卡片
    const checkbox = Array.from(document.getElementsByName('card-name')) as HTMLInputElement[];
    const cardIdList = checkbox.filter(element => element.checked).map(element => element.id);
    // 获取书籍信息
    const metadata = await getMetadata(bookId);
    const chapterCardList = config.weread.filterHighlight === "4"
        ? await getChapterNoteCardList(bookId)
        : await getChapterBestBookmarkCardList(bookId)
    chapterCardList.forEach((chapter) => {
        const noteList = chapter.chapterCards;
        chapter.chapterCards = noteList.filter((note) => cardIdList.includes(note.key));
    })
    // 导入文档
    if (config.weread.filterHighlight === "4") {
        await syncBestNotes(bookId, metadata, chapterCardList, config);
    } else {
        await syncNotes(bookId, metadata, chapterCardList, config);
    }
    showMessage('导入完成！');
}

export {
    checkImportedBestCard, 
    getCardsByFilter, 
    getCardMetadataList as getMetadatasCards, 
    updateConfig, 
    selectCheckboxByName, 
    syncSelectCards, 
    updateCardGroupFold,
    updateHeaderSelect, 
}