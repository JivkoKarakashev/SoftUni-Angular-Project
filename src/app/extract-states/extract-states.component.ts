import { Component } from '@angular/core';

import { CartItem, TradedItem } from '../types/item';
import { Discount } from '../types/discount';
import { Shipping } from '../types/shipping';
import { DBOrder } from '../types/order';

import { ShoppingCartStateManagementService } from '../shared/state-management/shopping-cart-state-management.service';
import { OrderStateManagementService } from '../shared/state-management/order-state-management.service';
import { TradedItemsStateManagementService } from '../shared/state-management/traded-items-state-management.service';

@Component({
  selector: 'app-extract-states',
  templateUrl: './extract-states.component.html',
  styleUrls: ['./extract-states.component.css']
})
export class ExtractStatesComponent {
  private cartItemsState: CartItem[] | null = null;
  private discountState: Discount | null = null;
  private shippingState: Shipping | null = null;
  private dbOrderState: DBOrder | null = null;
  private dbTradedItemsState: TradedItem[] | null = null;

  constructor(
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private orderStateMgmnt: OrderStateManagementService,
    private tradedItmsStateMgmnt: TradedItemsStateManagementService
  ) {

    this.cartItemsState = JSON.parse(localStorage.getItem('cartItemsState') as string) || null;
    this.discountState = JSON.parse(localStorage.getItem('discountState') as string) || null;
    this.shippingState = JSON.parse(localStorage.getItem('shippingState') as string) || null;
    this.dbOrderState = JSON.parse(localStorage.getItem('dbOrderState') as string) || null;
    this.dbTradedItemsState = JSON.parse(localStorage.getItem('dbTradedItemsState') as string) || null;

    if (this.cartItemsState) {
      this.cartStateMgmnt.setCartItemsState([...this.cartItemsState]);
    }
    if (this.discountState) {
      const { code, rate } = this.discountState;
      this.cartStateMgmnt.setDiscountState(code, rate);
    }
    if (this.shippingState) {
      const { name, value } = this.shippingState;
      this.cartStateMgmnt.setShippingState(name, value);
    }
    if (this.dbOrderState) {
      const { _createdOn, _id, _ownerId, email, username, address, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status } = this.dbOrderState;
      this.orderStateMgmnt.setDBOrderState({ _createdOn, _id, _ownerId, email, username, address, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status });
    }
    if (this.dbTradedItemsState) {
      this.tradedItmsStateMgmnt.setDBTradedItemsState([...this.dbTradedItemsState]);
    }
  }
}
