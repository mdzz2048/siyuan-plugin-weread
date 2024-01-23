interface Book {
    bookId: string  		    // 书籍 ID
    version: number             // 版本?
    format?: string 		    // 书籍格式
    cover: string			    // 封面 URL
    title: string			    // 书名
    author: string 			    // 作者
    bookVersion?: number        // 书籍版本
    category?: string   		// 书籍分类
    categories?: Categorie[]    // 所有分类
    language?: string           // 语言: zh
    publishTime?: string        // 出版时间
}

interface Chapter {
    title: string,
    chapterUid: number,
    chapterIdx: number,
}

interface Bookmark {
    bookId: string,
    bookmarkId: string,
    range: string,
    markText: string,
    chapterUid?: number,
}

interface Review {
    reviewId: string,		    // 想法 ID
    abstract?: string,		    // 标注内容
    content?: string,		    // 你的想法
    bookId: string,			    // 书籍 ID
    bookVersion?: number,	    // 书籍版本
    book?: Book,                // 书籍信息
    chapterUid: number,		    // 章节 ID
    createTime: number,		    // 创建时间
    author?: UserAuthor,        // 想法作者
    chapterTitle?: string,	    // 章节标题
    refMpInfo?: MpInfo,         // 公众号文章
}

interface User {
    userVid: number,
    name: string,
    avatar: string,
    gender?: number,
}

interface MpInfo {
    createTime: number,
    pic_url: string,
    reviewId: string,
    title: string,
}

// API: https://i.weread.qq.com/user/notebooks
export interface NotebookList {
    synckey: number,
    totalBookCount: number,
    noBookReviewCount: number,
    books: Notebook[]
}

interface Notebook {
    bookId: string,
    book: Book,
    reviewCount: number,
    reviewLikeCount: number,
    reviewCommentCount: number,
    noteCount: number,
    bookmarkCount: number,
    sort: number                // 最后阅读时间，等效于 BookSync 的 readUpdateTime
}

interface Categorie {
    categoryId: number,
    subCategoryId: number,
    categoryType: number,
    title: string
}

/**
 * API: https://i.weread.qq.com/shelf/sync?userVid=${userVid}&synckey=0&lectureSynckey=0
 */ 
export interface ShelfSync {
    bookCount: number,
    removedArchive: [],
    bookProgress: BookProgress[],
    synckey: number,
    removed: [],
    lectureRemoved: [],
    archive: Archive[],
    books: BookSync[],
    lectureBooks: [],
    lectureSynckey: number,
    lectureUpdate: [],
    mp: any
}

interface Archive {
    archiveId: number,
    name: string,
    bookIds: string[],
    removed: string[],
    lectureBookIds: string[],
    lectureRemoved: string[]
}

interface BookProgress {
    bookId: string,
    progress: number,
    chapterUid: number,
    chapterOffset: number,
    chapterIdx: number,
    appId: string,
    updateTime: number,
    synckey: number
}

interface BookSync extends Book {
    secret?: number,
    readUpdateTime?: number,
    finishReading?: number,
    paid?: number
}

/**
 * API: https://i.weread.qq.com/book/info?bookId=${book_id}
 */
export interface BookInfo extends Book {
    intro: string
    isbn: string
    totalWords: number
    publisher: string
    finishReading: string
}

export interface Metadata extends Notebook {
    book: BookInfo,
    bookPcUrl?: string,
    bookMobileUrl?: string,
}

/**
 * API: https://i.weread.qq.com/book/chapterInfos?bookIds=${book_id}&synckeys=0
 */
export interface ChapterInfoList {
    data: ChapterInfo[]
}

interface ChapterInfo {
    bookId: string,
    soldOut: number,
    clearAll: number,
    removed: [],
    updated: ChapterUpdated[]
    synckey: number,
    book: Book,
    chapterPcUrl?: string,
    chapterMobileUrl?: string,
}

interface ChapterUpdated extends Chapter {
    updateTime: number,
    readAhead: number,
    wordCount: number,
    price: number,
    paid: number,
    isMPChapter: number,
    level: number,
    files: string[],
}

/**
 * API: https://i.weread.qq.com/book/bookmarklist?bookId=${book_id}
 */
export interface BookmarkList {
    synckey: number,
    updated: BookmarkSelf[],
    removed: [],
    chapters: Chapter[],
    book: Book,
    refMpInfos: MpInfo[],
}

interface BookmarkSelf extends Bookmark {
    style: number,
    type: number,
    createTime: number,
    bookVersion?: number,
    refMpReviewId?: string,
}

/**
 * API: https://i.weread.qq.com/book/bestbookmarks?bookId=${book_id}
 */
export interface BestBookmarkList {
    synckey: number,
    totalCount: number,
    items: BookmarkBest[]
    chapters: Chapter[],
}

interface BookmarkBest extends Bookmark {
    userVid: number,
    totalCount: number,
    users: User[],
}

/**
 * API: https://i.weread.qq.com/review/list?bookId=${book_id}&listType=11&mine=1&synckey=0
 */
export interface ReviewList {
    synckey: number,
    totalCount: number,
    reviews: ReviewListItem[],
    removed: [],
    atUsers: [],
    refUsers: [],
    columns: [],
    hasMore: number,
}

interface ReviewListItem {
    reviewId: string,
    review: Review
}

interface UserAuthor extends User {
    isFollowing: number,
    isFollower: number,
    isHide: number,
}

/**
 * API: https://i.weread.qq.com/review/list?bookId=${book_id}&listType=8&chapterUid=${chapter_uid}&synckey=0&listMode=3
 */
export interface ChapterReviewList extends ReviewList {
    chapterTotalCount: number,
    reviews: ChapterReviewListItem[],
}

interface ChapterReviewListItem extends ReviewListItem {
    review: ChapterReview,
    likesCount?: number,
}

interface ChapterReview extends Review {
    chapterIdx: number,
    chapterTitle: string,
}

/**
 * API: https://i.weread.qq.com/readdetail || ${baseUrl}/readdetail&baseTimestamp...
 */
export interface ReadDetail {
    monthTimeSummary?: MonthTimeSummary[],
    yearReports?: YearReport[],
    datas: ReadDetailData[],
    hasMore: number,
    isNewest: number,
    validDayMinSecond: number,
}

interface YearReport {
    timestamp: number,
    url: string,
    logo: string,
}

interface MonthTimeSummary {
    monthTimestamp: number,     // Unix 时间戳, 单位：s
    monthTotalReadTime: number,
    timeSample: number[],
}

interface ReadDetailData {
    baseTimestamp: number,
    timeMeta: {
        lastTotalReadTime: number,
        totalReadTime: number,
        readTimeList: number[],
        totalCount: number,
    },
    readMeta: {
        bookFinish: number,
        bookRead: number,
        notes: number,
        words: number,
        books: [],              // todo: 数据不足, 可能是 Book
    }
}

/**
 * API: https://i.weread.qq.com/readdata/summary?synckey=0
 */
export interface ReadData {
    readTimes: { [timestamp: string]: number },
    synckey: number,
    registTime: number,
}  
