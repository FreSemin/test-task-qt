import { IsRepeated } from '@common/decorators';
import { IsString, MinLength, IsEmail } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @MinLength(8)
    @IsRepeated('password')
    retypedPassword: string;
}
