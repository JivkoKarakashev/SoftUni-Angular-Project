export interface UserForAuth {
    _id: string,
    accessToken: string,
    email: string,
    username: string,
    address: {
        phone: string,
        street_building: string,
        city: string,
        region: string,
        postalCode: string,
        country: string
    }
}

export interface UserWithAccountId {
    _id: string,
    accessToken: string,
    email: string,
    username: string,
    address: {
        phone: string,
        street_building: string,
        city: string,
        region: string,
        postalCode: string,
        country: string
    },
    _accountId: string
}

export const initialUserWithAccountId = {
    _id: '',
    accessToken: '',
    email: '',
    username: '',
    address: {
        phone: '',
        street_building: '',
        city: '',
        region: '',
        postalCode: '',
        country: ''
    },
    _accountId: ''
}

export interface UserForLogin {
    email: string
    password: string,
}

export interface UserForRegister {
    email: string
    username: string,
    address: {
        phone: string,
        street_building: string,
        city: string,
        region: string,
        postalCode: string,
        country: string
    },
    password: string,
}

export interface LoggedInOrLoggedOut {
    isLoggedIn: boolean,
    isLoggedOut: boolean
}

export const loggedInOrLoggedOutInitState = {
    isLoggedIn: false,
    isLoggedOut: true
}