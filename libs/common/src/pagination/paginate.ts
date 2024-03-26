import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { Paginated } from './interfaces';
import { PaginationQueryParams } from './input';

export async function paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    where: FindOptionsWhere<T>,
    paginationQueryParams: PaginationQueryParams,
): Promise<Paginated<T>> {
    const [data, total]: [T[], number] = await repository.findAndCount({
        skip: (paginationQueryParams.page - 1) * paginationQueryParams.take,
        take: paginationQueryParams.take,
        where,
    });

    return {
        page: paginationQueryParams.page,
        data,
        total,
    };
}
