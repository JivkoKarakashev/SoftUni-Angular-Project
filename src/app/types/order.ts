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
    paymentState: 'unpaid',
    status: 'pending'
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
    paymentState: 'unpaid' | 'paid',
    referenceNumber?: string,
    sequenceNumber?: number,
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
}

export interface Address {
    phone: string,
    street_building: string,
    city: string,
    region: string,
    postalCode: string,
    country: string
}

export const addressInitialState: Address = {
    phone: '',
    street_building: '',
    city: '',
    region: '',
    postalCode: '',
    country: ''
}

export const orderInitialState: Order = {
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
    paymentState: 'unpaid',
    status: 'pending'
}

export const dbOrderInitialState: DBOrder = {
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
    paymentState: 'unpaid',
    status: 'pending'
}