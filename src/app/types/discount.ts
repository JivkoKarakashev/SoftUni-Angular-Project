export interface Discount {
    code: string,
    rate: number
}

export const discountInitialState = {
    code: 'discount code',
    rate: 0
}