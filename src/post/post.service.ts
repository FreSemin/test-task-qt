import { Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto, UpdatePostDto } from './dto';
import { UserService } from '@user/user.service';
import { EntitiesTypes, OperationTypes } from '@common/constants';
import { EntityNotFoundError, EntityOperationError, OnlyAuthorManipulationError } from '@common/utils';
import { QueryParams } from './input';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(PostEntity)
        private readonly postRepository: Repository<PostEntity>,
        private readonly userService: UserService,
    ) {}

    private async isUserAuthorOfPost(userId: string, postAuthor: string): Promise<boolean> {
        const user = await this.userService.findOneById(userId);

        if (!user) {
            throw new EntityNotFoundError(EntitiesTypes.USER, userId);
        }

        return userId === postAuthor;
    }

    private async getPostWhereParams(queryParams: QueryParams): Promise<FindOptionsWhere<PostEntity>> {
        const whereParams: FindOptionsWhere<PostEntity> = {};

        if (queryParams.authorId) {
            const author = await this.userService.findOneById(queryParams.authorId);

            if (!author) {
                throw new EntityNotFoundError(EntitiesTypes.USER, queryParams.authorId);
            }

            whereParams.authorId = queryParams.authorId;
        }

        return whereParams;
    }

    async findAll(queryParams: QueryParams): Promise<PostEntity[]> {
        const whereParams = await this.getPostWhereParams(queryParams);

        return await this.postRepository.find({ where: { ...whereParams } });
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
        const post = await this.findOne(id);

        if (!(await this.isUserAuthorOfPost(userId, post.authorId))) {
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
            throw new EntityOperationError(EntitiesTypes.POST, OperationTypes.PUT);
        }
    }

    async delete(id: string, userId: string): Promise<PostEntity> {
        const post = await this.findOne(id);

        if (!(await this.isUserAuthorOfPost(userId, post.authorId))) {
            throw new OnlyAuthorManipulationError();
        }

        const deleteResult = await this.postRepository.delete({ id });

        if (deleteResult.affected && deleteResult.affected > 0) {
            return post;
        } else {
            throw new EntityOperationError(EntitiesTypes.POST, OperationTypes.DELETE);
        }
    }
}
