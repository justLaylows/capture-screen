
import generteCanvas from './common/generteCanvas.js' // 生成canvasdom
import drawCutBox from './common/cutBox.js' // 绘制剪切框
import ToolPanel from './common/toolPanel.js' // 创建工具栏
import ToolOption from './common/toolOption.js' // 创建配置栏

import renderArrowLine from './render/arrowLine.js' // 绘制箭头
import renderCircle from './render/circle.js' // 绘制椭圆
import renderBrush from './render/brush.js' // 绘制任意线
import renderRectangle from './render/rectangle.js' //绘制矩形
import renderMosaic from './render/mosaic.js' // 绘制马赛克
import renderText from './render/text.js' // 绘制文本

import drawingArrowLine from './drawing/arrowLine.js' // 收集绘制过程箭头信息
import drawingCircle from './drawing/circle.js' // 收集绘制过程椭圆信息
import drawingBrush from './drawing/brush.js' // 收集绘制过程画笔信息
import drawingRectangle from './drawing/rectangle.js' // 收集绘制过程矩形信息
import drawingMosaic from './drawing/mosaic.js' // 收集绘制过程马赛克信息
import drawingText from './drawing/text.js' // 收集绘制过程文本信息

import { fileDownload, savefile } from './common/fileMethod.js' // 文件操作方法

import './css/index.css' // 样式引入

class captureScreen {
  constructor({
    captureDom = window.document.body,
    isByMedia = false, // 是否通过媒体接口完成截屏
    saveCallback,
    zIndex = 99999
  } = {}) {
    this.captureDom = captureDom
    this.saveCallback = saveCallback // 点击保存后回调函数
    this.zIndex = zIndex // 挂载dom所处层级
    this.drawWidth = captureDom.clientWidth
    this.drawHeight = captureDom.clientHeight
    this.image = null // 截图底图
    this.toolData = [] // 保存工具栏中绘制图形数据
    this.activeTool = '' // 记录选中的某一个工具栏选项
    this.cutBoxInfo = null // 保存剪切位置信息,包括开始坐标点x,y和宽高width,height
    this.toolsBox = null //工具栏
    this.optionBox = null // 配置栏
    this.options = {
      size: 1,
      color: '#ff0000'
    } // 选择的配置项数据
    this.canvasDom = null // canvasDom
    this.imageCanvas = null // 渲染底图的canvas
    this.ctx = null // 上下文
    this.id = 1 // 通过自增方式用于生成唯一的id标识
    this.renderCutBox = null // 对于剪裁框操作类

    // 定义操作过程中需要使用的中间变量数据
    this.clickX = 0 // 鼠标点击位置
    this.clickY = 0 // 鼠标点击位置
    this.startPoistion = null // 操作前的图形位置信息
    this.judgeResult = null // 判断结果
    this.operationData = null // 操作图形数据对象，包括剪裁框对象与图形对象数据源 ，利用对象引用特性改变数据
    this.operateStatus = '' // 操作状态
    this.drawingInfo = null // 存放绘制图形信息

    this.initData(isByMedia)
  }
  async initData(isByMedia) {
    // 创建canvas画布
    const { canvasDom, ctx, imageCanvas, image } = await generteCanvas(
      this.captureDom,
      this.drawWidth,
      this.drawHeight,
      isByMedia,
      this.zIndex
    )
    this.canvasDom = canvasDom
    this.ctx = ctx
    this.imageCanvas = imageCanvas
    this.image = image
    // 绘制底图
    renderMosaic.draw(this.imageCanvas, this.image)
    // 创建剪裁框实例，并监听剪裁框事件
    this.generteCutBox(this.canvasDom)
  }
  /**
   * @func 基于画布大小生成剪裁框
   * @desc
   * @param {}
   * @return {}
   */
  generteCutBox(canvasDom) {
    const { width, height } = canvasDom
    const callBack = (cutBoxInfo, type) => {
      this.cutBoxInfo = cutBoxInfo
      // 绘制剪裁框并更新工具栏位置
      this.renderGraph()
      if (type === 'drawover') {
        // 添加事件监听
        this.addListener(canvasDom)
        // 更新或挂载工具栏
        this.updateToolsBox()
      }
    }
    this.renderCutBox = new drawCutBox(canvasDom, width, height, callBack)
    this.renderCutBox.drawing()
  }

  /**
   * @func 渲染图形 包括截屏底图、剪裁框和工具栏绘制的图形（不包括马赛克）
   * @desc
   * @param {
   *  isSave 是否保存， 保存时需要取消剪裁框绘制，增加底图绘制
   *  selectId  选中的图形id
   *  editId 主要为文本提供
   * }
   * @return {}
   */
  renderGraph(isSave = false, selectId, editId) {
    if (!this.ctx) return
    // 依次先绘制底图，工具栏图形，剪裁框
    this.ctx.clearRect(0, 0, this.drawWidth, this.drawHeight)
    isSave &&
      this.imageCanvas &&
      this.ctx.drawImage(
        this.imageCanvas,
        0,
        0,
        this.drawWidth,
        this.drawHeight
      )
    // 过滤掉文本内容为空的数据项 ,如果需要展示编辑就不过滤 ，避免新增文本时无数据
    !editId &&
      (this.toolData = this.toolData.filter(
        item =>
          item.type !== 'text' ||
          (item.type === 'text' && item.positionInfo.text.length > 0)
      ))

    // 判断此次文本渲染过程中是否存在需要编辑的文本,用于初始化文本渲染函数
    const isHaveEdit = this.toolData.filter(
      item => item.type === 'text' && item.id === editId
    )
    renderText.initData(this.ctx, this.cutBoxInfo, isHaveEdit.length > 0)

    // 设置canvasPath2D 辅助判断图形位置
    // 设置judgeOperate图形位置判断方法
    this.toolData.forEach(item => {
      item.isSelect = item.id === selectId
      item.type === 'text' && (item.isEdit = item.id === editId)
      switch (item.type) {
        // 矩形
        case 'rectangle':
          item.canvasPath2D = renderRectangle.draw(this.ctx, item)
          item.judgeOperate = renderRectangle.judgeOperate.bind(renderRectangle)
          break
        //椭圆
        case 'circle':
          item.canvasPath2D = renderCircle.draw(this.ctx, item)
          item.judgeOperate = renderCircle.judgeOperate.bind(renderCircle)
          break
        //箭头
        case 'arrow':
          item.canvasPath2D = renderArrowLine.draw(this.ctx, item)
          item.judgeOperate = renderArrowLine.judgeOperate.bind(renderArrowLine)
          break
        // 画笔
        case 'brush':
          item.canvasPath2D = renderBrush.draw(this.ctx, item)
          item.judgeOperate = renderBrush.judgeOperate.bind(renderBrush)
          break
        // 文本 特殊处理
        case 'text':
          item.canvasPath2D = renderText.draw(this.ctx, item)
          item.judgeOperate = renderText.judgeOperate.bind(renderText)
          break
      }
    })
    !isSave &&
      this.renderCutBox.drawCutOutBox(
        this.ctx,
        this.cutBoxInfo,
        !this.toolData.length
      )
  }
  /**
   * @func 添加事件监听操作 , 操作类型分为工具图形和剪裁框两类
   * @desc 思路
   *       在鼠标移动过程中，对所有图形位置与当前鼠标位置进行判断验证 （数据量大，可能存在性能问题）
   *       验证成功，改变鼠标指示器样式，同时在验证成功后，鼠标点击开启对应图形的移动操作
   *       鼠标抬起重置数据
   * @param {}
   * @return {}
   */
  addListener(canvasDom) {
    canvasDom.onmousedown = e => {
      // 点击鼠标左键提供功能
      e.button === 0 && this.handleMousedown(e)
    }
    canvasDom.onmousemove = e => {
      this.handleMouseMove(e, canvasDom)
    }
    canvasDom.onmouseout = canvasDom.onmouseup = e => {
      this.handleMouseUp(e, canvasDom)
    }

    // 单独处理文本编辑
    canvasDom.ondblclick = e => {
      const mouseX = e.clientX
      const mouseY = e.clientY
      const targetData = this.checkInsideText(mouseX, mouseY)
      targetData && this.renderGraph(false, targetData.id, targetData.id)
    }
  }
  // 检查当前点击位置是否在其中某一个文本上
  checkInsideText(mouseX, mouseY) {
    let judgeResult = null
    const textToolList = this.toolData.filter(item => item.type === 'text')
    // 文本图形 层级越高，拥有优先权
    for (let index = textToolList.length - 1; index >= 0; index--) {
      const target = textToolList[index]
      const { judgeOperate } = target
      judgeOperate &&
        (judgeResult = judgeOperate(target, this.ctx, mouseX, mouseY))
      if (judgeOperate && judgeResult) return target
    }
    return false
  }
  /**
   * @func 处理鼠标点击事件
   * @desc
   * @param {}
   * @return {}
   */
  handleMousedown(e) {
    this.clickX = e.clientX
    this.clickY = e.clientY
    // 判读当前是否为可编辑状态
    if (this.judgeResult && this.operationData) {
      this.operateStatus = 'edit'
      this.startPoistion = JSON.parse(
        JSON.stringify(this.operationData.positionInfo || this.operationData)
      )
      // 渲染图形被选中的状态
      this.renderGraph(false, this.operationData.id)
      return
    }
    //当前是否为可绘制图形状态
    if (
      this.activeTool &&
      this.checkIsRectInside(this.clickX, this.clickY) &&
      !this.checkInsideText(this.clickX, this.clickY)
    ) {
      this.operateStatus = 'drawing'
      this.handleDrawingEvent(e, 'mouseDown')
    }
    // 取消被选中状态展示
    this.renderGraph()
  }

  /**
   * @func 处理鼠标移动事件
   * @desc
   * @param {}
   * @return {}
   */
  handleMouseMove(e, dom) {
    const mouseX = e.clientX
    const mouseY = e.clientY
    // 执行图形移动、拖拽
    if (this.operateStatus === 'edit') {
      // 获取偏移量
      const [offsetX, offsetY] = this.correctOffset(
        [this.clickX, this.clickY],
        [mouseX, mouseY],
        this.cutBoxInfo
      )
      const { fnExecution } = this.judgeResult
      if (fnExecution) {
        const positionInfo = fnExecution(
          this.startPoistion,
          offsetX,
          offsetY,
          this.cutBoxInfo
        )
        // 利用对象引用特性更新位置信息 ，包括图形与剪裁框数据 剪裁框不存在positionInfo属性
        Object.assign(
          this.operationData.positionInfo || this.operationData,
          positionInfo
        )
      }
      // 操作移动为剪裁框时，更新工具栏位置状态:隐藏
      !this.toolData.length && this.updateToolsBox(false)
      // 重新渲染图形
      this.renderGraph(false, this.operationData.id)
      return
    }

    // 执行绘制
    if (this.operateStatus === 'drawing') {
      this.handleDrawingEvent(e, 'mouseMove')
      return
    }

    // 判断图形可操作状态： 剪裁框移动与伸拉 与图形移动伸拉互异
    // 判断剪裁框 当存在绘制图形时就不提供移动操作
    if (!this.toolData.length && !this.activeTool) {
      this.judgeResult = this.renderCutBox.judgeOperate(
        this.cutBoxInfo,
        mouseX,
        mouseY
      )
      this.judgeResult && (this.operationData = this.cutBoxInfo)
      dom.style.cursor = this.judgeResult?.mouseCursor || 'inherit'
      return
    }

    // 工具栏图形 层级越高，拥有优先权
    for (let index = this.toolData.length - 1; index >= 0; index--) {
      const target = this.toolData[index]
      const { judgeOperate } = target
      judgeOperate &&
        (this.judgeResult = judgeOperate(target, this.ctx, mouseX, mouseY))
      if (judgeOperate && this.judgeResult) {
        this.operationData = target
        dom.style.cursor = this.judgeResult.mouseCursor || 'inherit'
        return
      }
    }
    this.judgeResult = null
    this.operationData = null
    dom.style.cursor = 'inherit'
  }
  /**
   * @func 处理鼠标抬起事件
   * @desc
   * @param {}
   * @return {}
   */
  handleMouseUp(e, dom) {
    // 操作移动为剪裁框时，更新工具栏位置状态
    this.operateStatus === 'edit' &&
      !this.toolData.length &&
      this.updateToolsBox()
    // 操作为绘制图形，收集图形
    if (this.operateStatus === 'drawing' && this.drawingInfo) {
      const info = {
        id: this.id,
        type: this.activeTool,
        option: { ...this.options },
        positionInfo: this.drawingInfo
      }
      this.id++
      this.toolData.push(info)
      // 如果是文本需要直接开启编辑模式
      const editId = this.activeTool === 'text' && info.id
      this.renderGraph(false, editId, editId)
    }
    this.judgeResult = null
    this.startPoistion = null
    this.operationData = null
    this.operateStatus = ''
    this.drawingInfo = null
    dom.style.cursor = 'inherit'
  }
  /**
   * @func 处理不同操作工具的绘制过程，只包含鼠标点击事件处理与鼠标移动
   * @desc 鼠标点击主要用于初始化数据，鼠标移动用于收集数据与渲染图形
   * @param {}
   * @return {}
   */
  handleDrawingEvent(e, eventType = 'mouseDown') {
    switch (this.activeTool) {
      // 矩形
      case 'rectangle':
        if (eventType === 'mouseDown') {
          drawingRectangle.mouseDownEvent(e, this.cutBoxInfo)
        } else {
          // 清除画布
          this.renderGraph()
          this.drawingInfo = drawingRectangle.mouseMoveEvent(
            e,
            this.ctx,
            this.options
          )
        }

        break
      //椭圆
      case 'circle':
        if (eventType === 'mouseDown') {
          drawingCircle.mouseDownEvent(e, this.cutBoxInfo)
        } else {
          // 清除画布
          this.renderGraph()
          this.drawingInfo = drawingCircle.mouseMoveEvent(
            e,
            this.ctx,
            this.options
          )
        }

        break
      //箭头
      case 'arrow':
        if (eventType === 'mouseDown') {
          drawingArrowLine.mouseDownEvent(e, this.cutBoxInfo)
        } else {
          // 清除画布
          this.renderGraph()
          this.drawingInfo = drawingArrowLine.mouseMoveEvent(
            e,
            this.ctx,
            this.options
          )
        }
        break
      // 画笔
      case 'brush':
        if (eventType === 'mouseDown') {
          drawingBrush.mouseDownEvent(e, this.cutBoxInfo)
        } else {
          // 清除画布
          this.renderGraph()
          this.drawingInfo = drawingBrush.mouseMoveEvent(
            e,
            this.ctx,
            this.options
          )
        }

        break
      // 马赛克 特殊处理
      case 'mosaic':
        const ctx = this.imageCanvas.getContext('2d')
        if (eventType === 'mouseDown') {
          this.drawingInfo = drawingMosaic.mouseDownEvent(
            e,
            this.cutBoxInfo,
            ctx,
            this.options,
            this.image
          )
        } else {
          this.drawingInfo = drawingMosaic.mouseMoveEvent(e, ctx, this.options)
        }
        break
      // 文本 特殊处理
      case 'text':
        if (eventType === 'mouseDown') {
          this.drawingInfo = drawingText.mouseDownEvent(
            e,
            this.cutBoxInfo,
            this.options
          )
        }
        break
    }
  }

  /**
   * @func 如果需要操作剪裁框时，纠正偏移量，使其最大偏移处于剪裁框内
   * @desc
   * @param {
   *   start 开始点
   *   move 移动点
   *   cutBoxInfo 剪裁框信息
   * }
   * @return {
   *  偏移量[offsetX,offsetY]
   * }
   */
  correctOffset(start, move, cutBoxInfo) {
    // 判断当前操作图形是否为剪裁框，是不加限制，否则加以限制
    const isCutBox = !this.toolData.length
    const [startX, startY] = start
    const [moveX, moveY] = move

    if (isCutBox) return [moveX - startX, moveY - startY]

    const { x, y, width, height } = cutBoxInfo
    const rightBottomX = x + width
    const rightBottomY = y + height

    const correctX = Math.min(Math.max(x, moveX), rightBottomX)
    const correctY = Math.min(Math.max(y, moveY), rightBottomY)
    return [correctX - startX, correctY - startY]
  }

  // 挂载工具栏并移动到目标位置
  updateToolsBox(isShow = true) {
    if (!this.cutBoxInfo) return
    if (!this.toolsBox) {
      this.toolsBox = ToolPanel.createToolDom(
        this.toolBoxClickEvent.bind(this),
        this.zIndex + 1
      )
      this.captureDom.appendChild(this.toolsBox)
    }
    ToolPanel.setToolsPosition(
      this.toolsBox,
      this.cutBoxInfo,
      this.drawWidth,
      this.drawHeight,
      isShow
    )
    // 更新挂载配置栏，并设置位置
    this.updateOptionsBox()
  }
  // 处理工具栏点击事件
  toolBoxClickEvent(e) {
    if (!e.target.className.includes('capture_screen_tool_item')) return
    const domainTools = ['revoke', 'download', 'exit', 'save']
    const value = e.target.getAttribute('tool-data')
    // 功能性工具栏特殊处理
    if (domainTools.includes(value)) {
      this.toolFunction(value)
      return
    }
    const toolItemList = this.toolsBox.querySelectorAll(
      '.capture_screen_tool_item'
    )
    // 移除所有active 类名
    Array.from(toolItemList).forEach(dom => {
      dom.classList.remove('active')
    })
    if (this.activeTool === value) {
      this.activeTool = ''
    } else {
      this.activeTool = value
      e.target.classList.add('active')
    }
    // 更新配置栏状态
    this.updateOptionsBox()
  }
  // 执行工具栏操作函数
  toolFunction(type) {
    switch (type) {
      // 撤销
      case 'revoke':
        this.toolData.pop()
        // 可能测回马赛克，因此需要重新绘制底图
        const mosaicList = this.toolData.filter(item => item.type === 'mosaic')
        renderMosaic.draw(this.imageCanvas, this.image, mosaicList)
        // 重新渲染图形
        this.renderGraph()
        break
      // 下载
      case 'download':
        // 先还原所有绘制结果，后截图
        this.renderGraph(true)
        fileDownload(this.canvasDom, this.cutBoxInfo)
        this.destory()
        break
      case 'exit':
        this.destory()
        break
      case 'save':
        // 先还原所有绘制结果，后截图
        this.renderGraph(true)
        // 获取到图片文件后，通过回调将文件信息传出去
        const dataURL = savefile(this.canvasDom, this.cutBoxInfo)
        this.saveCallback && this.saveCallback(dataURL)
        this.destory()
    }
  }

  // 挂载配置栏并移动到目标位置
  updateOptionsBox() {
    if (!this.toolsBox) return
    if (!this.optionBox) {
      this.optionBox = ToolOption.createOptionDom(
        this.optionSizeClick.bind(this),
        this.optionColorClick.bind(this),
        this.options
      )
      this.toolsBox.appendChild(this.optionBox)
    }

    ToolOption.setToolsPosition(this.toolsBox, this.optionBox, this.activeTool)
  }
  // 处理配置栏size点击事件
  optionSizeClick(e) {
    if (!e.target.className.includes('size_item')) return

    const value = e.target.getAttribute('size-data')

    const itemList = this.optionBox.querySelectorAll('.size_item')
    // 移除所有active 类名
    Array.from(itemList).forEach(dom => {
      dom.classList.remove('active')
    })
    e.target.classList.add('active')
    this.options.size = value
  }
  // 处理配置栏color点击事件
  optionColorClick(e) {
    if (!e.target.className.includes('color_item')) return

    const value = e.target.getAttribute('color-data')

    const itemList = this.optionBox.querySelectorAll('.color_item')
    // 移除所有active 类名
    Array.from(itemList).forEach(dom => {
      dom.classList.remove('active')
    })

    e.target.classList.add('active')
    this.options.color = value
  }
  // 判断点是否剪裁框内,做事件移动、伸拉的判断
  checkIsRectInside(mouseX, mouseY) {
    const { x, y, width, height } = this.cutBoxInfo
    const centerX = x + width / 2
    const centerY = y + height / 2
    return (
      Math.abs(mouseX - centerX) <= width / 2 &&
      Math.abs(mouseY - centerY) <= height / 2
    )
  }
  // 销毁
  destory() {
    this.imageCanvas && this.imageCanvas.remove()
    this.canvasDom && this.canvasDom.remove()
    this.toolsBox && this.toolsBox.remove()
    renderText.destroy()
    this.imageCanvas = null
    this.canvasDom = null
    this.toolsBox = null
  }
}

export default captureScreen
