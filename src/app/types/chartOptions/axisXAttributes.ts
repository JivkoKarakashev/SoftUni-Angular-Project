export interface AxisXAttributes {
    title: string, /** Example: “Axis X Title” */
    titleWrap?: boolean,
    titleMaxWidth?: number, /** Example: 100,200,.. */
    titleBorderColor?: string, /** Example: “red”,”#FABD76″,.. */
    titleBorderThickness?: number, /** Example: 2,4,.. */
    titleTextAlign?: 'left' | 'center' | 'right',
    titleFontColor?: string, /** Example: “red”, “#006400”.. */
    titleFontSize?: number, /** pixels Example: 16, 25.. */
    titleFontFamily?: string, /** “calibri”, “tahoma, “verdana”.. */
    titleFontWeight?: 'lighter' | 'normal' | 'bold' | 'bolder',
    titleFontStyle?: 'normal' | 'italic' | 'oblique',
    margin?: number, /** Example: 8, 10.. */
    labelBackgroundColor?: string, /** Example: “red”,”#fabd76″.. */
    labelBorderColor?: string, /** Example: “red”,”#FABD76″,.. */
    labelBorderThickness?: number, /** Example: 2,4,.. */
    labelMaxWidth?: number, /** Example: 4, 20, 100 etc. */
    labelWrap?: boolean,
    labelAutoFit?: boolean,
    labelAngle?: number, /** Example: 20, 45, -30.. */
    labelFontFamily?: string, /** Example: “calibri”, “tahoma”, “verdana”.. */
    labelFontColor?: string, /** Example: “red”, “#FAC003”.. */
    labelFontSize?: number, /** Example: 16, 18, 22.. */
    labelFontWeight?: 'lighter' | 'normal' | 'bold' | 'bolder',
    labelFontStyle?: 'italic' | 'oblique' | 'normal',
    prefix?: string, /** Example: “$”,”cat”.. */
    labelTextAlign?: 'left' | 'center' | 'right',
    suffix?: string, /** “$”,”cat”.. */
    valueFormatString?: string, /** Example: "#,##0.##", */
    minimum?: number | Date, /** Example: 100, 350.. */
    maximum?: number | Date, /** Example: 100, 350.. */
    viewportMinimum?: number | Date, /** Example: -100, 350.. */
    viewportMaximum?: number | Date, /** Example: -100, 350.. */
    interval?: number, /** Example: 50, 75.. Sets the distance between Tick Marks, Grid Lines and Interlaced Colors. */
    intervalType?: 'number' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year',
    reversed?: boolean,
    logarithmic?: boolean, /** Changes axis scale to logarithmic scale. Default Logarithm Base is 10 */
    logarithmBase?: number, /** Options: 2, 16, Math.E,.. */
    tickLength?: number, /** Example: 10, 14.. */
    tickColor?: string, /** Example: “red”, “#006400” */
    tickThickness?: number, /** Example: 3, 4.. */
    lineColor?: string, /** Example: “blue”,”#21AB13″.. */
    lineThickness?: number, /** Example: 2, 4.. */
    lineDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot',
    gridDashType?: 'solid' | 'shortDash' | 'shortDot' | 'shortDashDot' | 'shortDashDotDot' | 'dot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot' | 'longDashDotDot',
    interlacedColor?: string, /** Example: “#F8F1E4”, “#FEFDDF”.. */
    gridThickness?: number, /** Example: 2,4.. */
    labelPlacement?: 'inside' | 'outside', /** Position axisX label either inside or outside the plot-area. */
    tickPlacement?: 'inside' | 'outside',
    gridColor?: string /** Example: “red”, “#FEFDDF”.. */
}