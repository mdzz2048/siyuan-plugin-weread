<template>
    <a class="aside-group-item" :href="href">
        <div class="item">
            <div class="item-icon">svg</div>
            <div class="item-text">{{ name }}</div>
            <div class="item-count">{{ count }}</div>
        </div>
    </a>
</template>

<script setup lang="ts">
// todo: icon 支持传入 Svg
defineProps<{
    href: string,
    name: string,
    count: number,
}>()

</script>

<style scoped>
a {
    color: inherit;
    text-decoration: none;
}
.aside-group-item {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background-color: #e5e8ed;
}
.aside-group-item:hover {
    background-color: #e9ebf0;
}
.item {
    display: flex;
}
.item-icon {
    /* width: 1.25rem; */
    /* height: 1.25rem; */
    margin-right: 0.5rem;
}
.item-text {
    display: flex;
    flex: auto;
}
.item-count {
    font-size: 0.875rem;
    line-height: 1.25rem;
}
</style>