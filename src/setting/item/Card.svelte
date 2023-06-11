<script lang="ts">
    import { createEventDispatcher } from "svelte";
    
    //Optional
    export let title: string = ""; // 笔记
    export let text: string = ""; // 标注

    export let settingKey: string;
    export let settingValue: any;

    const dispatch = createEventDispatcher();

    function changed(event: Event) {
        dispatch("changed", { key: settingKey, value: settingValue, event });
    }
</script>

<!-- todo: 卡片复选框悬浮显示 -->
<div class="weread-card">
    <input
        id={settingKey}
        name="weread-card-name"
        type="checkbox"
        value={settingValue}
        class="checkbox-input"
        on:change={changed}
    />
    <label for={settingKey}>
        <div class="weread-card-title">
            <slot name="title">{@html title}</slot>
        </div>
        <div class="weread-card-text">
            <slot name="text">{@html text}</slot>
        </div>
    </label>
</div>

<style lang="css">
    .weread-card {
        flex: auto;
        height: 120px;
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

    .checkbox-input {
        opacity: 0;
        z-index: 1;
        position: absolute;
        right: 0;
        top: 0;
    }
    
    .checkbox-input:hover {
        opacity: 1;
    }
</style>