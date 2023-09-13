<script lang="ts">
    import { book, FileDetail } from ".";
    import Svg from "../base/misc/Svg.svelte";
    import { 详情列表, 紧凑列表, 详情卡片, 紧凑卡片, 标题列表 } from "./toolbar";
    // import MenuItem from "../base/menu/MenuItem.svelte";
    import { Option } from "../base/menu";
    import { openMenu } from "./toolbar";

    const SVG_STYLE = "width: 14px; height: 14px";

    let checkedAttrs = [];
    let showAttr: book = {
        bookId: 'bookId', 
        title: 'title', 
        cover: 'cover', 
    }
    let showType: number = 0;
    let options: Option[] = [
            {
                icon: 详情列表, 
                text: '详情列表', 
                func: () => {
                    console.log('详情列表')
                }
            }, 
            {
                icon: 紧凑列表, 
                text: '紧凑列表', 
                func: () => {
                    console.log('紧凑列表')
                }
            }, 
            {
                icon: 详情卡片, 
                text: '详情卡片', 
                func: () => {
                    console.log('详情卡片')
                }
            }, 
            {
                icon: 紧凑卡片, 
                text: '紧凑卡片', 
                func: () => {
                    console.log('紧凑卡片')
                }
            }, 
            {
                icon: 标题列表, 
                text: '标题列表', 
                func: () => {
                    console.log('标题列表')
                }
            }
        ]
    let navigationStack = new Array<FileDetail>();
    let navigationHistoryStack = new Array<FileDetail>();

    navigationStack = [
        {
            id: '2', 
            parentId: '1', 
            fileName: '文件一', 
            fileType: 0
        }, 
        {
            id: '1', 
            parentId: '', 
            fileName: '文件夹', 
            fileType: 1
        }, 
        {
            id: '3', 
            parentId: '1', 
            fileName: '文件二', 
            fileType: 0
        }, 
        {
            id: '4', 
            parentId: '2', 
            fileName: '文件夹一', 
            fileType: 1
        }
    ]

    console.log(checkedAttrs);
    console.log(navigationHistoryStack);
    console.log(navigationStack);
    console.log(options);
    console.log(showAttr);

</script>

<div class="weread-library-toolbar">
    <div class="weread-library-toolbar-navigation">
        <span 
            class="weread-library-toolbar-navigation-item"
            on:keydown on:click={() => {
                console.log('后退');
            }}
        >
            <Svg icon="#iconBack" style={SVG_STYLE}></Svg>
        </span>
        <span
            class="weread-library-toolbar-navigation-item"
            on:keydown on:click={() => {
                console.log('前进');
            }}
        >          
            <Svg icon="#iconForward" style={SVG_STYLE}></Svg>
        </span>
        <span 
            class="weread-library-toolbar-navigation-item"
            on:keydown on:click={() => {
                console.log('历史');
            }}
        >
            <Svg icon="#iconDown" style={SVG_STYLE}></Svg>
        </span>
        <span 
            class="weread-library-toolbar-navigation-item"
            on:keydown on:click={() => {
                console.log('上级');
            }}
        >
            <Svg icon="#iconUp" style={SVG_STYLE}></Svg>
        </span>
    </div>
    <div class="weread-library-toolbar-folder-path">
        {#each navigationStack as folder_path}
            <span 
                class="weread-library-toolbar-folder-path-item"
                on:keydown on:click={() => {
                    console.log(folder_path);
                }}
            >
            {folder_path.fileName}
            </span>
        {/each}
    </div>
    <div class="weread-library-toolbar-search">
        <!-- todo: 搜索框-等书架管理功能做好了以后再加 -->
    </div>
    <div class="weread-library-toolbar-view-type">
        <!-- todo: 点击弹出菜单，同插件右键 -->
        {#if showType === 3}
            <span
                class="weread-library-toolbar-view-type-item"
                on:keydown on:click={() => {
                    
                }}
            >
                <!-- 绑定多个 input 值: https://www.svelte.cn/docs#%E7%BB%84%E7%BB%91%E5%AE%9A -->
                <Svg icon="#iconFilter" style={SVG_STYLE}></Svg>
            </span>
        {/if}
        <span
            class="weread-library-toolbar-view-type-item"
            on:keydown on:click={() => {
                console.log('open menu');
                openMenu();
                console.log('finsh');
            }}
        >
        {@html 详情卡片}
        </span>
    </div>
</div>

<style lang="css">
    .weread-library-toolbar {
        display: flex;
    }

    .weread-library-toolbar-navigation {
        display: flex;
        align-items: center;
        box-shadow: rgb(15 15 15 / 15%) 0px 1px 2px;
    }
    .weread-library-toolbar-navigation-item {
        margin: 2px;
        padding: 5px;
    }

    .weread-library-toolbar-folder-path {
        display: flex;
        align-items: center;
        box-shadow: rgb(15 15 15 / 15%) 0px 1px 2px;
    }
    .weread-library-toolbar-folder-path-item {
        padding-left: 5px;
        padding-right: 5px;
    }

    .weread-library-toolbar-view-type {
        display: flex;
        align-items: center;
        box-shadow: rgb(15 15 15 / 15%) 0px 1px 2px;
    }
    .weread-library-toolbar-folder-path-item {
        padding-left: 5px;
        padding-right: 5px;
    }
</style>