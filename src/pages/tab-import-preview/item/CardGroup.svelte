<script lang="ts">
    export let title: string = '';  // 标题文本
    export let id: string = '';     // ID
</script>

<div class="card-group" id={id}>
    {@html title}
    <slot />
</div>

<style>
    .card-group {
        width: 100%;
        overflow-y: auto;
        /* flex 布局 */
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        /* 底部分隔线 */
        border-bottom: 1px solid var(--b3-theme-surface-lighter);
    }
</style>