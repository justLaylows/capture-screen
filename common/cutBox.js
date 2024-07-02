class drawCutBox {
  constructor(dom, drawWidth, drawHeight, callback) {
    this.dom = dom;
    this.drawWidth = drawWidth;
    this.drawHeight = drawHeight;
    this.callback = callback;
    this.drawingInfo = {};
    this.positionInfo = {};

    this.handleMouseDown = this.mouseDownEvent.bind(this);
    this.handleMouseMove = this.mouseMoveEvent.bind(this);
    this.handleMouseUp = this.mouseUpEvent.bind(this);
  }

  // 通过事件监听获取剪裁框的位置信息
  drawing() {
    this.dom && this.dom.addEventListener("mousedown", this.handleMouseDown);
  }
  destroy() {
    this.dom && (this.dom.style.cursor = "inherit");
    this.dom && this.dom.removeEventListener("mousedown", this.handleMouseDown);
    this.dom && this.dom.removeEventListener("mousemove", this.handleMouseMove);
    this.dom && this.dom.removeEventListener("mouseup", this.handleMouseUp);
  }
  mouseDownEvent(e) {
    this.drawingInfo = {
      x: e.clientX,
      y: e.clientY,
      status: "init",
    };
    // 改变鼠标指示器状态
    this.dom.style.cursor = "crosshair";
    this.dom.addEventListener("mousemove", this.handleMouseMove);
    this.dom.addEventListener("mouseup", this.handleMouseUp);
  }
  mouseMoveEvent(e) {
    const { x, y } = this.drawingInfo;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    this.positionInfo = {
      x: Math.max(Math.min(x, mouseX), 0),
      y: Math.max(Math.min(y, mouseY), 0),
      width: Math.min(Math.abs(x - mouseX), this.drawWidth),
      height: Math.min(Math.abs(y - mouseY), this.drawHeight),
    };
    this.drawingInfo.status = "drawing";
    this.callback && this.callback(this.positionInfo, "drawing");
  }
  mouseUpEvent() {
    // 单次点击剪裁全屏
    if (this.drawingInfo.status === "init") {
      const positionInfo = {
        x: 0,
        y: 0,
        width: this.drawWidth,
        height: this.drawHeight,
      };
      this.callback && this.callback(positionInfo, "drawover");
    } else {
      this.callback && this.callback(this.positionInfo, "drawover");
    }
    this.destroy();
  }
  /**
   * @func 绘制裁剪框
   * @desc
   * @param {
   *   ctx, 执行上下文
   *   positionInfo 剪裁框信息
   *   isPoints  是否需要绘制八个点位
   * }
   * @return {}
   */
  drawCutOutBox(ctx, cutBoxInfo, isPoints = true) {
    const { x, y, width, height } = cutBoxInfo;
    const borderSize = 6;
    this.drawShadowMask(ctx, cutBoxInfo);
    // 绘制边框线条
    this.setOptions(ctx);
    ctx.strokeRect(x, y, width, height);
    // 绘制8个边框像素点并保存坐标信息以及事件参数

    // 绘制像素点
    const pointsPlace = this.getBorderPointsPlace(
      x,
      y,
      width,
      height,
      borderSize
    );
    isPoints &&
      pointsPlace.forEach((item) => {
        ctx.fillRect(...item, borderSize, borderSize);
      });
  }
  // 绘制阴影蒙层
  drawShadowMask(ctx, cutBoxInfo) {
    const { x, y, width, height } = cutBoxInfo;
    // 获取一个大矩形除去中间小矩形的上下左右位置信息
    const top = [0, 0, this.drawWidth, y];
    const left = [0, y, x, height];
    const right = [x + width, y, this.drawWidth - x - width, height];
    const bottom = [
      0,
      y + height,
      this.drawWidth,
      this.drawHeight - y - height,
    ];
    const positionList = [top, left, right, bottom];
    ctx.fillStyle = "rgba(0, 0, 0, .5)";

    positionList.forEach((item) => {
      ctx.clearRect(...item);
      ctx.fillRect(...item);
    });
  }

  // 设置样式配置
  setOptions(ctx) {
    const option = {
      strokeStyle: "#2CABFF",
      lineWidth: 1,
      fillStyle: "#2CABFF",
    };

    Object.keys(option).forEach((key) => {
      ctx[key] && (ctx[key] = option[key]);
    });
  }

  // 获取六个标识定位、顺时针
  getBorderPointsPlace(x, y, width, height, size) {
    return [
      [x - size / 2, y - size / 2],
      [x - size / 2 + width / 2, y - size / 2],
      [x - size / 2 + width, y - size / 2],
      [x - size / 2 + width, y - size / 2 + height / 2],
      [x - size / 2 + width, y - size / 2 + height],
      [x - size / 2 + width / 2, y - size / 2 + height],
      [x - size / 2, y - size / 2 + height],
      [x - size / 2, y - size / 2 + height / 2],
    ];
  }
  /**
   * @func  判断剪裁框操作方法：移动
   * @desc  注意：由于是外层使用，需要指定当前的this,否则this指向存在问题
   *        判断是否在边缘线上，采用模糊距离，提高体验
   * @param {}
   * @return {
   *  判断成功后,返回对应的mouse移动事件处理方法、鼠标状态或 抑或是其他信息
   *  其中返回函数支持参数依次为
   *  positionList  图形操作之前、已经转为像素的点位或路径信息
   *  offsetX   x方向、 鼠标移动偏移大小
   *  offsetY  y方向、 鼠标移动偏移大小
   * }
   */
  judgeOperate(positionInfo, mouseX, mouseY) {
    if (!positionInfo) return;
    const blurDistance = 5;
    const { x, y, width, height } = positionInfo;

    // 判断点是否在矩形的左上角

    if (
      this.checkIsRectInside(mouseX, mouseY, x, y, blurDistance, blurDistance)
    )
      // 左上角resize操作
      return {
        mouseCursor: "nw-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;

          const newPosition = {
            x: x + offsetX,
            y: y + offsetY,
            width: width - offsetX,
            height: height - offsetY,
          };

          return this.handleNewData(newPosition);
        },
      };
    // 判断点是否在矩形的右上角
    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x + width,
        y,
        blurDistance,
        blurDistance
      )
    )
      // 右上角resize操作
      return {
        mouseCursor: "ne-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x,
            y: y + offsetY,
            width: width + offsetX,
            height: height - offsetY,
          };

          return this.handleNewData(newPosition);
        },
      };

    // 判断点是否在矩形的左下角
    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x,
        y + height,
        blurDistance,
        blurDistance
      )
    )
      // 左下角resize操作
      return {
        mouseCursor: "sw-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x: x + offsetX,
            y,
            width: width - offsetX,
            height: height + offsetY,
          };

          return this.handleNewData(newPosition);
        },
      };

    // 判断点是否在矩形的右下角

    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x + width,
        y + height,
        blurDistance,
        blurDistance
      )
    )
      // 右下角resize操作
      return {
        mouseCursor: "se-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x,
            y,
            width: width + offsetX,
            height: height + offsetY,
          };

          return this.handleNewData(newPosition);
        },
      };

    // 判断点是否在矩形的上边缘线上

    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x + width / 2,
        y,
        width,
        blurDistance
      )
    )
      // 上边缘线resize操作
      return {
        mouseCursor: "ns-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x,
            y: y + offsetY,
            width,
            height: height - offsetY,
          };

          return this.handleNewData(newPosition);
        },
      };

    // 判断点是否在矩形的下边缘线上

    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x + width / 2,
        y + height,
        width,
        blurDistance
      )
    )
      // 下边缘线resize操作
      return {
        mouseCursor: "ns-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x,
            y,
            width,
            height: height + offsetY,
          };

          return this.handleNewData(newPosition);
        },
      };

    // 判断点是否在矩形的左边缘线上

    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x,
        y + height / 2,
        blurDistance,
        height
      )
    )
      // 左边缘线resize操作
      return {
        mouseCursor: "ew-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x: x + offsetX,
            y,
            width: width - offsetX,
            height,
          };

          return this.handleNewData(newPosition);
        },
      };

    // 判断点是否在矩形的右边缘线上

    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x + width,
        y + height / 2,
        blurDistance,
        height
      )
    )
      // 右边缘线resize操作
      return {
        mouseCursor: "ew-resize",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x,
            y,
            width: width + offsetX,
            height,
          };

          return this.handleNewData(newPosition);
        },
      };

    //判断是否在剪裁框内部
    if (
      this.checkIsRectInside(
        mouseX,
        mouseY,
        x + width / 2,
        y + height / 2,
        width / 2,
        height / 2
      )
    )
      // 剪裁框内部resize操作
      return {
        mouseCursor: "move",
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y, width, height } = positionInfo;
          const newPosition = {
            x: Math.min(Math.max(x + offsetX, 0), this.drawWidth - width),
            y: Math.min(Math.max(y + offsetY, 0), this.drawHeight - height),
            width,
            height,
          };

          return this.handleNewData(newPosition);
        },
      };
  }
  // 判断点是否在矩形内
  checkIsRectInside(mouseX, mouseY, x, y, width, height) {
    return Math.abs(mouseX - x) <= width && Math.abs(mouseY - y) <= height;
  }
  // 处理新的位置数据信息
  handleNewData(newPosition) {
    let { x, y, width, height } = newPosition;
    // 当伸拉反方向超出时，调整坐标
    width < 0 && (x += width);
    height < 0 && (y += height);
    x = Math.max(0, x);
    y = Math.max(0, y);
    width = Math.min(Math.abs(width), this.drawWidth);
    height = Math.min(Math.abs(height), this.drawHeight);
    return { x, y, width, height };
  }
}
export default drawCutBox;
