/*
 * @description: 绘制文本
 * maxWidth 、maxHeight :是指文本内容所占宽高度
 */

/**
 * @func 绘制文本
 * @desc dom渲染文本比 canvas渲染文本 ，多出padding大小的差距
 * @param {}
 * @return {}
 */
class drawText {
  constructor() {
    this.dpr = window.devicePixelRatio || 1
    this.padding = 3 // 内边框
    this.letterSpacing = 1 // 文字间距
    this.baseFontSize = 16
    this.minWidth = 35 // 文本dom最小宽度
    this.showTextDom = null // 用于展示与编辑文本dom

    this.cutBoxInfo = null
    this.ctx = null // 当前执行绘制上下文

    this.opearteInfo = null // 当前操作的文本数据源 、利用对象引用特性改变值
  }

  /**
   * @func 向外层提供可以初始化数据的函数
   * @desc
   * @param {
   *   ctx 执行上下文
   *   cutBoxInfo 剪裁框信息
   *   isHaveEdit 当前绘制所有文本中是否存在需要编辑的文本
   * }
   * @return {}
   */
  initData(ctx, cutBoxInfo, isHaveEdit) {
    // 创建文本编辑dom
    this.createTextDom(ctx)
    this.ctx = ctx
    this.cutBoxInfo = cutBoxInfo
    if (isHaveEdit) {
      this.showTextDom.style.display = 'inline-block'
    } else {
      this.showTextDom.style.display = 'none'
      this.opearteInfo = null
    }
  }
  /**
   * @func 绘制文本
   * @desc
   * @param {
   *  ctx 执行上下文
   *  info 文本信息
   * }
   * @return {}
   */
  draw(ctx, info) {
    const { positionInfo, option = {}, isSelect, isEdit } = info
    const { x, y, text } = positionInfo

    // 设置ctx绘制样式
    this.setOptions(ctx, option, isEdit)
    const { textConfig, width, height } = this.getTextConfig(
      ctx,
      positionInfo,
      this.baseFontSize * option.size
    )
    // 构造范围path,用于辅助判断事件处理
    const canvasPath2D = new Path2D()
    this.drawTextLedge(canvasPath2D, [x, y], width, height)

    canvasPath2D.closePath()

    // 存在需要编辑的文本渲染dom,否则canvas渲染
    if (isEdit) {
      this.opearteInfo = info
      this.drawAuxiliaryDom(positionInfo, this.cutBoxInfo)
    } else {
      this.renderWrapText(ctx, textConfig)
      isSelect && ctx.stroke(canvasPath2D)
    }

    // 为当前文本添加实际宽高度值
    Object.assign(info.positionInfo, { width, height })
    return canvasPath2D
  }

  // 设置样式配置
  setOptions(ctx, option, isEdit) {
    const { color, size = 1 } = option
    const fontSize = this.baseFontSize * size
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.font = `normal ${fontSize}px zzgf_dianhei`
    ctx.textBaseline = 'top'
    if (isEdit) {
      // 保持样式同步
      this.showTextDom.style.fontSize = fontSize + 'px'
      this.showTextDom.style.color = color
      this.showTextDom.style.fontWeight = 'normal'
      this.showTextDom.style.fontFamily = 'zzgf_dianhei'
      this.showTextDom.style.boxShadow = `inset 0 0 0 1px ${color}`
    }
  }
  // 渲染每个文字的具体位置
  renderWrapText(ctx, renderTextList) {
    renderTextList.forEach(item => {
      const { x, y, value } = item
      ctx.fillText(value, x, y)
    })
  }
  /**
   * @func 绘制辅助点位，用于展示图形选中状态,同时支持文本编辑
   * @desc
   * @param {}
   * @return {}
   */
  drawAuxiliaryDom(positionInfo, cutBoxInfo) {
    const { x, y, text } = positionInfo
    const {
      x: cutBoxX,
      y: cutBoxY,
      width: cutWidth,
      height: cutHeight
    } = cutBoxInfo
    // 计算限制宽高最大限制值
    const maxWidth = ~~(cutWidth - (x - cutBoxX) - this.padding)
    const maxHeight = ~~(cutHeight - (y - cutBoxY) - this.padding)
    // 需要减去边框与boder大小
    this.showTextDom.style.left = x - this.padding + 'px'
    this.showTextDom.style.top = y - this.padding + 'px'
    // 需要考虑边框大小影响
    this.showTextDom.style.maxWidth = maxWidth + 'px'
    this.showTextDom.style.maxHeight = maxHeight + 'px'
    this.showTextDom.innerText = text

    // 更新当前文本渲染位置数据信息，保持编辑与展示时同步
    Object.assign(this.opearteInfo.positionInfo, {
      maxWidth,
      maxHeight
    })
    this.showTextDom.focus()

  }
  // 计算渲染文本的每个文字所需要渲染的位置与总文本所占宽高
  getTextConfig(context, positionInfo, fontSize) {
    const { x, y, text, maxWidth, maxHeight } = positionInfo
    const letterSpacing = this.letterSpacing // 文字间距
    // 行高参考系为字体大小
    const lineHeight = fontSize
    // 计算所有文字所占宽度与高度 ,并设置最低宽度与高度
    let height = lineHeight
    let width = 0
    // text为二维数组,逐字设置文字间隔和行高
    let calcWidth = 0
    let calcHeight = 0
    const textConfig = []
    const textList = text.split('')
    for (let i = 0, len = textList.length; i < len; i++) {
      const singleText = textList[i]

      const textWidth = context.measureText(singleText).width
      // 超过最大限制或为换行符时 优先考虑换行渲染

      if (singleText === '\n' || textWidth + calcWidth >= maxWidth) {
        calcWidth = 0
        calcHeight += lineHeight
      }
      // 如果超出最大高度时，不再计算之后为文本位置
      if (calcHeight >= maxHeight) break
      // 除去换行符
      if (singleText !== '\n') {
        textConfig.push({
          x: x + calcWidth,
          y: y + calcHeight,
          value: singleText
        })
        // 计算文本所占宽度
        calcWidth += textWidth + letterSpacing
      }

      width = Math.max(calcWidth, width)
      height = Math.max(calcHeight + lineHeight, height)
    }

    return { textConfig, width, height }
  }
  // 基于落脚点，文字的宽高绘制框选范围,以用于操作时范围判断
  drawTextLedge(ctx, start, width, height) {
    const [x, y] = start
    const padding = this.padding
    width = width + 2 * padding
    height = height + 2 * padding
    ctx.rect(x - padding, y - padding, width, height)
  }
  // 生成用于支持文本的编辑
  createTextDom(ctx) {
    const canvas = ctx.canvas
    const mountDom = canvas.parentNode || window.body
    if (this.showTextDom) return
    const zIndex = canvas.style.zIndex
    const textDom = document.createElement('span')
    textDom.setAttribute('contentEditable', true)
    textDom.style.display = 'inline-block'
    textDom.style.position = 'absolute'
    textDom.style.background = 'transparent'
    textDom.style.zIndex = +zIndex + 1
    textDom.style.outline = 'none'
    textDom.style.lineHeight = 1
    textDom.style.minWidth = this.minWidth + 'px'
    textDom.style.letterSpacing = this.letterSpacing + 'px'
    textDom.style.wordBreak = 'break-all'
    textDom.style.padding = this.padding + 'px'
    mountDom.appendChild(textDom)
    this.showTextDom = textDom
    this.addListener()
  }
  // 为textDom 添加输入事件监听
  addListener() {
    this.showTextDom.oninput = e => {
      if (!this.opearteInfo) return
      const { maxHeight, text } = this.opearteInfo.positionInfo
      const { innerText, clientHeight } = e.target
      // 输入内容超出最大位置限制后
      if (clientHeight >= maxHeight) {
        e.target.innerText = text
      } else {
        // 重新赋予文本宽高限制 需要考虑边框的大小
        Object.assign(this.opearteInfo.positionInfo, {
          text: innerText
        })
      }

    }
  }
  /**
   * @func  判断文本操作方法：移动
   * @desc 注意：由于是外层使用，需要指定当前的this,否则this指向存在问题
   * @param {}
   * @return {
   *  判断成功后,返回对应的mouse移动事件处理方法、鼠标状态或 抑或是其他信息
   *  其中返回函数支持参数依次为
   *  startPoistion  图形操作之前、已经转为像素的点位或路径信息
   *  offsetX   x方向、 鼠标移动偏移大小
   *  offsetY  y方向、 鼠标移动偏移大小
   * }
   */
  judgeOperate(info, ctx, x, y) {
    const { canvasPath2D } = info
    if (!canvasPath2D) return
    if (ctx.isPointInPath(canvasPath2D, x * this.dpr, y * this.dpr)) {
      return {
        mouseCursor: 'move',
        fnExecution: (positionInfo, offsetX, offsetY) => {
          const { x, y } = positionInfo
          const newPosition = {
            ...positionInfo,
            x: x + offsetX,
            y: y + offsetY
          }
          return this.handleNewData(newPosition)
        }
      }
    }
  }
  /**
   * @func 处理文本移动后的位置限制,保存文本移动处于整个剪裁框内
   * @desc 移动过程中需要将文本原来的宽高作为最大的宽高度
   * @param {}
   * @return {}
   */
  handleNewData(positionInfo) {
    const { x, y, width = 0, height = 0 } = positionInfo
    const {
      x: cutBoxX,
      y: cutBoxY,
      width: cutWidth,
      height: cutHeight
    } = this.cutBoxInfo
    // 需要考虑边框大小影响
    const padding = 2 * this.padding
    const correctX = Math.min(
      Math.max(cutBoxX + padding, x),
      cutBoxX + cutWidth - width - padding
    )
    const correctY = Math.min(
      Math.max(cutBoxY + padding, y),
      cutBoxY + cutHeight - height - padding
    )
    return {
      ...positionInfo,
      x: correctX,
      y: correctY
    }
  }
  destroy() {
    this.showTextDom && this.showTextDom.remove()
    this.showTextDom = null
  }
}
export default new drawText()
