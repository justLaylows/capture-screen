/*
 * @description: 绘制矩形
 */

class drawRectangle {
  constructor() {
    this.dpr = window.devicePixelRatio || 1
    this.baseLineWidth = 3
    this.degreeOfBlur = 5 //模糊程度
  }

  /**
   * @func 绘制矩形
   * @desc
   * @param {}
   * @return {}
   */
  draw(ctx, info) {
    const { positionInfo, option = {}, isSelect } = info
    const canvasPath2D = new Path2D()
    this.setOptions(ctx, option)
    positionInfo.forEach(item => {
      canvasPath2D.lineTo(...item)
    })
    canvasPath2D.closePath()
    ctx.stroke(canvasPath2D)
    isSelect && this.drawAuxiliaryPoint(ctx, positionInfo)
    return canvasPath2D
  }

  // 设置样式配置
  setOptions(ctx, option) {
    const { color, size } = option
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = this.baseLineWidth * size
  }

  /**
   * @func 绘制辅助点位，用于展示图形选中状态，即白色圆形点位
   * @desc
   * @param {}
   * @return {}
   */
  drawAuxiliaryPoint(ctx, positionInfo) {
    const radius = this.degreeOfBlur
    const pointList = this.getPointsPlace(positionInfo)
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 1

    // 矩形边框
    ctx.beginPath()
    pointList.forEach(item => {
      ctx.lineTo(...item)
    })
    ctx.closePath()
    ctx.stroke()
    // 绘制八个圆形点位
    pointList.forEach(item => {
      ctx.beginPath()
      ctx.arc(...item, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })
  }
  // 获取八个标识定位
  getPointsPlace(positionInfo) {
    const [x, y] = positionInfo[0] // 左上角
    const [rightBottomX, rightBottomY] = positionInfo[2] // 右下角
    const width = Math.abs(rightBottomX - x)
    const height = Math.abs(rightBottomY - y)
    return [
      [x, y],
      [x + width / 2, y],
      [x + width, y],
      [x + width, y + height / 2],
      [x + width, y + height],
      [x + width / 2, y + height],
      [x, y + height],
      [x, y + height / 2]
    ]
  }
  /**
   * @func  判断矩形操作方法：移动
   * @desc  注意：由于是外层使用，需要指定当前的this,否则this指向存在问题
   * @param {}
   * @return {
   *  判断成功后,返回对应的mouse移动事件处理方法、鼠标状态或 抑或是其他信息
   *  其中返回函数支持参数依次为
   *  positionList  图形操作之前、已经转为像素的点位或路径信息
   *  offsetX   x方向、 鼠标移动偏移大小
   *  offsetY  y方向、 鼠标移动偏移大小
   *  cutBoxInfo 剪裁框信息
   * }
   */
  judgeOperate(info, ctx, x, y) {
    const { canvasPath2D, positionInfo } = info
    if (!canvasPath2D) return
    // 依次顺时针方向计算矩形四个点位
    const [leftTop, rightTop, rightBottom, leftBottom] = positionInfo
    const [leftTopX, leftTopY] = leftTop
    const [rightBottomX, rightBottomY] = rightBottom
    const width = Math.abs(rightBottomX - leftTopX)
    const height = Math.abs(rightBottomY - leftTopY)
    //左上角
    if (this.judgeWithinRound(x, y, leftTop)) {
      // 左上角resize操作
      return {
        mouseCursor: 'nw-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]
          const [rightBottomX, rightBottomY] = positionList[2]
          const newPosition = [
            [leftTopX + offsetX, leftTopY + offsetY],
            [rightBottomX, rightBottomY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }

    //上边缘中间位置
    if (this.judgeWithinRound(x, y, [leftTopX + width / 2, leftTopY])) {
      // 上边缘resize操作
      return {
        mouseCursor: 'ns-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]
          const [rightBottomX, rightBottomY] = positionList[2]
          const newPosition = [
            [leftTopX, leftTopY + offsetY],
            [rightBottomX, rightBottomY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }
    //右上角
    if (this.judgeWithinRound(x, y, rightTop)) {
      // 右上角resize操作
      return {
        mouseCursor: 'ne-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]
          const [rightBottomX, rightBottomY] = positionList[2]
          const newPosition = [
            [leftTopX, leftTopY + offsetY],
            [rightBottomX + offsetX, rightBottomY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }

    //右边缘中间位置
    if (
      this.judgeWithinRound(x, y, [rightBottomX, rightBottomY - height / 2])
    ) {
      // 右边缘resize操作
      return {
        mouseCursor: 'ew-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]
          const [rightBottomX, rightBottomY] = positionList[2]
          const newPosition = [
            [leftTopX, leftTopY],
            [rightBottomX + offsetX, rightBottomY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }

    //右下角
    if (this.judgeWithinRound(x, y, rightBottom)) {
      // 右下角resize操作
      return {
        mouseCursor: 'se-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]
          const [rightBottomX, rightBottomY] = positionList[2]

          const newPosition = [
            [leftTopX, leftTopY],
            [rightBottomX + offsetX, rightBottomY + offsetY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }

    //下边缘中间位置
    if (
      this.judgeWithinRound(x, y, [leftTopX + width / 2, leftTopY + height])
    ) {
      // //下边缘resize操作
      return {
        mouseCursor: 'ns-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]
          const [rightBottomX, rightBottomY] = positionList[2]

          const newPosition = [
            [leftTopX, leftTopY],
            [rightBottomX, rightBottomY + offsetY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }

    //左下角
    if (this.judgeWithinRound(x, y, leftBottom)) {
      // 左下角resize操作
      return {
        mouseCursor: 'sw-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]

          const [rightBottomX, rightBottomY] = positionList[2]

          const newPosition = [
            [leftTopX + offsetX, leftTopY],
            [rightBottomX, rightBottomY + offsetY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }

    //左边缘中间位置
    if (this.judgeWithinRound(x, y, [leftTopX, leftTopY + height / 2])) {
      //左边缘中间resize操作
      return {
        mouseCursor: 'ew-resize',
        fnExecution: (positionList, offsetX, offsetY, cutBoxInfo) => {
          // [x,y]
          const [leftTopX, leftTopY] = positionList[0]

          const [rightBottomX, rightBottomY] = positionList[2]

          const newPosition = [
            [leftTopX + offsetX, leftTopY],
            [rightBottomX, rightBottomY]
          ]

          return this.correctPosition(newPosition, cutBoxInfo)
        }
      }
    }
    // 内部
    if (ctx.isPointInStroke(canvasPath2D, x * this.dpr, y * this.dpr)) {
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

  /**
   * @func 将像素位置、设置偏移后，再转为经纬度
   * @desc  包含经纬度转为像素位置和点击位置信息
   * @param {
   *   positionList 原像素位置
   *   offsetX,offsetY 偏移量
   * }
   * @return {}
   */
  changePosition(positionList, offsetX, offsetY) {
    return positionList.map(item => {
      const [x, y] = item
      return [x + offsetX, y + offsetY]
    })
  }
  // 根据矩形的左上角与右下角 纠正矩形拉伸过程中的位置
  correctPosition(positionList, cutBoxInfo) {
    const [[leftTopX, leftTopY], [rightBottomX, rightBottomY]] = positionList

    // 计算矩形的左上角点坐标
    const topLeft = [
      Math.min(leftTopX, rightBottomX),
      Math.min(leftTopY, rightBottomY)
    ]
    // 计算矩形的右上角点坐标
    const topRight = [
      Math.max(leftTopX, rightBottomX),
      Math.min(leftTopY, rightBottomY)
    ]
    // 计算矩形的右下角点坐标
    const bottomRight = [
      Math.max(leftTopX, rightBottomX),
      Math.max(leftTopY, rightBottomY)
    ]
    // 计算矩形的左下角点坐标
    const bottomLeft = [
      Math.min(leftTopX, rightBottomX),
      Math.max(leftTopY, rightBottomY)
    ]
    return this.handleData(
      [topLeft, topRight, bottomRight, bottomLeft],
      cutBoxInfo
    )
  }
  /**
   * @func 处理位置数据,使其数据位置处于剪裁框范围内
   * @desc
   * @param {}
   * @return {}
   */

  handleData(positionList, cutBoxInfo) {
    const { x, y, width, height } = cutBoxInfo
    const rightBottomX = x + width
    const rightBottomY = y + height
    return positionList.map(item => {
      const [X, Y] = item
      const positionX = Math.min(Math.max(x, X), rightBottomX)
      const positionY = Math.min(Math.max(y, Y), rightBottomY)
      return [positionX, positionY]
    })
  }
  // 判断是否在圆形内
  judgeWithinRound(mouseX, mouseY, center) {
    const radius = this.degreeOfBlur
    const [x, y] = center
    return (mouseX - x) ** 2 + (mouseY - y) ** 2 <= radius ** 2
  }
}
export default new drawRectangle()
