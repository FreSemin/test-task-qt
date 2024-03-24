export class EmailTakenError extends Error {
    constructor(email: string) {
        super(`Email ${email} already taken!`);
    }
}
