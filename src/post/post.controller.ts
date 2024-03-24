import { Controller, Get } from '@nestjs/common';
import { PostService } from './post.service';

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
}
