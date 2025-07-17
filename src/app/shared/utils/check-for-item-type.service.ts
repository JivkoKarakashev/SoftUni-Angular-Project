import { Injectable } from '@angular/core';

import { CartItem, Item, TradedItem } from 'src/app/types/item';
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
    product: 'number',
    checked: 'boolean',
};

const tradedItemSchema = {
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
    product: 'number',
    checked: 'boolean',
    status: 'string',
    orderId: 'string',
    stockId: 'string',
    sellerId: 'string'
};

const DBOrderSchema = {
    _createdOn: 'number',
    _id: 'string',
    _ownerId: 'string',
    email: 'string',
    username: 'string',
    address: 'Address',
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
export class CheckForItemTypeService {

    //  return Object.keys(cartItemSchema).every((prop) => Object.keys(itm).includes(prop));
    //  return Object.keys(cartItemSchema).some((prop) => prop == undefined);

    isItem(inputItm: Item | CartItem): inputItm is Item {
        const inputItmPropsArr = Object.keys(inputItm);
        const cartItemPropsArr = Object.keys(cartItemSchema);
        if (cartItemPropsArr.some((prop) => !inputItmPropsArr.includes(prop))) {
            // console.log('Item type');
            return true;
        } else {
            // console.log('WRONG Item type!');
            return false;
        }
    }
    isCartItem(inputItm: CartItem | Item): inputItm is CartItem {
        const inputItmPropsArr = Object.keys(inputItm);
        const cartItemPropsArr = Object.keys(cartItemSchema);
        if (cartItemPropsArr.every((prop) => inputItmPropsArr.includes(prop))) {
            // console.log('CartItem type');
            return true;
        } else {
            // console.log('WRONG CartItem type!');
            return false;
        }
    }
    isTradedItemsArr(inputItmsArr: TradedItem[]): inputItmsArr is TradedItem[] {
        let result = true;
        const tradedItmPropsArr = Object.keys(tradedItemSchema);
        for (const itm of inputItmsArr) {
            const inputItmPropsArr = Object.keys(itm);
            if (tradedItmPropsArr.every((prop) => inputItmPropsArr.includes(prop))) {
                // console.log('TradedItem type');
            } else {
                // console.log('WRONG TradedItem type!');
                result = false;
                break;
            }
        }
        return result;
    }

    isOrder(itm: Order | DBOrder): itm is Order {
        const itmPropsArr = Object.keys(itm);
        const orderPropsArr = Object.keys(DBOrderSchema);
        if (orderPropsArr.some((prop) => !itmPropsArr.includes(prop))) {
            // console.log('Order type');
            return true;
        } else {
            // console.log('WRONG DBOrder type!');
            return false;
        }
    }
    isDBOrder(itm: DBOrder | Order): itm is DBOrder {
        const itmPropsArr = Object.keys(itm);
        const cartItemPropsArr = Object.keys(DBOrderSchema);
        if (cartItemPropsArr.every((prop) => itmPropsArr.includes(prop))) {
            // console.log('DBOrder type');
            return true;
        } else {
            // console.log('WRONG DBOrder type!');
            return false;
        }
    }
}