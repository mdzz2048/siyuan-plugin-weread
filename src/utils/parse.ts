import { 
    getBookInfos,
    getNotebooks, 
    getNotebookHighlights,
    getNotebookBestHighlights,
    getNotebookReviews
} from "../api/weread";
import { BookmarkList, Metadata } from "../types/weread";
import { BookCard, NoteCard, ChapterNoteCard, ChapterInfo } from "../types/card";

/**
 * 解析微信读书时间戳为字符串格式
 * @param timestamp 以秒为单位的 Unix 时间戳
 * @returns 字符串格式的时间戳
 */
export const parseTimeStamp = (timestamp: number): string => {
    // 微信读书时间戳为 10 位，需要乘 1000
    let date = new Date(timestamp * 1000);
    let Y = date.getFullYear();
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

/* ------------------------ 解析为用于展示的卡片数据 ------------------------ */

/**
 * 获取书架上所有书籍的卡片列表
 * @returns 卡片列表
 */
export async function getCardMetadataList(): Promise<BookCard[]> {
    const notebookInfo = await getNotebooks();
    const metadataList = notebookInfo.books.map((notebook) => {
        const noteCount = notebook.bookmarkCount + notebook.noteCount + notebook.reviewCount;
        const card: BookCard = {
            title: `${noteCount} 个笔记`,
            text: notebook.book.title,
            info: notebook.sort.toString(),
            url: notebook.book.cover,
            key: notebook.bookId,
            value: notebook.bookId,
        }
        return card;
    })
    // 根据阅读时间排序（倒序）
    metadataList.sort((a, b) => Number.parseInt(a.info) - Number.parseInt(b. info));
    metadataList.forEach((metedata) => {
        metedata.info = parseTimeStamp(Number.parseInt(metedata.info));
    })
    metadataList.reverse();
    return metadataList;
}

/**
 * 根据书籍标注数据，判断是否为公众号，获取章节信息
 * @param bookmarkInfo 书籍标注列表
 * @returns 书籍章节信息
 */
function getBookmarkChapterInfo(bookmarkInfo: BookmarkList): ChapterInfo[] {
    let chaptersInfo: ChapterInfo[] = [];
    if (bookmarkInfo?.refMpInfos?.length > 0 ) {    // 公众号
        chaptersInfo = bookmarkInfo.refMpInfos.map((chapter) => { 
            const info: ChapterInfo = {
                title: chapter.title,
                id: chapter.reviewId,
            }
            return info;
        })
    } else {
        chaptersInfo = bookmarkInfo.chapters.map((chapter) => {
            const info: ChapterInfo = {
                title: chapter.title,
                id: chapter.chapterUid.toString(),
            }
            return info;
        })
    }
    return chaptersInfo;
}

/**
 * 通过 API 获取的卡片是按时间逆序排列的，该函数将其改为顺序排列
 * @param chapterNoteCardList 卡片列表
 * @returns 排序后的卡片列表
 */
function reverseChapterNoteCard(chapterNoteCardList: ChapterNoteCard[]): ChapterNoteCard[] {
    chapterNoteCardList.forEach((chapter) => {
        chapter.chapterCards.reverse();     // 逆序列表，符合时间序列
    })
    return chapterNoteCardList.reverse();   // 逆序列表，符合章节顺序
}

/**
 * 根据书籍 ID 获取按章节排序的标注卡片
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export async function getChapterBookmarkCardList(bookId: string): Promise<ChapterNoteCard[]> {
    const bookmarkInfo = await getNotebookHighlights(bookId);
    const chaptersInfo = getBookmarkChapterInfo(bookmarkInfo);
    const chapterNoteCardList = chaptersInfo.reduce((accumulator, currentChapterInfo) => {
        // REF: [reduce](https://developer.mzozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
        const bookmarkList = bookmarkInfo.updated
            .filter((bookmark) => {
                const chapterId = bookmark.refMpReviewId ? bookmark.refMpReviewId : bookmark.chapterUid;
                return currentChapterInfo.id === chapterId.toString()
            })
            .map((bookmark) => {
                const card: NoteCard = {
                    title: "",
                    text: bookmark.markText,
                    info: parseTimeStamp(bookmark.createTime),
                    key: bookmark.bookmarkId,
                    value: "bookmark",
                }
                return card;
            })
        const chapterNoteCard: ChapterNoteCard = {
            chapterTitle: currentChapterInfo.title,
            chapterUid: currentChapterInfo.id,
            chapterCards: bookmarkList,
            chapterCardsCount: bookmarkList.length,
        }
        accumulator.push(chapterNoteCard);
        return accumulator;
    }, []);
    return reverseChapterNoteCard(chapterNoteCardList as ChapterNoteCard[]);
}

/**
 * 根据书籍 ID 获取按章节排序的热门标注卡片
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export async function getChapterBestBookmarkCardList(bookId: string) {
    const bookmarkInfo = await getNotebookBestHighlights(bookId);
    const { chapters, items } = bookmarkInfo;
    const chapterNoteCardList = chapters.reduce((accumulator, currentChapterInfo) => {
        const bookmarkList = items
            .filter(bookmark => bookmark.chapterUid === currentChapterInfo.chapterUid)
            .map(bookmark => {
                const card: NoteCard = {
                    title: "",
                    text: bookmark.markText,
                    info: `热度：${bookmark.totalCount}`,
                    key: bookmark.bookmarkId,
                    value: "bestBookmark",
                }
                return card;
            })
        const chapterNoteCard: ChapterNoteCard = {
            chapterTitle: currentChapterInfo.title,
            chapterUid: currentChapterInfo.chapterUid.toString(),
            chapterCards: bookmarkList,
            chapterCardsCount: bookmarkList.length,
        }
        accumulator.push(chapterNoteCard);
        return accumulator;
    }, [])
    return reverseChapterNoteCard(chapterNoteCardList as ChapterNoteCard[]);
}

/**
 * 根据书籍 ID 获取按章节排序的想法卡片
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export async function getChapterReviewCardList(bookId: string): Promise<ChapterNoteCard[]> {
    const reviewInfo = await getNotebookReviews(bookId);
    const chapterNoteCardList: ChapterNoteCard[] = [];
    console.log(reviewInfo);

    reviewInfo.reviews.forEach((review) => {
        const reviewData = review.review;
        const chapterTitle = reviewData.refMpInfo ? reviewData.refMpInfo.title : reviewData.chapterTitle;
        const chapterUid = reviewData.refMpInfo ? reviewData.refMpInfo.reviewId : reviewData.chapterUid.toString();
        const existChapter = chapterNoteCardList.find((chapter) => chapter.chapterUid === chapterUid);
        const card: NoteCard = {
            title: reviewData.content,
            text: reviewData.abstract,
            info: parseTimeStamp(reviewData.createTime),
            key: reviewData.reviewId,
            value: "review",
        }
        if (existChapter) {
            existChapter.chapterCards.push(card);
        } else {
            const chapterInfo: ChapterNoteCard = {
                chapterTitle: chapterTitle,
                chapterUid: chapterUid,
                chapterCards: [card],
                chapterCardsCount: 1,
            }
            chapterNoteCardList.push(chapterInfo)
        }
    })
    chapterNoteCardList.forEach((chapter) => {
        chapter.chapterCardsCount = chapter.chapterCards.length;
    })
    return reverseChapterNoteCard(chapterNoteCardList as ChapterNoteCard[]);
}

/**
 * 根据书籍 ID 获取按章节排序的想法、标注列表
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export async function getChapterNoteCardList(bookId: string): Promise<ChapterNoteCard[]> {
    const chapterNoteCardList: ChapterNoteCard[] = [];
    const chapterReviewCardList = await getChapterReviewCardList(bookId);
    const chapterBookmarkCardList = await getChapterBookmarkCardList(bookId);

    chapterBookmarkCardList.forEach((bookmark) => {
        const existChapter = chapterNoteCardList.find((chapter) => chapter.chapterUid === bookmark.chapterUid);
        if (existChapter) {
            existChapter.chapterCards.push(...bookmark.chapterCards);
        } else {
            chapterNoteCardList.push(bookmark);
        }
    })
    chapterReviewCardList.forEach((review) => {
        const existChapter = chapterNoteCardList.find((chapter) => chapter.chapterUid === review.chapterUid);
        if (existChapter) {
            existChapter.chapterCards.push(...review.chapterCards);
        } else {
            chapterNoteCardList.push(review);
        }
    })

    return chapterNoteCardList;
}

/* ------------------------ 获取 Metadata ------------------------ */

/**
 * 根据书籍 ID 获取书籍元数据
 * @param bookId 书籍 ID
 * @returns 书籍元数据
 */
export async function getMetadata(bookId: string): Promise<Metadata> {
    const notebookList = await getNotebooks();
    const notebook = notebookList.books.find(notebook => notebook.bookId === bookId);
    if (notebook === undefined) console.log(`未找到书籍 Metadata: ${notebook.book.title} -> ${bookId}`);
    notebook.book = await getBookInfos(bookId);
    return notebook as Metadata;
}

/**
 * 获取书架上所有书籍的元数据
 * @returns 书籍元数据列表
 */
export async function getMetadataList(): Promise<Metadata[]> {
    const notebookList = await getNotebooks();
    notebookList.books.forEach(async (notebook) => {
        const bookInfo = await getBookInfos(notebook.bookId);
        notebook.book = bookInfo;
    })
    return notebookList.books as Metadata[];
}