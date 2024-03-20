export interface Item {
    _ownerId: string,
    _id: string,
    image: string
    description: string,
    color: string[],
    quantity: number,
    price: number,
    buyed?: boolean
}