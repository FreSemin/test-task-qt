import { IsValidPeriod } from '@common/decorators';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryParams {
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
