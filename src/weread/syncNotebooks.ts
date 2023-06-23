import { showMessage } from "siyuan";
import { getMetadatas, getHighlights, getReviews, parseTimeStamp, getChapterNotes } from "../utils/parseResponse";
import type { Highlight, Review, Metadata, Note } from "./models";
import { 
    createDocWithMd, 
    sql, 
    getBlockAttrs, 
    setBlockAttrs, 
    updateBlock, 
} from "../api";


/* ------------------------ 工具函数 ------------------------ */

// 根据属性查找
type DataType = "doc" | "bookmark" | "review";
export async function isAttrsExist(type: DataType, weread_id: string) {
    const stmt = {
        'doc': `SELECT * FROM attributes WHERE name='custom-book-id' AND value='${weread_id}'`, 
        'bookmark': `SELECT * FROM attributes WHERE name='custom-bookmark-id' AND value='${weread_id}'`, 
        'review': `SELECT * FROM attributes WHERE name='custom-review-id' AND value='${weread_id}'`
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
        abstract: note.note, 
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

export function parseMetadataTemplate(template: string, object: Metadata)  {
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

export function parseHighlightTemplate(template: string, object: Highlight)  {
    const create_time = parseTimeStamp(object.createTime);
    const bookmark_id = object.bookmarkId;
    const dict = {
        '{{bookId}}': object.bookId, 
        '{{bookVersion}}': object.bookVersion,  
        '{{chapterUid}}': object.chapterUid, 
        '{{chapterTitle}}': object.chapterTitle, 
        '{{bookmarkId}}': object.bookmarkId, 
        '{{markText}}': object.markText, 
        '{{createTime}}': object.createTime, 
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
    // 返回 Kramdown 格式
    return `{{{row\n${template}\n}}}\n{: custom-bookmark-id=\"${bookmark_id}\" custom-created-time=\"${create_time}\"}`
}

export function parseReviewTemplate(template: string, object: Review)  {
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
        '{{createTime}}': object.createTime, 
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
    // 返回 Kramdown 格式
    return `{{{row\n${template}\n}}}\n{: custom-review-id=\"${review_id}\" custom-created-time=\"${create_time}\"}`
}


/* ------------------------ 导入函数 ------------------------ */

// 部分导入
export async function syncNotes(book_id: string, metadata: Metadata, highlights: Highlight[], reviews: Review[], config: any) {
    let root_id = await isAttrsExist('doc', book_id);
    let import_with_chapter = config.siyuan.importType;

    if (!root_id) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata)
        let path = '/' + metadata.title;
        let docAttr = {
            'custom-book-id': book_id
        }
        root_id = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
    } else {
        // 文档粒度的覆盖更新
        let doc = parseMetadataTemplate(config.siyuan.docTemplate, metadata);
        if (import_with_chapter == 1) {
            // 含章节标题
            let chapters = await getChapterNotes(book_id);
            let chapters_parsed = [];
            for (const chapter of chapters) {
                let title = chapter.chapterTitle;
                let uid = chapter.chapterUid;
                let notes = chapter.chapterNotes;
                let notes_parsed = [];
                for (const note of notes) {
                    let highlight = highlights.filter(highlight => highlight.bookmarkId === note.id)[0];
                    let review = reviews.filter(review => review.reviewId === note.id)[0];
                    if (highlight) {
                        let highlight_parsed = parseHighlightTemplate(config.siyuan.highlightTemplate, highlight);
                        notes_parsed.push(highlight_parsed);
                    } else if (review) {
                        let review_parsed = parseReviewTemplate(config.siyuan.noteTemplate, review);
                        notes_parsed.push(review_parsed);
                    }
                }
                let chapter_parsed = `# ${title}\n\n{: custom-chapter-id=\"${uid}\"}\n\n${notes_parsed.join('\n\n')}`;
                chapters_parsed.push(chapter_parsed);
            }
            doc = doc + '\n\n' + chapters_parsed.join('\n\n');
        } else {
            // 无章节标题
            let highlight = highlights
                .map((highlight) => parseHighlightTemplate(config.siyuan.highlightTemplate, highlight))
                .join('\n\n');
            let review = reviews
                .map((review) => parseReviewTemplate(config.siyuan.noteTemplate, review))
                .join('\n\n');
            doc = doc + "\n\n" + highlight + "\n\n" + review;
        }
        await updateDoc(root_id, doc);
    }
}

// 单本导入
export async function syncNotebook(book_id: string, metadata: Metadata, config: any) {
    let root_id = await isAttrsExist('doc', book_id);
    let import_with_chapter = config.siyuan.importType;

    if (!root_id) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata)
        let path = '/' + metadata.title;
        let docAttr = {
            'custom-book-id': book_id
        }
        root_id = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
    } else {
        // 文档粒度的覆盖更新
        let doc = parseMetadataTemplate(config.siyuan.docTemplate, metadata);
        if (import_with_chapter == 1) {
            // 含章节标题
            let chapters = await getChapterNotes(book_id);
            let chapters_parsed = [];
            for (const chapter of chapters) {
                let title = chapter.chapterTitle;
                let uid = chapter.chapterUid;
                let notes = chapter.chapterNotes;
                let notes_parsed = [];
                for (const note of notes) {
                    if (note.isHighlight) {
                        let highlight = Note2Highlight(note);
                        let highlight_parsed = parseHighlightTemplate(config.siyuan.highlightTemplate, highlight);
                        notes_parsed.push(highlight_parsed);
                    } else {
                        let review = Note2Review(note);
                        let review_parsed = parseReviewTemplate(config.siyuan.noteTemplate, review);
                        notes_parsed.push(review_parsed);
                    }
                }
                let chapter_parsed = `# ${title}\n\n{: custom-chapter-id=\"${uid}\"}\n\n${notes_parsed.join('\n\n')}`;
                chapters_parsed.push(chapter_parsed);
            }
            doc = doc + '\n\n' + chapters_parsed.join('\n\n') + `\n{: custom-book-id=\"${book_id}\"}`;
        } else {
            // 无章节标题
            let highlights = await getHighlights(book_id);
            let reviews = await getReviews(book_id);
            let highlight = highlights
                .map((highlight) => parseHighlightTemplate(config.siyuan.highlightTemplate, highlight))
                .join('\n\n');
            let review = reviews
                .map((review) => parseReviewTemplate(config.siyuan.noteTemplate, review))
                .join('\n\n');
            doc = doc + "\n\n" + highlight + "\n\n" + review + `\n{: custom-book-id=\"${book_id}\"}`;
        }
        await updateDoc(root_id, doc);
    }
}

// 全部导入
export async function syncNotebooks(config: any) {
    showMessage('正在导入全部标注和笔记，这需要一段时间，请耐心等候……');

    let metadatas = await getMetadatas();
    for (const metadata of metadatas) {
        let book_id = metadata.bookId;
        let book_name = metadata.title;
        console.log(`正在导入：${book_name}`)
        await syncNotebook(book_id, metadata, config);
    }

    showMessage('已导入全部标注和笔记！')
}