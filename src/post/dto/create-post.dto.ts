import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
    @ApiProperty({ minLength: 3 })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @ApiProperty({ minLength: 3 })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    description: string;
}
