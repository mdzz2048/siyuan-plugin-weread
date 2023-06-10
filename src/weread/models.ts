export type Highlight = {
	bookmarkId: string;
	created: number;
	createTime: string;
	chapterUid: number;
	chapterTitle: string;
	markText: string;
	style: number;
	reviewContent?: string;
	range: string;
}

export type ChapterHighlight = {
	chapterUid: number;
	chapterTitle: string;
	chapterReviewCount: number;
	highlights: Highlight[];
}

export type Metadata = {
    bookId: string;
	title: string;
	author: string;
	cover: string;
    format?: string;
	url: string;
	publishTime: string;
	reviewCount: number;
	isbn?: string;
	category?: string;
	publisher?: string;
	intro?: string;
	duplicate?: boolean;
	lastReadDate: string;
}

export type Review = {
    reviewId: string;
	chapterUid?: number;
	chapterTitle?: string;
	created: number;
	createTime: string;
	content: string;
	mdContent?: string;
	abstract?: string;
	range?: string;
	type: number;
}

export type BookReview = {
	chapterReviews: ChapterReview[];
	bookReviews: Review[];
};

export type ChapterReview = {
	chapterUid: number;
	chapterTitle: string;
	chapterReviews?: Review[];
	reviews: Review[];
};