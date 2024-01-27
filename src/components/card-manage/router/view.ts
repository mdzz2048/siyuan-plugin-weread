
import { showMessage } from "siyuan"
import { isAttrsExist } from "../../../syncNotebooks"
import { ChapterNoteCard, NoteCard } from "../../../types/card"
import { Metadata } from "../../../types/weread"
import { CustomMouseMenu, CustomMouseMenuOptions } from "../commonMenu"
import { getPcUrl } from "../../../utils/parse"
import { getReadData, getReadDetail, getReadInfo } from "../../../api/weread"

export const getBookNoteCount = (book: Metadata) => {
    return book?.bookmarkCount + book?.noteCount + book?.reviewCount
}

/* ------------------------ 点击事件 ------------------------ */

export function clickFoldButton(event: MouseEvent) {
    const iconEle = event.target as HTMLElement
    const btnEle = iconEle.parentElement
    const fold = btnEle.getAttribute('fold')
    if (fold === "true") {
        // 展开
        btnEle.setAttribute("fold", "false")
        btnEle.firstElementChild.setAttribute("style", "transform: rotate(90deg)")
        btnEle.parentElement.nextElementSibling?.removeAttribute("style")
    } else if (fold === "false") {
        // 折叠
        btnEle.setAttribute("fold", "true")
        btnEle.firstElementChild.setAttribute("style", "")
        btnEle.parentElement.nextElementSibling?.setAttribute("style", "display: none")
    }
}
export function clickChapterLink(chapter: ChapterNoteCard) {
    const bookId = chapter.chapterCards[0]?.data.bookId ?? ""
    const chapterUid = chapter.chapterUid
    if (bookId) {
        const url = getPcUrl(bookId, chapterUid)
        console.log(url)
        window.open(url)
    } else {
        const url = "https://ld246.com"
        window.open(url)
    }
}

/* ------------------------ 菜单 ------------------------ */

export const showMenu = (e: MouseEvent, option: CustomMouseMenuOptions) => {
    e.preventDefault()
    const MouseMenuCtx = CustomMouseMenu(option)
    const { x, y } = e
    MouseMenuCtx.show(x, y)
}
export function bookMenu(data: Metadata) {
    // 浅拷贝，避免对 bookMenuOption 造成影响
    const option = { ...bookMenuOption }
    option.params = data
    return option
}
export function cardMenu(data: NoteCard) {
    // 浅拷贝，避免对 cardMenuOption 造成影响
    const option = { ...cardMenuOption }
    option.params = data
    return option
}
export function filterMenu(dom: HTMLElement) {
    filterMenuOption.el = dom
    return filterMenuOption
}
export function sortMenu(dom: HTMLElement) {
    sortMenuOption.el = dom
    return filterMenuOption
}
const bookMenuOption: CustomMouseMenuOptions = {
    menuList: [
        {
            label: "打开文档",
            fn: async (params: Metadata) => {
                const blockId = await isAttrsExist("doc", params.bookId)
                if (blockId) {

                    console.log("打开思源文档: " + blockId)
                } else {
                    showMessage(params?.book.title + "未导入")
                }
            }
        },
        {
            label: "在浏览器阅读",
            fn: (params: Metadata) => {
                const url = getPcUrl(params.bookId)
                window.open(url)
                console.log("在浏览器打开微信读书: " + url)
            }
        },
        {
            label: "在思源阅读",
            fn: (params: Metadata) => {
                const url = getPcUrl(params.bookId)
                // todo: webview 打开网页
                console.log("在思源打开微信读书: " + url)
            }
        },
        {
            label: "查看阅读数据",
            fn: async (parmas: Metadata) => {
                const bookId = parmas.bookId
                const readData = await getReadData()
                const readInfo = await getReadInfo(bookId)
                const readDetail = await getReadDetail(0)
                console.log("read data: ", readData)
                console.log("read info: ", readInfo)
                console.log("read detail: ", readDetail)
            }
        }
    ]
}
const cardMenuOption: CustomMouseMenuOptions = {
    menuList: [
        {
            label: "打开",
            fn: async (params: NoteCard) => {
                switch (params.value) {
                    case "bookmark": {
                        const blockId = await isAttrsExist("bookmark", params.key)
                        if (blockId) {

                            console.log("打开思源内容块: " + blockId)
                        } else {
                            showMessage("当前标注未导入")
                        }
                        break
                    }
                    case "review": {
                        const blockId = await isAttrsExist("review", params.key)
                        if (blockId) {

                            console.log("打开思源内容块: " + blockId)
                        } else {
                            showMessage("当前想法未导入")
                        }
                        break
                    }
                }
            }
        },
        {
            label: "打开悬浮窗",
            fn: async (params: NoteCard) => {
                switch (params.value) {
                    case "bookmark": {
                        const blockId = await isAttrsExist("bookmark", params.key)
                        if (blockId) {

                            console.log("使用悬浮窗打开: " + blockId)
                        } else {
                            showMessage("当前标注未导入")
                        }
                        break
                    }
                    case "review": {
                        const blockId = await isAttrsExist("review", params.key)
                        if (blockId) {

                            console.log("使用悬浮窗打开: " + blockId)
                        } else {
                            showMessage("当前想法未导入")
                        }
                        break
                    }
                }
            }
        },
        { line: true },
        {
            label: "复制思源链接",
            fn: (params: NoteCard) => {
                console.log(params)
            }
        },
        {
            label: "复制原始数据",
            fn: (params: NoteCard) => {
                const metadataStr = JSON.stringify(params.data)
                navigator.clipboard.writeText(metadataStr)
                console.log("复制原始数据", metadataStr)
            }
        }
    ]
}
const filterMenuOption: CustomMouseMenuOptions = {
    menuList: [
        {
            label: "想法",
            fn: (params: string) => {
                console.log("筛选: 想法" + params)
            }
        },
        {
            label: "划线",
            fn: (params: string) => {
                console.log("筛选: 划线" + params)
            }
        },
        {
            label: "书签",
            fn: (params: string) => {
                console.log("筛选: 书签" + params)
            }
        },
        {
            label: "点评",
            fn: (params: string) => {
                console.log("筛选: 点评" + params)
            }
        },
        {
            label: "热门标注",
            fn: (params: string) => {
                console.log("筛选: 热门标注" + params)
            }
        },
    ]
}
const sortMenuOption: CustomMouseMenuOptions = {
    menuList: [
        {
            label: "按创建时间",
            fn: (params: string) => {
                console.log("排序: 按创建时间" + params)
            }
        },
        {
            label: "按编辑时间",
            fn: (params: string) => {
                console.log("排序: 按编辑时间" + params)
            }
        },
        {
            label: "按字母排序",
            fn: (params: string) => {
                console.log("排序: 按字母排序" + params)
            }
        },
        {
            label: "按章节排序",
            fn: (params: string) => {
                console.log("排序: 按章节排序" + params)
            }
        },
    ]
}

/* ------------------------ 高亮 ------------------------ */

// REF: https://juejin.cn/post/7199438741533376573
// 使用 [CSS 自定义高亮 API - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/CSS_Custom_Highlight_API)
// 兼容性：Chrome、Edge (105+), Safari (17.2+), firefox (寄), Electron (思源使用的版本 > 28.0, 可以使用这个 API)
export function highlightHitResult(value: string, node: Element) {
    
    // 创建 createTreeWalker 迭代器，用于遍历文本节点，保存到一个数组
    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
    const allTextNodes = []
    let currentNode = treeWalker.nextNode()
    while (currentNode) {
        allTextNodes.push(currentNode)
        currentNode = treeWalker.nextNode()
    }
    
   // 判断一下是否支持 CSS.highlights
    if (!CSS.highlights) {
        console.log("CSS Custom Highlight API not supported.")
        return
    }
    
    // 清除上个高亮
    CSS.highlights.clear()
    
    // 为空判断
    const str = value.trim().toLowerCase()
    if (!str) return
    
    // 查找所有文本节点是否包含搜索词
    const ranges = allTextNodes
        .map((el) => {
            return { el, text: el.textContent.toLowerCase() }
        })
        .map(({ el, text }) => {
            const indices = []
            let startPos = 0
            while (startPos < text.length) {
                const index = text.indexOf(str, startPos)
                if (index === -1) break
                indices.push(index)
                startPos = index + str.length
            }
    
            // 根据搜索词的位置创建选区
            return indices.map((index) => {
                const range = new Range()
                range.setStart(el, index)
                range.setEnd(el, index + str.length)
                return range
            })
        })
    
    // 创建高亮对象
    const searchResultsHighlight = new Highlight(...ranges.flat())
    
    // 注册高亮
    CSS.highlights.set("search-results", searchResultsHighlight)
}