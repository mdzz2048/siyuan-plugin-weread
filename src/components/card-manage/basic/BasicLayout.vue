<template>
    <div class="common-layout">
        <el-container class="el-container">
            <el-aside class="layout-basic--navbar">
                <slot name="aside"></slot>
            </el-aside>
            <el-container class="el-container">
                <el-aside class="layout-basic--menu">
                    <slot name="menu"></slot>
                </el-aside>
                <el-main class="layout-basic--main">
                    <el-header class="layout-basic--header">
                        <slot name="header"></slot>
                    </el-header>
                    <el-main class="layout-basic--main">
                        <slot></slot>
                    </el-main>
                </el-main>
            </el-container>
        </el-container>
  </div>
</template>

<style scoped>
.common-layout {
    height: 100%;
}
.el-container {
    height: 100%;
}
.layout-basic--navbar {
    width: 60px;
    background-color: #e6e8ed;
    border-right: 1px solid #d5d5d5;
}
.layout-basic--menu {
    width: 290px;
    min-width: 200px;
    max-width: 400px;
    background-color: #edeff3;
    border-right: 1px solid #d5d5d5;
}
.layout-basic--header {
    border-bottom: 1px solid #d5d5d5;
}
.layout-basic--main {
    background-color: #edeff3;
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: auto;
}
</style>