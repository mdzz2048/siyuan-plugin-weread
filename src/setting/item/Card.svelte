<script lang="ts">
    //Optional
    export let title: string = ""; // 笔记
    export let text: string = ""; // 标注
</script>

<div class="weread-card">
    <div class="weread-card-title">
        <slot name="title">{@html title}</slot>
    </div>
    <div class="weread-card-text">
        <slot name="text">{@html text}</slot>
    </div>
</div>

<style lang="css">
    .weread-card {
        flex: auto;
        height: 100px;
        width: 100%;

        border-radius: 5px;
        background-color: var(--b3-menu-background);
        box-shadow: 1px var(--b3-theme-on-background);
        padding: 5px 0;
        margin: 5px 0;
    }

    .weread-card-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0px 0px 5px 0px;
        padding: 0px 0px 0px 6.5px;
    }

    .weread-card-text {        
        background-color: #ebeaf075;
        border-left: 1.5px solid var(--b3-scroll-color);
        padding: 0px 5px;
        /* 隐藏多余文字 */
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
        overflow: hidden;
    }
</style>