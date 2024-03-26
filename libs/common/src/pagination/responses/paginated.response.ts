import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Paginated } from '../interfaces';

@ApiExtraModels()
export class PaginatedResponse<T> implements Paginated<T> {
    @ApiProperty()
    page: number;

    data: T[];

    @ApiProperty()
    total: number;
}
