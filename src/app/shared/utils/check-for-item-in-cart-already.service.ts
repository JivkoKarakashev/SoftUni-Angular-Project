import { Injectable } from "@angular/core";

import { CartItem, Item, ListItem } from "src/app/types/item";

@Injectable({
    providedIn: 'root'
})
export class CheckForItemInCartAlreadyService {

    check(itmsObjArray: Array<Item[]>, cartItmsArray: CartItem[]): ListItem[] {
        let listItmesArray: ListItem[] = [];
        // console.log(itmsObjArray);
        // console.log(cartItmsArray);
        const length = itmsObjArray.length;
        // console.log(length);
        for (let i = 0; i < length; i++) {
            const currCollection = itmsObjArray[i];
            // console.log(currCollection);
            let currListItemsCollection: ListItem[] = [];
            // console.log(currCollection);
            currCollection.forEach((itm, idx) => {
                currListItemsCollection[idx] = { ...currCollection[idx], inCart: false };
                if (cartItmsArray.some(cartItm => cartItm._id === itm._id)) {
                    currListItemsCollection[idx] = { ...currCollection[idx], inCart: true };
                    // console.log(currCollection[idx]);
                }
            });
            listItmesArray = [...listItmesArray, ...currListItemsCollection];
        }
        return listItmesArray;
    }
}