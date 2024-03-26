import { IsRepeated } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ required: true, minLength: 3 })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({ required: true })
    @IsEmail()
    email: string;

    @ApiProperty({ required: true, minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ required: true, minLength: 8 })
    @IsString()
    @MinLength(8)
    @IsRepeated('password')
    retypedPassword: string;
}
