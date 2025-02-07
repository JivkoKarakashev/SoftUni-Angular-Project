export class CustomError extends Error {
    isUserError = false;

    constructor(
        name: string,
        message: string,
        isUserError: boolean
    ) {
        super();
        this.name = name;
        this.message = message;
        this.isUserError = isUserError;
        
        Object.setPrototypeOf(this, new.target.prototype);
    }
}