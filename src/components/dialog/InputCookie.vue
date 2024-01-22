<template>
    <Tips
        cancelButtonText="取消"
        confirmButtonText="确认"
        @onCancle="cancel"
        @onConfirm="confirm"
    >
        <Input type="text" setting-key="input-cookie" setting-value=""/>
    </Tips>
</template>

<script setup lang="ts">
    import { Dialog } from 'siyuan';
    import Tips from '../siyuan/siyuan/dialog/Tips.vue';
    import Input from '../siyuan/siyuan/setting/Input.vue';

    const props = defineProps<{
        dialog: Dialog,
    }>();

    function cancel() {
        props.dialog.destroy();
    }

    function confirm() {
        console.log('do something');
        props.dialog.destroy();
    }
</script>