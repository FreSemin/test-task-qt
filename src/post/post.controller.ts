import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { CurrentUser } from '@common/decorators';
import { EntityNotFoundError, EntityOperationError, OnlyAuthorManipulationError } from '@common/utils';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    async findAll() {
        try {
            return await this.postService.findAll();
        } catch (err) {
            throw err;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.postService.findOne(id);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            throw err;
        }
    }

    @Post()
    async create(@Body() createPostDto: CreatePostDto, @CurrentUser('sub') userId: string) {
        try {
            return await this.postService.create(createPostDto, userId);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            throw err;
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @CurrentUser('sub') userId: string) {
        try {
            return await this.postService.update(id, updatePostDto, userId);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            if (err instanceof OnlyAuthorManipulationError) {
                throw new ForbiddenException(err.message);
            }

            if (err instanceof EntityOperationError) {
                throw new BadRequestException(err.message);
            }

            throw err;
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @CurrentUser('sub') userId: string) {
        try {
            return await this.postService.delete(id, userId);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            if (err instanceof OnlyAuthorManipulationError) {
                throw new ForbiddenException(err.message);
            }

            if (err instanceof EntityOperationError) {
                throw new BadRequestException(err.message);
            }

            throw err;
        }
    }
}
