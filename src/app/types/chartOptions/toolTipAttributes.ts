export interface ToolTipAttributes {
    enabled?: boolean,
    fontColor?: string, /** Example: “red”, “#FAC003″.. */
    fontStyle?: 'normal' | 'italic' | 'oblique',
    fontSize?: number, /** Example: 16,18,22.. */
    fontFamily?: string, /** Example: “arial” , “tahoma”, “verdana”.. */
    fontWeight?: 'lighter' | 'normal' | 'bold' | 'bolder',
    borderThickness?: number, /** Example: 2,4.. */
    cornerRadius?: number, /** Options: 2,3,8.. */
    reversed?: boolean,
    backgroundColor?: string, /** Example: “red”, “#FF0000”.. */
    shared?: boolean, /** In a Multi-Series or a Combination Chart, it is often required to display all values common to x value in a single bubble. | In a smaller device/ touchscreen devices, it is advised to show shared Tool Tip! */
    content?: string, /** ToolTip for entire chart can be set by adding content at toolTip object. content can either be HTML or text string. */
    animationEnabled?: boolean,
    borderColor?: string /** Example: “red”, “#808080”.. */
}