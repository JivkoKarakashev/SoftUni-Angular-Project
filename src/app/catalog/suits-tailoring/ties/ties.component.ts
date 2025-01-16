import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { CartItem, Item, ListItem } from 'src/app/types/item';
import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { TiesService } from './ties.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';

import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { ToastrMessageHandlerService } from 'src/app/shared/utils/toastr-message-handler.service';
import { NgConfirmService } from 'ng-confirm-box';

@Component({
  selector: 'app-ties',
  templateUrl: './ties.component.html',
  styleUrls: ['./ties.component.css']
})
export class TiesComponent implements OnInit, OnDestroy {

  public listItems: ListItem[] = [];
  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private tiesService: TiesService,
    private errorsService: ErrorsService,
    private checkForInCartAlready: CheckForItemInCartAlreadyService,
    private cartService: ShoppingCartService,
    private catalogManagerService: CatalogManagerService,
    private confirmService: NgConfirmService,
    private toastrMessageHandler: ToastrMessageHandlerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.cartItms = [...this.cartItms, ...this.cartStateMgmnt.getCartItems()];
    this.cartItemsCounter = this.cartItms.length;
    const tiesSub = this.tiesService.getTies()
      .pipe(
        catchError(err => { return of(err); }),
      )
      .subscribe(res => {
        this.loading = false;
        if (res instanceof HttpErrorResponse) {
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...res }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...res }];
          return;
        }
        this.listItems = [...this.listItems, ...this.checkForInCartAlready.check([res as Item[]], this.cartItms)];
        // console.log(this.listItems);
      });
    this.unsubscriptionArray.push(tiesSub);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 2');
  }

  onAddToCart(i: number): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = this.listItems[i];
    const newCartItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = { ...this.listItems[idx], inCart: true };
    this.cartService.addCartItem(newCartItem);
    this.cartItemsCounter++;
    this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
    // console.log(this.listItems);
    // console.log(this.cartItms);
  }

  onDelete(i: number): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        const { _id, subCat } = this.listItems[i];
        const deleteSub = this.catalogManagerService.deleteItem(subCat, _id)
          .pipe(
            catchError(err => { throw err; })
          )
          .subscribe(
            {
              next: () => {
                const newListItems = this.listItems.filter((itm, idx) => idx != i ? itm : null);
                this.listItems = [...newListItems];
                this.toastrMessageHandler.showInfo();
              },
              error: (err) => {
                const errMsg: string = err.error.message;
                this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
                this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
                this.toastrMessageHandler.showError(errMsg);
              }
            }
          );
        this.unsubscriptionArray.push(deleteSub);
      },
      () => { return; }
    );
  }

  onEdit(i: number): void {
    this.confirmService.showConfirm('Edit this item?',
      () => {
        this.catalogManagerService.setCatalogItemToEdit({ ...this.listItems[i] });
        this.router.navigate(['/edit-product']);
      },
      () => { return; }
    );
  }
}
