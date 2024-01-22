import { defineStore } from "pinia";
import { client } from "../api/siyuan";
import { IOption } from "../components/siyuan/siyuan/setting";
import { Ref, computed, ref } from "vue";
import { getChapterNoteCardList, getMetadataList } from "../utils/parse";
import { ChapterNoteCard } from "../types/card";
import { Metadata } from "../types/weread";

export const useSiyuanNotebookStore = defineStore('siyuanNotebooks', {
    state: async () => {
        const response = await client.lsNotebooks()
        return response.data.notebooks
    },
    actions: {
        async getNotebooksOption() {
            const response = await client.lsNotebooks()
            const notebooks = response.data.notebooks
            const notebooksOption: IOption[] = []
            notebooks.forEach((item) => {
                console.log(item)
                notebooksOption.push({ key: item.id, text: item.name })
            })
            return notebooksOption
        },
        async updateNotebooks() {
            const response = await client.lsNotebooks()
            return response.data.notebooks
        }
    }
})

export const useConfStore = defineStore('config', {
    state: () => {
        return {
            notebook: "",
        }
    }
})

export const useWereadStore = defineStore('weread', {
    state: () => ({
        metadatas: [],
        notes: {},
        selected: "",
    }),
    actions: {
        async getMetadatas() {
            this.metadatas = await getMetadataList()
        },
        getMetadata(bookId: string): Metadata {
            return this.metadatas.find((book: Metadata) => book.bookId === bookId)
        },
        getBookNotes(bookId: string): ChapterNoteCard[] {
            return this.notes[bookId]
        },
        isBookNotesExist(bookId: string): boolean {
            return Object.keys(this.notes).includes(bookId)
        },
        async addBookNotes(bookId: string) {
            this.notes[bookId] = await getChapterNoteCardList(bookId)
        },
        async refereshBookNotes(bookId: string): Promise<ChapterNoteCard[]> {
            const notes = await getChapterNoteCardList(bookId)
            this.notes[bookId] = notes
            return notes
        },
        async removeBookNotes(bookId: string) {
            delete this.notes[bookId]
        },
        setSelectedBook(bookId: string) {
            this.selected = bookId
        },
    }
})

// 

export const useCounterStore = defineStore('counter', () => {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    function increment() {
        count.value++
    }

    return { count, doubleCount, increment }
})

export const useSelectCardStore = defineStore('selectedCards', () => {
    const list = ref([])
    return { list }
})

export const useCardShowTypeStore = defineStore('CardShowType', () => {
    type TShowType = "card-detail" | "card-simple" | "list-detail" | "list-simle" | "list-title"
    const type: Ref<TShowType> = ref('card-detail')
    return { type }
})
