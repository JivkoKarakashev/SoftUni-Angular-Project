import { Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastrMessageHandlerService {

  constructor(private toastr: ToastrService) { }

  showInfo() {
    this.toastr.info(`Item was deleted successfully!`, 'Info!', { timeOut: 3000, positionClass: 'toast-top-right' });
  }

  showSuccess() {
    this.toastr.success('Item was successfully added to the cart!', 'Success!', { timeOut: 3000, positionClass: 'toast-top-right' });
  }

  showError(errMsg: string) {
    this.toastr.error(`${errMsg}`, 'Error!', { timeOut: 3000, positionClass: 'toast-top-right' });
  }
}
