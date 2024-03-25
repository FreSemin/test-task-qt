export interface Paginated<T> {
    page: number;
    data: T[];
    total: number;
}
