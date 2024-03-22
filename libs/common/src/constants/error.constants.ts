import { EntitiesTypes } from '.';

export const ENTITY_NOT_FOUND_TEXT = 'Entity not found!';

export const ENTITY_BY_VALUE_NOT_FOUND_TEXT = (entityType: EntitiesTypes, value: string | number) =>
    `${entityType} with ${value} not found!`;

export const EMAIL_TAKEN_TEXT = (email: string) => `Email ${email} already taken!`;

export const INVALID_CREDENTIALS_TEXT = 'Wrong password or email!';
