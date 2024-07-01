/**
 * @func 收集事件操作中像素信息
 * @desc
 * @param {}
 * @return {}
 */
class drawingText {
  constructor() {
    this.baseFontSize = 16
    this.padding = 3 // 边距
    this.minWidth = 35 // 文本dom最小宽度
  }
  mouseDownEvent(e, cutBoxInfo, option) {
    const positionInfo = {
      x: e.clientX,
      y: e.clientY,
      text: ''
    }
    return this.handleLimit(positionInfo, cutBoxInfo, option)
  }
  // 根据当前点击初始化最大宽高度
  handleLimit(positionInfo, cutBoxInfo, option) {
    const { x, y } = positionInfo
    const minHeight = this.baseFontSize * option.size
    const {
      x: cutBoxX,
      y: cutBoxY,
      width: cutWidth,
      height: cutHeight
    } = cutBoxInfo
    // 纠正初始位置
    const correctX = Math.min(
      Math.max(cutBoxX + this.padding, x),
      cutBoxX + cutWidth - this.minWidth - this.padding
    )
    const correctY = Math.min(
      Math.max(cutBoxY + this.padding, y),
      cutBoxY + cutHeight - minHeight - this.padding
    )
    // 计算限制宽高 需要考虑边框大小影响
    const maxWidth = ~~(cutWidth - (x - cutBoxX) - this.padding)
    const maxHeight = ~~(cutHeight - (y - cutBoxY) - this.padding)

    return {
      ...positionInfo,
      x: correctX,
      y: correctY,
      maxWidth,
      maxHeight
    }
  }
}

export default new drawingText()
