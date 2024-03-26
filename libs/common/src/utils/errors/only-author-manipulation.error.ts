export class OnlyAuthorManipulationError extends Error {
    constructor() {
        super('Only author can manipulate with post!');
    }
}
