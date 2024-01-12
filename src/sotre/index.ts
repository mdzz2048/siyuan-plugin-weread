import { defineStore } from "pinia";
import { client } from "../api/siyuan";

export const useSiyuanNotebookStore = defineStore('siyuanNotebooks', {
    state: async () => {
        const response = await client.lsNotebooks()
        return response.data.notebooks
    }
})

export const useConfStore = defineStore('config', {
    state: () => {
        return {
            notebook: "",
        }
    }
})