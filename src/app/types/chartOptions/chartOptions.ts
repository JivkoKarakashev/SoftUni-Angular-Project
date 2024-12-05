import { AxisXAttributes } from "./axisXAttributes"
import { AxisYAttributes } from "./axisYAttributes"
import { DataSeriesAttributes } from "./dataSeriesAttributes"
import { LegendAttributes } from "./legendAttributes"
import { SubtitleAttributes } from "./subtitleAttributes"
import { ToolTipAttributes } from "./toolTipAttributes"
import { ToolbarAttributes } from "./toolbarAttributes"

export interface ChartOptions {
  interactivityEnabled?: boolean,
  animationDuration?: number, /** milliseconds */
  animationEnabled?: boolean,
  exportFileName?: string,
  exportEnabled?: boolean,
  zoomEnabled?: boolean, /** Chart types that have Axis */
  zoomType?: 'x' | 'y' | 'xy', /** Chart types that have Axis + zoomEnabled is set to true */
  theme?: 'light1' | 'light2' | 'dark1' | 'dark2',
  backgroundColor?: string, /** Example: “yellow”, “#fff”.. */
  colorSet?: Array<string>, /** [//colorSet Array “#4661EE”, “#EC5657”, “#1BCDD1”, “#8FAABB”, “#B08BEB”, “#3EA0DD”, “#F5A52A”, “#23BFAA”, “#FAA586”, “#EB8CC6”,]); */
  width?: number, /** pixels */
  height?: number, /** pixels */
  subtitles?: Array<SubtitleAttributes>,
  toolbar?: ToolbarAttributes,
  title: SubtitleAttributes,
  axisX?: AxisXAttributes,
  axisY?: AxisYAttributes,
  axisX2?: AxisXAttributes,
  axisY2?: AxisYAttributes,
  data: Array<DataSeriesAttributes>,
  toolTip?: ToolTipAttributes,
  legend?: LegendAttributes
}

export const purchasesSalesChartOptsInit: ChartOptions = {
  title: {
    text: "Percentage of Purchases and Sales"
  },
  data: [{
    type: "pie",
    showInLegend: true,
    legendText: "{label}",
    indexLabel: "#percent%",
    dataPoints: [
      { label: "purchases", y: 0 },
      { label: "sales", y: 0 }
    ]
  }]
};

export const purchaseCategoriesChartOptsInit: ChartOptions = {
  title: {
    text: "Percentage of purchases by category"
  },
  data: [{
    type: "pie",
    showInLegend: true,
    legendText: "{label}",
    indexLabel: "#percent%",
    dataPoints: []
  }]
};

export const salesCategoriesChartOptsInit: ChartOptions = {
  title: {
    text: "Percentage of sales by category"
  },
  data: [{
    type: "pie",
    showInLegend: true,
    legendText: "{label}",
    indexLabel: "#percent%",
    dataPoints: []
  }]
};