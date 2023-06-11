import type { 
    Highlight, 
    Review, 
    Metadata, 
    ChapterHighlight, 
    ChapterReview
} from "../weread/models";
import { getNotebooks, getNotebookHighlights, getNotebookReviews } from "../weread/api";
import jsonpath from 'jsonpath';


/* ------------------------ 解析返回值 ------------------------ */

// 解析 API: getNotebooks 的返回值
export const parseMetadata = (notebook: any): Metadata => {
    const book = notebook['book'];

    const metaData: Metadata ={
        bookId: book['bookId'],
        bookVersion: book['version'],
        title: book['title'], 
        author: book['author'],
        cover: book['cover'], 
        format: book['format'], 
        publishTime: book['publishTime'], 
        reviewCount: notebook['reviewCount'], 
        noteCount: notebook['noteCount'], 
        bookmarkCount: notebook['bookmarkCount']
    } 

    return metaData;
}

// 解析 API: getNotebookHighlights 的返回值
export const parseHighlights = (highlightData: any): Highlight[] => {
    const book = highlightData['book'];
    const highlights = highlightData['updated'];
    const chapters: [] = 
        highlightData['chapters'].length === 0
            ? highlightData['refMpInfos'] || [] // 微信公众号
            : highlightData['chapters'];
    const chapterMap = new Map(
        chapters.map(
            (chapter) =>
                [chapter['chapterUid'] || chapter['reviewId'], chapter['title']] as [string, string]
        )
    );

    return highlights.map((highlight) => {
		const chapterUid = highlight['chapterUid'] || highlight['refMpReviewId'];
        const highlightInfo: Highlight = {
            bookId: highlight['bookId'], 
            bookVersion: book['version'], 
            chapterUid: chapterUid, 
            chapterTitle: chapterMap.get(chapterUid), 
            bookmarkId: highlight['bookmarkId'], 
            markText: highlight['markText'], 
            createTime: highlight['createTime'], 
            style: highlight['style'], 
            type: highlight['type'], 
            range: highlight['range']
        }
        return highlightInfo;
    })
}

export const parseChapterHighlights = (highlightData: any): ChapterHighlight[] => {
    const chapterResult: ChapterHighlight[] = [];
    
    let chapterUids: number[] = jsonpath.query(highlightData, '$..chapterUid');
    chapterUids = [...new Set(chapterUids)];
    for (let chapterUid of chapterUids) {
        const chapterHighlights = jsonpath.query(highlightData, `$..[?(@.chapterUid == ${chapterUid})]`);
        const chapterHighlightCount = chapterHighlights.length;
        const chapterTitle = chapterHighlights[0]['chapterTitle'];

        const chapterHighlight: ChapterHighlight = {
            chapterUid: chapterUid, 
            chapterTitle: chapterTitle, 
            chapterHighlightCount: chapterHighlightCount, 
            chapterHighlights: chapterHighlights
        }

        chapterResult.push(chapterHighlight);
    }

    return chapterResult;
}

// 解析 API: getNotebookReviews 的返回值
export const parseReviews = (reviewsData: any): Review[] => {
    const reviews: [] = reviewsData['reviews'];

    return reviews.map((reviewData) => {
        const review = reviewData['review'];
        const reviewInfo: Review = {
            reviewId: review['reviewId'], 
            abstract: review['abstract'], 
            content: review['content'], 
            bookId: review['bookId'], 
            bookVersion: review['bookVersion'], 
			chapterUid: review['chapterUid'] || review['refMpInfo']?.['reviewId'],
			chapterTitle: review['chapterTitle'] || review['refMpInfo']?.['title'],
            createTime: review['createTime'], 
            atUserVids: review['atUserVids'], 
            type: review['type'], 
            range: review['range']
        }
        return reviewInfo;
    });
}

export const parseChapterReviews = (reviewsData: any): ChapterReview[] => {
    const chapterResult: ChapterReview[] = [];
    
    let chapterUids: number[] = jsonpath.query(reviewsData, '$..chapterUid');
    chapterUids = [...new Set(chapterUids)];
    for (let chapterUid of chapterUids) {
        const chapterReviews = jsonpath.query(reviewsData, `$..[?(@.chapterUid == ${chapterUid})]`);
        const chapterReviewCount = chapterReviews.length;
        const chapterTitle = chapterReviews[0]['chapterTitle'];

        const chapterReview: ChapterReview = {
            chapterUid: chapterUid, 
            chapterTitle: chapterTitle, 
            chapterReviewCount: chapterReviewCount, 
            chapterReviews: chapterReviews
        }

        chapterResult.push(chapterReview);
    }

    return chapterResult;    
}

// 解析时间戳
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

/* ------------------------ 获取解析后的信息 ------------------------ */

export async function getHighlights(book_id: string) {
    let response = await getNotebookHighlights(book_id);
    return parseHighlights(response);
}

export async function getReviews(book_id: string) {
    let response = await getNotebookReviews(book_id);
    return parseReviews(response);
}

export async function getMetadatas() {
    let metadatas = [];
    let response = await getNotebooks();
    for (const metadata of response['books']) {
        metadatas.push(parseMetadata(metadata));
    }
    return metadatas;
}