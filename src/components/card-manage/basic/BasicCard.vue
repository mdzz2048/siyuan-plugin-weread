<template>
    <div 
        :class="showCardStyle ? 'card-group-item' : 'list-group-item'" 
        v-mouse-menu="props.menuOptions"
        @click="$emit('clickCard', props.id)"
    >
        <!-- 卡片主体 -->
        <div :class="showCardStyle ? 'card' : 'list'">
            <!-- 卡片标题: Header -->
            <div class="card-header" v-if="$slots.header && !hinddenCardHeader">
                <BasicText :clamp-line="clampLineCardHeader">
                    <slot name="header"></slot>
                </BasicText>
            </div>
            <!-- 卡片内容: Body -->
            <div class="card-body" v-if="!hinddenCardBody">
                <!-- 引用 -->
                <div class="card-body__main">
                    <div v-if="useHiglightStyle" class="card-body__main-mark"></div>
                    <div 
                        v-if="!hinddenCardBodyText"
                        class="card-body__main-info" 
                        :class="{ 'card-body__main-highlight': useHiglightStyle }"
                    >
                        <BasicText 
                            :clamp-line="clampLineCardBodyText" 
                            :fold-button-id="id + 'fold-button'"
                            :use-fold-button="useFoldStyleCardBodyText">
                            <slot></slot>
                        </BasicText>
                    </div>
                    <PreivewImg v-if="imgUrl" :url="imgUrl"></PreivewImg>
                </div>
                <!-- 笔记 -->
                <div class="card-body__note" v-if="!hinddenCardBodyNote">
                    <BasicText :clamp-line="clampLineCardBodyNote">
                        <slot name="note"></slot>
                    </BasicText>
                </div>
                <!-- 标签 -->
                <div class="card-body__tags">
                    <slot name="tags"></slot>
                </div>
            </div>
            <!-- 卡片脚注: Footer -->
            <div class="card-footer" v-if="$slots.footer && !hinddenCardFooter">
                <slot name="footer"></slot>
            </div>
        </div>
        <!-- 卡片复选框 -->
        <BasicCheckbox v-if="useCheckbox" :checkbox-id="id"></BasicCheckbox>
    </div>
</template>

<script setup lang="ts">
import PreivewImg from './PreivewImg.vue';
import BasicText from './BasicText.vue';
import BasicCheckbox from './BasicCheckbox.vue';
import { CustomMouseMenuOptions, MouseMenuDirective } from '../commonMenu';
import { computed, ref, watch } from 'vue';
import { useCardShowTypeStore } from '../../../store';

// todo: 增加一个图片的位置参数，支持配置在左侧或者右侧显示图片
const props = withDefaults(
    defineProps<{
        id: string,
        menuOptions: CustomMouseMenuOptions,
        imgUrl?: string,
        useCheckbox?: boolean,
        useHiglightStyle?: boolean,
        useFoldStyleCardBodyText?: boolean,
        holdDefaultStyle?: boolean,
        hinddenCardHeader?: boolean,
        hinddenCardBody?: boolean,
        hinddenCardBodyText?: boolean,
        hinddenCardBodyNote?: boolean,
        hinddenCardFooter?: boolean,
        clampLineCardHeader?: number,
        clampLineCardBodyText?: number,
        clampLineCardBodyNote?: number,
    }>(), 
    {
        useCheckbox: true,
        useHiglightStyle: false,
    }
)
const emits = defineEmits(["clickCard"])
const cardShowType = useCardShowTypeStore()
const hinddenCardHeader = ref(props.hinddenCardHeader)
const hinddenCardBody = ref(props.hinddenCardBody)
const hinddenCardBodyText = ref(props.hinddenCardBodyText)
const hinddenCardBodyNote = ref(props.hinddenCardBodyNote)
const hinddenCardFooter = ref(props.hinddenCardFooter)
const clampLineCardHeader = ref(props.clampLineCardHeader)
const clampLineCardBodyText = ref(props.clampLineCardBodyText)
const clampLineCardBodyNote = ref(props.clampLineCardBodyNote)
const showCardStyle = computed(() => { 
    if (props.holdDefaultStyle) return true
    return cardShowType.type.startsWith('card') 
})
const reset = () => {
    hinddenCardBody.value = false
    hinddenCardBodyText.value = false
    hinddenCardBodyNote.value = false
    hinddenCardFooter.value = false
    clampLineCardHeader.value = 2
    clampLineCardBodyText.value = 4
    clampLineCardBodyNote.value = 2
}

watch(cardShowType, () => {
    if (props.holdDefaultStyle) return
    switch (cardShowType.type) {
        case "card-detail": 
            reset()
            break
        case "card-simple": 
            reset()
            hinddenCardBody.value = true
            break
        case "list-detail": 
            reset()
            break
        case "list-simle": 
            reset()
            hinddenCardBodyNote.value = true
            clampLineCardBodyText.value = 1
            break
        case "list-title": 
            reset()
            hinddenCardBody.value = true
            // hinddenCardFooter.value = true
            clampLineCardHeader.value = 1
            break
        default: 
            reset()
            break
    }
})
const vMouseMenu = MouseMenuDirective
</script>

<style scoped>
/* todo: 卡片的样式还需要优化 */
.card-group-item {
    display: flex;
    flex: auto;
    position: relative;
    width: 100%;
}
.card {
    border-radius: 0.25rem;
    padding: 0.625rem 1rem;
    margin: 0.5rem;
    background-color: #ffffff;
    width: 100%;

    display: flex;
    flex-direction: column;
}
.card:hover {
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);
}
.card-header {
    font-weight: 600;
}
.card-footer {
    font-size: small;
}
.card-body {
    flex: auto;
    overflow: hidden;
    padding: 5px 0;
}
.card-body__main {
    flex: auto;
    display: flex;
    opacity: 0.75;
}
.card-body__main-info {
    text-wrap: balance;
    width: 100%;
}
.card-body__main-mark {
    position: absolute;
    left: 0.5rem;
    width: 0.5rem;
    height: 100%;
    max-height: 4rem;
    border-left: 0.5rem solid #ffd845;
    border-bottom-right-radius: 0.125rem;
    border-top-right-radius: 0.125rem;
}
.card-body__main-highlight {
    background-color: #f6f7f9;
    padding: 1rem 0.75rem;
    color: #6a6a6b;
    font-size: .75rem;
    line-height: 1rem;
    width: 100%;
}
.card-body__note {
    display: flex;
    padding: 0.5rem 0;
}
.card-body__tags {
    max-height: 50px;
}
.card-checkbox-wrapper {
    cursor: pointer;
    /* opacity: 0; */
    position: absolute;
    right: 0.75rem;
    top: 0.75rem;
    z-index: 1;

}
.card-checkbox {
    padding: 0;
    margin: 0;
}
.list-group-item {
    position: relative;
}
.list {
    border-top: 0.4px solid #e5e8ed;
    padding: 1rem 1.5rem;
    background-color: #ffffff;

    display: flex;
    flex-direction: column;
}
</style>