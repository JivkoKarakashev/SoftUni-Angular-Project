import { CartItem } from "./cartItem"

export interface AccountForRegister {
    sales: CartItem[]
}

export interface DBAccount {
    _createdOn: number,
    _id: string,
    _ownerId: string,
    sales: CartItem[]
}

export interface IdProp {
    _id: string
}