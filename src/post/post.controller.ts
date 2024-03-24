import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto';
import { CurrentUser } from '@common/decorators';
import { EntityNotFoundError } from 'typeorm';

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
}
