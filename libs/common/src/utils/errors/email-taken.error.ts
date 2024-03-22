export class EmailTakenError extends Error {
    constructor(message: string) {
        super(message);
    }
}
