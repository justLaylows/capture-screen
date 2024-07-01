import renderCircle from '../render/circle.js' // 绘制椭圆

/**
 * @func 收集事件操作中像素信息
 * @desc
 * @param {}
 * @return {}
 */

class drawingCircle {
  constructor() {
    this.cutBoxInfo = {}
    this.drawingInfo = null
    this.positionInfo = []
  }
  mouseDownEvent(e, cutBoxInfo) {
    const mouseX = e.clientX
    const mouseY = e.clientY
    this.cutBoxInfo = cutBoxInfo
    this.drawingInfo = { clickX: mouseX, clickY: mouseY }
  }
  mouseMoveEvent(e,ctx,option) {
    const { clickX, clickY } = this.drawingInfo

    const mouseX = e.clientX
    const mouseY = e.clientY
    // 计算矩形的左上角点坐标
    const topLeftX = Math.min(clickX, mouseX)
    const topLeftY = Math.min(clickY, mouseY)

    // 计算矩形的右上角点坐标
    const topRightX = Math.max(clickX, mouseX)
    const topRightY = topLeftY

    // 计算矩形的右下角点坐标
    const bottomRightX = topRightX
    const bottomRightY = Math.max(clickY, mouseY)

    // 计算矩形的左下角点坐标
    const bottomLeftX = topLeftX
    const bottomLeftY = bottomRightY

    this.positionInfo = this.handleData([
      [topLeftX, topLeftY],
      [topRightX, topRightY],
      [bottomRightX, bottomRightY],
      [bottomLeftX, bottomLeftY]
    ])

    const drawInfo = { option, positionInfo: this.positionInfo }
    renderCircle.draw(ctx, drawInfo)
    return this.positionInfo
  }

  /**
   * @func 处理位置数据,使其数据位置处于剪裁框范围内
   * @desc
   * @param {}
   * @return {}
   */

  handleData(positionList) {
    const { x, y, width, height } = this.cutBoxInfo
    const rightBottomX = x + width
    const rightBottomY = y + height
    return positionList.map(item => {
      const [X, Y] = item
      const positionX = Math.min(Math.max(x, X), rightBottomX)
      const positionY = Math.min(Math.max(y, Y), rightBottomY)
      return [positionX, positionY]
    })
  }
}
export default new drawingCircle()
