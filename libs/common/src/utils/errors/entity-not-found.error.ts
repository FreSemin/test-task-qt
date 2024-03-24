import { EntitiesTypes } from '@common/constants';

export class EntityNotFoundError extends Error {
    constructor(entityType: EntitiesTypes, value: string) {
        super(`${entityType} with ${value} not found!`);
    }
}
