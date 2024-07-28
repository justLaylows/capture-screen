import { CUTBOXINFO } from '../types/index'
class ToolPanel {
  createToolDom(clickEvent: (e: MouseEvent) => void, zIndex: number) {
    const toolList = [
      {
        label: "矩形",
        value: "rectangle",
      },
      {
        label: "椭圆",
        value: "circle",
      },
      {
        label: "箭头",
        value: "arrow",
      },
      {
        label: "画笔",
        value: "brush",
      },
      {
        label: "马赛克",
        value: "mosaic",
      },
      {
        label: "文本",
        value: "text",
      },
      {
        label: "撤销",
        value: "revoke",
      },
      {
        label: "退出",
        value: "exit",
      },
      {
        label: "下载",
        value: "download",
      },
      {
        label: "保存",
        value: "save",
      },
    ];
    const toolBox = document.createElement("div");
    toolBox.className = "capture_screen_tool_panel";
    toolBox.style.zIndex = `${zIndex}`;
    toolList.forEach((item) => {
      const toolItem = document.createElement("span");
      toolItem.className = `capture_screen_tool_item tool_item_${item.value}`;
      toolItem.setAttribute("tool-data", item.value);
      toolItem.setAttribute("title", item.label);
      toolBox.appendChild(toolItem);
    });
    toolBox.onclick = clickEvent;
    return toolBox;
  }

  /**
   * @func 参照剪裁框位置信息设置工具栏位置
   * @desc
   * @param {
   *   toolsDom 工具栏dom
   *   cutBoxInfo 剪裁框信息
   *   drawWidth 、 drawHeight  截屏宽高 用于做限制处理
   *   isShow 是否需要展示
   * }
   * @return {}
   */
  setToolsPosition(toolsDom: HTMLElement, cutBoxInfo: CUTBOXINFO, drawWidth: number, drawHeight: number, isShow: boolean = true) {
    const { x, y, width, height } = cutBoxInfo;
    const right = drawWidth - x - width + 5;
    const top = y + height + 5;
    toolsDom.style.right = Math.min(right, drawWidth) + "px";
    // 考虑到color与size设置项
    toolsDom.style.top =
      Math.max(top + 80 > drawHeight ? y - 40 : top, 5) + "px";
    toolsDom.style.display = isShow ? "flex" : "none";
  }
}

export default new ToolPanel();
