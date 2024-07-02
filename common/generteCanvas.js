// 引入html2canvas 最新版本特定环境下存在渲染问题
import html2canvas from 'htmltocanvas-plus'

// 生成canvas dom
const generteCanvas = (
  captureDom,
  width,
  height,
  isByMedia = false,
  zIndex
) => {
  return new Promise(async resolve => {
    const canvasDom = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    canvasDom.style.position = 'absolute'
    canvasDom.style.top = 0
    canvasDom.style.left = 0
    canvasDom.style.zIndex = zIndex
    canvasDom.style.width = width + 'px'
    canvasDom.style.height = height + 'px'
    canvasDom.width = Math.round(dpr * width)
    canvasDom.height = Math.round(dpr * height)
    const ctx = canvasDom.getContext('2d')
    ctx.scale(dpr, dpr)
    const image = isByMedia
      ? await getImageByMedia(width, height)
      : await getImageByDomToPng(captureDom)
    // 底图不需熬缩放
    const imageCanvas = canvasDom.cloneNode(true)
    imageCanvas.width = width
    imageCanvas.height = height

    captureDom.appendChild(imageCanvas)
    captureDom.appendChild(canvasDom)
    ctx.fillStyle = 'rgba(0, 0, 0, .5)'
    ctx.fillRect(0, 0, width, height)
    resolve({ canvasDom, ctx, imageCanvas, image })
  })
}

const dataURLToImg = url => {
  return new Promise(resolve => {
    const image = new Image()
    image.src = url
    image.onload = () => {
      resolve(image)
    }
  })
}
// 通过将html dom转为png 获取底图
function getImageByDomToPng(captureDom) {
  const setup = {
    useCORS: true
  }
  return html2canvas(captureDom, setup)
}

// 调用浏览器自带的媒体共享获取底图
function getImageByMedia(width, height) {
  return new Promise(async resolve => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        preferCurrentTab: true
      })
      const tracks = mediaStream.getTracks()
      tracks.forEach(track => {
        track.onended = null
      })
      let video = document.createElement('video')
      video.width = width
      video.height = height
      video.srcObject = mediaStream
      video.play()

      const canvasDom = document.createElement('canvas')
      canvasDom.width = width
      canvasDom.height = height
      const ctx = canvasDom.getContext('2d')
      video.ontimeupdate = async () => {
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(video, 0, 0, width, height)

        if (video.currentTime >= 1) {
          const url = canvasDom.toDataURL()
          const image = await dataURLToImg(url)
          resolve(image)
          // 关闭视频video
          const tracks = video.srcObject.getTracks()
          tracks && tracks.forEach(track => track.stop())
          video.srcObject = null
        }
      }
    } catch (err) {
      console.error(err)
    }
  })
}

export default generteCanvas
