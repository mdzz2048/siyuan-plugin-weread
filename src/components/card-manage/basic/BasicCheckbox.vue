<template>
    <div class="card-checkbox-wrapper">
        <input type="checkbox" class="card-checkbox" v-model="selected" :value="checkboxId" :name="checkboxId">
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const selected = inject('selectedCheckbox')
// const customId = generateUUID()

defineProps<{
    checkboxId: string,
}>()
defineEmits(['select'])

// todo: 
// 1. 之后这个 id 应该由父组件提供
// 2. 选中一个之后，显示所有的 checkbox
// function generateUUID(): string {
//     return 'pkmtools-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         var r = Math.random() * 16 | 0,
//             v = c == 'x' ? r : (r & 0x3 | 0x8);
//         return v.toString(16);
//     });
// }
</script>

<style scoped>
/* todo: checkbox 还需要美化一下，默认不显示 */
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
</style>