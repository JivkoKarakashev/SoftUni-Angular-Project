import { Injectable } from '@angular/core';

import { DropdownList } from 'src/app/config/multiselect-dropdown-config';

@Injectable({
  providedIn: 'root'
})
export class CheckForSizeTypeService {

  isDropdownListSize(size: Array<DropdownList> | Array<string | number>): size is Array<DropdownList> {
    if (typeof size.at(0) !== 'string' && typeof size.at(0) !== 'number') {
        console.log('Size is Array of DropdownList Type');
        return true;
    } else {
        console.log('Size is Array of String|Number Type!');
        return false;
    }
}
}
