import { CartItem } from "./cartItem";
import { Discount } from "./discount";
import { Shipping } from "./shipping";

export interface Order {
    _createdOn: number,
    _id: string,
    _ownerId: string,
    email: string,
    purchasedItems: CartItem[],
    subtotal: number,
    discount: Discount,
    discountValue: number,
    shippingMethod: Shipping,
    shippingValue: number,
    total: number,
    paymentState: string
}