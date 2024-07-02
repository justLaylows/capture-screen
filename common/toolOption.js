class ToolOption {
  /**
   * @func 创建配置栏dom
   * @desc
   * @param {
   *  sizeClickEvent, 大小点击事件处理
   *  colorClcikEvent, 颜色点击事件处理
   *   defaultOption 默认选择的配置用于设置状态
   * }
   * @return {}
   */
  createOptionDom(sizeClickEvent, colorClcikEvent, defaultOption) {
    const optionBox = document.createElement("div");
    optionBox.className = "capture_screen_option-box";
    const sizeBox = this.createSizeDom(sizeClickEvent, defaultOption);
    const colorBox = this.createColorDom(colorClcikEvent, defaultOption);
    const iconBox = this.createIconDom();
    optionBox.appendChild(sizeBox);
    optionBox.appendChild(colorBox);
    // 添加三角形角标
    optionBox.appendChild(iconBox);
    return optionBox;
  }

  createSizeDom(sizeClickEvent, defaultOption) {
    const sizeList = [
      {
        value: 0.5,
      },
      {
        value: 1,
      },
      {
        value: 1.5,
      },
    ];

    const sizeBox = document.createElement("div");
    sizeBox.className = "capture_screen_size-box";
    sizeList.forEach((item) => {
      const { value } = item;
      const sizeItem = document.createElement("span");
      sizeItem.className =
        value === defaultOption.size ? "size_item active" : "size_item";
      sizeItem.setAttribute("size-data", value);
      sizeBox.appendChild(sizeItem);
    });
    sizeBox.onclick = sizeClickEvent;
    return sizeBox;
  }
  createColorDom(colorClcikEvent, defaultOption) {
    const colorList = [
      {
        value: "#ff0000",
      },
      {
        value: "#057cf2",
      },
      {
        value: "#06de2e",
      },
      {
        value: "#ece706",
      },
      {
        value: "#000000",
      },
      {
        value: "#ffffff",
      },
    ];

    const colorBox = document.createElement("div");
    colorBox.className = "capture_screen_color-box";
    colorList.forEach((item) => {
      const { value } = item;
      const colorItem = document.createElement("span");
      colorItem.className =
        value === defaultOption.color ? "color_item active" : "color_item";
      colorItem.style.backgroundColor = value;
      colorItem.setAttribute("color-data", value);
      colorBox.appendChild(colorItem);
    });
    colorBox.onclick = colorClcikEvent;
    return colorBox;
  }
  // 创建三角形定位icon
  createIconDom() {
    const iconDom = document.createElement("div");
    iconDom.className = "triangle-icon";
    return iconDom;
  }
  /**
   * @func 参照工具栏位置信息设置配置栏位置
   * @desc
   * @param {
   *   toolBox 工具栏dom
   *   optionDom 配置栏dom
   *   activeTool 当前active的工具栏
   * }
   * @return {}
   */
  setToolsPosition(toolDom, optionDom, activeTool) {
    const isShow = !!activeTool;
    optionDom.style.display = isShow ? "flex" : "none";
    // 设置颜色选择显示与隐藏状态，选中马赛克时不予展示颜色选择器
    const colorBox = optionDom.querySelector(".capture_screen_color-box");
    colorBox.style.display = activeTool === "mosaic" ? "none" : "flex";

    const activeToolDom = toolDom.querySelector(".active");
    // 用于设置角标位置
    const triangleDom = optionDom.querySelector(".triangle-icon");
    const { offsetLeft = 0, clientWidth = 0 } = activeToolDom || {};
    optionDom.style.top = "42px";
    if (activeTool === "mosaic") {
      optionDom.style.left =
        offsetLeft + clientWidth / 2 - optionDom.clientWidth / 2 + "px";
      triangleDom.style.left = "50%";
    } else {
      optionDom.style.left = 0;
      triangleDom.style.left = offsetLeft + clientWidth / 2 + "px";
    }
  }
}

export default new ToolOption();
