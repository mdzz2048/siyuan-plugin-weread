export interface book {
    bookId: string;         // 书籍 ID
	title: string;			// 书名
	cover: string;			// 封面 URL
	author?: string;		// 作者
	isbn?: string;			// ISBN
	intro?: string;			// 简介
	publishTime?: string;	// 出版时间
	publisher?: string;		// 出版社
    createTime?:number      // 创建时间
	lastReadTime?: number   // 最后阅读时间
	reviewCount?: number;	// 想法数量
	bookmarkCount?: number;	// 标注数量?
	noteCount?: number;		// 笔记数量?
	totalWords?: number;	// 书籍总字数
    tags?: number;          // 自定义-星级
    note?: string;          // 自定义-评价
}

export interface FileDetail {
	id: string | number;
	parentId: string | number;
	fileName: string;
	fileType: number;
	childFiles?: Array<FileDetail>;
}