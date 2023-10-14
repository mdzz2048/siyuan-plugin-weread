export interface BookCard {
    title: string,
    text: string,
    info: string,
    url: string,
    key: string,
    value: string,
}

export interface NoteCard {
    title: string,
    text: string,
    info: string,
    key: string,
    value: string,
}

export interface ChapterNoteCard {
    chapterTitle: string,
    chapterUid: string,
    chapterCards: NoteCard[],
    chapterCardsCount: number,
}

export interface ChapterInfo {
    title: string,
    id: string,
}