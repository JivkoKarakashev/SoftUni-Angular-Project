export interface Item {
    _ownerId: string,
    _id: string,
    image: string
    description: string,
    size: (string | number)[],
    color: string[],
    quantity: number,
    price: number,
    buyed?: boolean
}