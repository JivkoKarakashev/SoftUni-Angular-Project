export interface DataPointAttributes {
    x?: number, /** Example: 10, 20, 30.. | new Date(2011, 08, 01) */
    y: number, /** Example: 5, 20, -30.. */
    z?: number, /** Example: 10, 20, 35.. | Only applicable in case of Bubble chart. This value determines the size of the bubble! */
    name?: string, /** Example: “apple”, “mango”.. */
    isIntermediateSum?: boolean, /** Works only in Waterfall Chart! */
    isCumulativeSum?: boolean, /** Works only in Waterfall Chart! */
    cursor?: 'alias' | 'all-scroll' | 'auto' | 'cell' | 'col-resize' | 'context-menu' | 'copy' | 'crosshair' | 'default' | 'e-resize' | 'ew-resize' | 'grab' | 'grabbing' | 'help' | 'move' | 'n-resize' | 'ne-resize' | 'nesw-resize' | 'ns-resize' | 'nw-resize' | 'nwse-resize' | 'no-drop' | 'none' | 'not-allowed' | 'pointer' | 'progress' | 'row-resize' | 's-resize' | 'se-resize' | 'sw-resize' | 'text' | 'w-resize' | 'wait' | 'zoom-in' | 'zoom-out',
    label?: string, /** Example: “label1”, “label2”.. */
    highlightEnabled?: boolean, /** highlightEnabled on dataPoint overrides the one in dataSeries */
    indexLabelLineDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot',
    indexLabel?: string, /** Example: “{label}”,”Win”, “x: {x} , y: {y} ” | In case of pie and doughnut charts if indexLabel is not provided, label is used as indexLabel! */
    indexLabelPlacement?: 'outside' | 'inside' | 'auto',
    indexLabelOrientation?: 'horizontal' | 'vertical',
    indexLabelBackgroundColor?: string, /** Example: “red”, “#FAC003”.. */
    indexLabelBorderColor?: string, /** “red”,”#FABD76″,.. */
    indexLabelFontColor?: string, /** Example: “red”, “#FAC003”.. */
    indexLabelWrap?: boolean,
    indexLabelBorderThickness?: number, /** Example: 1,3,.. */
    indexLabelMaxWidth?: number, /** Options: 4, 20, 100 etc. */
    indexLabelTextAlign?: 'left' | 'center' | 'right',
    indexLabelFontSize?: number, /** Example: 12, 16, 22.. */
    indexLabelFontStyle?: 'italic' | 'oblique' | 'normal',
    indexLabelFontFamily?: string, /** Example: “calibri” , “tahoma”, “verdana”.. */
    indexLabelFontWeight?: 'lighter' | 'normal' | 'bold' | 'bolder',
    indexLabelLineColor?: string, /** Example: “red”, “#FAC003”.. */
    indexLabelLineThickness?: number, /** Example: 4, 6.. */
    toolTipContent?: string, /** Examples toolTipContent can either be literal string or keywords. You can also use HTML tags. */
    exploded?: boolean,
    color?: string, /** Example: “red”, “green”.. */
    lineColor?: string, /** Example: “blue”,”#21AB13″.. */
    lineDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot',
    showInLegend?: boolean,
    legendText?: string, /** Example: “apple”, “mango”.. | It is only applicable in case of pie, doughnut, funnel and pyramid chart! */
    legendMarkerType?: 'circle' | 'square' | 'cross' | 'triangle',
    legendMarkerColor?: string, /** Example: “red”, “#008000”.. */
    legendMarkerBorderColor?: string /** Example: “red”, “#008000”.. */
    legendMarkerBorderThickness?: number, /** Example: 4, 7.. */
    markerType?: 'circle' | 'square' | 'cross' | 'triangle',
    markerColor?: string, /** Example: “red”, “#008000”.. */
    markerSize?: number, /** Example: 5, 10.. */
    markerBorderColor?: string, /** Example: “red”, “#008000”.. */
    markerBorderThickness?: number /** Example: 4, 7.. */
}