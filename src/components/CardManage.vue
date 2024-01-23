<!-- todo: 弄一个布局组件，避免引入 element-plus -->
<template>
    <div class="common-layout" id="card-manage">
        <el-container class="el-container">
            <!-- 侧边栏 -->
            <el-aside class="layout-basic--navbar">
                <svg class="b3-list-item__graphic" @click="currentRouter = 'View'">
                    <use xlink:href="#iconInbox"></use>
                </svg>
                <svg class="b3-list-item__graphic" @click="currentRouter = 'Charts'">
                    <use xlink:href="#iconTable"></use>
                </svg>
            </el-aside>
            <!-- 动态组件 -->
            <component :is="routers[currentRouter]" />
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NotFound from './card-manage/router/NotFound.vue';
import Charts from './card-manage/router/Charts.vue';
import View from './card-manage/router/View.vue';

const routers = {
    View,
    Charts,
    NotFound,
}
const currentRouter = ref("Charts" ?? "NotFound")
</script>

<style scoped>
.common-layout {
    height: 100%;
}
.el-container {
    height: 100%;
}
.layout-basic--navbar {
    width: 40px;
    background-color: #e6e8ed;
    border-right: 1px solid #d5d5d5;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.layout-basic--navbar > svg {
    padding: 5px;
    margin: 5px;
}
</style>