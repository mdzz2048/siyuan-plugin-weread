<template>
    <div class="save-menu">
        <div :class="['save-menu__header', { 'no-white': headerNoWhite || allNoWhite }]">
            <slot name="header"></slot>
        </div>
        <div :class="['save-menu__top', { 'no-white': topNoWhite || allNoWhite }]">
            <slot name="top">Top</slot>
        </div>
        <div :class="['save-menu__bottom', { 'no-white': bottomNoWhite || allNoWhite }]">
            <slot name="bottom">Bottom</slot>
        </div>
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        headerNoWhite?: boolean,
        topNoWhite?: boolean,
        bottomNoWhite?: boolean,
        allNoWhite?: boolean,
    }>(), 
    {
        headerNoWhite: false,
        topNoWhite: false,
        bottomNoWhite: false,
        allNoWhite: false,
    })
</script>

<style scoped>
.save-menu {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1.5rem 0 0;
    box-sizing: border-box;
}
.save-menu__header {
    padding-right: 0.75rem;
    padding-left: 0.75rem;
    margin-bottom: 1.5rem;
    line-height: 1.5rem;
    font-size: 1.125rem;
    font-weight: 700;
}
.save-menu__top {
    padding-right: 0.75rem;
    padding-left: 0.75rem;
    display: flex;
    flex-direction: column;
}
.save-menu__bottom {
    flex: auto;
    overflow-y: auto;
    padding: 1rem 0.75rem;
}
.no-white {
    padding: 0;
}
</style>