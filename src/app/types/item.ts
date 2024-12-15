export interface CreateItem {
    image: string,
    altImages: string[],
    cat: string,
    subCat: string,
    description: string,
    size: (string | number)[],
    color: string[],
    brand: string,
    quantity: number,
    price: number
}

export interface Item extends CreateItem {
    _ownerId: string,
    _id: string,
    _createdOn: number,
}

/* eslint-disable */
export interface Belt extends Item { }
export interface Blazer extends Item { }
export interface Jacket extends Item { }
export interface Boot extends Item { }
export interface Bottom extends Item { }
export interface Legging extends Item { }
export interface Cap extends Item { }
export interface Hat extends Item { }
export interface Glove extends Item { }
export interface Gym extends Item { }
export interface Jacket extends Item { }
export interface Longwear extends Item { }
export interface Outdoors extends Item { }
export interface Running extends Item { }
export interface Ski extends Item { }
export interface Snowboard extends Item { }
export interface Slippers extends Item { }
export interface Sunglasses extends Item { }
export interface Sweater extends Item { }
export interface Swim extends Item { }
export interface Surf extends Item { }
export interface Tie extends Item { }
export interface Trainers extends Item { }
export interface Tuxedo extends Item { }
export interface Partywear extends Item { }
export interface Waistcoat extends Item { }
export interface Watch extends Item { }
/* eslint-enable */

export interface ListItem extends Item {
    inCart: boolean
}

export interface CartItem extends Item {

    selectedSize: string | number,
    selectedColor: string,
    selectedQuantity: number,
    product: number,
    checked: boolean
}

export interface TradedItem extends CartItem {
    status: 'pending' | 'confirmed' | 'rejected' | 'shipped' | 'delivered',
    orderId: string,
    stockId: string,
    sellerId: string
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
}

export const initialListItem: ListItem = {
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
    inCart: false
}

export const cartItemInitailState: CartItem = {
    _ownerId: '',
    _id: '',
    _createdOn: NaN,
    image: '',
    altImages: [],
    cat: '',
    subCat: '',
    description: '',
    brand: '',
    size: [],
    selectedSize: '',
    color: [],
    selectedColor: '',
    quantity: NaN,
    selectedQuantity: NaN,
    price: NaN,
    product: NaN,
    checked: false
}

export const TradingItemInitialState: TradedItem = {
    ...cartItemInitailState,
    status: 'pending',
    orderId: '',
    stockId: '',
    sellerId: ''
}