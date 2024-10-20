# window截图
- 支持矩形绘制、圆型绘制、箭头绘制、画笔、马赛克、文本编辑以及相关组合操作的撤回、编辑与拖拽移动

## 插件安装

```bash
yarn add shot-web-screen
npm install shot-web-screen --save
```

## 插件使用

### import 形式使用插件

- 在需要使用截屏插件的业务代码中导入插件

```javascript
import captureScreen from "shot-web-screen";
```

- 在业务代码中使用时实例化插件即可

```javascript
let imgUrl = ''
new captureScreen({
  saveCallback: (base64: string) => {
    imgUrl = base64;
  },
});
```
## 参数配置
| 参数名  | 类型  |  默认值 | 说明  |
| ------------ | ------------ | ------------ | ------------ |
| captureDom  | HTMLElement（可选）  | window.document.body |  当isWebRtc为true时无效，同时也会将操作时的相关dom挂载其上 |
| zIndex  | number  | 99999 |  挂载dom层级 |
| isWebRtc  |   boolean（可选）| false  |  是否开启WebRtc，开启后会将整个屏幕进行截图 。默认为false，是使用html2canvas方式进行底图截取|
|saveCallback  |   Function（可选）| 无  |  完成截图后点击完成后回调函数,会将截图结果通过base64形式进行回传|
|loadCallback  |   Function（可选）| 无  |  截图完成截图底图资源渲染回调 |
| basicImage  |   HTMLImageElement（可选）|无 |  截图底图，传入后可不借助html2canvas或 WebRtc方式进行底图图片截取|
