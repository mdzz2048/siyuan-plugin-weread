<template>
    <div :class="groupType">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCardShowTypeStore } from '../../../store';

const showType = useCardShowTypeStore()
const groupType = computed(() => {
    const isCard = showType.type.startsWith('card')
    if (isCard) {
        return 'card-group'
    } else {
        return 'list-group'
    }
})
</script>

<style scoped>
.card-group {
    /* height: 100%; */
    padding: 0 0.5rem;

    display: grid;
    gap: 0.5rem;
    /* grid-template-rows: repeat(auto-fill, minmax(175px, auto)); */
    grid-auto-rows: auto;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    grid-auto-flow: row dense;
    justify-content: center;
}
.list-group {
    display: flex;
    flex-direction: column;
}
</style>