import { EntitiesTypes, OperationTypes } from '@common/constants';

export class EntityOperationError extends Error {
    constructor(entity: EntitiesTypes, operation: OperationTypes) {
        super(`Something went wrong while ${operation} ${entity}!`);
    }
}
