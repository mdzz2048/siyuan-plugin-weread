<script lang="ts">

    export let is_MP_WXS: boolean;  // 是否为公众号文章
    export let img_url: string;
    export let title: string;

</script>

<!-- 卡片边框 -->
<div class="book_card">
    {#if is_MP_WXS}
        <!-- 圆形公众号头像 -->
        <!-- 三行文章标题 -->
    {:else}
        <!-- 图片 -->
        <img src="{img_url}" alt="{title}">
    {/if}
</div>

<style lang="css">

</style>
