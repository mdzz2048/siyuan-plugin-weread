import { WereadConfig } from "../types/config"

export const DEFAULT_CONFIG: WereadConfig = {
    siyuan: {
        notebook: '', 
        docName: '1', 
        docTemplate: '',
        savePath: '/', 
        highlightTemplate: '{{markText}}', 
        noteTemplate: '{{abstract}}\n{{content}}', 
        bestHighlightTemplate: '{{markText}}', 
        importType: ''
    },
    weread: {
        filterHighlight: '3',
        userName: '', 
        userVid: '', 
        bookId: '', 
    }, 
    Cookie: ''
}
