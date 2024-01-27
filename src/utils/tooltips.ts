/**
 * 使用思源默认的 tooltips 样式进行提示
 * @param element 触发的事件
 * @param tooltip 显示的内容
 */
export function showToolTip(event: MouseEvent, tooltip: string) {
    const element = event.target as HTMLElement
    const rect = element.getBoundingClientRect()

    removeTooltip()
    addToolTip(tooltip, rect)
}

const isMobile = () => {
    return document.getElementById("sidebar") ? true : false;
}

const addToolTip = (text: string, rect: DOMRect) => {
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'tooltip';
    tooltip.innerText = text;
    document.body.appendChild(tooltip);
    console.log(text, tooltip)
    setPosition(tooltip, rect.left, rect.bottom, rect.height, rect.width);
}

const removeTooltip = () => {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

/**
 * 设置元素位置
 * REF: https://github.com/siyuan-note/siyuan/blob/master/app/src/util/setPosition.ts#L3
*/
const setPosition = (element: HTMLElement, x: number, y: number, targetHeight: number = 0, targetLeft: number = 0) => {
    element.style.top = y + "px";
    element.style.left = x + "px";
    const rect = element.getBoundingClientRect();
    const toolbarHight = isMobile() ? 0 : 32;
    // 上下超出屏幕
    if (rect.bottom > window.innerHeight || rect.top < toolbarHight) {
        const top = y - rect.height - targetHeight;
        if (top > toolbarHight && (top + rect.height) < window.innerHeight) {
            // 上部
            element.style.top = top + "px";
        } else if (top <= toolbarHight) {
            // 位置超越到屏幕上方外时，需移动到屏幕顶部。eg：光标在第一个块，然后滚动到上方看不见的位置，按 ctrl+a
            element.style.top = toolbarHight + "px";
        } else {
            // 依旧展现在下部，只是位置上移
            element.style.top = Math.max(toolbarHight, window.innerHeight - rect.height) + "px";
        }
    }
    if (rect.right > window.innerWidth) {
        // 展现在左侧
        element.style.left = `${window.innerWidth - rect.width - targetLeft}px`;
    } else if (rect.left < 0) {
        // 依旧展现在左侧，只是位置右移
        element.style.left = "0";
    }
}