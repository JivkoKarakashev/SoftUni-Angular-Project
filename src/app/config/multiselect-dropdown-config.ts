import { IDropdownSettings } from "ng-multiselect-dropdown";

export interface DropdownList {
    _id:  number | string,
    _name: number | string
}

export const dropdownList: DropdownList[] = [
    { _id: 4, _name: 4 },
    { _id: 6, _name: 6 },
    { _id: 8, _name: 8 },
    { _id: 10, _name: 10 },
    { _id: 12, _name: 12 },
    { _id: 14, _name: 14 },
    { _id: 16, _name: 16 },
    { _id: 34, _name: 34 },
    { _id: 36, _name: 36 },
    { _id: 38, _name: 38 },
    { _id: 40, _name: 40 },
    { _id: 42, _name: 42 },
    { _id: 44, _name: 44 },
    { _id: 46, _name: 46 },
    { _id: 48, _name: 48 },
    { _id: 50, _name: 50 },
    { _id: 52, _name: 52 },
    { _id: 54, _name: 54 },
    { _id: 'XS', _name: 'XS' },
    { _id: 'S', _name: 'S' },
    { _id: 'M', _name: 'M' },
    { _id: 'L', _name: 'L' },
    { _id: 'XL', _name: 'XL' },
    { _id: 'XXL', _name: 'XXL' }
]

export const dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: '_id',
    textField: '_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
};