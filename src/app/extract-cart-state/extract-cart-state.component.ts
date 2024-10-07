import { Component } from '@angular/core';

import { ShoppingCartService } from '../shared/shopping-cart.service';
import { CartItem } from '../types/cartItem';
import { Discount } from '../types/discount';
import { Shipping } from '../types/shipping';

@Component({
  selector: 'app-extract-cart-state',
  templateUrl: './extract-cart-state.component.html',
  styleUrls: ['./extract-cart-state.component.css']
})
export class ExtractCartStateComponent {
  private cartItemsState: CartItem[] | null = null;
  private discountState: Discount | null = null;
  private shippingState: Shipping | null = null;

  constructor(private cartService: ShoppingCartService) {
    this.cartItemsState = JSON.parse(localStorage.getItem('cartItemsState') as string) || null;
    this.discountState = JSON.parse(localStorage.getItem('discountState') as string) || null;
    this.shippingState = JSON.parse(localStorage.getItem('shippingState') as string) || null;
    if (this.cartItemsState) {
      this.cartService.setCartItems([...this.cartItemsState]);
    }
    if (this.discountState) {
      const { code, rate } = this.discountState;
      this.cartService.setDiscountState(code, rate);
    }
    if (this.shippingState) {
      const {name, value} = this.shippingState;
      this.cartService.setShippingState(name, value);
    }
  }
}
