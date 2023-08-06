import { getCookieBykey } from "../utils/cookie";
import { getFile } from "../api";
import { IWebSocketData, fetchSyncPost } from "siyuan";


const mainUrl = 'https://weread.qq.com';
const baseUrl = 'https://i.weread.qq.com';


/* ------------------------工具函数------------------------ */

async function getUserInfo() {
    // todo: 换个靠谱的方法
    let config = await getFile('data/storage/petal/siyuan-plugin-weread/config');
    let cookie = config.Cookie;

    const wr_skey = getCookieBykey(cookie, 'wr_skey');
    const wr_vid = getCookieBykey(cookie, 'wr_vid');

    const headers = {
        'accessToken': wr_skey, 
        'vid': wr_vid
    };

    return headers;
}

async function requestUrl(url: string) {
    // todo: 请求失败处理
    let proxy_url = '/api/network/forwardProxy';
    let data = {
        "url": url,
        "method": "GET",
        "timeout": 5000,
        "contentType": "application/json",
        "headers": [ await getUserInfo() ],
        "payload": {}
    }
    let response: IWebSocketData = await fetchSyncPost(proxy_url, data);
    return JSON.parse(response.data['body']);
}

/* ------------------------ 微信读书 API ------------------------*/

// 获取所有笔记本
export async function getNotebooks() {
    let url = `${baseUrl}/user/notebooks`;
    let response = await requestUrl(url);
    return response;
}

// 获取书架信息
export async function getBookSync() {
    let wr_vid = (await getUserInfo()).vid;
    // let url = `${mainUrl}/web/shelf/sync`;
    let url = `${baseUrl}/shelf/sync?userVid=${wr_vid}&synckey=0&lectureSynckey=0​`;
    let response = await requestUrl(url);
    return response;
}

// 获取最近书籍？没有有效返回数据
export async function getRecentBooks() {
    let wr_vid = (await getUserInfo()).vid;
    let url = `${baseUrl}/shelf/friendCommon?userVid=${wr_vid}`;
    let response = await requestUrl(url);
    return response;
}

// 获取书籍详细信息，包括标题、作者、出版时间、出版社、ISBN 等
export async function getBookInfos(book_id: string) {
    let url = `${baseUrl}/book/info?bookId=${book_id}`;
    let response = await requestUrl(url);
    return response;
}

// 获取书籍章节信息
export async function getBookChapterInfos(book_id: string) {
    let url = `${baseUrl}/book/chapterInfos?bookIds=${book_id}&synckeys=0`
    let response = await requestUrl(url);
    return response;
}

// 获取书籍高亮标注
export async function getNotebookHighlights(book_id: string) {
    let url = `${baseUrl}/book/bookmarklist?bookId=${book_id}`;
    let response = await requestUrl(url);
    return response;
}

// 获取书籍热门标注（公众号、导入书籍没有热门标注）
export async function getNotebookBestHighlights(book_id: string) {
    let url = `${baseUrl}/book/bestbookmarks?bookId=${book_id}`;
    let response = await requestUrl(url);
    return response;
}

// 获取书籍想法
export async function getNotebookReviews(book_id: string) {
    let url = `${baseUrl}/review/list?bookId=${book_id}&listType=11&mine=1&synckey=0`;
    let response = await requestUrl(url);
    return response;
}

// 获取书籍章节评论（）
export async function getNotebookBestReviews(book_id: string, chapter_uid: number | string) {
    let url = `${baseUrl}/review/list?bookId=${book_id}&listType=8&chapterUid=${chapter_uid}&synckey=0&listMode=3`;
    let response = await requestUrl(url);
    return response;
}

// 获取评论信息？没有返回有效数据
export async function getNotebookComments(wr_vid: string) {
    let url = `${baseUrl}/review/list?listType=6&userVid=${wr_vid}&rangeType=2&mine=1&listMode=1`;
    let response = await requestUrl(url);
    return response;
}

/**
 * 获取阅读时长
 * REF: https://github.com/Higurashi-kagome/wereader/blob/e7c85352332e94095dccc34da2dba21c7826e11f/src/background/modules/bg-wereader-api.ts#L116
 * 本年月数据及去年年总结：https://i.weread.qq.com/readdetail 
 * 指定月及该月之前指定数量的月数据：https://i.weread.qq.com/readdetail?baseTimestamp=1612108800&count=3&type=1
 * type=1：获取月数据
 * type=0：获取周数据
 */
export async function getReadDetail(type=1, count=3, monthTimestamp?: number) {
    let url = `${baseUrl}/readdetail`;

    if(monthTimestamp) url = `${url}&baseTimestamp=${monthTimestamp}`;
    if(count) url = `${url}&count=${count}`;
    if([0,1].indexOf(type)>-1) url = `${url}&type=${type}`;
    let response = await requestUrl(url);
    
    return response;
}

/**
 * 获取每天阅读时长
 * 
 */
export async function getReadData() {
    let url = `${baseUrl}/readdata/summary?synckey=0`;
    let response = await requestUrl(url);
    return response;
}