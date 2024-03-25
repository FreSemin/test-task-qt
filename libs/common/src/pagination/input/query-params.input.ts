import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationQueryParams {
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page: number = 1;

    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(100)
    take: number = 10;
}
