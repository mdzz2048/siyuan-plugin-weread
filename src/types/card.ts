import { Review, BookmarkSelf, BookmarkBest } from "./weread"

export interface NoteCard {
    title: string,
    text: string,
    info: string,
    key: string,
    value: "bookmark" | "bestBookmark" | "review",
    data: Review | BookmarkSelf | BookmarkBest
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