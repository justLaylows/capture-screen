import { CUTBOXINFO, OPTION, TEXTPOSITIONINFO } from '../types/index'

/**
 * @func 收集事件操作中像素信息
 * @desc
 * @param {}
 * @return {}
 */
class drawingText {
  baseFontSize: number
  padding: number
  minWidth: number
  constructor() {
    this.baseFontSize = 20
    this.padding = 3 // 边距
    this.minWidth = 35 // 文本dom最小宽度
  }
  mouseDownEvent(e: MouseEvent, cutBoxInfo: CUTBOXINFO, option: OPTION) {
    const positionInfo = {
      x: e.offsetX,
      y: e.offsetY,
      text: ''
    }
    return this.handleLimit(positionInfo, cutBoxInfo, option)
  }
  // 计算文字字体大小并进行限制
  calcFontSize(baseFontSize: number, size: number) {
    const fontSize = baseFontSize * size
    return Math.max(16, Math.min(28, fontSize))
  }
  // 根据当前点击初始化最大宽高度
  handleLimit(positionInfo: TEXTPOSITIONINFO, cutBoxInfo: CUTBOXINFO, option: OPTION) {
    const { x, y } = positionInfo
    const minHeight = this.calcFontSize(this.baseFontSize, option.size)
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
