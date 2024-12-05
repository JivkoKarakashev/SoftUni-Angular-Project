export interface LegendAttributes {
    cursor?: 'alias' | 'all-scroll' | 'auto' | 'cell' | 'col-resize' | 'context-menu' | 'copy' | 'crosshair' | 'default' | 'e-resize' | 'ew-resize' | 'grab' | 'grabbing' | 'help' | 'move' | 'n-resize' | 'ne-resize' | 'nesw-resize' | 'ns-resize' | 'nw-resize' | 'nwse-resize' | 'no-drop' | 'none' | 'not-allowed' | 'pointer' | 'progress' | 'row-resize' | 's-resize' | 'se-resize' | 'sw-resize' | 'text' | 'w-resize' | 'wait' | 'zoom-in' | 'zoom-out',
    reversed?: boolean,
    maxWidth?: number, /** Example: 100, 200, 500 etc. */
    maxHeight?: number, /** Example: 100,200, 300 etc. */
    itemWrap?: boolean,
    itemMaxWidth?: number, /** Example: 100, 150, 200 etc. */
    itemWidth?: number, /** Example: 100, 200, 300 etc. | itemWidth can be used to align legend items! */
    markerMargin?: number, /** Example: 4,12.. */
    dockInsidePlotArea?: boolean,
    fontSize?: number, /** Example: 16,18,22.. */
    fontFamily?: string, /** Example: “arial” , “tahoma”, “verdana”.. */
    fontColor?: string, /** Example: “red”, “#FAC003″.. */
    fontWeight?: 'lighter' | 'normal' | 'bold' | 'bolder',
    fontStyle?: 'normal' | 'italic' | 'oblique',
    verticalAlign?: 'top' | 'center' | 'bottom',
    horizontalAlign?: 'left' | 'right' | 'center'
}