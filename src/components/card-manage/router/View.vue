<template>
    <!-- 卡片管理界面: 左右布局 -->
    <el-container class="el-container">
        <!-- 侧边栏 -->
        <el-aside class="layout-basic--menu">
            <InboxAside :top-no-white="true" :bottom-no-white="true">
                <template #header>当前书籍</template>
                <template #top>
                    <!-- 这个是当前的书的卡片 -->
                    <BasicCard
                        :id="selectedBook?.bookId"
                        :key="selectedBook?.bookId"
                        :img-url="selectedBook?.book?.cover"
                        :menu-options="bookMenu(selectedBook)"
                        :use-checkbox="false"
                        :hold-default-style="true"
                    >
                        <template #header>{{ getBookNoteCount(selectedBook) + "条笔记" }}</template>
                        {{ selectedBook?.book.title }}
                        <template #footer>{{ parseTimeStamp(selectedBook?.sort) }}</template>
                    </BasicCard>
                </template>
                <template #bottom>
                    <div class="search-book">
                        <Input type="search"
                            :block="true"
                            setting-key="search-book" 
                            setting-value=""
                            placeholder="搜索"
                            @changed="searchBook"
                        />
                    </div>
                    <!-- 这里是所有的书的卡片列表 -->
                    <div id="weread-books">
                        <BasicCard
                            :id="book.bookId"
                            :img-url="book.book.cover"
                            :menu-options="bookMenu(book)"
                            :use-checkbox="false"
                            :hold-default-style="true"
                            :key="book.bookId"
                            v-for="book in showBooks"
                            @click-card="clickCard(book.bookId)"
                        >
                            <template #header>{{ getBookNoteCount(book) + "条笔记" }}</template>
                            {{ book.book?.title }}
                            <template #footer>{{ parseTimeStamp(selectedBook?.sort) }}</template>
                        </BasicCard>
                    </div>
                </template>
            </InboxAside>
        </el-aside>
        <!-- 卡片管理主体面板: 上下布局 -->
        <el-main class="layout-basic--main">
            <!-- 顶部工具栏 -->
            <el-header class="layout-basic--header">
                <div class="cm-toolbar">
                    <div class="cm-toolbar-title">
                        <h2>笔记</h2>
                        <svg class="b3-list-item__graphic" 
                            @click="clickRefresh"
                        >
                            <use xlink:href="#iconRefresh"></use>
                        </svg>
                    </div>
                    <div class="cm-toolbar-items">
                        <div class="cm-toolbar-item" ref="dom" 
                            @click="showMenu($event, filterMenu(dom))"
                        >筛选</div>
                        <div class="cm-toolbar-item" ref="dom"
                            @click="showMenu($event, sortMenu(dom))"
                        >排序</div>
                        <div class="cm-toolbar-item">
                            <Input type="search"
                                setting-key="search-note" 
                                setting-value=""
                                placeholder="搜索"
                                @changed="searchNote"
                            />
                        </div>
                    </div>
                </div>
            </el-header>
            <!-- 卡片组 -->
            <el-main class="layout-basic--main" id="weread-notes">
                <!-- 这里循环构建每个章节的卡片组 -->
                <template v-for="chapter in showNotes" :key="chapter.chapterUid">
                    <!-- todo: 章节工具栏 (折叠/展开、全选、打开微信读书) -->
                    <div class="chapter-toolbar">
                        <div class="chapter-toolbar__fold" fold="false">
                            <svg style="transform: rotate(90deg)" 
                                @click="clickFoldButton($event)"
                            >
                                <use xlink:href="#iconPlay"></use>
                            </svg>
                        </div>
                        <div class="chapter-toolbar__title">
                            {{ chapter.chapterTitle }}
                            <span class="chapter-toolbar__wrlink"
                                @click="clickChapterLink(chapter)"
                            >⇧</span>
                        </div>
                    </div>
                    <BasicGroup>
                        <BasicCard 
                            :id="note.key"
                            :use-checkbox="false"
                            :use-higlight-style="true"
                            :use-fold-style-card-body-text="true"
                            :menu-options="cardMenu(note)"
                            :key="note.key"
                            v-for="note in chapter.chapterCards"
                        >
                            {{ note.text }}
                            <template #note>{{ note?.title }}</template>
                            <template #footer>{{ note.info }}</template>
                        </BasicCard>
                    </BasicGroup>
                </template>
            </el-main>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import InboxAside from '../basic/InboxAside.vue';
import BasicCard from '../basic/BasicCard.vue';
import BasicGroup from '../basic/BasicGroup.vue';
import Input from '../../siyuan/siyuan/setting/Input.vue';
import { onMounted, ref, watch, type Ref } from 'vue';
import { Metadata } from '../../../types/weread';
import { parseTimeStamp } from '../../../utils/parse';
import { ChapterNoteCard } from '../../../types/card';
import { useWereadStore } from '../../../store';
import { ElLoading } from "element-plus";
import { 
    highlightHitResult, 
    bookMenu, filterMenu, sortMenu, cardMenu, showMenu, 
    getBookNoteCount, 
    clickChapterLink, clickFoldButton
} from './view';

const dom = ref()
const wereadStore = useWereadStore()
const allBooks: Ref<Metadata[]> = ref([])
const allNotes: Ref<ChapterNoteCard[]> = ref([])
const showBooks: Ref<Metadata[]> = ref([])
const showNotes: Ref<ChapterNoteCard[]> = ref([])
const selectedBook: Ref<Metadata> = ref()
const loadingInstance = ElLoading.service({
    target: "#CardView",
})

onMounted(async () => {
    if (wereadStore.metadatas.length === 0) {
        console.log('new')
        await wereadStore.getMetadatas()
        allBooks.value = wereadStore.metadatas
        wereadStore.setSelectedBook(allBooks.value[0].bookId)
        await wereadStore.addBookNotes(allBooks.value[0].bookId)
    }
    // todo: 适配使用 pinia 控制的缓存
    allBooks.value = wereadStore.metadatas
    allNotes.value = wereadStore.getBookNotes(wereadStore.selected)
    selectedBook.value = wereadStore.getMetadata(wereadStore.selected)
    showBooks.value = allBooks.value
    showNotes.value = allNotes.value
    loadingInstance.close()
})

watch(selectedBook, async () => {
    console.log('选中的书: ', selectedBook, wereadStore.selected)
    const bookId = selectedBook.value.bookId
    const isExist = wereadStore.isBookNotesExist(bookId)
    if (!isExist) {
        await wereadStore.addBookNotes(bookId)
    }
    allNotes.value = wereadStore.getBookNotes(bookId)
    showNotes.value = wereadStore.getBookNotes(bookId)
})
function clickCard(bookId: string) {
    selectedBook.value = allBooks.value.find(book => book.bookId === bookId)
    wereadStore.selected = bookId
}
async function clickRefresh() {
    console.log('refresh')
    const loading = ElLoading.service({
        target: "#weread-notes",
    })
    const notes = await wereadStore.refereshBookNotes(selectedBook.value.bookId)
    console.log(notes)
    allNotes.value = notes
    showNotes.value = notes
    loading.close()
}
function searchBook(key: string, value: string) {
    console.log(key, value)
    const books = allBooks.value
    showBooks.value = books.filter(book => book.book.title.includes(value))
    console.log(showBooks.value)
    // 高亮搜索内容
    highlightHitResult(value, document.querySelector("#weread-books"))
}
function searchNote(key: string, value: string) {
    console.log(key, value)
    console.log(allNotes.value)
    const result = []
    const chapters = allNotes.value

    chapters.forEach(chapter => {
        const cards = chapter.chapterCards.filter(note => {
            const hitHighlght = note.text.includes(value)
            const hitNote = note.title.includes(value)
            return hitHighlght || hitNote
        })
        const cloneChapter: ChapterNoteCard = {
            chapterCards: cards,
            chapterCardsCount: chapter.chapterCardsCount,
            chapterTitle: chapter.chapterTitle,
            chapterUid: chapter.chapterUid,
        }
        result.push(cloneChapter)
    })
    showNotes.value = value ? result : allNotes.value
    // 高亮搜索内容
    highlightHitResult(value, document.querySelector("#weread-notes"))
}
</script>

<style scoped>
.el-container {
    height: 100%;
}
.layout-basic--menu {
    width: 290px;
    min-width: 200px;
    max-width: 400px;
    background-color: #edeff3;
    border-right: 1px solid #d5d5d5;
}
.layout-basic--header {
    border-bottom: 1px solid #d5d5d5;
    height: auto;
}
.layout-basic--main {
    background-color: #edeff3;
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: auto;
}
.chapter-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 1rem;
}
.chapter-toolbar__fold {
    padding: 0.25rem 0.5rem;
}
.chapter-toolbar__fold > svg {
    width: 10px;
    height: 10px;
    opacity: 0.75;
    cursor: pointer;
}
.chapter-toolbar__title {
    padding: 0.25rem 0.5rem;

    font-size: large;
    font-weight: 600;
}
.chapter-toolbar__checkbox {
    padding: 0.25rem 0.25rem;
}

.cm-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.5rem 0;
}
.cm-toolbar-title {
    display: flex;
    align-items: center;
}
.cm-toolbar-title > h2 {
    margin-right: 0.5rem;
}
.cm-toolbar-title > svg {
    cursor: pointer;
}
.cm-toolbar-items {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    line-height: 1.25rem;
}
.cm-toolbar-item {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
}

.search-book {
    padding: 0.5rem;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #edeff3;
}

::highlight(search-results) {
    background-color: rgb(235 235 5);
    color: black;
}
</style>