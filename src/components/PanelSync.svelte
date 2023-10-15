<script lang="ts">
    import { WereadConfig } from "../types/config";
    import { Plugin } from "siyuan";
    import Input from "./siyuan/item/Input.svelte";
    import { ItemType } from "./siyuan/item/item";
    import CardGroup from "./base/layout/CardGroup.svelte";
    import { onDestroy, onMount } from "svelte";
    import { getMetadatasCards } from "./import/cardview";
    import BookCard from "./import/BookCard.svelte";

    export let config: WereadConfig;
    export let plugin: Plugin;

    let metadatas = [];

    onMount(async () => {
        metadatas = await getMetadatasCards();

        console.log("Setting panel opened");
    });

    onDestroy(() => {
        console.log("Setting panel closed");
    });
</script>

<div>
    <div class="search">
        <Input
            block={true}
            type={ItemType.text}
            settingKey="search"
            settingValue=""
            placeholder="搜索笔记"
            on:changed={ async e => {
                console.log(e);
            }}
        />
    </div>
    <div class="split"></div>
    <div class="card-group">
        <CardGroup title="">
            {#each metadatas as metadata}
                <BookCard
                    type={ItemType.checkbox}
                    title={metadata.title}
                    text={metadata.text}
                    info={metadata.info}
                    url={metadata.url}
                    settingKey={metadata.key}
                    settingValue={metadata.value}
                    on:clicked={async (event) => {
                        console.log(event);
                    }}
                >
                </BookCard>
            {/each}
        </CardGroup>
    </div>
    <div class="split"></div>
    <div class="button-import">
        <Input
            type={ItemType.button}
            settingKey="import"
            settingValue="导入"
            on:clicked={
                async e => {
                    console.log(e);
                }
            }
        />
    </div>
</div>

<style lang="less">
    .search {
        padding: 5px;
    }

    .card-group {
        height: 500px;
        overflow-y: auto;
    }

    .split {
        border-bottom: 1px solid var(--b3-theme-surface);
    }

    .button-import {
        position: absolute;
        right: 5px;
        bottom: 5px;
    }
</style>