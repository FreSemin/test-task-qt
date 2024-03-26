import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { EntityNotFoundError } from '@common/utils';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('User')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':emailOrId')
    @ApiResponse({ status: HttpStatus.OK, type: User })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
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
