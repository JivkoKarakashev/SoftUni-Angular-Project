import { Component } from '@angular/core';

import { ShoppingCartService } from '../shared/shopping-cart/shopping-cart.service';
import { ConfirmOrderService } from '../checkout/confirm-order/confirm-order.service';
import { CartItem } from '../types/cartItem';
import { Discount } from '../types/discount';
import { Shipping } from '../types/shipping';
import { DBOrder } from '../types/order';

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

  constructor(private cartService: ShoppingCartService, private confirmOrderService: ConfirmOrderService) {
    this.cartItemsState = JSON.parse(localStorage.getItem('cartItemsState') as string) || null;
    this.discountState = JSON.parse(localStorage.getItem('discountState') as string) || null;
    this.shippingState = JSON.parse(localStorage.getItem('shippingState') as string) || null;
    this.dbOrderState = JSON.parse(localStorage.getItem('dbOrderState') as string) || null;
    if (this.cartItemsState) {
      this.cartService.setCartItems([...this.cartItemsState]);
    }
    if (this.discountState) {
      const { code, rate } = this.discountState;
      this.cartService.setDiscountState(code, rate);
    }
    if (this.shippingState) {
      const { name, value } = this.shippingState;
      this.cartService.setShippingState(name, value);
    }
    if (this.dbOrderState) {
      const { _createdOn, _id, _ownerId, email, username, address, purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status } = this.dbOrderState;
      this.confirmOrderService.setDBOrderState({ _createdOn, _id, _ownerId, email, username, address, purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status });
    }
  }
}
