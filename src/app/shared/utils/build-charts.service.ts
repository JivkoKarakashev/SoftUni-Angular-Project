import { Injectable } from '@angular/core';

import { ChartOptions } from 'src/app/types/chartOptions/chartOptions';
import { DataPointAttributes } from 'src/app/types/chartOptions/dataPointAttributes';
import { TradedItem } from 'src/app/types/item';
import { CapitalizeCategoryService } from './capitalize-category.service';

@Injectable({
  providedIn: 'root'
})
export class BuildChartsService {

  private purchasesSalesChartOpts: ChartOptions = {
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

  private purchasesCategoryChartOpts: ChartOptions = {
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

  private salesCategoriesChartOpts: ChartOptions = {
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

  constructor(
    public capitalizeCategory: CapitalizeCategoryService,
  ) { }

  buildPurchasesSalesChart(purchasedItmsQty: number, soldItmsQty: number): ChartOptions {
    const chart = { ... this.purchasesSalesChartOpts };
    chart.data[0].dataPoints[0] = { ...chart.data[0].dataPoints[0], y: purchasedItmsQty };
    chart.data[0].dataPoints[1] = { ...chart.data[0].dataPoints[1], y: soldItmsQty };
    return chart;
  }
  buildPurchaseCategoryChart(purchasedItms: TradedItem[]): ChartOptions {
    const chart = { ...this.purchasesCategoryChartOpts };
    const dataPointsArr: DataPointAttributes[] = [];
    purchasedItms.forEach(itm => {
      const label = this.capitalizeCategory.capitalize(itm.cat);
      const idx = dataPointsArr.map(p => p.label).indexOf(label);
      (idx > -1) ? dataPointsArr[idx].y++ : dataPointsArr.push({ label, y: 1 });
    });
    chart.data[0].dataPoints = [...dataPointsArr];
    return chart;
  }

  buildSalesCategoryChart(purchasedItms: TradedItem[]): ChartOptions {
    const chart = { ...this.salesCategoriesChartOpts };
    const dataPointsArr: DataPointAttributes[] = [];
    purchasedItms.forEach(itm => {
      const label = this.capitalizeCategory.capitalize(itm.cat);
      const idx = dataPointsArr.map(p => p.label).indexOf(label);
      (idx > -1) ? dataPointsArr[idx].y++ : dataPointsArr.push({ label, y: 1 });
    });
    chart.data[0].dataPoints = [...dataPointsArr];
    return chart;
  }
}
