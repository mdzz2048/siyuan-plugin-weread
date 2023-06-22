<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Canvas from "./Canvas.svelte";
    import { ItemType } from "../../setting/item/item";
    
    export let title: string = "";  // 卡片标题
    export let text: string = "";   // 卡片内容
    export let info: string = "";   // 附加信息
    export let url: string  = "";   // 封面地址
    export let type: ItemType;      // SettingType

    export let settingKey: string = "";
    export let settingValue: any = "";

    const dispatch = createEventDispatcher();

    function changed(event: Event) {
        dispatch("changed", { key: settingKey, value: settingValue, event });
    }

    function clicked(event: MouseEvent) {
        dispatch("clicked", { key: settingKey, value: settingValue, event });
    }
</script>

<div class="card">
    <label class="card-body" for={settingKey}>
        <div class="content">
            <div class="title">
                <slot name="title">{@html title}</slot>
            </div>
            <div class="text">
                <slot name="text">{@html text}</slot>
            </div>
        </div>
        <div>
            <Canvas url={url} ></Canvas>
        </div>
        <div class="info">
            <slot name="info">{@html info}</slot>
        </div>
    </label>
    {#if type === ItemType.checkbox}
        <input
            class="checkbox"
            name="book-name"
            type="checkbox"
            id={settingKey}
            value={settingValue}
            on:change={changed}
        />
    {:else if type === ItemType.button}
        <button
            class="button"
            id={settingKey}
            on:click={clicked}
        />
    {/if}
</div>

<style lang="css">
    .card {
        width: 100%;
        border-radius: 5px;
        margin: 5px;
        outline: 1px solid rgb(190, 190, 190);
        overflow: hidden;

        position: relative;
    }

    .card .card-body {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }

    .card .content {
        display: flex;
        flex-flow: column;
    }
    .card .content .title {
        margin: 0px;
        box-sizing: border-box;
        /* 单行溢出隐藏 */
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        /* 突出显示 */
        font-size: 1.2em;
        font-weight: bold;
    }
    .card .content .text {
        margin-top: 8px;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
    }

    .card .info {
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
    .card .button {
        opacity: 0;
    }
</style>