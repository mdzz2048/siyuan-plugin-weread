<script lang="ts">
    import { createEventDispatcher } from "svelte";
    
    export let title: string = "";  // 卡片标题
    export let text: string = "";   // 卡片内容
    export let info: string = "";   // 附加信息

    export let settingKey: string;
    export let settingValue: any;

    const dispatch = createEventDispatcher();

    function changed(event: Event) {
        dispatch("changed", { key: settingKey, value: settingValue, event });
    }
</script>

<div class="card">
    <label class="content" for={settingKey}>
        <div class="title">
            <slot name="title">{@html title}</slot>
        </div>
        <div class="text">
            <slot name="text">{@html text}</slot>
        </div>
        <div class="info">
            <slot name="info">{@html info}</slot>
        </div>
    </label>
    <input
        id={settingKey}
        value={settingValue}
        name="card-name"
        type="checkbox"
        class="checkbox"
        on:change={changed}
    />
</div>

<style lang="css">
    .card {
        height: 100%;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        overflow: hidden;
        
        display: flex;
        justify-content: center;
        align-items: center;

        margin: 5px;

        position: relative;
    }
    .card .content {
        width: 100%;
        height: 100%;
        padding: 15px;

        box-sizing: border-box;
    }

    .card .content .title {
        margin: 0px;

        box-sizing: border-box;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;

        font-size: 1.3em;
        font-weight: bold;
    }

    .card .content .text {
        margin: 8px 0px;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
        overflow: hidden;
    }

    .card .content .info {
        font-size: 0.8em;

        position: absolute;
        bottom: 8px;
    }

    .card .checkbox {
        position: absolute;
        right: 5px;
        top: 5px;

        opacity: 0;
    }
    .card .checkbox:hover {
        opacity: 1;
    }

    .card:has( .checkbox:checked) {
        outline: 1.5px dashed rgb(60, 60, 220)
    }
</style>