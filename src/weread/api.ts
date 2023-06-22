import { getCookieBykey } from "../utils/cookie";
import { getFile } from "../api";
import axios from "axios";


const baseUrl:string = 'https://i.weread.qq.com';


/* ------------------------工具函数------------------------ */

async function getUserInfo() {
    // todo: 换个靠谱的方法
    let config = await getFile('data/storage/petal/siyuan-plugin-weread/config');
    let cookie = config.Cookie;

    const wr_skey = getCookieBykey(cookie, 'wr_skey');
    const wr_vid = getCookieBykey(cookie, 'wr_vid');

    // 不会思源直接发送带 Cookie 的请求，先用这两个鉴权顶顶
    const headers = {
        'accessToken': wr_skey, 
        'vid': wr_vid
    };

    return headers;
}

async function requestUrl(url: string) {
    let headers = getUserInfo()

    // // 使用 fetch
    // let response = await fetch(url, {
    //     method: 'GET',
    //     mode: 'cors',
    //     // cache: 'no-cache', 
    //     headers: headers, 
    //     redirect: 'follow', 
    //     credentials: 'include'
    // });
    // return response.json();

    // 使用第三方库 axios
    const axiosConfig = {
        headers: await headers, 
        withCredentials: true, 
    };
    let response = await axios.get(url, axiosConfig);
    // todo: 请求失败处理
    return response.data;
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

// 获取书籍想法
export async function getNotebookReviews(book_id: string) {
    let url = `${baseUrl}/review/list?bookId=${book_id}&listType=11&mine=1&synckey=0`;
    let response = await requestUrl(url);
    return response;
}