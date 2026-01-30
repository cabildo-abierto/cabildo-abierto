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