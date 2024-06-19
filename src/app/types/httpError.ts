export interface HttpError {
    headers?: {
        normalizedNames: {},
        lazyUpdate: null
    },
    status?: number,
    statusText?: string,
    url?: string,
    ok?: boolean,
    name?: string,
    message?: string,
    error?: {
        code: number,
        message: string
    }
}