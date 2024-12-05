export interface SubtitleAttributes {
    backgroundColor?: string, /** Example: “red”, “#FF0000”.. */
    borderColor?: string, /** Example: “red”, “#FF0000”.. */
    borderThickness?: number, /** pixels */
    cornerRadius?: number, /** Example: 5, 8.. */
    fontColor?: string, /** Example: “red”, “#FAC003”.. */
    fontFamily?: string, /** Example: “arial” , “tahoma”, “verdana”.. */
    fontSize?: number, /** pixels */
    fontWeight?: 'lighter' | 'normal' | 'bold' | 'bolder',
    horizontalAlign?: 'left' | 'right' | 'center',
    margin?: number, /** Example: 4, 12.. applied between Chart Title and Plot Area */
    padding?: number | {
        top?: number,
        right?: number,
        bottom?: number,
        left?: number
    },
    text?: string, /** Example: “Chart title” */
    textAlign?: 'left' | 'center' | 'right',
    verticalAlign?: 'top' | 'center' | 'bottom',
    wrap?: boolean,
    maxWidth?: number, /** Example: 200, 500 etc.. */
    dockInsidePlotArea?: boolean /** When it's set to true, title renders inside the plot area there by giving more space to plot area. */
}