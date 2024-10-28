export interface Item {
    _ownerId: string,
    _id: string,
    _createdOn: number,
    image: string,
    altImages: string[],
    cat: string,
    subCat: string,
    description: string,
    size: (string | number)[],
    color: string[],
    brand: string,
    quantity: number,
    price: number,
    buyed: boolean
}

export const initialItem: Item = {
    _ownerId: '',
    _id: '',
    _createdOn: NaN,
    image: '',
    altImages: [''],
    cat: '',
    subCat: '',
    description: '',
    size: [''],
    color: [''],
    brand: '',
    quantity: NaN,
    price: NaN,
    buyed: false
}