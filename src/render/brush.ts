import { POSITIONINFO, RENDERINFO,  OPTION } from '../types/index'
// 绘制画笔
class drawBrush {
  dpr:number
  baseLineWidth:number
  constructor() {
    this.dpr = window.devicePixelRatio || 1
    this.baseLineWidth = 3
  }

  /**
   * @func 绘制直线
   * @desc
   * @param {}
   * @return {}
   */
  draw(ctx:CanvasRenderingContext2D, info: RENDERINFO) {
    const { positionInfo , option} = info
    const canvasPath2D = new Path2D()
    this.setOptions(ctx, option)
    positionInfo.forEach(item => {
      canvasPath2D.lineTo(...item as [number, number])
    })

    ctx.stroke(canvasPath2D)
    return canvasPath2D
  }
  // 设置样式配置
  setOptions(ctx:CanvasRenderingContext2D, option:OPTION) {
    const { color, size } = option

    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = this.baseLineWidth * size
  }
  /**
   * @func  判断任意曲线操作方法：移动
   * @desc 注意：由于是外层使用，需要指定当前的this,否则this指向存在问题
   * @param {}
   * @return {
   *  判断成功后,返回对应的mouse移动事件处理方法、鼠标状态或 抑或是其他信息
   *  其中返回函数支持参数依次为
   *  positionList  图形操作之前、已经转为像素的点位或路径信息
   *  offsetX   x方向、 鼠标移动偏移大小
   *  offsetY  y方向、 鼠标移动偏移大小
   * }
   */
  judgeOperate(info:RENDERINFO, ctx:CanvasRenderingContext2D, x:number, y:number) {
    const { canvasPath2D } = info
    if (!canvasPath2D) return
    if (ctx.isPointInStroke(canvasPath2D, x * this.dpr, y * this.dpr)) {
      return {
        mouseCursor: 'move',
        fnExecution: (positionList:POSITIONINFO, offsetX:number, offsetY:number) =>{
          return positionList.map(item => {
            const [x, y] = item
            return [x + offsetX, y + offsetY]
          })
        }
      }
    }
  }
}

export default new drawBrush()
