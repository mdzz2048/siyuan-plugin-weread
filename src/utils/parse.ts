import { 
    getBookInfos,
    getNotebooks, 
    getNotebookHighlights,
    getNotebookBestHighlights,
    getNotebookReviews
} from "../api/weread"
import { BookmarkList, BookInfo, Metadata, BestBookmarkList, ReviewList } from "../types/weread"
import { NoteCard, ChapterNoteCard, ChapterInfo } from "../types/card"
import CryptoJS from "crypto-js"

/**
 * 解析微信读书时间戳为字符串格式
 * @param timestamp 以秒为单位的 Unix 时间戳
 * @returns 字符串格式的时间戳
 */
export const parseTimeStamp = (timestamp: number): string => {
    // 微信读书时间戳为 10 位，需要乘 1000
    let date = new Date(timestamp * 1000)
    let Y = date.getFullYear()
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours())
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

// REF: https://github.com/zhaohongxuan/obsidian-weread-plugin/blob/main/src/parser/parseResponse.ts#L249
const getFa = (id: string): [string, string[]] => {
	if (/^\d*$/.test(id)) {
		const c: string[] = [];
		for (let a = 0; a < id.length; a += 9) {
			const b = id.slice(a, Math.min(a + 9, id.length));
			c.push(parseInt(b, 10).toString(16));
		}
		return ['3', c];
	}
	let d = '';
	for (let i = 0; i < id.length; i++) {
		d += id.charCodeAt(i).toString(16);
	}
	return ['4', [d]];
};
const hashUrl = (id: string): string => {
    const str = CryptoJS.MD5(id).toString(CryptoJS.enc.Hex)
	const fa = getFa(id)
	let strSub = str.substr(0, 3)
	strSub += fa[0]
	strSub += '2' + str.substr(str.length - 2, 2)

	for (let j = 0; j < fa[1].length; j++) {
		const n = fa[1][j].length.toString(16)
		if (n.length === 1) {
			strSub += '0' + n
		} else {
			strSub += n
		}
		strSub += fa[1][j];
		if (j < fa[1].length - 1) {
			strSub += 'g'
		}
	}

	if (strSub.length < 20) {
		strSub += str.substr(0, 20 - strSub.length)
	}

	strSub += CryptoJS.MD5(strSub).toString(CryptoJS.enc.Hex).substr(0, 3)
    return strSub
}

export const getPcUrl = (bookId: string, chapterUid?: string): string => {
	const prefix = 'https://weread.qq.com/web/reader/'
    const url = chapterUid 
        ? prefix + hashUrl(bookId) + "k" +  hashUrl(chapterUid)
        : prefix + hashUrl(bookId)
	return url
}

/* ------------------------ 解析为用于展示的卡片数据 ------------------------ */

/**
 * 根据书籍标注数据，判断是否为公众号，获取章节信息
 * @param bookmarkInfo 书籍标注列表
 * @returns 书籍章节信息
 */
// todo: remove
function getBookmarkChapterInfo(bookmarkInfo: BookmarkList): ChapterInfo[] {
    let chaptersInfo: ChapterInfo[] = []
    if (bookmarkInfo?.refMpInfos?.length > 0 ) {    // 公众号
        chaptersInfo = bookmarkInfo.refMpInfos.map((chapter) => { 
            const info: ChapterInfo = {
                title: chapter.title,
                id: chapter.reviewId,
            }
            return info
        })
    } else {
        chaptersInfo = bookmarkInfo.chapters.map((chapter) => {
            const info: ChapterInfo = {
                title: chapter.title,
                id: chapter.chapterUid.toString(),
            }
            return info
        })
    }
    return chaptersInfo
}

/**
 * 通过 API 获取的卡片是按时间逆序排列的，该函数将其改为顺序排列
 * @param chapterNoteCardList 卡片列表
 * @returns 排序后的卡片列表
 */
function reverseChapterNoteCard(chapterNoteCardList: ChapterNoteCard[]): ChapterNoteCard[] {
    chapterNoteCardList.forEach((chapter) => {
        chapter.chapterCards.reverse()     // 逆序列表，符合时间序列
    })
    return chapterNoteCardList.reverse()   // 逆序列表，符合章节顺序
}

/**
 * 根据书籍 ID 获取按章节排序的标注卡片
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export function getChapterBookmarkCardList(bookmarks: BookmarkList): ChapterNoteCard[] {
    const chaptersInfo = getBookmarkChapterInfo(bookmarks)
    const chapterNoteCardList = chaptersInfo.reduce((accumulator, currentChapterInfo) => {
        // REF: [reduce](https://developer.mzozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
        const bookmarkList = bookmarks.updated
            .filter((bookmark) => {
                const chapterId = bookmark.refMpReviewId ? bookmark.refMpReviewId : bookmark.chapterUid
                return currentChapterInfo.id === chapterId.toString()
            })
            .map((bookmark) => {
                const card: NoteCard = {
                    title: "",
                    text: bookmark.markText,
                    info: parseTimeStamp(bookmark.createTime),
                    key: bookmark.bookmarkId,
                    value: "bookmark",
                    data: bookmark
                }
                return card
            })
        const chapterNoteCard: ChapterNoteCard = {
            chapterTitle: currentChapterInfo.title,
            chapterUid: currentChapterInfo.id,
            chapterCards: bookmarkList,
            chapterCardsCount: bookmarkList.length,
        }
        accumulator.push(chapterNoteCard)
        return accumulator
    }, [])
    return reverseChapterNoteCard(chapterNoteCardList as ChapterNoteCard[])
}

/**
 * 根据书籍 ID 获取按章节排序的热门标注卡片
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export function getChapterBestBookmarkCardList(bestBookmarks: BestBookmarkList) {
    const { chapters, items } = bestBookmarks
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
                    data: bookmark,
                }
                return card
            })
        const chapterNoteCard: ChapterNoteCard = {
            chapterTitle: currentChapterInfo.title,
            chapterUid: currentChapterInfo.chapterUid.toString(),
            chapterCards: bookmarkList,
            chapterCardsCount: bookmarkList.length,
        }
        accumulator.push(chapterNoteCard)
        return accumulator
    }, [])
    return reverseChapterNoteCard(chapterNoteCardList as ChapterNoteCard[])
}

/**
 * 根据书籍 ID 获取按章节排序的想法卡片
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export function getChapterReviewCardList(reviews: ReviewList): ChapterNoteCard[] {
    const chapterNoteCardList: ChapterNoteCard[] = []

    reviews.reviews.forEach((review) => {
        const reviewData = review.review
        const chapterTitle = reviewData.refMpInfo ? reviewData.refMpInfo.title : reviewData.chapterTitle
        const chapterUid = reviewData.refMpInfo ? reviewData.refMpInfo.reviewId : reviewData.chapterUid.toString()
        const existChapter = chapterNoteCardList.find((chapter) => chapter.chapterUid === chapterUid)
        const card: NoteCard = {
            title: reviewData.content,
            text: reviewData.abstract,
            info: parseTimeStamp(reviewData.createTime),
            key: reviewData.reviewId,
            value: "review",
            data: reviewData,
        }
        if (existChapter) {
            existChapter.chapterCards.push(card)
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
        chapter.chapterCardsCount = chapter.chapterCards.length
    })
    return reverseChapterNoteCard(chapterNoteCardList as ChapterNoteCard[])
}

/**
 * 根据书籍 ID 获取按章节排序的想法、标注列表
 * @param bookId 书籍 ID
 * @returns 卡片列表
 */
export async function getChapterNoteCardList(bookId: string): Promise<ChapterNoteCard[]> {
    console.log('start: getChapterNoteCardList', new Date().getTime())

    let chapterNoteCardList: ChapterNoteCard[] = []
    let chapterReviewCardList: ChapterNoteCard[] = []
    let chapterBookmarkCardList: ChapterNoteCard[] = []

    const promises: Promise<BookmarkList | ReviewList>[] = []
    promises.push(getNotebookReviews(bookId))
    promises.push(getNotebookHighlights(bookId))
    const results = await Promise.allSettled(promises)
    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            switch (index) {
                case 0: 
                    chapterReviewCardList = getChapterReviewCardList(result.value as ReviewList)
                    break
                case 1: 
                    chapterBookmarkCardList = getChapterBookmarkCardList(result.value as BookmarkList)
                    break
            }
        }
    })
    console.log('end: getChapterNoteCardList', new Date().getTime())

    chapterBookmarkCardList.forEach((bookmark) => {
        const existChapter = chapterNoteCardList.find((chapter) => chapter.chapterUid === bookmark.chapterUid)
        if (existChapter) {
            existChapter.chapterCards.push(...bookmark.chapterCards)
        } else {
            chapterNoteCardList.push(bookmark)
        }
    })
    chapterReviewCardList.forEach((review) => {
        const existChapter = chapterNoteCardList.find((chapter) => chapter.chapterUid === review.chapterUid)
        if (existChapter) {
            existChapter.chapterCards.push(...review.chapterCards)
        } else {
            chapterNoteCardList.push(review)
        }
    })

    return chapterNoteCardList
}

/* ------------------------ 获取 Metadata ------------------------ */

/**
 * 根据书籍 ID 获取书籍元数据
 * @param bookId 书籍 ID
 * @returns 书籍元数据
 */
export async function getMetadata(bookId: string): Promise<Metadata> {
    const notebookList = await getNotebooks()
    const notebook = notebookList.books.find(notebook => notebook.bookId === bookId)
    if (notebook === undefined) {
        console.log(`未找到书籍 Metadata: ${notebook.book.title} -> ${bookId}`)
    }
    notebook.book = await getBookInfos(bookId)
    return notebook as Metadata
}

/**
 * 获取书架上所有书籍的元数据
 * @returns 书籍元数据列表
 */
export async function getMetadataList(): Promise<Metadata[]> {
    console.log('start: getNotebooks', new Date().getTime())
    
    const notebookList = await getNotebooks()

    console.log('end: getNotebooks', new Date().getTime())
    // notebookList.books.forEach(async (notebook) => {
    //     const bookInfo = await getBookInfos(notebook.bookId)
    //     notebook.book = bookInfo
    // })
    console.log('start: getBookInfos', new Date().getTime())

    const promises: Promise<BookInfo>[] = []
    notebookList.books.forEach(notebook => promises.push(getBookInfos(notebook.bookId)))
    const books = await Promise.allSettled(promises)
    books.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.bookId !== "") {
            notebookList.books[index].book = result.value
        }
    })
    
    console.log('end: getBookInfos', new Date().getTime())

    return notebookList.books as Metadata[]
}