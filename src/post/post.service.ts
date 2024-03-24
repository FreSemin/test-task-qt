import { Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto, UpdatePostDto } from './dto';
import { UserService } from '@user/user.service';
import { EntitiesTypes } from '@common/constants';
import { OnlyAuthorManipulationError, UpdatePostError } from '@common/utils';

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

    async findOne(id: string): Promise<PostEntity> {
        const post = await this.postRepository.findOneBy({ id });

        if (!post) {
            throw new EntityNotFoundError(EntitiesTypes.POST, id);
        }

        return post;
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

    async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<PostEntity> {
        const post = await this.postRepository.findOneBy({ id });

        if (!post) {
            throw new EntityNotFoundError(EntitiesTypes.POST, id);
        }

        const user = await this.userService.findOneById(userId);

        if (!user) {
            throw new EntityNotFoundError(EntitiesTypes.USER, userId);
        }

        if (userId !== post.authorId) {
            throw new OnlyAuthorManipulationError();
        }

        const newPost = await this.postRepository.create({
            ...post,
            ...updatePostDto,
        });

        const updateResult = await this.postRepository.update({ id }, newPost);

        if (updateResult.affected && updateResult.affected > 0) {
            return newPost;
        } else {
            throw new UpdatePostError();
        }
    }
}
