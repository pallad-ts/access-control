export class AccessDeniedError extends Error {
    constructor(message: string = 'Access denied') {
        super(message);
        this.message = message;
        this.name = 'AccessDeniedError';
    }
}