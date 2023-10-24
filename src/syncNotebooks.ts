import { showMessage } from "siyuan";
import { getMetadatas, getHighlights, getReviews, parseTimeStamp, getChapterNotes, getChapterBestHighlights, getBookMetadata } from "./utils/parseResponse";
import type { Highlight, Review, Metadata, Note, BestHighlight } from "weread";
import { 
    createDocWithMd, 
    sql, 
    getBlockAttrs, 
    setBlockAttrs, 
    updateBlock, 
} from "./api/siyuan";


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
    let response = await sql(stmt[type]);
    let block_id = response.length >= 1 ? response[0]['block_id'] : '';

    return block_id;
}

// 初次创建
export async function creatDoc(notebook: string, docTemplate :string, attrs: { [key: string]: string; }, path: string = '/') {
    let block_id = await createDocWithMd(notebook, path, docTemplate);
    await setBlockAttrs(block_id, attrs);
    return block_id;
}

// 后续更新
export async function updateDoc(block_id: string, data: string) {
    let attr = await getBlockAttrs(block_id);
    updateBlock('markdown', data, block_id);
    setBlockAttrs(block_id, attr);
}

export async function updateNote(block_id: string, data: string) {
    let attr = await getBlockAttrs(block_id);
    await updateBlock('markdown', data, block_id);
    await setBlockAttrs(block_id, attr);
}

function Note2Highlight(note: Note) {
    const highlight: Highlight = {
        bookId: note.bookId, 
        bookVersion: note.bookVersion, 
        chapterUid: note.chapterUid, 
        chapterTitle: note.chapterTitle, 
        bookmarkId: note.id, 
        markText: note.text, 
        createTime: note.createTime, 
        style: note.style, 
        type: note.type, 
        range: note.range
    }
    return highlight;
}

function Note2Review(note: Note) {
    const review: Review = {
        reviewId: note.id, 
        abstract: note.text, 
        content: note.note, 
        bookId: note.bookId, 
        bookVersion: note.bookVersion, 
        chapterUid: note.chapterUid, 
        chapterTitle: note.chapterTitle, 
        createTime: note.createTime, 
        atUserVids: note.atUserVids, 
        type: note.type, 
        range: note.range
    }
    return review;
}

/* ------------------------ 模板参数匹配 ------------------------*/

export function parseMetadataTemplate(template: string, object: Metadata) {
    const dict = {
        '{{bookId}}': object.bookId, 
        '{{author}}': object.author, 
        '{{bookVersion}}': object.bookVersion,  
        '{{bookmarkCount}}': object.bookmarkCount, 
        '{{category}}': object.category, 
        '{{cover}}': object.cover, 
        '{{format}}': object.format, 
        '{{intro}}': object.intro, 
        '{{isbn}}': object.isbn, 
        '{{noteCount}}': object.noteCount, 
        '{{publishTime}}': object.publishTime, 
        '{{publisher}}': object.publisher, 
        '{{reviewCount}}': object.reviewCount, 
        '{{readUpdateTime}}': object.readUpdateTime, 
        '{{title}}': object.title, 
        '{{totalWords}}': object.totalWords
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

export async function parseHighlightTemplate(template: string, object: Highlight) {
    const create_time = parseTimeStamp(object.createTime);
    const bookmark_id = object.bookmarkId;
    const dict = {
        '{{bookId}}': object.bookId, 
        '{{bookVersion}}': object.bookVersion,  
        '{{chapterUid}}': object.chapterUid, 
        '{{chapterTitle}}': object.chapterTitle, 
        '{{bookmarkId}}': object.bookmarkId, 
        '{{markText}}': object.markText, 
        '{{markRowText}}': object.markText,
        '{{createTime}}': create_time, 
        '{{style}}': object.style, 
        '{{type}}': object.type, 
        '{{range}}': object.range, 
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
    let block_id = await isAttrsExist('bookmark', object.bookmarkId);
    if (block_id) {
        attr = `{: id=\"${block_id}\" custom-bookmark-id=\"${bookmark_id}\" custom-created-time=\"${create_time}\"}`;
    } else {
        attr = `{: custom-bookmark-id=\"${bookmark_id}\" custom-created-time=\"${create_time}\"}`;
    }

    // 返回 Kramdown 格式
    return `${highlight_parsed}\n${attr}`;
}

export async function parseBestHighlightTemplate(template: string, object: BestHighlight) {
    const bookmark_id = object.bookmarkId;
    const dict = {
        '{{bookId}}': object.bookId, 
        '{{chapterUid}}': object.chapterUid, 
        '{{chapterTitle}}': object.chapterTitle, 
        '{{bookmarkId}}': object.bookmarkId, 
        '{{markText}}': object.markText, 
        '{{markRowText}}': object.markText,
        '{{totalCount}}': object.totalCount
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
    let block_id = await isAttrsExist('bookmark', object.bookmarkId);
    if (block_id) {
        attr = `{: id=\"${block_id}\" custom-bookmark-id=\"${bookmark_id}\"}`;
    } else {
        attr = `{: custom-bookmark-id=\"${bookmark_id}\"}`;
    }

    // 返回 Kramdown 格式
    return `${highlight_parsed}\n${attr}`;
}

export async function parseReviewTemplate(template: string, object: Review) {
    const create_time = parseTimeStamp(object.createTime);
    const review_id = object.reviewId;
    const dict = {
        '{{bookId}}': object.bookId, 
        '{{bookVersion}}': object.bookVersion,  
        '{{reviewId}}': object.reviewId, 
        '{{abstract}}': object.abstract, 
        '{{content}}': object.content, 
        '{{chapterUid}}': object.chapterUid, 
        '{{chapterTitle}}': object.chapterTitle, 
        '{{createTime}}': create_time, 
        '{{atUserVids}}': object.atUserVids, 
        '{{type}}': object.type, 
        '{{range}}': object.range, 
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
    let block_id = await isAttrsExist('review', object.reviewId);
    if (block_id) {
        attr = `{: id=\"${block_id}\" custom-review-id=\"${review_id}\" custom-created-time=\"${create_time}\"}`;
    } else {
        attr = `{: custom-review-id=\"${review_id}\" custom-created-time=\"${create_time}\"}`;
    }

    // 返回 Kramdown 格式
    return `${review_parsed}\n${attr}`;
}


/* ------------------------ 导入函数 ------------------------ */

// 含章节标题
async function getDoc1 (book_id: string, config: any, highlights?: Highlight[], reviews?: Review[]) {
    let chapters = await getChapterNotes(book_id);
    let chapters_parsed = [];
    for (const chapter of chapters) {
        let title = chapter.chapterTitle;
        let uid = chapter.chapterUid;
        let notes = chapter.chapterNotes;
        let notes_parsed = [];
        for (const note of notes) {
            let highlight = highlights
                ? highlights.filter(highlight => highlight.bookmarkId === note.id)[0]
                : false;
            let review = reviews
                ? reviews.filter(review => review.reviewId === note.id)[0]
                : false;
            if (highlight) {
                let highlight_parsed = await parseHighlightTemplate(config.siyuan.highlightTemplate, highlight);
                notes_parsed.push(highlight_parsed);
            }
            if (review) {
                let review_parsed = await parseReviewTemplate(config.siyuan.noteTemplate, review);
                notes_parsed.push(review_parsed);
            }
            if (note.isHighlight && !reviews && !highlights) {
                let highlight = Note2Highlight(note);
                let highlight_parsed = await parseHighlightTemplate(config.siyuan.highlightTemplate, highlight);
                notes_parsed.push(highlight_parsed);
            }
            if (!note.isHighlight && !reviews && !highlights) {
                let review = Note2Review(note);
                let review_parsed = await parseReviewTemplate(config.siyuan.noteTemplate, review);
                notes_parsed.push(review_parsed);
            }
        }
        let chapter_parsed = `# ${title}\n\n{: custom-chapter-id=\"${uid}\"}\n\n${notes_parsed.join('\n\n')}`;
        chapters_parsed.push(chapter_parsed);
    }
    return chapters_parsed.join('\n\n');
}

// 无章节标题
async function getDoc2 (config: any, highlights?: Highlight[], reviews?: Review[], book_id?: string) {
    if (!highlights && !reviews && book_id) {
        // 单本导入，补全 highlights 和 reviews 信息
        highlights = await getHighlights(book_id);
        reviews = await getReviews(book_id);
    }
    let highlight = highlights
        .map(async (highlight) => await parseHighlightTemplate(config.siyuan.highlightTemplate, highlight))
        .join('\n\n');
    let review = reviews
        .map(async (review) => await parseReviewTemplate(config.siyuan.noteTemplate, review))
        .join('\n\n');

    return highlight + "\n\n" + review;
}


// 部分导入
export async function syncNotes(book_id: string, metadata: Metadata, highlights: Highlight[], reviews: Review[], config: any) {
    let root_id = await isAttrsExist('doc', book_id);
    let import_with_chapter = config.siyuan.importType;

    // 获取待导入内容
    let docData = '';
    let docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata);
    if (import_with_chapter == 1) {
        // 含章节标题
        docData = await getDoc1(book_id, config, highlights, reviews);
    } else {
        // 无章节标题
        docData = await getDoc2(config, highlights, reviews);
    }

    if (!root_id) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let path = config.siyuan.savePath 
            ? config.siyuan.savePath + '/' + metadata.title
            : '/' + metadata.title;
        let docAttr = {
            'custom-book-id': book_id
        }
        root_id = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
        await updateDoc(root_id, `${docTemplate}\n\n${docData}\n\n{: custom-book-id=\"${book_id}\"}`);
    } else {
        // 文档粒度的覆盖更新
        await updateDoc(root_id, `${docTemplate}\n\n${docData}\n\n{: custom-book-id=\"${book_id}\"}`);
    }
}

// 导入热门标注
export async function syncBestNotes(book_id: string, metadata: Metadata, best_highlights: BestHighlight[], config: any) {
    let root_id = await isAttrsExist('custom', book_id, 'custom-book-id-best-highlight');
    let import_with_chapter = config.siyuan.importType;

    // 获取待导入内容
    let docData = '';
    let docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata);
    if (import_with_chapter == 1) {
        // 含章节标题
        let chapters = await getChapterBestHighlights(book_id);
        let chapters_parsed = [];
        for (const chapter of chapters) {
            let title = chapter.chapterTitle;
            let uid = chapter.chapterUid;
            let highlights = chapter.chapterHighlights;
            let highlights_parsed = [];
            for (const highlight of highlights) {
                let best_highlight_parsed = await parseBestHighlightTemplate(config.siyuan.bestHighlightTemplate, highlight);
                highlights_parsed.push(best_highlight_parsed);
            }
            let chapter_parsed = `# ${title}\n\n{: custom-chapter-id=\"${uid}\"}\n\n${highlights_parsed.join('\n\n')}`;
            chapters_parsed.push(chapter_parsed);
        }
        docData = chapters_parsed.join('\n\n');
    } else {
        // 无章节标题
        docData = best_highlights
            .map(async (highlight) => await parseBestHighlightTemplate(config.siyuan.bestHighlightTemplate, highlight))
            .join('\n\n');
    }

    if (!root_id) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let path = config.siyuan.savePath 
            ? config.siyuan.savePath + '/热门标注/' + metadata.title
            : '/热门标注/' + metadata.title;
        let docAttr = {
            'custom-book-id-best-highlight': book_id
        }
        root_id = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
        await updateDoc(root_id, `${docTemplate}\n\n${docData}\n\n{: custom-book-id-best-highlight=\"${book_id}\"}`);
    } else {
        // 文档粒度的覆盖更新
        await updateDoc(root_id, `${docTemplate}\n\n${docData}\n\n{: custom-book-id-best-highlight=\"${book_id}\"}`);
    }
}

// 单本导入
export async function syncNotebook(book_id: string, metadata: Metadata, config: any) {
    let root_id = await isAttrsExist('doc', book_id);
    let import_with_chapter = config.siyuan.importType;

    // 获取待导入内容
    let docData = '';
    let docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata);
    if (import_with_chapter == 1) {
        // 含章节标题
        docData = await getDoc1(book_id, config);
    } else {
        // 无章节标题
        docData = await getDoc2(config, [], [], book_id);
    }

    if (!root_id) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let path = config.siyuan.savePath 
            ? config.siyuan.savePath + '/' + metadata.title
            : '/' + metadata.title;
        let docAttr = {
            'custom-book-id': book_id
        }
        root_id = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
        await updateDoc(root_id, `${docTemplate}\n\n${docData}\n\n{: custom-book-id=\"${book_id}\"}`);
    } else {
        // 文档粒度的覆盖更新
        await updateDoc(root_id, `${docTemplate}\n\n${docData}\n\n{: custom-book-id=\"${book_id}\"}`);
    }
}

// 全部导入
export async function syncNotebooks(config: any) {
    showMessage('正在导入全部标注和笔记，这需要一段时间，请耐心等候……');

    let metadatas = await getMetadatas();
    for (let metadata of metadatas) {
        let book_id = metadata.bookId;
        let book_name = metadata.title;
        // getNotebooks() 获取的信息不全，需要用 getBookInfos() 补全
        metadata = await getBookMetadata(book_id);
        console.log(`正在导入：${book_name}`)
        await syncNotebook(book_id, metadata, config);
    }

    showMessage('已导入全部标注和笔记！')
}