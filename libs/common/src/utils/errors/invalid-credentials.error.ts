import { INVALID_CREDENTIALS_TEXT } from '@common/constants';

export class InvalidCredentialsError extends Error {
    constructor(message: string = INVALID_CREDENTIALS_TEXT) {
        super(message);
    }
}
