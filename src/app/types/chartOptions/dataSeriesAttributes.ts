import { DataPointAttributes } from "./dataPointAttributes";

export interface DataSeriesAttributes {
    name?: string,
    cursor?: 'alias' | 'all-scroll' | 'auto' | 'cell' | 'col-resize' | 'context-menu' | 'copy' | 'crosshair' | 'default' | 'e-resize' | 'ew-resize' | 'grab' | 'grabbing' | 'help' | 'move' | 'n-resize' | 'ne-resize' | 'nesw-resize' | 'ns-resize' | 'nw-resize' | 'nwse-resize' | 'no-drop' | 'none' | 'not-allowed' | 'pointer' | 'progress' | 'row-resize' | 's-resize' | 'se-resize' | 'sw-resize' | 'text' | 'w-resize' | 'wait' | 'zoom-in' | 'zoom-out',
    visible?: boolean,
    type: 'line' | 'column' | 'bar' | 'area' | 'spline' | 'splineArea' | 'stepLine' | 'scatter' | 'bubble' | 'stackedColumn' | 'stackedBar' | 'stackedArea' | 'stackedColumn100' | 'stackedBar100' | 'stackedArea100' | 'pie' | 'doughnut',
    axisXType?: 'primary' | 'secondary',
    axisYType?: 'primary' | 'secondary',
    axisXIndex?: number, /** Options: 1, 2, 3.. */
    axisYIndex?: number, /** Options: 1,2,3.. */
    xValueType?: 'number' | 'dateTime',
    yValueFormatString?: string, /** Example: "#,###.##'%'" */
    zValueFormatString?: string, /** Example: "##.#0 mm" Only in Bubble type chart! */
    percentFormatString?: string, /** Example: "#0.##" */
    xValueFormatString?: string, /** Example: "$#######.00" */
    highlightEnabled?: boolean, /** Highlighting of dataPoints on mouse hover. */
    connectNullData?: boolean, /** A line breaks wherever a null dataPoint (y = null) is present, when it's set to true, change this behaviour to draw a line between adjacent non-null dataPoints */
    lineDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot',
    nullDataLineDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot',
    indexLabelLineDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot',
    color?: string, /** Example: “red”, “green”.. */
    lineColor?: string, /** Example: “blue”,”#21AB13″.. */
    bevelEnabled?: boolean,
    fillOpacity?: number,
    startAngle?: number,
    indexLabel?: string, /** Example: “{label}”, “Win”, “x: {x}, y: {y} ” */
    radius?: number | string, /** Example: 200, 150, “90%”, “75%” */
    innerRadius?: number | string, /** Example: 200, 150, “90%”, “75%” */
    indexLabelPlacement?: string, /** Example: “outside”, “inside”, “auto” */
    indexLabelMaxWidth?: number, /** Options: 4, 20, 100 etc. */
    indexLabelWrap?: boolean,
    indexLabelTextAlign?: 'left' | 'center' | 'right',
    indexLabelOrientation?: 'horizontal' | 'vertical',
    indexLabelBackgroundColor?: string, /** Example: “red”, “#FAC003”.. */
    neckWidth?: number | string, /** Example: 100, 150, “30%”, “35%” */
    indexLabelFontStyle?: 'italic' | 'oblique' | 'normal',
    neckHeight?: number | string, /** Example: 100, 150, “30%”, “35%” */
    indexLabelBorderColor?: string, /** Example: “red”,”#FABD76″,.. */
    indexLabelBorderThickness?: number, /** Example: 1,3,.. */
    reversed?: boolean,
    valueRepresents?: string, /** Example: “area”,”height” | Works only in Funnel / Pyramid Chart! */
    upperBoxColor?: string, /** Example: “red”, “#DD7E86” | Works only in Box and Whisker Chart! */
    lowerBoxColor?: string, /** Example: “green”, “#DD7E86” | Works only in Box and Whisker Chart! */
    indexLabelFontColor?: string, /** Example: “red”, “#FAC003”.. */
    whiskerLength?: number | string, /** Example: 10, 14, “80%”, “60%”.. */
    whiskerColor?: string, /** Example: “red”, “#FAC003”.. */
    whiskerThickness?: number, /** Example: 4, 6.. | Works only in Error / Box and Whisker Charts! | Values should always be positive! */
    indexLabelFontSize?: number, /** Example: 12, 16, 22.. */
    whiskerDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot', /** Works only in Box and Whisker & Error Charts! */
    indexLabelFontFamily?: string, /** Example: “calibri”, “tahoma”, “verdana”.. */
    indexLabelFontWeight?: 'lighter' | 'normal' | 'bold' | 'bolder',
    stemColor?: string, /** Example: “red”, “#FAC003”.. */
    stemThickness?: number, /** Example: 4, 6.. */
    indexLabelLineColor?: string, /** Example: “red”, “#FAC003”.. */
    stemDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot', /** Works only in Box and Whisker & Error Charts! */
    indexLabelLineThickness?: number, /** Example: 4, 6 */
    toolTipContent?: string, /** Examples toolTipContent can either be literal string or keywords. You can also use HTML tags. */
    linkedDataSeriesIndex?: number, /** Example: 1,2,3.. */
    lineThickness?: number, /** Example: 3,4.. | In area charts you can disable line by setting lineThickness to 0! */
    markerType?: 'none' | 'circle' | 'square' | 'triangle' | 'cross',
    markerColor?: string, /** Example: “red”, “#008000”.. */
    markerSize?: number, /** Example: 5, 10.. */
    markerBorderColor?: string, /** Example: “red”, “#008000”.. */
    markerBorderThickness?: number, /** Example: 2,4.. */
    showInLegend?: boolean,
    legendText?: string, /** Example: “2010”, “2011”.. */
    legendMarkerBorderColor?: string, /** Example: “red”, “#008000”.. */
    legendMarkerBorderThickness?: number, /** Example: 2, 4.. */
    legendMarkerType?: 'circle' | 'square' | 'cross' | 'triangle',
    explodeOnClick?: boolean, /** Exploding of Pie / Doughnut / Funnel / Pyramid segment on click */
    legendMarkerColor?: string, /** Example: “red”, “#008000”.. */
    risingColor?: string, /** Options: “red”, “#DD7E86”, etc. */
    dataPoints: Array<DataPointAttributes>,
    fallingColor?: string /** Example: “orange”, “#DD7E86” */
}