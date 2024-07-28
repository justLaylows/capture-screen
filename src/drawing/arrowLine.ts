
import { CUTBOXINFO,OPTION,POSITIONINFO } from '../types/index'
import renderArrowLine from '../render/arrowLine' // 绘制箭头

/**
 * @func 收集事件操作中像素信息
 * @desc
 * @param {}
 * @return {}
 */

class drawingArrowLine {
  cutBoxInfo: CUTBOXINFO
  positionInfo:POSITIONINFO
  constructor() {
    this.cutBoxInfo = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
    this.positionInfo = []
  }
  mouseDownEvent(e:MouseEvent, cutBoxInfo:CUTBOXINFO) {
    const mouseX = e.offsetX
    const mouseY = e.offsetY
    this.cutBoxInfo = cutBoxInfo
    this.positionInfo = [[mouseX, mouseY]]
  }

  mouseMoveEvent(e:MouseEvent, ctx:CanvasRenderingContext2D , option:OPTION) {
    const start = this.positionInfo.shift() as Array<number>

    const end = this.handleData(e.offsetX, e.offsetY)
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

  handleData(mouseX:number, mouseY:number) {
    const { x, y, width, height } = this.cutBoxInfo
    const rightBottomX = x + width
    const rightBottomY = y + height
    const positionX = Math.min(Math.max(x, mouseX), rightBottomX)
    const positionY = Math.min(Math.max(y, mouseY), rightBottomY)
    return [positionX, positionY]
  }
}

export default new drawingArrowLine()
