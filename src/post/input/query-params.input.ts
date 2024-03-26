import { IsValidPeriod } from '@common/decorators';
import { PaginationQueryParams } from '@common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryParams extends PaginationQueryParams {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    authorId?: string;

    @ApiProperty({ required: false, description: 'date format YYYY-MM-DDTHH:mm' })
    @IsOptional()
    @IsValidPeriod()
    from?: string;

    @ApiProperty({ required: false, description: 'date format YYYY-MM-DDTHH:mm' })
    @IsOptional()
    @IsValidPeriod()
    to?: string;
}
