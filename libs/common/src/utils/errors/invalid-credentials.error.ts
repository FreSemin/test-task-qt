export class InvalidCredentialsError extends Error {
    constructor() {
        super('Wrong password or email!');
    }
}
