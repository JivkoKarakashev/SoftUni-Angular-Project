import { Injectable } from '@angular/core';

export interface RelatedProductsPaginationConfig {
  size: number,
  selectedPage: number,
  lastPageSize: number,
  pageSize: number,
  pageSizeReq: number,
  skipSizeReq: number,
  totalPages: number
}

export const relatedProductsPaginationConfigInit: RelatedProductsPaginationConfig = {
  size: 0,
  selectedPage: 0,
  lastPageSize: 0,
  pageSize: 0,
  pageSizeReq: 0,
  skipSizeReq: 0,
  totalPages: 0
}

@Injectable({
  providedIn: 'root'
})
export class RelatedProductsPaginationService {

  relatedProductsPaginationConfigCalc(collSize: number, pSize: number, currP: number): RelatedProductsPaginationConfig {
    const size = collSize - 1;
    const totalPages = this.totalPagesCalc(size, pSize);
    const lastPageSize = this.lastPageSizeCalc(collSize, pSize);
    const selectedPage = this.selectedPageCalc(currP, totalPages);
    const skipSizeReq = this.skipSizeReqCalc(selectedPage, pSize);
    const pageSizeReq = this.pageSizeReqCalc(selectedPage, totalPages, collSize, pSize, skipSizeReq);
    return {
      size,
      selectedPage,
      lastPageSize,
      pageSize: pSize,
      pageSizeReq,
      skipSizeReq,
      totalPages
    }
  }

  private totalPagesCalc(size: number, pageSize: number): number {
    return Math.ceil(size / pageSize);
  }

  private lastPageSizeCalc(collSize: number, pageSize: number): number {
    return collSize % pageSize;
  }

  private selectedPageCalc(currPage: number, totalPages: number): number {
    return ((currPage < totalPages) ? currPage : totalPages) || 1;
  }

  private skipSizeReqCalc(selectedPage: number, pageSize: number): number {
    return (selectedPage - 1) * pageSize;
  }

  private pageSizeReqCalc(currPage: number, totalPages: number, collSize: number, pageSize: number, skipSizeReq: number): number {
    // console.log(currPage, totalPages, collSize);
    if (currPage < totalPages) {
      return pageSize;
    } else {
      return collSize - skipSizeReq;
    }
  }
}
