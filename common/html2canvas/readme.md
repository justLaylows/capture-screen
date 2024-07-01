当前最新版本的html2canvas使用时，
特定环境下存在报错问题，源码在计算 css background相关属性时，计算结果为0时 
此this.ctx.createPattern(canvas, 'repeat') as CanvasPattern 行代码报错
因此暂时在本地引入使用更改过的打包版本