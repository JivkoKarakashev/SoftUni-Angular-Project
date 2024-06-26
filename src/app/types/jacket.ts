export interface Jacket {
    _ownerId: string,
    _id: string,
    image: string
    description: string,
    size: string [],
    color: string[],
    brand: string,
    quantity: number,
    price: number,
    buyed?: boolean
}