export interface Watch {
    _ownerId: string,
    _id: string,
    image: string
    description: string,
    size: (string | number)[],
    color: string[],
    brand: string,
    quantity: number,
    price: number,
    buyed?: boolean
}