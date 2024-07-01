import renderBrush from '../render/brush.js' // 绘制任意线

/**
 * @func 收集事件操作中像素信息
 * @desc
 * @param {}
 * @return {}
 */
class drawingBrush {
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
    this.positionInfo.push(this.handleData(e.clientX, e.clientY))
    const drawInfo = { option, positionInfo: this.positionInfo }
    renderBrush.draw(ctx, drawInfo)
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

export default new drawingBrush()
