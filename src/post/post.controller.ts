import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { CurrentUser } from '@common/decorators';
import { EntityNotFoundError, EntityOperationError, OnlyAuthorManipulationError } from '@common/utils';
import { QueryParams } from './input';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponse } from '@common/pagination/responses';
import { Post as PostEntity } from './entity/post.entity';

@ApiTags('Post')
@ApiBearerAuth()
@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    @ApiResponse({
        status: HttpStatus.OK,
        schema: {
            allOf: [
                { $ref: getSchemaPath(PaginatedResponse) },
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(PostEntity) },
                        },
                    },
                },
            ],
        },
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Author not found' })
    async findAll(@Query() queryParams: QueryParams, @Req() req: Request) {
        try {
            return await this.postService.findAll(queryParams, req.url);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            throw err;
        }
    }

    @Get(':id')
    @ApiResponse({ status: HttpStatus.OK, type: PostEntity })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
        try {
            return await this.postService.findOne(id, req.url);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            throw err;
        }
    }

    @ApiBody({ type: CreatePostDto })
    @Post()
    @ApiResponse({ status: HttpStatus.CREATED, type: PostEntity })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
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

    @ApiBody({ type: UpdatePostDto })
    @Put(':id')
    @ApiResponse({ status: HttpStatus.OK, type: PostEntity })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST })
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
    @ApiResponse({ status: HttpStatus.OK, type: PostEntity })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST })
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
