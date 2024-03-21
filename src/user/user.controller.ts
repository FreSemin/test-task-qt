import { Body, Controller, Post, UnprocessableEntityException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailTakenError } from '@common/utils';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        try {
            return await this.userService.create(createUserDto);
        } catch (err) {
            if (err instanceof EmailTakenError) {
                throw new UnprocessableEntityException(err.message);
            }

            throw err;
        }
    }
}
