import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  private paginationConfig$$ = new BehaviorSubject<PaginationConfig>(paginationConfigInit);

  get collectionSize(): number {
    return this.paginationConfig$$.value.collectionSize;
  }

  get currentPage(): number {
    return this.paginationConfig$$.value.selectedPage;
  }

  get lastPageSize(): number {
    return this.paginationConfig$$.value.lastPageSize;
  }

  get pageSize(): number {
    return this.paginationConfig$$.value.pageSize;
  }

  get skipSizeReq(): number {
    return this.paginationConfig$$.value.skipSizeReq;
  }

  get totalPages(): number {
    return this.paginationConfig$$.value.totalPages;
  }
  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////
  getPaginationConfig(): PaginationConfig {
    return this.paginationConfig$$.value;
  }
  resetPaginationConfig(): void {
    this.paginationConfig$$.next({ ...paginationConfigInit });
  }

  paginationConfigCalcAndSet(collectionSize: number, pageSize: number, currentPage: number): PaginationConfig {
    if (collectionSize === 0) {
      return this.paginationConfig$$.value;
    }

    this.partialPaginationConfigCalcAndSet(collectionSize, pageSize, currentPage);
    this.skipSizeReqCalcAndSet();
    this.pageSizeReqCalcAndSet();
    return this.paginationConfig$$.value;
  }

  private partialPaginationConfigCalcAndSet(collSize: number, pSize: number, currP: number): void {
    const totalPages = Math.ceil(collSize / pSize);
    this.paginationConfig$$.next({
      ...this.paginationConfig$$.value,
      collectionSize: collSize,
      selectedPage: ((currP < totalPages) ? currP : totalPages) || 1,
      lastPageSize: collSize % pSize,
      pageSize: pSize,
      totalPages
    });
  }

  private pageSizeReqCalcAndSet(): void {
    if (this.currentPage < this.totalPages) {
      this.paginationConfig$$.next({ ...this.paginationConfig$$.value, pageSizeReq: this.pageSize });
    } else {
      this.paginationConfig$$.next({ ...this.paginationConfig$$.value, pageSizeReq: this.collectionSize - this.skipSizeReq });
    }
  }

  private skipSizeReqCalcAndSet(): void {
    this.paginationConfig$$.next({ ...this.paginationConfig$$.value, skipSizeReq: (this.currentPage - 1) * this.pageSize });
  }

}
