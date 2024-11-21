import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { ErrorsService } from './errors.service';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.css']
})
export class ErrorsComponent implements OnInit, OnDestroy {
  public httpErrorsArr: HttpErrorResponse[] = [];
  public errorsArr: Error[] = [];

  constructor(
    private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {
    this.httpErrorsArr = [...this.errorsService.gethttpErrorsArr()];
    this.errorsArr = [...this.errorsService.getErrorsArr()];
  }

  ngOnDestroy(): void {
    this.errorsService.sethttpErrorsArr([]);
    this.errorsService.setErrorsArr([]);
  }

}

