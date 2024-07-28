
export type POSITIONINFO = Array<Array<number>>

export type TEXTPOSITIONINFO = {
    x: number,
    y: number,
    text: string,
    maxWidth?: number,
    maxHeight?: number,
    width?: number,
    height?: number

}

export type OPTION = {
    size: number,
    color: string
}
export type RENDERINFO = {
    positionInfo: POSITIONINFO,
    option: OPTION,
    canvasPath2D?: Path2D
    isSelect?: boolean
    id?: number

}

export type TEXTRENDERINFO = {
    id: number,
    positionInfo: TEXTPOSITIONINFO,
    option: OPTION,
    canvasPath2D?: Path2D
    isSelect: boolean,
    isEdit: boolean
}
export type CUTBOXINFO = {
    x: number,
    y: number,
    width: number,
    height: number
}

export type DRAWINGINFO = {
    clickX: number,
    clickY: number
}

export type JUDGERESULT = {
    mouseCursor: string,
    fnExecution: Function
}



export function isValidKey(
    key: string | number | symbol,
    object: object
): key is keyof typeof object {
    return key in object;
}