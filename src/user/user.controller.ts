import { ClassSerializerInterceptor, Controller, Get, NotFoundException, Param, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { EntityNotFoundError } from '@common/utils';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':emailOrId')
    async findOne(@Param('emailOrId') emailOrId: string) {
        try {
            return await this.userService.findOneByEmailOrId(emailOrId);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            throw err;
        }
    }
}
