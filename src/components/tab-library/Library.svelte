<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    import Toolbar from "./Toolbar.svelte";
    import Attr from "./view/ListAttr.svelte";
    import CardGroup from "../base/layout/CardGroup.svelte";

    import Weread from "../..";
    import { showMessage } from "siyuan";
    import { WereadConfig } from "../../types/config";

    export let config: WereadConfig;
    export let plugin: Weread;

    onMount(async () => {
        console.log("Setting panel opened");
    });
    onDestroy(() => {
        console.log(config);
        console.log(plugin);
        console.log("Setting panel closed");
        showMessage('close');
    });
</script>

<Toolbar>

</Toolbar>
<hr>
<Attr>

</Attr>
<hr>
<CardGroup>
    
</CardGroup>

<style lang="css">

</style>
