export class InvalidValueError {
    readonly _tag = "InvalidValueError"
    readonly message: string

    constructor(message: string) {
        this.message = message
    }
}

export class AddJobError {
    readonly _tag = "AddJobsError";
}

export class UpdateRedisError {
    readonly _tag = "UpdateRedisError"
}

export class DBSelectError {
    readonly _tag = "DBSelectError"
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}

export class DBInsertError {
    readonly _tag = "InsertError"
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}