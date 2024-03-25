import { IsValidPeriod } from '@common/decorators';
import { PaginationQueryParams } from '@common/pagination';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryParams extends PaginationQueryParams {
    @IsOptional()
    @IsUUID()
    authorId?: string;

    @IsOptional()
    @IsValidPeriod()
    from?: string;

    @IsOptional()
    @IsValidPeriod()
    to?: string;
}
