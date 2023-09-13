<script lang="ts">
    import { Option } from ".";

    export let options: Option[];

</script>

<div class="weread-menu" >
    {#each options as option}
        <div 
            class="weread-menu"
            on:keydown
            on:click={async () => { option.func }}
        >
            <span>
                {@html option.icon}
            </span>
            <span>
                {option.text}
            </span>
        </div>
    {/each}
</div>

<style lang="css">

</style>