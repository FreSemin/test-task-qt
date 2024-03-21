export class EmailTakenError extends Error {
    constructor(message: string = 'Email already taken!') {
        super(message);
    }
}
