import { Menu } from "siyuan"

export const 详情卡片 = 
    `<svg width="14px" height="14px" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.729" y="0.729" width="5.104" height="5.104" rx="1.311" stroke="currentColor" stroke-width="1.301" fill="none"></rect>
        <rect x="0.729" y="8.167" width="5.104" height="5.104" rx="1.311" stroke="currentColor" stroke-width="1.301" fill="none"></rect>
        <rect x="8.166" y="0.729" width="5.104" height="5.104" rx="1.311" stroke="currentColor" stroke-width="1.301" fill="none"></rect>
        <rect x="8.166" y="8.167" width="5.104" height="5.104" rx="1.311" stroke="currentColor" stroke-width="1.301" fill="none"></rect>
    </svg>`

export const 紧凑卡片 = 
    `<svg width="14px" height="14px" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect y="5.7" width="6.417" height="2.6" rx="1.3" fill="currentColor"></rect>
        <rect x="7.583" y="5.7" width="6.417" height="2.6" rx="1.3" fill="currentColor"></rect>
        <rect y="9.905" width="6.417" height="2.6" rx="1.3" fill="currentColor"></rect>
        <rect x="7.583" y="9.905" width="6.417" height="2.6" rx="1.3" fill="currentColor"></rect>
        <rect y="1.496" width="6.417" height="2.6" rx="1.3" fill="currentColor"></rect>
        <rect x="7.583" y="1.496" width="6.417" height="2.6" rx="1.3" fill="currentColor"></rect>
    </svg>`

export const 详情列表 = 
    `<svg width="14px" height="14px" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.729" y="1.75" width="12.542" height="4.083" rx="1.311" stroke="currentColor" stroke-width="1.301" fill="none"></rect>
        <rect x="0.292" y="8.166" width="13.417" height="1.458" rx="0.729" fill="currentColor"></rect>
        <rect x="0.292" y="11.375" width="10.208" height="1.458" rx="0.729" fill="currentColor"></rect>
    </svg>`

export const 紧凑列表 = 
    `<svg width="14px" height="14px" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.729" y="1.604" width="4.083" height="4.083" rx="2.042" stroke="currentColor" stroke-width="1.301" fill="none"></rect>
        <rect x="6.708" y="4.521" width="7.292" height="1.458" rx="0.729" fill="currentColor"></rect>
        <rect x="6.708" y="1.604" width="7.292" height="1.458" rx="0.729" fill="currentColor"></rect>
        <rect x="0.729" y="8.021" width="4.083" height="4.083" rx="2.042" stroke="currentColor" stroke-width="1.301" fill="none"></rect>
        <rect x="6.708" y="8.021" width="7.292" height="1.458" rx="0.729" fill="currentColor"></rect>
        <rect x="6.708" y="10.938" width="7.292" height="1.458" rx="0.729" fill="currentColor"></rect>
    </svg>`

export const 标题列表 = 
    `<svg width="14px" height="14px" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect y="6.271" width="14" height="1.458" rx="0.729" fill="currentColor"></rect>
        <rect y="9.625" width="9.333" height="1.458" rx="0.729" fill="currentColor"></rect>
        <rect y="2.917" width="14" height="1.458" rx="0.729" fill="currentColor"></rect>
    </svg>`

export function openMenu() {
    console.log('menu')
    // 使用更多按钮的宽度
    let rect = document.querySelector("#barMore").getBoundingClientRect();

    // 添加设置按钮
    const menu = new Menu('LibraryWereadContextMenu');
    menu.addItem({
        icon: 'iconSettings', 
        label: '设置', 
        click: async () => {
            console.log('setting');
        }
    });

    menu.open({
        x: 100,
        y: 100,
        isLeft: true
    })
}