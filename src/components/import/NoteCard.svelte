<script lang="ts">
    import { createEventDispatcher } from "svelte";
    
    export let text: string = "";   // 卡片内容
    export let note: string = "";  // 卡片笔记
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
        <div class="text">
            <slot name="text">{@html text}</slot>
        </div>
        <div class="note">
            <slot name="note">{@html note}</slot>
        </div>
        <div class="info">
            <slot name="info">{@html info}</slot>
        </div>
    </label>
    <input
        class="checkbox"
        name="card-name"
        type="checkbox"
        id={settingKey}
        value={settingValue}
        on:change={changed}
    />
</div>

<style lang="css">
    .card {
        width: 45%;
        min-width: 250px;
        max-width: 400px;
        margin: 5px;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        overflow: hidden;
        
        display: flex;
        position: relative;
    }

    .card .content {
        width: 100%;
        height: 100%;
        padding: 15px;

        box-sizing: border-box;
    }

    .card .content .note {
        margin-bottom: 10px;
        box-sizing: border-box;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;

        font-size: 1.1em;
    }

    .card .content .text {
        margin-bottom: 5px;
        padding-left: 5px;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
        overflow: hidden;

        border-left: 2px solid rgb(190, 190, 190);
    }

    .card .content .info {
        font-size: 0.8em;

        position: absolute;
        bottom: 5px;
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