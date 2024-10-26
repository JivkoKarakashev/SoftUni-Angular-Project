import { Injectable } from '@angular/core';
import { CartItem } from 'src/app/types/cartItem';
import { Item } from 'src/app/types/item';
import { DBOrder, Order } from 'src/app/types/order';

const cartItemSchema = {
    _ownerId: 'string',
    _id: 'string',
    _createdOn: 'number',
    image: 'string',
    altImages: 'array',
    cat: 'string',
    subCat: 'string',
    description: 'string',
    brand: 'string',
    size: 'array',
    selectedSize: 'string' || 'number',
    color: 'array',
    selectedColor: 'string',
    quantity: 'number',
    selectedQuantity: 'number',
    price: 'number',
    buyed: 'boolean',
    product: 'number',
    checked: 'boolean'
};

const DBOrderSchema = {
    _createdOn: 'number',
    _id: 'string',
    _ownerId: 'string',
    email: 'string',
    username: 'string',
    address: 'Address',
    purchasedItems: 'CartItem[]',
    subtotal: 'number',
    discount: 'Discount',
    discountValue: 'number',
    shippingMethod: 'Shipping',
    shippingValue: 'number',
    total: 'number',
    paymentState: 'string',
    status: 'string'
};

@Injectable({
    providedIn: 'root'
})
export class CheckForItemType {

    //  return Object.keys(cartItemSchema).every((prop) => Object.keys(itm).includes(prop));
    //  return Object.keys(cartItemSchema).some((prop) => prop == undefined);

    isItem(itm: Item | CartItem): itm is Item {
        const itmPropsArr = Object.keys(itm);
        const cartItemPropsArr = Object.keys(cartItemSchema);
        if (cartItemPropsArr.some((prop) => !itmPropsArr.includes(prop))) {
            console.log('Item type');
            return true;
        } else {
            console.log('CartItem type');
            return false;
        }
    }
    isCartItem(itm: CartItem | Item): itm is CartItem {
        const itmPropsArr = Object.keys(itm);
        const cartItemPropsArr = Object.keys(cartItemSchema);
        if (cartItemPropsArr.every((prop) => itmPropsArr.includes(prop))) {
            console.log('CartItem type');
            return true;
        } else {
            console.log('CartItem type');
            return false;
        }
    }

    isOrder(itm: Order | DBOrder): itm is Order {
        const itmPropsArr = Object.keys(itm);
        const orderPropsArr = Object.keys(DBOrderSchema);
        if (orderPropsArr.some((prop) => !itmPropsArr.includes(prop))) {
            console.log('Order type');
            return true;
        } else {
            console.log('DBOrder type');
            return false;
        }
    }
    isDBOrder(itm: DBOrder | Order): itm is DBOrder {
        const itmPropsArr = Object.keys(itm);
        const cartItemPropsArr = Object.keys(DBOrderSchema);
        if (cartItemPropsArr.every((prop) => itmPropsArr.includes(prop))) {
            console.log('DBOrder type');
            return true;
        } else {
            console.log('Order type');
            return false;
        }
    }
}