

export type APISuccess<T> = {
    success: true
    value: T
}


export type APIError<T> = {
    success: false
    error: string
}


export type APIResult<T> = APISuccess<T> | APIError<T>