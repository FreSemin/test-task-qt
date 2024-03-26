import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationQueryParams {
    @ApiProperty({ required: true, minimum: 1 })
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiProperty({ required: true, minimum: 1, maximum: 100 })
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(100)
    take: number = 10;
}
