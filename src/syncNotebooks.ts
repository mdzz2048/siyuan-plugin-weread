import { showMessage } from "siyuan";
import { client } from "./api/siyuan";
import { WereadConfig } from "./types/config";
import { ChapterNoteCard } from "./types/card";
import { BookmarkBest, BookmarkSelf, Metadata, Review } from "./types/weread";
import { getMetadataList, getChapterNoteCardList, parseTimeStamp } from "./utils/parse";
import { sendRequest } from "./utils/network";

/* ------------------------ 导入函数 ------------------------ */

// 导入热门标注
// todo: remove
export async function syncBestNotes(bookId: string, metadata: Metadata, chapterCardList: ChapterNoteCard[], config: WereadConfig) {
    const rootId = await isAttrsExist('custom', bookId, 'custom-book-id-best-highlight');
    // 获取待导入内容
    const docData = config.siyuan.importType === "1"
        ? await parseChapterDoc(config, chapterCardList)
        : await parseDoc(config, chapterCardList)
    const docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata);

    if (!rootId) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let path = config.siyuan.savePath 
            ? config.siyuan.savePath + '/热门标注/' + metadata.book.title
            : '/热门标注/' + metadata.book.title;
        let docAttr = {
            'custom-book-id-best-highlight': bookId
        }
        const rootId = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
        await updateDoc(rootId, `${docTemplate}\n\n${docData}\n\n{: custom-book-id-best-highlight=\"${bookId}\"}`);
    } else {
        // 文档粒度的覆盖更新
        await updateDoc(rootId, `${docTemplate}\n\n${docData}\n\n{: custom-book-id-best-highlight=\"${bookId}\"}`);
    }
}

// 单本导入
export async function syncNotebook(bookId: string, metadata: Metadata, config: WereadConfig) {
    const rootId = await isAttrsExist('doc', bookId);
    const chapterCardList = await getChapterNoteCardList(bookId);
    // 获取待导入内容
    const docData = config.siyuan.importType === "1"
        ? await parseChapterDoc(config, chapterCardList)
        : await parseDoc(config, chapterCardList)
    const docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata);

    if (!rootId) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let path = config.siyuan.savePath 
            ? config.siyuan.savePath + '/' + metadata.book.title
            : '/' + metadata.book.title;
        let docAttr = {
            'custom-book-id': bookId
        }
        const rootId = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
        await updateDoc(rootId, `${docTemplate}\n\n${docData}\n\n{: custom-book-id=\"${bookId}\"}`);
    } else {
        // 文档粒度的覆盖更新
        await updateDoc(rootId, `${docTemplate}\n\n${docData}\n\n{: custom-book-id=\"${bookId}\"}`);
    }
}

// 全部导入
export async function syncNotebooks(config: WereadConfig) {
    showMessage('正在导入……');
    
    const notebookList = await getMetadataList();
    const bodyList = notebookList.map(notebook => [notebook.bookId, notebook, config])
    // 控制并发
    sendRequest(5, bodyList, syncNotebook, () => {
        console.log("导入完成")
    })

    showMessage('导入完成')
}

/* ------------------------ 工具函数 ------------------------ */

// 根据属性查找
type DataType = "doc" | "bookmark" | "review" | "custom";
export async function isAttrsExist(type: DataType, weread_id: string, attr?: string) {
    const stmt = {
        'doc': `SELECT * FROM attributes WHERE name='custom-book-id' AND value='${weread_id}'`, 
        'bookmark': `SELECT * FROM attributes WHERE name='custom-bookmark-id' AND value='${weread_id}'`, 
        'review': `SELECT * FROM attributes WHERE name='custom-review-id' AND value='${weread_id}'`, 
        'custom': `SELECT * FROM attributes WHERE name='${attr}' AND value='${weread_id}'`
    }
    let response = await client.sql({ stmt: stmt[type] });
    let result = response.data;
    let block_id = result.length >= 1 ? result[0]['block_id'] : '';

    return block_id;
}

// 初次创建
export async function creatDoc(notebook: string, docTemplate :string, attrs: { [key: string]: string; }, path: string = '/') {
    let response = await client.createDocWithMd({
        notebook: notebook, 
        path: path, 
        markdown: docTemplate, 
    })
    let block_id = response.data; 
    await client.setBlockAttrs({
        id: block_id, 
        attrs: attrs
    });
    return block_id;
}

// 后续更新
export async function updateDoc(block_id: string, data: string) {
    let response = await client.getBlockAttrs({ id: block_id });
    let attr = response.data;
    client.updateBlock({
        dataType: "markdown", 
        data: data, 
        id: block_id, 
    });
    client.setBlockAttrs({
        id: block_id, 
        attrs: attr, 
    });
}

/* ------------------------ 模板参数匹配 ------------------------*/

export function parseMetadataTemplate(template: string, book: Metadata) {
    const dict = {
        '{{bookId}}': book.bookId,
        '{{author}}': book.book.author,
        '{{title}}': book.book.title,
        '{{bookVersion}}': book.book.bookVersion,
        '{{bookmarkCount}}': book.bookmarkCount,
        '{{category}}': book.book.category,
        '{{cover}}': book.book.cover,
        '{{format}}': book.book.format,
        '{{noteCount}}': book.noteCount, 
        '{{reviewCount}}': book.reviewCount, 
        '{{publishTime}}': book.book.publishTime,
        '{{readUpdateTime}}': book.sort,
        '{{intro}}': book.book.intro,
        '{{isbn}}': book.book.isbn,
        '{{publisher}}': book.book.publisher,
        '{{totalWords}}': book.book.totalWords,
    }
    const description = {
        '{{bookId}}': '书籍 ID: ', 
        '{{author}}': '作者: ', 
        '{{bookVersion}}': '书籍版本: ',  
        '{{bookmarkCount}}': '标注数量: ', 
        '{{category}}': '书籍类别: ', 
        '{{cover}}': '', 
        '{{format}}': '书籍格式: ', 
        '{{intro}}': '简介: ', 
        '{{isbn}}': 'ISBN: ', 
        '{{noteCount}}': '笔记数量: ', 
        '{{publishTime}}': '出版时间: ', 
        '{{publisher}}': '出版社: ', 
        '{{reviewCount}}': '想法数量: ', 
        '{{readUpdateTime}}': '最后阅读时间: ', 
        '{{title}}': '', 
        '{{totalWords}}': '总字数: '
    }

    for (let key in dict) {
        if (key === '{{cover}}') {
            template = template.replace(key, `<center><img src="${dict[key]}" width="180"></center>`);
        } else {
            template = template.replace(key, `<center>${description[key]}${dict[key]}</center>`);
        }
    }
    template = `<div>${template}</div>`

    return template;
}

export async function parseHighlightTemplate(template: string, bookmark: BookmarkSelf, chapterTitle?: string) {
    const create_time = parseTimeStamp(bookmark.createTime);
    const bookmark_id = bookmark.bookmarkId;
    const dict = {
        '{{bookId}}': bookmark.bookId,
        '{{bookVersion}}': bookmark.bookVersion,
        '{{chapterUid}}': bookmark.chapterUid,
        '{{chapterTitle}}': chapterTitle,
        '{{bookmarkId}}': bookmark.bookmarkId,
        '{{markText}}': bookmark.markText,
        '{{createTime}}': create_time,
        '{{style}}': bookmark.style,
        '{{type}}': bookmark.type,
        '{{range}}': bookmark.range,
    }

    for (let key in dict) {
        if (key == '{{markText}}') {
            let quote = dict[key]
                .split('\n\n')
                .map((quote) => '> ' + quote.trim())
                .join('\n> \n');
            template = template.replace(key, quote);
        } else {
            template = template.replace(key, dict[key]);
        }
    }

    // 保留导入过的 ID
    let attr = '';
    let highlight_parsed = `{{{row\n${template}\n}}}`;
    let block_id = await isAttrsExist('bookmark', bookmark.bookmarkId);
    if (block_id) {
        attr = `{: id=\"${block_id}\" custom-bookmark-id=\"${bookmark_id}\" custom-created-time=\"${create_time}\"}`;
    } else {
        attr = `{: custom-bookmark-id=\"${bookmark_id}\" custom-created-time=\"${create_time}\"}`;
    }

    // 返回 Kramdown 格式
    return `${highlight_parsed}\n${attr}`;
}

export async function parseBestHighlightTemplate(template: string, bookmark: BookmarkBest, chapterTitle?: string) {
    const bookmark_id = bookmark.bookmarkId;
    const dict = {
        '{{bookId}}': bookmark.bookId,
        '{{chapterUid}}': bookmark.chapterUid,
        '{{chapterTitle}}': chapterTitle,
        '{{bookmarkId}}': bookmark.bookmarkId,
        '{{markText}}': bookmark.markText,
        '{{totalCount}}': bookmark.totalCount,
    }

    for (let key in dict) {
        if (key == '{{markText}}') {
            let quote = dict[key]
                .split('\n\n')
                .map((quote) => '> ' + quote.trim())
                .join('\n> \n');
            template = template.replace(key, quote);
        } else {
            template = template.replace(key, dict[key]);
        }
    }

    // 保留导入过的 ID
    let attr = '';
    let highlight_parsed = `{{{row\n${template}\n}}}`;
    let block_id = await isAttrsExist('bookmark', bookmark.bookmarkId);
    if (block_id) {
        attr = `{: id=\"${block_id}\" custom-bookmark-id=\"${bookmark_id}\"}`;
    } else {
        attr = `{: custom-bookmark-id=\"${bookmark_id}\"}`;
    }

    // 返回 Kramdown 格式
    return `${highlight_parsed}\n${attr}`;
}

export async function parseReviewTemplate(template: string, review: Review) {
    const create_time = parseTimeStamp(review.createTime);
    const review_id = review.reviewId;
    const dict = {
        '{{bookId}}': review.bookId,
        '{{bookVersion}}': review.bookVersion,
        '{{reviewId}}': review.reviewId,
        '{{abstract}}': review.abstract,
        '{{content}}': review.content,
        '{{chapterUid}}': review.chapterUid,
        '{{chapterTitle}}': review.chapterTitle,
        '{{createTime}}': create_time,
        // '{{atUserVids}}': review.atUserVids,
        // '{{type}}': review.type,
        // '{{range}}': review.range,
    }

    for (let key in dict) {
        if (key == '{{abstract}}') {
            let quote = dict[key]
                .split('\n\n')
                .map((quote) => '> ' + quote.trim())
                .join('\n> \n');
            template = template.replace(key, quote);
        } else if (key == '{{content}}') {
            let note = dict[key]
                .split('\n\n')
                .map((note) => '- ' + note.trim())
                .join('\n\n');
            template = template.replace(key, note);
        } else {
            template = template.replace(key, dict[key]);
        }
    }

    // 保留导入过的 ID
    let attr = '';
    let review_parsed = `{{{row\n${template}\n}}}`;
    let block_id = await isAttrsExist('review', review.reviewId);
    if (block_id) {
        attr = `{: id=\"${block_id}\" custom-review-id=\"${review_id}\" custom-created-time=\"${create_time}\"}`;
    } else {
        attr = `{: custom-review-id=\"${review_id}\" custom-created-time=\"${create_time}\"}`;
    }

    // 返回 Kramdown 格式
    return `${review_parsed}\n${attr}`;
}

/* ------------------------ 导入辅助函数 ------------------------ */

// 含章节标题
async function parseChapterDoc(config: WereadConfig, chapterCardList: ChapterNoteCard[]): Promise<string> {
    const parsedChapterList: string[] = [];
    for (const chapter of chapterCardList) {
        const title = chapter.chapterTitle;
        const uid = chapter.chapterUid;
        const noteList = chapter.chapterCards;
        const parsedNote = [];
        let template = "";
        for (const note of noteList) {
            switch (note.value) {
                case "bookmark":
                    template = config.siyuan.highlightTemplate;
                    const bookmark = note.data as BookmarkSelf
                    console.log('parseChapterDoc', bookmark)
                    const parsedBookmark = await parseHighlightTemplate(template, bookmark, chapter.chapterTitle);
                    parsedNote.push(parsedBookmark);
                    break;
                case "review":
                    template = config.siyuan.noteTemplate;
                    const review = note.data as Review
                    const parsedReview = await parseReviewTemplate(template, review);
                    parsedNote.push(parsedReview);
                    break;
                case "bestBookmark":
                    template = config.siyuan.bestHighlightTemplate;
                    const bestBookmark = note.data as BookmarkBest
                    const parsedBestBookmark = await parseBestHighlightTemplate(template, bestBookmark, chapter.chapterTitle)
                    parsedNote.push(parsedBestBookmark);
                    break;
                default:
                    console.log("笔记解析失败!", note);
            }
        }
        let parsedChapter = `# ${title}\n\n{: custom-chapter-id=\"${uid}\"}\n\n${parsedNote.join('\n\n')}`;
        parsedChapterList.push(parsedChapter);
    }
    return parsedChapterList.join('\n\n');
}

// 无章节标题
async function parseDoc(config: WereadConfig, chapterCardList: ChapterNoteCard[]) {
    const parsedReviewList = [];
    const parsedBookmarkList = [];
    let template = "";
    for (const chapter of chapterCardList) {
        for (const note of chapter.chapterCards) {
            switch (note.value) {
                case "bookmark":
                    template = config.siyuan.highlightTemplate;
                    const bookmark = note.data as BookmarkSelf
                    const parsedBookmark = await parseHighlightTemplate(template, bookmark, chapter.chapterTitle);
                    parsedBookmarkList.push(parsedBookmark);
                    break;
                case "review":
                    template = config.siyuan.noteTemplate;
                    const review = note.data as Review
                    const parsedReview = await parseReviewTemplate(template, review);
                    parsedReviewList.push(parsedReview);
                    break;
                case "bestBookmark":
                    // 不导入热门标注
                    break;
                default:
                    console.log("笔记解析失败!", note);

            }
        }
    }
    return parsedBookmarkList.join('\n\n') + "\n\n" + parsedReviewList.join('\n\n');
}
