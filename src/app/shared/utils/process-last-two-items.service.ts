import { Injectable } from '@angular/core';

import { Item } from 'src/app/types/item';

export interface lastTwoSlideImgs {
  _id: string
  cat: string,
  capitalizedCat: string,
  image: string,
  subCat: string,
}

@Injectable({
  providedIn: 'root'
})
export class ProcessLastTwoItemsService {

  process(lastTwoitmsObjArray: Array<Item[]>): Array<lastTwoSlideImgs[]> {
    const lastTwoSlideImgsArr: Array<lastTwoSlideImgs[]> = [];
    // console.log(lastTwoitmsObjArray);
    const length = lastTwoitmsObjArray.length;
    let catIdxCounter = 0;
    // console.log(length);
    for (let i = 0; i < length; i++) {
      const currLastTwoCollection = Object.entries(lastTwoitmsObjArray[i]).map(lastTwoItms => lastTwoItms[1]);
      if (i === 0) {
        currLastTwoCollection.forEach(itm => {
          const { _id, cat, image, subCat } = itm;
          const capitalizedCat = this.capitalizeCategory(cat);
          if (!lastTwoSlideImgsArr[catIdxCounter]) {
            lastTwoSlideImgsArr[catIdxCounter] = [];
          }
          lastTwoSlideImgsArr[catIdxCounter] = [...lastTwoSlideImgsArr[catIdxCounter], { _id, cat, capitalizedCat, image, subCat }];
        });
      } else {
        currLastTwoCollection.forEach(itm => {
          const { _id, cat, image, subCat } = itm;
          const capitalizedCat = this.capitalizeCategory(cat);
          const subArrLastIdx = lastTwoSlideImgsArr[catIdxCounter].length - 1;
          lastTwoSlideImgsArr[catIdxCounter][subArrLastIdx].cat !== cat ? catIdxCounter++ : null;
          if (!lastTwoSlideImgsArr[catIdxCounter]) {
            lastTwoSlideImgsArr[catIdxCounter] = [];
          }
          lastTwoSlideImgsArr[catIdxCounter] = [...lastTwoSlideImgsArr[catIdxCounter], { _id, cat, capitalizedCat, image, subCat }];
        });
      }
    }
    // console.log(lastTwoSlideImgsArr);
    return lastTwoSlideImgsArr;
  }

  capitalizeCategory(category: string): string {
    const arr = category.split('_');
    let capitalizedCat = '';
    arr.forEach((wrd) => {
      wrd = wrd.charAt(0).toLocaleUpperCase().concat(wrd.slice(1));
      capitalizedCat += (`${wrd} `);
      capitalizedCat.concat(`${wrd} `);
    });
    // console.log(capitalizedCat);
    return capitalizedCat;
  }
}
