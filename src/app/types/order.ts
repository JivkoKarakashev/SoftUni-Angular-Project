import { CartItem } from "./cartItem";
import { Discount, discountInitialState } from "./discount";
import { Shipping, shippingInitialState } from "./shipping";

export interface Order {
    email: string,
    username: string,
    address: Address,
    purchasedItems: CartItem[],
    subtotal: number,
    discount: Discount,
    discountValue: number,
    shippingMethod: Shipping,
    shippingValue: number,
    total: number,
    paymentState: string
}

export interface DBOrder {
    _createdOn: number,
    _id: string,
    _ownerId: string,
    email: string,
    username: string,
    address: Address,
    purchasedItems: CartItem[],
    subtotal: number,
    discount: Discount,
    discountValue: number,
    shippingMethod: Shipping,
    shippingValue: number,
    total: number,
    paymentState: string
}

export interface Address {
    phone: string,
    street_building: string,
    city: string,
    region: string,
    postalCode: string,
    country: string
}

export const addressInitialState = {
    phone: '',
    street_building: '',
    city: '',
    region: '',
    postalCode: '',
    country: ''
}

export const orderInitialState = {
    email: '',
    username: '',
    address: addressInitialState,
    purchasedItems: [],
    subtotal: NaN,
    discount: discountInitialState,
    discountValue: NaN,
    shippingMethod: shippingInitialState,
    shippingValue: NaN,
    total: NaN,
    paymentState: ''
}

export const dbOrderInitialState = {
    _createdOn: NaN,
    _id: '',
    _ownerId: '',
    email: '',
    username: '',
    address: addressInitialState,
    purchasedItems: [],
    subtotal: NaN,
    discount: discountInitialState,
    discountValue: NaN,
    shippingMethod: shippingInitialState,
    shippingValue: NaN,
    total: NaN,
    paymentState: ''
}