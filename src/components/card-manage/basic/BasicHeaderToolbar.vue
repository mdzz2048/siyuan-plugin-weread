<template>
    <div class="cm-toolbar">
        <div class="cm-toolbar-title">Title</div>
        <div class="cm-toolbar-items">
            <div class="cm-toolbar-item">筛选</div>
            <div class="cm-toolbar-item" ref="dom" @click="showMenu($event, sortOptions)">排序</div>
            <div class="cm-toolbar-item" ref="dom" @click="showMenu($event, cardStyleOptions)">卡片样式</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCardShowTypeStore } from '../../../store';
import { CustomMouseMenu, type MenuSetting } from '../commonMenu';

const dom = ref()
const store = useCardShowTypeStore()
const showMenu = (e: MouseEvent, option: MenuSetting[]) => {
    e.preventDefault()
    const MouseMenuCtx = CustomMouseMenu({
        el: dom.value,
        menuList: option
    })
    const { x, y } = e
    MouseMenuCtx.show(x, y)
}
const sortOptions: MenuSetting[] = [
    { label: '按时间正序' },
    { label: '按时间逆序' },
]
const cardStyleOptions: MenuSetting[] = [
    { label: '详情卡片', fn: () => { store.type = 'card-detail' } },
    { label: '紧凑卡片', fn: () => { store.type = 'card-simple' } },
    { label: '详情列表', fn: () => { store.type = 'list-detail' } },
    { label: '紧凑列表', fn: () => { store.type = 'list-simle' } },
    { label: '标题列表', fn: () => { store.type = 'list-title' } },
]
</script>

<style scoped>
.cm-toolbar {
    display: flex;
    height: 2rem;
    align-items: center;
    justify-content: space-between;
}
.cm-toolbar-title {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5rem;
}
.cm-toolbar-items {
    display: flex;
    font-size: .875rem;
    line-height: 1.25rem;
}
.cm-toolbar-item {
    padding-left: .75rem;
    padding-right: .75rem;
}
</style>