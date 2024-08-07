export interface Outdoors {
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
    buyed?: boolean
}