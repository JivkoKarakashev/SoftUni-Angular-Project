import { CartItem } from "./cartItem";
import { Discount } from "./discount";
import { Shipping } from "./shipping";

export interface Order {
    _createdOn: number,
    id: string,
    _ownerId: string,
    purchasedItems: CartItem[],
    subtotal: number,
    discount: Discount,
    discountValue: number,
    shippingMethod: Shipping,
    shippingValue: number,
    total: number
}