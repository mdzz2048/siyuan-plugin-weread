import type { 
    Highlight, 
    Review, 
    Note,
    Metadata, 
    ChapterHighlight, 
    ChapterReview, 
    ChapterNotes
} from "../weread/models";
import { getNotebooks, getNotebookHighlights, getNotebookReviews, getBookInfos } from "../weread/api";
import jsonpath from 'jsonpath';


/* ------------------------ 解析返回值 ------------------------ */

// 解析 API: getNotebooks 的返回值
export const parseMetadata = (notebook: any): Metadata => {
    const book = notebook['book'];

    const metadata: Metadata ={
        bookId: book['bookId'],
        bookVersion: book['version'],
        title: book['title'], 
        author: book['author'],
        cover: book['cover'], 
        format: book['format'], 
        readUpdateTime: notebook['sort'], 
        reviewCount: notebook['reviewCount'], 
        noteCount: notebook['noteCount'], 
        bookmarkCount: notebook['bookmarkCount']
    } 

    return metadata;
}

// 解析 API: getBookInfos 的返回值
export const parseBookInfos = (bookInfo: any): Metadata => {
    const metadata: Metadata = {
        bookId: bookInfo['bookId'],
        bookVersion: bookInfo['version'],
        title: bookInfo['title'], 
        author: bookInfo['author'],
        cover: bookInfo['cover'], 
        isbn: bookInfo['isbn'], 
        intro: bookInfo['intro'], 
        format: bookInfo['format'], 
        publishTime: bookInfo['publishTime'], 
        category: bookInfo['category'], 
        publisher: bookInfo['publisher'], 
        readUpdateTime: bookInfo['updateTime'], 
        reviewCount: bookInfo['reviewCount'], 
        bookmarkCount: bookInfo['bookmarkCount'], 
        noteCount: bookInfo['noteCount']
    }

    return metadata;
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
        const chapterHighlights = jsonpath.query(highlightData, `$.updated..[?(@.chapterUid == ${chapterUid})]`);
        const chapterHighlightCount = chapterHighlights.length;
        // todo: 公众号文章可能有问题
        const chapterTitle = jsonpath.query(highlightData, `$.chapters..[?(@.chapterUid == ${chapterUid})].title`)[0];

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
        const chapterTitle = jsonpath.query(reviewsData, `$..[?(@.chapterUid == ${chapterUid})].chapterTitle`)[0];

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

// 解析 API: getNotebookHighlights、getNotebookReviews 的章节笔记
export const parseChapterNote = (highlights, reviews, title: string, uid: number): Note[] => {
    const chapterNote: Note[] = [];

    for (const highlight of highlights) {
        let note: Note = {
            id: highlight['bookmarkId'], 
            text: highlight['markText'], 
            note: '', 
            bookId: highlight['bookId'], 
            chapterUid: uid, 
            chapterTitle: title, 
            createTime: highlight['createTime'], 
            isHighlight: true, 
            style: highlight['style'], 
            type: highlight['type'], 
            range: highlight['range']
        }
        chapterNote.push(note);
    }
    for (const review of reviews) {
        let note: Note = {
            id: review['reviewId'], 
            text: review['abstract'], 
            note: review['content'], 
            bookId: review['bookId'], 
            bookVersion: review['bookVersion'], 
            chapterUid: uid, 
            chapterTitle: title, 
            createTime: review['createTime'], 
            isHighlight: false, 
            atUserVids: review['atUserVids'], 
            type: review['type'], 
            range: review['range']
        }
        chapterNote.push(note);
    }
    // 根据 range 排序，匹配微信读书章节内顺序
    chapterNote.sort((a, b) => {
        let aa = Number(a.range.split('-')[0]);
        let bb = Number(b.range.split('-')[0]);
        return aa - bb;
    })

    return chapterNote;
}


export const parseChapterNotes = (highlightData: any, reviewsData: any): ChapterNotes[] => {
    const chapterResult: ChapterNotes[] = [];
    
    let highlightUids: number[] = jsonpath.query(highlightData, '$..chapterUid');
    let reviewUids: number[] = jsonpath.query(reviewsData, '$..chapterUid');
    let chapterUids: number[] = highlightUids.length > reviewUids.length ? highlightUids : reviewUids;
    chapterUids = [...new Set(chapterUids)].sort((a,b) => a - b );
    for (let chapterUid of chapterUids) {
        const chapterHighlights = jsonpath.query(highlightData, `$.updated..[?(@.chapterUid == ${chapterUid})]`);
        const chapterHighlightCount = chapterHighlights.length;
        const chapterReviews = jsonpath.query(reviewsData, `$..[?(@.chapterUid == ${chapterUid})]`);
        const chapterReviewCount = chapterReviews.length;
        // todo: 公众号文章可能有问题
        const chapterTitle = highlightUids.length > reviewUids.length 
            ? jsonpath.query(highlightData, `$.chapters..[?(@.chapterUid == ${chapterUid})].title`)[0]
            : jsonpath.query(reviewsData, `$..[?(@.chapterUid == ${chapterUid})].chapterTitle`)[0];
        const chapterNote = parseChapterNote(chapterHighlights, chapterReviews, chapterTitle, chapterUid);

        const chapterNoteInfo: ChapterNotes = {
            chapterUid: chapterUid, 
            chapterTitle: chapterTitle, 
            chapterNoteCount: chapterReviewCount + chapterHighlightCount, 
            chapterNotes: chapterNote
        }

        chapterResult.push(chapterNoteInfo);
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

export async function getChapterHighlights(book_id: string) {
    let response = await getNotebookHighlights(book_id);
    return parseChapterHighlights(response);
}

export async function getChapterReviews(book_id: string) {
    let response = await getNotebookReviews(book_id);
    return parseChapterReviews(response);   
}

export async function getChapterNotes(book_id: string) {
    let highlights = await getNotebookHighlights(book_id);
    let reveiws = await getNotebookReviews(book_id);
    return parseChapterNotes(highlights, reveiws);
}

export async function getHighlights(book_id: string) {
    let response = await getNotebookHighlights(book_id);
    return parseHighlights(response);
}

export async function getReviews(book_id: string) {
    let response = await getNotebookReviews(book_id);
    return parseReviews(response);
}

export async function getMetadata(book_id: string) {
    let metadatas = await getMetadatas();
    return metadatas.filter(metadata => metadata.bookId === book_id)[0];
}

export async function getMetadatas() {
    let metadatas:Metadata[] = [];
    let response = await getNotebooks();
    for (const metadata of response['books']) {
        metadatas.push(parseMetadata(metadata));
    }
    return metadatas;
}

export async function getBookMetadata(book_id: string) {
    let response = await getBookInfos(book_id);
    return parseBookInfos(response);
}