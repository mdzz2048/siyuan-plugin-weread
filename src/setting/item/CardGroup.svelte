<script lang="ts">
    export let title: string; // 标题文本
</script>

<div class="weread-card-group">
    {@html title}
    <slot />
</div>

<style>
    .weread-card-group {
        height: 300px;
        width: auto;
        flex-direction: column;
        overflow-y: auto;

        margin: 0 24px;
        padding: 16px 0;
        border-bottom: 1px solid var(--b3-theme-surface-lighter);
    }
</style>