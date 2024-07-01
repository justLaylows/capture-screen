/**
 * @func 绘制马赛克、设计与其他图形不同:马赛克改变的是底图像素点颜色配置
 * @desc
 * @param {}
 * @return {}
 */

class drawMosaic {
  constructor() {
    this.record = new Set() // 记录绘制过的位置
    this.baseImageCtx = null // 底图执行上下文 ，主要用于获取imageData数据
  }

  /**
   * @func 绘制马赛克
   * @desc 绘制的马赛克
   * @param {}
   * @return {}
   */
  draw(canvas, image, drawList = []) {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    this.baseImageCtx = this.getImageCtx(image, width, height)
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)
    // 清空记录
    this.record.clear()
    drawList.forEach(info => {
      const { positionInfo } = info
      positionInfo.forEach(item => {
        this.addMosaic(this.baseImageCtx, ctx, ...item)
      })
    })
  }
  /**
   * 为一个位置添加马赛克
   *    实现思路：
   *      1. 获取鼠标划过路径区域的图像信息
   *      2. 将区域内的像素点绘制成周围相近的颜色
   * @param imageCtx 底图上下文
   * @param ctx 绘制执行上下文
   * @param x 当前鼠标X轴坐标
   * @param y 当前鼠标Y轴坐标
   * @param size 马赛克画笔大小
   */
  addMosaic(imageCtx, ctx, x, y, size) {
    // 当前位置绘制过马赛克不再绘制
    if (!imageCtx || this.record.has([x, y].join())) return
    const imageData = imageCtx.getImageData(x, y, size, size)
    //分别取四个端点处的像素点为整块区域的颜色，以达到马赛克的效果
    const colorA = this.getAxisColor(imageData, 0, 0)
    const colorB = this.getAxisColor(imageData, 0, size - 1)
    const colorC = this.getAxisColor(imageData, size - 1, 0)
    const colorD = this.getAxisColor(imageData, size - 1, size - 1)
    //更改矩形颜色，xy位置加上size范围内的矩形 ，来变更矩形rgba为color
    // 由将整个大的矩形划分为4个小方块分别绘制不同的马赛克颜色
    const middle = size / 2
    for (let w = 0; w < size; w++) {
      for (let h = 0; h < size; h++) {
        const position = [w + x, y + h].join()
        this.record.add(position)
        if (w < middle && h < middle) {
          this.setAxisColor(imageData, w, h, colorA)
        } else if (w >= middle && h < middle) {
          this.setAxisColor(imageData, w, h, colorB)
        } else if (w < middle && h >= middle) {
          this.setAxisColor(imageData, w, h, colorC)
        } else {
          this.setAxisColor(imageData, w, h, colorD)
        }
      }
    }
    ctx.putImageData(imageData, x, y)
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
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)
    return ctx
  }
  /**
   * 获取图像指定坐标位置的颜色
   * @param imgData 需要进行操作的图片
   * @param x x点坐标
   * @param y y点坐标
   */
  getAxisColor(imgData, x, y) {
    const w = imgData.width
    const data = imgData.data
    const color = []
    //(y*w+x)*4  y多少行*宽+x列前面多少个*4(4代表rgba) 得到坐标最终索引获取color
    color[0] = data[(y * w + x) * 4] //R -> 0~255
    color[1] = data[(y * w + x) * 4 + 1] //G -> 0~255
    color[2] = data[(y * w + x) * 4 + 2] //B -> 0~255
    color[3] = data[(y * w + x) * 4 + 3] //A -> 0~255
    return color
  }
  /**
   * 设置图像指定坐标位置的颜色
   * @param imgData 需要进行操作的图片
   * @param x x点坐标
   * @param y y点坐标
   * @param colors 颜色数组
   */
  setAxisColor(imgData, x, y, colors) {
    const w = imgData.width
    const d = imgData.data
    d[4 * (y * w + x)] = colors[0]
    d[4 * (y * w + x) + 1] = colors[1]
    d[4 * (y * w + x) + 2] = colors[2]
    d[4 * (y * w + x) + 3] = colors[3]
  }
}

export default new drawMosaic()
