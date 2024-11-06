import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CapitalizeCategoryService {

  capitalize(category: string): string {
    const arr = category.split('_');
    let capitalizedCat = '';
    arr.forEach((wrd) => {
      wrd = wrd.charAt(0).toLocaleUpperCase().concat(wrd.slice(1));
      capitalizedCat += (`${wrd} `);
    });
    // console.log(capitalizedCat);
    return capitalizedCat;
  }
}
