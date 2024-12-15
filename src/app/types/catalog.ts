export type CatalogCategory = 'accessories' | 'clothes' | 'shoes' | 'sportswear' | 'suits_tailoring';
export type CatalogSubcategory = 'belts' | 'caps_hats' | 'gloves' | 'sunglasses' | 'watches' | 'jackets' | 'longwear' | 'boots' | 'slippers' | 'trainers' | 'bottoms_leggings' | 'gym' | 'outdoors' | 'running' | 'ski_snowboard' | 'sweaters' | 'blazers_jackets' | 'ties' | 'tuxedos_partywear' | 'waistcoats' | 'workwear';

export const catalogCategories: Array<CatalogCategory> = ['accessories', 'clothes', 'shoes', 'sportswear', 'suits_tailoring'];
export const catalogSubcategories: Array<CatalogSubcategory> = ['belts', 'caps_hats', 'gloves', 'sunglasses', 'watches', 'jackets', 'longwear', 'boots', 'slippers', 'trainers', 'bottoms_leggings', 'gym', 'outdoors', 'running', 'ski_snowboard', 'sweaters', 'blazers_jackets', 'ties', 'tuxedos_partywear', 'waistcoats', 'workwear'];


export interface CatalogCategorySelectOption {
    _id: CatalogCategory | ''
    label: 'CatalogCategory' | 'Accessories' | 'Clothes' | 'Shoes' | 'Sportswear' | 'Suits Tailoring',
    value: CatalogCategory | ''
}
export interface CatalogSubcategorySelectOption {
    _categoryId: CatalogCategory | '',
    label: 'Choose Subcategory' | 'Belts' | 'Caps Hats' | 'Gloves' | 'Sunglasses' | 'Watches' | 'Jackets' | 'Longwear' | 'Boots' | 'Slippers' | 'Trainers' | 'Bottoms Leggings' | 'Gym' | 'Outdoors' | 'Running' | 'Ski Snowboard' | 'Sweaters' | 'Blazers Jackets' | 'Ties' | 'Tuxedos Partywear' | 'Waistcoats' | 'Workwear',
    value: CatalogSubcategory | ''
}


export const accessoriesSelectOptions: CatalogCategorySelectOption = {
    _id: 'accessories',
    label: 'Accessories',
    value: 'accessories'
}
export const clothesSelectOptions: CatalogCategorySelectOption = {
    _id: 'clothes',
    label: 'Clothes',
    value: 'clothes'
}
export const shoesSelectOptions: CatalogCategorySelectOption = {
    _id: 'shoes',
    label: 'Shoes',
    value: 'shoes'
}
export const sportswearSelectOptions: CatalogCategorySelectOption = {
    _id: 'sportswear',
    label: 'Sportswear',
    value: 'sportswear'
}
export const suits_tailoringSelectOptions: CatalogCategorySelectOption = {
    _id: 'suits_tailoring',
    label: 'Suits Tailoring',
    value: 'suits_tailoring'
}

export const catalogCategorySelectOptions: CatalogCategorySelectOption[] = [{ ...accessoriesSelectOptions }, { ...clothesSelectOptions }, { ...shoesSelectOptions }, { ...sportswearSelectOptions }, { ...suits_tailoringSelectOptions }];


export const beltsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'accessories',
    label: 'Belts',
    value: 'belts'
}
export const caps_hatsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'accessories',
    label: 'Caps Hats',
    value: 'caps_hats'
}
export const glovesSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'accessories',
    label: 'Gloves',
    value: 'gloves'
}
export const sunglassesSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'accessories',
    label: 'Sunglasses',
    value: 'sunglasses'
}
export const watchesSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'accessories',
    label: 'Watches',
    value: 'watches'
}
export const jacketsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'clothes',
    label: 'Jackets',
    value: 'jackets'
}
export const longwearSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'clothes',
    label: 'Longwear',
    value: 'longwear'
}
export const bootsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'shoes',
    label: 'Boots',
    value: 'boots'
}
export const slippersSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'shoes',
    label: 'Slippers',
    value: 'slippers'
}
export const trainersSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'shoes',
    label: 'Trainers',
    value: 'trainers'
}
export const bottoms_leggingsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'sportswear',
    label: 'Bottoms Leggings',
    value: 'bottoms_leggings'
}
export const gymSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'sportswear',
    label: 'Gym',
    value: 'gym'
}
export const outdoorsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'sportswear',
    label: 'Outdoors',
    value: 'outdoors'
}
export const runningSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'sportswear',
    label: 'Running',
    value: 'running'
}
export const ski_snowboardSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'sportswear',
    label: 'Ski Snowboard',
    value: 'ski_snowboard'
}
export const sweatersSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'sportswear',
    label: 'Sweaters',
    value: 'sweaters'
}
export const blazers_jacketsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'suits_tailoring',
    label: 'Blazers Jackets',
    value: 'blazers_jackets'
}
export const tiesSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'suits_tailoring',
    label: 'Ties',
    value: 'ties'
}
export const tuxedos_partywearSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'suits_tailoring',
    label: 'Tuxedos Partywear',
    value: 'tuxedos_partywear'
}
export const waistcoatsSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'suits_tailoring',
    label: 'Waistcoats',
    value: 'waistcoats'
}
export const workwearSelectOptions: CatalogSubcategorySelectOption = {
    _categoryId: 'suits_tailoring',
    label: 'Workwear',
    value: 'workwear'
}

export const catalogSubcategorySelectOptions: CatalogSubcategorySelectOption[] = [{ ...beltsSelectOptions }, { ...caps_hatsSelectOptions }, { ...glovesSelectOptions }, { ...sunglassesSelectOptions }, { ...watchesSelectOptions }, { ...jacketsSelectOptions }, { ...longwearSelectOptions }, { ...bootsSelectOptions }, { ...slippersSelectOptions }, { ...trainersSelectOptions }, { ...bottoms_leggingsSelectOptions }, { ...gymSelectOptions }, { ...outdoorsSelectOptions }, { ...runningSelectOptions }, { ...ski_snowboardSelectOptions }, { ...sweatersSelectOptions }, { ...blazers_jacketsSelectOptions }, { ...tiesSelectOptions }, { ...tuxedos_partywearSelectOptions }, { ...waistcoatsSelectOptions }, { ...workwearSelectOptions }];