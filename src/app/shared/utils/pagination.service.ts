import { Injectable } from '@angular/core';

export interface PaginationConfig {
  collectionSize: number,
  selectedPage: number,
  lastPageSize: number,
  pageSize: number,
  pageSizeReq: number,
  skipSizeReq: number,
  totalPages: number
}

export const paginationConfigInit: PaginationConfig = {
  collectionSize: 0,
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
export class PaginationService {

  paginationConfigCalc(collSize: number, pSize: number, currP: number): PaginationConfig {
    const collectionSize = collSize;
    const totalPages = this.totalPagesCalc(collSize, pSize);
    const lastPageSize = this.lastPageSizeCalc(collSize, pSize);
    const selectedPage = this.selectedPageCalc(currP, totalPages);
    const skipSizeReq = this.skipSizeReqCalc(selectedPage, pSize);
    const pageSizeReq = this.pageSizeReqCalc(selectedPage, totalPages, collSize, pSize, skipSizeReq);
    return {
      collectionSize,
      selectedPage,
      lastPageSize,
      pageSize: pSize,
      pageSizeReq,
      skipSizeReq,
      totalPages
    }
  }

  private totalPagesCalc(collectionSize: number, pageSize: number): number {
    return Math.ceil(collectionSize / pageSize);
  }

  private lastPageSizeCalc(collectionSize: number, pageSize: number): number {
    return collectionSize % pageSize;
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
