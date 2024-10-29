import { Injectable } from "@angular/core";

import { CartItem } from "src/app/types/cartItem";
import { Item } from "src/app/types/item";

@Injectable({
    providedIn: 'root'
})
export class CheckForItemInCartAlreadyService {

    check(itmsObjArray: Array<Item[]>, cartItmsArray: CartItem[]): Item[] {
        let listItmesArray: Item[] = [];
        // console.log(itmsObjArray);
        // console.log(cartItmsArray);
        const length = itmsObjArray.length;
        // console.log(length);
        for (let i = 0; i < length; i++) {
            const currCollection = itmsObjArray[i];
            // console.log(currCollection);
            currCollection.forEach((itm, idx) => {
                if (cartItmsArray.some(cartItm => cartItm._id === itm._id)) {
                    currCollection[idx] = { ...currCollection[idx], buyed: true };
                    // console.log(currCollection[idx]);
                }
            });
            listItmesArray = [...listItmesArray, ...currCollection];
        }
        return listItmesArray;
    }
}