import renderArrowLine from '../render/arrowLine.js' // 绘制箭头

/**
 * @func 收集事件操作中像素信息
 * @desc
 * @param {}
 * @return {}
 */

class drawingArrowLine {
  constructor() {
    this.cutBoxInfo = {}
    this.positionInfo = []
  }
  mouseDownEvent(e, cutBoxInfo) {
    const mouseX = e.clientX
    const mouseY = e.clientY
    this.cutBoxInfo = cutBoxInfo
    this.positionInfo = [[mouseX, mouseY]]
  }

  mouseMoveEvent(e, ctx, option) {
    const start = this.positionInfo.shift()

    const end = this.handleData(e.clientX, e.clientY)
    this.positionInfo = [start, end]
    const drawInfo = { option, positionInfo: this.positionInfo }
    renderArrowLine.draw(ctx, drawInfo)
    return this.positionInfo
  }
  /**
   * @func 处理位置数据,使其数据位置处于剪裁框范围内
   * @desc
   * @param {}
   * @return {}
   */

  handleData(mouseX, mouseY) {
    const { x, y, width, height } = this.cutBoxInfo
    const rightBottomX = x + width
    const rightBottomY = y + height
    const positionX = Math.min(Math.max(x, mouseX), rightBottomX)
    const positionY = Math.min(Math.max(y, mouseY), rightBottomY)
    return [positionX, positionY]
  }
}

export default new drawingArrowLine()
