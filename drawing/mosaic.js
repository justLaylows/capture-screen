import renderMosaic from '../render/mosaic.js' // 绘制马赛克

/**
 * @func 收集事件操作中像素信息
 * @desc
 * @param {}
 * @return {}
 */
class drawingMosaic {
  constructor() {
    this.degreeOfBlur = 10 // 马赛克模糊大小
    this.cutBoxInfo = {}
    this.positionInfo = []
    this.baseImageCtx = null // 底图执行上下文
  }
  /**
   * @func 鼠标点击事件处理
   * @desc
   * @param {
   *   e 事件event
   *   cutBoxInfo 剪裁框信息
   *   ctx 需要添加马赛克的canvas上下文
   *   option 配置项
   *   image 操作底图
   * }
   * @return {}
   */
  mouseDownEvent(e, cutBoxInfo, ctx, option, image) {
    this.cutBoxInfo = cutBoxInfo
    const { clientWidth, clientHeight } = e.target
    this.baseImageCtx = this.getImageCtx(image, clientWidth, clientHeight)
    this.positionInfo = [this.handleData(e.clientX, e.clientY, ctx, option)]
    return this.positionInfo
  }
  /**
   * @func 鼠标移动事件处理
   * @desc
   * @param {
   *   e 事件event
   *   ctx 需要添加马赛克的canvas上下文
   *   option 配置项
   *   image 操作底图
   * }
   * @return {}
   */
  mouseMoveEvent(e, ctx, option) {
    const correctPosition = this.handleData(e.clientX, e.clientY, ctx, option)
    this.positionInfo.push(correctPosition)
    return this.positionInfo
  }

  /**
   * @func 获取底图执行上下文,用于获取底图imageData
   * @desc
   * @param {}
   * @return {}
   */
  getImageCtx(image, width, height) {
    const canvasDom = document.createElement('canvas')
    canvasDom.width = width
    canvasDom.height = height
    const ctx = canvasDom.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
    return ctx
  }
  /**
   * @func 处理位置数据,使其数据位置处于剪裁框范围内
   * @desc
   * @param {}
   * @return {}
   */

  handleData(mouseX, mouseY, ctx, option) {
    const { size = 1 } = option
    const { x, y, width, height } = this.cutBoxInfo
    const rightBottomX = x + width
    const rightBottomY = y + height
    const positionX = Math.min(Math.max(x, mouseX), rightBottomX)
    const positionY = Math.min(Math.max(y, mouseY), rightBottomY)
    const calcSize = this.degreeOfBlur * size
    // 保证是以鼠标为中心周围 ,数据依次为中心位置x,y、马赛克绘制范围size
    const position = [
      ~~(positionX - calcSize / 2),
      ~~(positionY - calcSize / 2),
      ~~calcSize
    ]
    // 在当前位置周围绘制添加一个马赛克
    renderMosaic.addMosaic(this.baseImageCtx, ctx, ...position)
    return position
  }
}

export default new drawingMosaic()
