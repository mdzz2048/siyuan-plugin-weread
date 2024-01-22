<template>
    <div :class="line" v-if="!useFoldButton">
        <slot></slot>
    </div>
    <div class="wrapper" v-else>
        <input :id="foldButtonId" class="exp"  type="checkbox">
        <div class="text" :line-clamp="clampLine">
            <label class="btn" :for="foldButtonId"></label>
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    clampLine?: number,
    foldButtonId?: string,
    useFoldButton?: boolean,
}>(), {
    clampLine: 2,
    useFoldButton: false
})
const line = computed(() => {
    return `line-clamp-${props.clampLine}`
})
</script>

<style scoped>
/* 隐藏多余指定行数的内容 */
.line-clamp-1 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
}
.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}
.line-clamp-3 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
}
.line-clamp-4 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
}
/* 折叠/展开样式 */
[line-clamp="1"] {
    max-height: 1.5em;
}
[line-clamp="2"] {
    max-height: 3em;
}
[line-clamp="3"] {
    max-height: 4.5em;
}
[line-clamp="4"] {
    max-height: 6em;
}
.wrapper {
    display: flex;
}
.text {
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: justify;
    /* display: flex; */
    /* display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical; */
    position: relative;
    line-height: 1.5;
    max-height: 6em;
    transition: .3s max-height;
}
.text::before {
    content: '';
    height: calc(100% - 1em - 6px);
    float: right;
}
.text::after {
    content: '';
    width: 999vw;
    height: 999vw;
    position: absolute;
    box-shadow: inset calc(100px - 999vw) calc(1rem - 999vw) 0 0 #f6f7f9;
    margin-left: -100px;
}
.btn {
    position: relative;
    float: right;
    clear: both;
    margin: 0 0 0 20px;
    padding: 0 6px;
    background: #3F51B5;
    border-radius: 4px;
    color:  #fff;
    cursor: pointer;
}
.btn::after {
    content:'展开'
}
.exp {
    display: none;
}
.exp:checked + .text {
    max-height: none;
}
.exp:checked + .text::after {
    visibility: hidden;
}
.exp:checked + .text .btn::before {
    visibility: hidden;
}
.exp:checked + .text .btn::after {
    content:'收起'
}
.btn::before {
    content: '...';
    position: absolute;
    left: -5px;
    color: #333;
    transform: translateX(-100%)
}
</style>