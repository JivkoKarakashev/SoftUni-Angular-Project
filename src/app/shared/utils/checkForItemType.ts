import { Injectable } from '@angular/core';
import { CartItem } from 'src/app/types/cartItem';
import { Item } from 'src/app/types/item';

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

@Injectable({
    providedIn: 'root'
})
export class CheckForItemType {

    //  return Object.keys(cartItemSchema).every((prop) => Object.keys(itm).includes(prop));
    //  return Object.keys(cartItemSchema).some((prop) => prop == undefined);

    isItem(itm: Item | CartItem): itm is Item {
        // const itmPropsArr = Object.keys(itm);
        const cartItemPropsArr = Object.keys(cartItemSchema);
        if (cartItemPropsArr.some((prop) => prop == undefined)) {
            return true;
        } else {
            return false;
        }
    }
    isCartItem(itm: CartItem | Item): itm is CartItem {
        const itmPropsArr = Object.keys(itm);
        const cartItemPropsArr = Object.keys(cartItemSchema);
        if (cartItemPropsArr.every((prop) => itmPropsArr.includes(prop))) {
            return true
        } else {
            return false;
        }
    }
}