import html2canvas from 'htmltocanvas-plus'
// 生成canvas dom
const generteCanvas = (
  captureDom: HTMLElement,
  width: number,
  height: number,
  basicImage: HTMLImageElement | null,
  isWebRtc: boolean = false,
  zIndex: number
): Promise<
  {
    canvasDom: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    imageCanvas: HTMLCanvasElement,
    image: HTMLCanvasElement | HTMLImageElement
  }
> => {
  return new Promise(async resolve => {
    const canvasDom = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    const dprWidth = Math.round(width * dpr)
    const dprHeight = Math.round(height * dpr)
    canvasDom.style.position = 'absolute'
    canvasDom.style.top = '0'
    canvasDom.style.left = '0'
    canvasDom.style.zIndex = `${zIndex}`
    canvasDom.style.width = width + 'px'
    canvasDom.style.height = height + 'px'
    canvasDom.width = dprWidth
    canvasDom.height = dprHeight
    const ctx = canvasDom.getContext('2d') as CanvasRenderingContext2D
    ctx.scale(dpr, dpr)
    const image = basicImage || (isWebRtc
      ? await getImageByMedia() as HTMLImageElement
      : await getImageByDomToPng(captureDom) as HTMLCanvasElement)
    // 底图不需要缩放
    const imageCanvas = canvasDom.cloneNode(true) as HTMLCanvasElement
    captureDom.appendChild(imageCanvas)
    captureDom.appendChild(canvasDom)
    ctx.fillStyle = 'rgba(0, 0, 0, .5)'
    ctx.fillRect(0, 0, width, height)
    resolve({ canvasDom, ctx, imageCanvas, image })
  })
}

const dataURLToImg = (url: string) => {
  return new Promise(resolve => {
    const image = new Image()
    image.src = url
    image.onload = () => {
      resolve(image)
    }
  })
}
// 通过将html dom转为png 获取底图
function getImageByDomToPng(captureDom: HTMLElement) {
  const setup = {
    useCORS: true
  }
  return html2canvas(captureDom, setup)
}

// 调用浏览器自带的媒体共享获取底图
function getImageByMedia() {
  return new Promise(async resolve => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true
      })
      const tracks = mediaStream.getTracks()
      tracks.forEach(track => {
        track.onended = null
      })
      const dpr = window.devicePixelRatio || 1;
      const videoHeight = Math.round(window.outerHeight * dpr)
      const screenWidth = Math.round(window.innerWidth * dpr)
      const screenHeight = Math.round(window.innerHeight * dpr)
      const screenX = 0
      const screenY = videoHeight - screenHeight
      const video = document.createElement('video') as HTMLVideoElement
      video.srcObject = mediaStream
      video.play()

      const canvasDom = document.createElement('canvas')
      canvasDom.width = screenWidth
      canvasDom.height = screenHeight
      const ctx = canvasDom.getContext('2d') as CanvasRenderingContext2D
      video.ontimeupdate = async () => {
        ctx.clearRect(0, 0, screenWidth, screenHeight)
        ctx.drawImage(video, screenX, screenY, screenWidth, screenHeight, 0, 0, screenWidth, screenHeight)
        if (video.currentTime < 1) return
        const url = canvasDom.toDataURL()
        const image = await dataURLToImg(url)
        resolve(image)
        // 关闭视频video
        if (video.srcObject instanceof MediaStream) {
          const tracks = video.srcObject.getTracks()
          tracks && tracks.forEach(track => track.stop())
        }
        video.srcObject = null

      }
    } catch (err) {
      console.error(err)
    }
  })
}

export default generteCanvas
