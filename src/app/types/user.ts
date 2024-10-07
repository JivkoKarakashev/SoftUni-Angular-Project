export interface UserForAuth {
    _id: string,
    accessToken: string,
    email: string,
    username: string,
}

export interface UserForLogin {
    email: string
    password: string,
}

export interface UserForRegister {
    email: string
    username: string,
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