<script lang="ts">
    import { onMount } from "svelte";

    export let url: string;
    
    let canvas: any;
    let ctx: any;
    let width = 70;
    let height = 70;

    // REF：https://juejin.cn/post/6957521363326205982
    function adaptImage(imgW, imgH, cvsX, cvsY, cvsW, cvsH) {
        let idealW = imgW
        let idealH = cvsH + (imgW - cvsW) * (cvsH / cvsW)
        if (idealH <= imgH) {
            return [0, imgH / 2 - idealH / 2, idealW, idealH, cvsX, cvsY, cvsW, cvsH]
        } else {
            idealH = imgH
            idealW = cvsW + (imgH - cvsH) * (cvsW / cvsH)
            return [imgW / 2 - idealW / 2, 0, idealW, idealH, cvsX, cvsY, cvsW, cvsH]
        }
    }
        
    // REF: https://learn.svelte.dev/tutorial/context-api
    onMount(() => {
        ctx = canvas.getContext("2d");
        let img = new Image()
        img.src = url
        img.onload = () => {
            let adaptedImage = adaptImage(img.width, img.height, 0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, ...adaptedImage)
        }
    });
</script>

<canvas bind:this={canvas} {width} {height}></canvas>