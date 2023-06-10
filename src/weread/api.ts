import { getCookieBykey } from "./cookie";

import axios from "axios";
import Weread from "..";

export default class WereadApi extends Weread {
	private baseUrl: string = 'https://i.weread.qq.com';
    private cookie: string;

    constructor(options) {
        super(options);

        this.cookie;
    }

    async getUserInfo() {
        let config = this.config;
        this.cookie = config.Cookie;

        const wr_skey = getCookieBykey(this.cookie, 'wr_skey');
        const wr_vid = getCookieBykey(this.cookie, 'wr_vid');

        // 不会思源直接发送带 Cookie 的请求，先用这两个鉴权顶顶
        const headers = {
            'accessToken': wr_skey, 
            'vid': wr_vid
        };

        return headers;
    }

    async requestUrl(url: string) {
        let headers = this.getUserInfo()

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
        return response.data;
    }
    
    // 获取所有笔记本
    async getNotebooks() {
        let url = `${this.baseUrl}/user/notebooks`;
        let response = await this.requestUrl(url);
        return response;
    }

    // 获取书架信息
    async getBookSync() {
        let wr_vid = (await this.getUserInfo()).vid;
        let url =  `${this.baseUrl}/shelf/sync?userVid=${wr_vid}&synckey=0&lectureSynckey=0​`;
        let response = await this.requestUrl(url);
        return response;
    }
    
    // 获取最近书籍？没有有效返回数据
    async getRecentBooks() {
        let wr_vid = (await this.getUserInfo()).vid;
        let url =  `${this.baseUrl}/shelf/friendCommon?userVid=${wr_vid}`;
        let response = await this.requestUrl(url);
        return response;
    }

    // 获取书籍详细信息，包括标题、作者、出版时间、出版社、ISBN 等
    async getBook(book_id: string) {
        let url = `${this.baseUrl}/book/info?bookId=${book_id}`;
        let response = await this.requestUrl(url);
        return response;
    }

    // 获取书籍章节信息
    async getBookChapterInfos(book_id: string) {
        let url = `${this.baseUrl}/book/chapterInfos?bookIds=${book_id}&synckeys=0`
        let response = await this.requestUrl(url);
        return response;
    }
    
    // 获取书籍高亮标注
    async getNotebookHighlights(book_id: string) {
        let url = `${this.baseUrl}/book/bookmarklist?bookId=${book_id}`;
        let response = await this.requestUrl(url);
        return response;
    }
    
    // 获取书籍想法
    async getNotebookReviews(book_id: string) {
        let url = `${this.baseUrl}/review/list?bookId=${book_id}&listType=11&mine=1&synckey=0`;
        let response = await this.requestUrl(url);
        return response;
    }
}