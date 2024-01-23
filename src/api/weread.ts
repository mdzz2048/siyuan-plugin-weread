import { getPluginConfig } from "../utils/config";
import { getCookieBykey } from "../utils/cookie";
import { BestBookmarkList, BookInfo, BookmarkList, ChapterInfoList, ChapterReviewList, NotebookList, ReadData, ReadDetail, ReviewList, ShelfSync } from "../types/weread";
import { WereadConfig } from "../types/config";

const baseUrl = 'https://i.weread.qq.com';

/* ------------------------工具函数------------------------ */

async function requestUrl(url: string) {
    // todo: 请求失败处理
    const config = getPluginConfig("siyuan-plugin-weread") as WereadConfig;
    // const config = usePlugin().data
    const response = await fetch(url, {
        method: "GET",
        "headers": {
            "Content-Type": "application/json",
            "accessToken": getCookieBykey(config.Cookie, "wr_skey"),
            "vid": config.weread.userVid,
        },
    });
    return await response.json();
}

/* ------------------------ 微信读书 API ------------------------*/

/**
 * 获取所有笔记本
 * @returns 笔记本数据
 */
export async function getNotebooks(): Promise<NotebookList> {
    const url = `${baseUrl}/user/notebooks`;
    const response: NotebookList = await requestUrl(url);
    return response;
}

/**
 * 获取书架信息
 * @returns 书架数据
 */
export async function getBookSync(): Promise<ShelfSync> {
    const config = getPluginConfig("siyuan-plugin-weread") as WereadConfig;
    const wr_vid = getCookieBykey(config.Cookie, 'wr_vid');
    const url = `${baseUrl}/shelf/sync?userVid=${wr_vid}&synckey=0&lectureSynckey=0​`;
    const response: ShelfSync = await requestUrl(url);
    return response;
}

/**
 * 获取书籍详细信息，包括标题、作者、出版时间、出版社、ISBN 等
 * @param book_id 书籍 ID
 * @returns 书籍详细信息
 */
export async function getBookInfos(book_id: string): Promise<BookInfo> {
    const url = `${baseUrl}/book/info?bookId=${book_id}`;
    const response: BookInfo = await requestUrl(url);
    return response;
}

/**
 * 获取书籍章节信息
 * @param book_id 书籍 ID
 * @returns 书籍章节信息
 */
export async function getBookChapterInfos(book_id: string): Promise<ChapterInfoList> {
    const url = `${baseUrl}/book/chapterInfos?bookIds=${book_id}&synckeys=0`
    const response: ChapterInfoList = await requestUrl(url);
    return response;
}

/**
 * 获取数据标注
 * @param book_id 书籍 ID
 * @returns 标注数据
 */
export async function getNotebookHighlights(book_id: string): Promise<BookmarkList> {
    const url = `${baseUrl}/book/bookmarklist?bookId=${book_id}`;
    const response: BookmarkList = await requestUrl(url);
    return response;
}

/**
 * 获取书籍热门标注（公众号、导入书籍没有热门标注）
 * @param book_id 书籍 ID
 * @returns 热门标注数据
 */
export async function getNotebookBestHighlights(book_id: string): Promise<BestBookmarkList> {
    const url = `${baseUrl}/book/bestbookmarks?bookId=${book_id}`;
    const response: BestBookmarkList = await requestUrl(url);
    return response;
}

/**
 * 获取书籍想法
 * @param book_id 书籍 ID
 * @returns 书籍想法数据
 */
export async function getNotebookReviews(book_id: string): Promise<ReviewList> {
    const url = `${baseUrl}/review/list?bookId=${book_id}&listType=11&mine=1&synckey=0`;
    const response: ReviewList = await requestUrl(url);
    return response;
}

/**
 * 获取书籍章节评论
 * @param book_id 书籍 ID
 * @param chapter_uid 章节 ID
 * @returns 章节评论信息
 */
export async function getNotebookBestReviews(book_id: string, chapter_uid: number | string): Promise<ChapterReviewList> {
    const url = `${baseUrl}/review/list?bookId=${book_id}&listType=8&chapterUid=${chapter_uid}&synckey=0&listMode=3`;
    const response: ChapterReviewList = await requestUrl(url);
    return response;
}

// 获取评论信息？没有返回有效数据
export async function getNotebookComments(wr_vid: string) {
    const url = `${baseUrl}/review/list?listType=6&userVid=${wr_vid}&rangeType=2&mine=1&listMode=1`;
    const response = await requestUrl(url);
    return response;
}

/**
 * 获取阅读时长
 * @param type 获取模式 1: 月数据; 0： 周数据
 * @param count 
 * @param monthTimestamp 以秒为单位的 Unix 时间戳
 * @returns 阅读时长信息
*/
export async function getReadDetail(type=1, count=3, monthTimestamp?: number): Promise<ReadDetail> {
    // REF: https://github.com/Higurashi-kagome/wereader/blob/e7c85352332e94095dccc34da2dba21c7826e11f/src/background/modules/bg-wereader-api.ts#L116
    let url = `${baseUrl}/readdetail`;

    if (monthTimestamp) url = `${url}&baseTimestamp=${monthTimestamp}`;
    if (count) url = `${url}&count=${count}`;
    if ([0,1].indexOf(type) > -1) url = `${url}&type=${type}`;
    const response: ReadDetail = await requestUrl(url);
    
    return response;
}

/**
 * 获取每天的阅读数据
 * @returns 阅读数据
 */
export async function getReadData(): Promise<ReadData> {
    // 获取每月阅读最久的书
    // /readdata/detail?mode=monthly&defaultPreferBook=0&baseTime=1698768000
    // 获取总阅读时长最久的书。有所有的统计信息，包括：喜好的书、阅读情况
    // /readdata/detail?mode=overall&defaultPreferBook=0&baseTime=0
    const url = `${baseUrl}/readdata/summary?synckey=0`;
    const response: ReadData = await requestUrl(url);
    return response;
}

/**
 * 获取指定书籍的阅读数据
 * @returns 阅读数据
 */
export async function getReadInfo(bookId: string) {
    // 获取笔记信息之类的数据需要加其他参数，只获取阅读记录只要 readingDetail 和 bookId 即可
    // const fullInfo = `?noteCount=1&readingDetail=1&finishedBookIndex=1&readingBookCount=1&finishedBookCount=1&bookId=${bookId}&finishedDate=1`
    const url = `${baseUrl}/readinfo?readingDetail=1&bookId=${bookId}`;
    const response = await requestUrl(url);
    return response;
}