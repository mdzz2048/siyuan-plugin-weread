<template>
    <div class="toolbar">
        <div class="toolbar-title">
            <input type="checkbox" id="select-all" v-model="selected" @change="$emit('clickSelectAll', selected)">
            Title
        </div>
        <div class="toolbar-items">
            <div class="toolbar-item">菜单</div>
            <div class="toolbar-item exist" @click="$emit('clickExist')">退出多选</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selected = ref(false)

defineEmits(['clickExist', 'clickSelectAll'])
</script>

<style scoped>
.toolbar {
    display: flex;
    height: 2rem;
    align-items: center;
    justify-content: space-between;
}
.toolbar-title {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5rem;
}
.toolbar-items {
    display: flex;
    font-size: .875rem;
    line-height: 1.25rem;
}
.toolbar-item {
    padding-left: .75rem;
    padding-right: .75rem;
}
</style>