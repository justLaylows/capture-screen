/*
 * @Author: yanghaoxuan
 * @LastEditors: yanghaoxuan
 * @Date: 2024-05-16  13:51:58
 * @LastEditTime: 2024-05-16 13:51:58
 * @Description: 文件操作方法
 * @FilePath: src\scopes\project\common\utils\chat\tool-fun\capture-screen\common\fileMethod.js
 */

// dataURL 转为 File
export const dataURLToFile = (fileDataURL, filename) => {
  let arr = fileDataURL.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * @func 将绘制完成的canvas图层,并进行剪裁保存
 * @desc
 * @param {}
 * @return {}
 */
export const fileDownload = (drawDoneCanvas, cutBoxInfo) => {
  const dataURL = savefile(drawDoneCanvas, cutBoxInfo)
  const fileName = '截图'
  const a = document.createElement('a') // 创建一个隐藏的a标签
  a.style = 'display: none'
  a.download = fileName
  a.href = dataURL
  document.body.appendChild(a)
  a.click() // 触发a标签的click事件
  document.body.removeChild(a)
}

/**
 * @func 将绘制完成的canvas图层,并进行剪裁保存
 * @desc
 * @param {}
 * @return {}
 */
export const savefile = (drawDoneCanvas, cutBoxInfo) => {
  const { x, y, width, height } = cutBoxInfo
  // 构建截图容器
  const imgContainer = document.createElement('canvas')
  imgContainer.width = width
  imgContainer.height = height
  const ctx = imgContainer.getContext('2d')
  // 剪裁图片
  ctx.drawImage(drawDoneCanvas, x, y, width, height, 0, 0, width, height)
  return imgContainer.toDataURL()
}
