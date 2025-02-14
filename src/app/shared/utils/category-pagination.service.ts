import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SubcategoryPaginationConfig {
  subcategoryUrl: string,
  subcategorySize: number,
  subcategorySizeReq: number,
  subcategorySkipReq: number
}

export const subcategoryPaginationConfigInit: SubcategoryPaginationConfig = {
  subcategoryUrl: '',
  subcategorySize: 0,
  subcategorySizeReq: 0,
  subcategorySkipReq: 0
}

export interface CategoryPaginationConfig {
  categoryComposition: Array<number>,
  categorySize: number,
  totalPages: number,
  lastPageSize: number,
  selectedPage: number,
  pageSize: number,
  sizeReqAccum: number,
  skipReqAccum: number,
  subcategoryConfigs: Array<SubcategoryPaginationConfig>
}

export const categoryPaginationConfigInit: CategoryPaginationConfig = {
  categoryComposition: [],
  categorySize: 0,
  totalPages: 0,
  lastPageSize: 0,
  selectedPage: 0,
  pageSize: 0,
  sizeReqAccum: 0,
  skipReqAccum: 0,
  subcategoryConfigs: []
}


@Injectable({
  providedIn: 'root'
})
export class CategoryPaginationService {

  private categoryUrls$$ = new BehaviorSubject<Array<string>>([]);
  private categoryPaginationConfig$$ = new BehaviorSubject<CategoryPaginationConfig>(categoryPaginationConfigInit);

  setCategoryUrls(catUrls: string[]): void {
    this.categoryUrls$$.next(catUrls);
  }
  getCategoryUrls() {
    return this.categoryUrls$$.value;
  }

  getCategoryPaginationConfig() {
    return this.categoryPaginationConfig$$.value;
  }
  resetCategoryPaginationConfig() {
    this.categoryUrls$$.next([]);
    this.categoryPaginationConfig$$.next({ ...categoryPaginationConfigInit });
  }
  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////
  paginationCategoryConfigCalcAndSet(catComp: Array<number>, pSize: number, currP: number): void {
    const categoryComposition = [...catComp];
    const categorySize = this.categorySizeCalc([...catComp]);
    const totalPages = this.totalPagesCalc(categorySize, pSize);
    const lastPageSize = this.lastPageSizeCalc(categorySize, pSize);
    const selectedPage = this.selectedPageCalc(currP, totalPages);
    const skipReqAccum = this.skipReqAccumCalc(selectedPage, pSize);
    const subcategoryConfigs = this.subcategoryConfigsCalc(categoryComposition, skipReqAccum, pSize);
    this.categoryPaginationConfig$$.next(
      {
        categoryComposition,
        categorySize,
        totalPages,
        lastPageSize,
        selectedPage,
        pageSize: pSize,
        skipReqAccum,
        sizeReqAccum: 0,
        subcategoryConfigs
      }
    );
    // console.log(this.paginationCategoryConfig$$.value);
  }

  private categorySizeCalc(catComp: number[]): number {
    return catComp.reduce((acc, curr) => acc += curr, 0);
  }

  private totalPagesCalc(catSize: number, pageSize: number): number {
    return Math.ceil(catSize / pageSize);
  }

  private lastPageSizeCalc(catSize: number, pageSize: number): number {
    return catSize % pageSize;
  }

  private selectedPageCalc(currPage: number, totalPages: number): number {
    return ((currPage < totalPages) ? currPage : totalPages) || 1;
  }

  private skipReqAccumCalc(selectedPage: number, pageSize: number): number {
    return (selectedPage - 1) * pageSize;
  }

  private subcategoryConfigsCalc(catComp: number[], skipReqAccum: number, pageSize: number): Array<SubcategoryPaginationConfig> {
    const subcatConfigs: SubcategoryPaginationConfig[] = [];
    let skipReqCounter = 0;
    let sizeReqAccum = 0;

    for (let i = 0; sizeReqAccum < pageSize; i++) {
      if (i === catComp.length) {
        break;
      }
      const skipReqDiff = skipReqAccum - skipReqCounter;
      const sizeReqDiff = pageSize - sizeReqAccum;

      const subcategoryUrl = this.categoryUrls$$.value[i];
      const subcategorySize = catComp[i];
      // console.log('************************************');
      // console.log('Index: ' + i);

      let subcategorySkipReq = 0;
      let subcategorySizeReq = 0;
      if (skipReqCounter < skipReqAccum) {
        if (skipReqDiff < subcategorySize) {
          skipReqCounter += skipReqDiff;
          subcategorySkipReq = skipReqDiff;
          if (sizeReqDiff < subcategorySize - skipReqDiff) {
            sizeReqAccum += sizeReqDiff;
            subcategorySizeReq = sizeReqDiff;
          } else {
            sizeReqAccum += subcategorySize - skipReqDiff;
            subcategorySizeReq = subcategorySize - skipReqDiff;
          }
        } else {
          skipReqCounter += subcategorySize;
          subcategorySkipReq = subcategorySize;
        }
      } else {
        if (sizeReqDiff < subcategorySize) {
          sizeReqAccum += sizeReqDiff;
          subcategorySizeReq = sizeReqDiff;
        } else {
          // console.log('subCatSize: ' + subcategorySize);
          sizeReqAccum += subcategorySize;
          subcategorySizeReq = subcategorySize;
        }
      }
      // console.log('-------------------------------------');
      // console.log('skipReqCounter: ' + skipReqCounter);
      // console.log('sizeReqAccum ' + sizeReqAccum);
      // console.log('-------------------------------------');
      // console.log('************************************');

      subcatConfigs.push({
        subcategoryUrl,
        subcategorySize,
        subcategorySkipReq,
        subcategorySizeReq
      });
    }
    // console.log('SkipReqCounter:' + skipReqCounter);
    return subcatConfigs;
  }
}
