export interface WereadConfig {
    siyuan: {
        notebook: string, 
        docName: string, 
        docTemplate: string,
        savePath: string, 
        highlightTemplate: string, 
        noteTemplate: string, 
        bestHighlightTemplate: string, 
        importType: string
    },
    weread: {
        filterHighlight: string,
        userName: string, 
        userVid: string, 
        bookId: string, 
    }, 
    Cookie: string
}
