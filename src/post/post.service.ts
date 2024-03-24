import { Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto';
import { UserService } from '@user/user.service';
import { EntitiesTypes } from '@common/constants';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(PostEntity)
        private readonly postRepository: Repository<PostEntity>,
        private readonly userService: UserService,
    ) {}

    async findAll(): Promise<PostEntity[]> {
        return await this.postRepository.find();
    }

    async create(createPostDto: CreatePostDto, userId: string): Promise<PostEntity> {
        const user = await this.userService.findOneById(userId);

        if (!user) {
            throw new EntityNotFoundError(EntitiesTypes.USER, userId);
        }

        const post = await this.postRepository.create({
            ...createPostDto,
            authorId: userId,
        });

        return await this.postRepository.save(post);
    }
}
