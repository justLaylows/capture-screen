class drawArrowLine {
  constructor() {
    this.dpr = window.devicePixelRatio || 1
    this.arrowHeight = 10
    this.arrowAngle = 30
    this.degreeOfBlur = 5 // 模糊度
  }

  draw(ctx, info) {
    const { positionInfo, option = {}, isSelect } = info
    // 根据size大小设置渲染的配置参数
    const [start, end] = positionInfo
    const arrowHeight = this.arrowHeight * (option.size || 1)
    const { leftArrow, rightArrow } = this.drawHeadArrow(
      ...start,
      ...end,
      arrowHeight
    )

    // 计算箭头之间直线两侧点位置
    const leftSlider = this.calculateLinePoint(
      ...rightArrow,
      ...leftArrow,
      arrowHeight / 2
    )
    const rightSlider = this.calculateLinePoint(
      ...leftArrow,
      ...rightArrow,
      arrowHeight / 2
    )

    const positionPath = [leftSlider, leftArrow, end, rightArrow, rightSlider]
    const canvasPath2D = new Path2D()

    this.setOptions(ctx, option)
    canvasPath2D.moveTo(...start)
    positionPath.forEach(item => {
      canvasPath2D.lineTo(...item)
    })
    canvasPath2D.closePath()
    ctx.fill(canvasPath2D)
    // 是否被选中，选中就展示辅助点位
    isSelect && this.drawAuxiliaryPoint(ctx, positionInfo)
    return canvasPath2D
  }
  /**
   * @func 绘制辅助点位，用于展示图形选中状态，即白色圆形点位
   * @desc
   * @param {}
   * @return {}
   */
  drawAuxiliaryPoint(ctx, positionInfo) {
    const radius = this.degreeOfBlur
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 1
    positionInfo.forEach(item => {
      ctx.beginPath()
      ctx.arc(...item, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })
  }
  /**
   * @func  绘制箭头
   * @desc
   * @param {
   *  startX, startY 起始点
   *  endX, endY 终点
   *  arrowHeight 箭头长度
   *  angle 箭头偏角度
   * }
   * @return {}
   */
  drawHeadArrow(startX, startY, endX, endY, arrowHeight, angle = 30) {
    const lineAngle = Math.atan2(endY - startY, endX - startX)

    const leftArrow = this.getArrowPosition(
      endX,
      endY,
      lineAngle,
      'left',
      arrowHeight,
      angle
    )

    const rightArrow = this.getArrowPosition(
      endX,
      endY,
      lineAngle,
      'right',
      arrowHeight,
      angle
    )
    return {
      leftArrow,
      rightArrow
    }
  }
  /**
   * @func 绘制一条直线情况下、根据参考点x、y计算左侧或右侧的某一角度下的另一个点,用于绘制箭头
   * @desc
   * @param {
   *   x,y 参考点
   *   lineAngle 两个之间绘制成一条直线时，两点之间的角度
   *   position 需要计算另一个的位置，左侧还是右侧方向
   *   angle 相对于直线的偏角度
   *   h 到参考直线点的距离
   * }
   * @return {}
   */
  getArrowPosition(x, y, lineAngle, position = 'left', h = 5, angle = 30) {
    // 将角度转换为弧度
    const radians = angle * (Math.PI / 180)
    // 计算斜边长
    const len = h / Math.sin(radians)
    const calcAngle =
      lineAngle + Math.PI + (position === 'left' ? -radians : radians)
    const calcX = x + Math.cos(calcAngle) * len
    const calcY = y + Math.sin(calcAngle) * len

    return [calcX, calcY]
  }

  /**
   * @func 计算一条直线上,从起始点到终点之间某一距离为distance(相对于终点)的一点
   * @desc
   * @param {}
   * @return {}
   */
  calculateLinePoint(startX, startY, endX, endY, distance = 0) {
    const pathLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
    const x = startX + (endX - startX) * ((pathLength - distance) / pathLength)
    const y = startY + (endY - startY) * ((pathLength - distance) / pathLength)
    return [x, y]
  }
  // 设置ctx样式配置
  setOptions(ctx, option) {
    ctx.fillStyle = option.color
    ctx.strokeStyle = option.color
    ctx.lineWidth = 1
  }

  /**
   * @func  判断直线操作方法：移动
   * @desc 注意：由于是外层使用，需要指定当前的this,否则this指向存在问题
   * @param {}
   * @return {
   *   判断成功后,返回对应的mouse移动事件处理方法、鼠标状态或 抑或是其他信息
   *  其中返回函数支持参数依次为
   *  positionList  图形操作之前、已经转为像素的点位或路径信息
   *  offsetX   x方向、 鼠标移动偏移大小
   *  offsetY  y方向、 鼠标移动偏移大小
   * }
   */
  judgeOperate(info, ctx, x, y) {
    const { canvasPath2D, positionInfo } = info
    if (!canvasPath2D) return
    // 获取直线起始和终点点位
    const [start, end] = positionInfo
    // 起始点
    if (this.judgeWithinRound(x, y, start)) {
      return {
        mouseCursor: 'grabbing',
        fnExecution: (positionList, offsetX, offsetY) => {
          const newPosition = this.changePosition(
            positionList,
            offsetX,
            offsetY,
            1
          )

          return newPosition
        }
      }
    }
    // 终点
    if (this.judgeWithinRound(x, y, end)) {
      return {
        mouseCursor: 'grabbing',
        fnExecution: (positionList, offsetX, offsetY) => {
          const newPosition = this.changePosition(
            positionList,
            offsetX,
            offsetY,
            0
          )
          return newPosition
        }
      }
    }
    if (
      ctx.isPointInStroke(canvasPath2D, x * this.dpr, y * this.dpr) ||
      ctx.isPointInPath(canvasPath2D, x * this.dpr, y * this.dpr)
    ) {
      return {
        mouseCursor: 'move',
        fnExecution: (positionList, offsetX, offsetY) => {
          const newPosition = this.changePosition(
            positionList,
            offsetX,
            offsetY
          )

          return newPosition
        }
      }
    }
  }

  // 判断是否在圆形内
  judgeWithinRound(mouseX, mouseY, center) {
    const radius = this.degreeOfBlur
    const [x, y] = center
    return (mouseX - x) ** 2 + (mouseY - y) ** 2 <= radius ** 2
  }
  /**
   * @func 将像素位置、设置偏移
   * @desc
   * @param {
   *  positionList 像素位置
   *   offsetX,offsetY 偏移量
   *   noIndex 不需要偏移的经纬度索引
   * }
   * @return {}
   */
  changePosition(positionList, offsetX, offsetY, noIndex) {
    return positionList.map((item, index) => {
      const [x, y] = item
      const newX = x + (noIndex === index ? 0 : offsetX)
      const newY = y + (noIndex === index ? 0 : offsetY)
      return [newX, newY]
    })
  }
}

export default new drawArrowLine()
