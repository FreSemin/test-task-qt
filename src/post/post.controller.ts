import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { CurrentUser } from '@common/decorators';
import { EntityNotFoundError, EntityOperationError, OnlyAuthorManipulationError } from '@common/utils';
import { QueryParams } from './input';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    async findAll(@Query() queryParams: QueryParams) {
        try {
            return await this.postService.findAll(queryParams);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            throw err;
        }
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
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
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updatePostDto: UpdatePostDto,
        @CurrentUser('sub') userId: string,
    ) {
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
    async delete(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser('sub') userId: string) {
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
