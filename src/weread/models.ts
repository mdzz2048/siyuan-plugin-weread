export type Notebook = {
	metaData: Metadata;
	chapterHighlights: ChapterHighlight[];
	chapterReviews: ChapterReview[];
};

export type Metadata = {
    bookId: string;			// 书籍 ID
	bookVersion: number		// 书籍版本
	title: string;			// 书名
	author: string;			// 作者
	cover: string;			// 封面 URL
	isbn?: string;			// ISBN
	intro?: string;			// 简介
    format?: string;		// 书籍格式
	publishTime?: string;	// 出版时间
	category?: string;		// 书籍类别
	publisher?: string;		// 出版社
	readUpdateTime?: number // 最后阅读时间
	reviewCount?: number;	// 想法数量
	bookmarkCount?: number;	// 标注数量?
	noteCount?: number;		// 笔记数量?
}

export type Highlight = {
	bookId: string;			// 书籍 ID
	bookVersion?: number;	// 书籍版本
	chapterUid: number;		// 章节 ID
	chapterTitle: string;	// 章节标题
	bookmarkId: string;		// 标记 ID
	markText: string; 		// 标记文本
	createTime: number;		// 创建时间
	style?: number;			// 样式 ID
	type?: number;			// * 功能不明
	range?: string;			// * 章节定位
}

export type ChapterHighlight = {
	chapterUid: number;
	chapterTitle: string;
	chapterHighlightCount: number;
	chapterHighlights: Highlight[];
}

export type BestHighlight = {
	bookId: string;			// 书籍 ID
	chapterUid: number;		// 章节 ID
	chapterTitle: string;	// 章节标题
	bookmarkId: string;		// 标记 ID
	markText: string; 		// 标记文本
	totalCount: number		// 标注人数
}

export type ChapterBestHighlight = {
	chapterUid: number;
	chapterTitle: string;
	chapterHighlightCount: number;
	chapterHighlights: BestHighlight[];
}

export type Review = {
	reviewId: string;		// 想法 ID
	abstract?: string;		// 标注内容
	content?: string;		// 你的想法
	bookId: string;			// 书籍 ID
	bookVersion?: number;	// 书籍版本
	chapterUid: number;		// 章节 ID
	chapterTitle: string;	// 章节标题
	createTime: number;		// 创建时间
	atUserVids?: any;		// * 用户 ID，暂时用不到
	type?: number;			// * 功能不明
	range?: string;			// * 章节定位
}

export type ChapterReview = {
	chapterUid: number;
	chapterTitle: string;
	chapterReviewCount: number;
	chapterReviews: Review[];
};

export type Note = {
	id: string;				// 想法或标注 ID
	text?: string;			// 标注内容
	note?: string;			// 你的想法
	bookId: string;			// 书籍 ID
	bookVersion?: number;	// 书籍版本
	chapterUid: number;		// 章节 ID
	chapterTitle: string;	// 章节标题
	createTime: number;		// 创建时间
	isHighlight?: boolean	// 是否为标注
	style?: number;			// 样式 ID
	atUserVids?: any;		// * 用户 ID，暂时用不到
	type?: number;			// * 功能不明
	range?: string;			// * 章节定位
}

export type ChapterNotes = {
	chapterUid: number;
	chapterTitle: string;
	chapterNoteCount: number;
	chapterNotes: Note[];
};