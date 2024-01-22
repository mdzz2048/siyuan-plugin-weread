<template>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const canvas = ref<InstanceType<typeof HTMLCanvasElement>>();
const props = withDefaults(defineProps<{
    url: string,
    width?: number,
    height?: number,
}>(), {
    width: 70,
    height: 70,
});

// REF：https://juejin.cn/post/6957521363326205982
function adaptImage(
    imgW: number, 
    imgH: number, 
    cvsX: any, 
    cvsY: any, 
    cvsW: number, 
    cvsH: number
): [number, number, number, number, number, number, number, number] {
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

onMounted(() => {
    const ctx = canvas.value?.getContext("2d")
    // const ctx = canvas.value.getContext("2d");
    const img = new Image()
    img.src = props.url
    img.onload = () => {
        const width = canvas.value?.width ?? props.width
        const height = canvas.value?.height ?? props.height
        const adaptedImage = adaptImage(img.width, img.height, 0, 0, width, height)
        ctx?.drawImage(img, ...adaptedImage)
    }
})
</script>

