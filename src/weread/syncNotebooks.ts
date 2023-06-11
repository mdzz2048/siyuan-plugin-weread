import { showMessage } from "siyuan";
import { getMetadatas, getHighlights, getReviews, parseTimeStamp } from "../utils/parseResponse";
import type { Highlight, Review, Metadata } from "./models";
import { 
    createDocWithMd, 
    sql, 
    appendBlock, 
    getBlockAttrs, 
    setBlockAttrs, 
    updateBlock, 
} from "../api";


/* ------------------------ 工具函数 ------------------------ */

// 根据属性查找
type DataType = "doc" | "bookmark" | "review";
export async function isAttrsExist(type: DataType, weread_id: string) {
    const stmt = {
        'doc': `SELECT * FROM attributes WHERE name='custom-book-id' AND value='${weread_id}%'`, 
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
    setTimeout(await setBlockAttrs(block_id, attrs), 500);
    return block_id;
}

export async function creatNote(parent_id: string, data: string, attrs: { [key: string]: string; }) {
    let response = await appendBlock('markdown', data, parent_id);
    let block_id = response[0].doOperations[0].id;
    setTimeout(await setBlockAttrs(block_id, attrs), 500);
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

    for (let key in dict) {
        template = template.replace(key, dict[key]);
    }

    return template.length > 0 ? template  + '---' : template;
}

export function parseHighlightTemplate(template: string, object: Highlight)  {
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

    return '{{{row\n' + template + '\n}}}';
}

export function parseReviewTemplate(template: string, object: Review)  {
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

    return '{{{row\n' + template + '\n}}}';
}


/* ------------------------ 导入函数 ------------------------ */

// 单本导入
export async function syncNotebook(book_id: string, metadata: Metadata, config: any) {
    let highlights = await getHighlights(book_id);
    let reviews = await getReviews(book_id);
    let root_id = await isAttrsExist('doc', book_id);

    if (!root_id) {
        // 需要新建微信读书文档（没有找到符合自定义属性的文档）
        let docTemplate = parseMetadataTemplate(config.siyuan.docTemplate, metadata)
        let path = '/' + metadata.title;
        let docAttr = {
            'custom-book-id': book_id
        }
        root_id = await creatDoc(config.siyuan.notebook, docTemplate, docAttr, path);
    }
    for (const highlight of highlights) {
        let block_id = await isAttrsExist("bookmark", highlight.bookmarkId);
        let highlightTemplate = parseHighlightTemplate(config.siyuan.highlightTemplate, highlight);
        let highlightAttr = {
            'custom-bookmark-id': highlight.bookmarkId, 
            'custom-created-time': parseTimeStamp(highlight.createTime)
        }
        if (block_id) { // 标注之前发送过（存在对应的自定义属性）
            await updateNote(block_id, highlightTemplate);
        } else {
            block_id = await creatNote(root_id, highlightTemplate, highlightAttr);
        }
    }
    for (const review of reviews) {
        let block_id = await isAttrsExist("review", review.reviewId);
        let reviewTemplate = parseReviewTemplate(config.siyuan.noteTemplate, review);
        let reviewAttr = {
            'custom-review-id': review.reviewId, 
            'custom-created-time': parseTimeStamp(review.createTime)
        }
        if (block_id) { // 想法之前发送过（存在对应的自定义属性）
            await updateNote(block_id, reviewTemplate);
        } else {
            block_id = await creatNote(root_id, reviewTemplate, reviewAttr); 
        }
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