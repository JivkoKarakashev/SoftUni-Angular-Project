export interface UserForAuth {
    _id: string,
    accessToken: string,
    email: string,
    username: string,
}

export interface UserForLogin {
    email: string
    pass: string,
}

export interface UserForRegister {
    email: string
    username: string,
    pass: string,
}