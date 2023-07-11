<script lang="ts">
    import { Dialog } from "siyuan";


    export let config: any;
    export let dialog: Dialog;

    function updateCookieByInput() {
        let input = document.getElementById('input_cookie')['value'];
        config.Cookie = input;
        dialog.destroy();
    }
</script>

<div class="b3-dialog__content">
    <input class="b3-text-field fn__block" placeholder="手动输入 Cookie" id="input_cookie" value="">
    <div class="b3-label__text">配置后用作微信读书鉴权</div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel" on:click={ () => { dialog.destroy() }}>取消</button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--text" on:click={ () => { updateCookieByInput() }}>确定</button>
</div>