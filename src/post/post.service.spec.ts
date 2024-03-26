import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserService } from '@user/user.service';
import { RedisService } from '@redis/redis.service';
import { CreatePostDto } from './dto';
import { User } from '@user/entities/user.entity';
import { Post } from './entity/post.entity';
import { EntityNotFoundError, OnlyAuthorManipulationError } from '@common/utils';
import { config } from 'dotenv';
import { Paginated } from '@common/pagination/interfaces';

config();

const authorMock: User = {
    id: 'f2e1593c-bf97-4421-bd07-375440610dd2',
    name: 'user1',
    email: 'email1@gmail.com',
    password: '12345678',
    posts: [],
};

const createPostDto: CreatePostDto = {
    name: 'post name',
    description: 'post description',
};

const postMock: Post = {
    id: '42ca922b-a6cb-476c-9152-ac901622949f',
    name: 'post name',
    description: 'post description',
    createdAt: new Date('2024-03-25T15:26:20.209Z'),
    authorId: authorMock.id,
    author: {
        ...authorMock,
    },
};

const postPaginatedMock: Paginated<Post> = {
    page: 1,
    data: [postMock],
    total: 1,
};

const apiPostPath = `${process.env.APP_PREFIX}/post`;

describe('PostService', () => {
    let service: PostService;
    let postRepository: Repository<Post>;

    const mockPostRepository = {
        findOneBy: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findAndCount: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockUserService = {
        findOneById: jest.fn(),
    };

    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
        getKeys: jest.fn(),
        mDel: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: getRepositoryToken(Post),
                    useValue: mockPostRepository,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
            ],
        }).compile();

        service = module.get<PostService>(PostService);
        postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should get all posts successfully', async () => {
            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(postRepository, 'findAndCount').mockResolvedValueOnce([
                postPaginatedMock.data,
                postPaginatedMock.total,
            ]);

            const spyRedisSet: jest.SpyInstance = jest.spyOn(mockRedisService, 'set');

            expect(
                await service.findAll(
                    { page: postPaginatedMock.page, take: postPaginatedMock.data.length },
                    apiPostPath,
                ),
            ).toEqual(postPaginatedMock);
            expect(spyRedisSet).toHaveBeenCalledWith(apiPostPath, postPaginatedMock);
        });

        it('should get all posts from cache', async () => {
            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(postRepository, 'findAndCount').mockResolvedValueOnce([
                postPaginatedMock.data,
                postPaginatedMock.total,
            ]);

            const spyRedisSet: jest.SpyInstance = jest.spyOn(mockRedisService, 'set');

            expect(
                await service.findAll(
                    { page: postPaginatedMock.page, take: postPaginatedMock.data.length },
                    apiPostPath,
                ),
            ).toEqual(postPaginatedMock);
            expect(spyRedisSet).toHaveBeenNthCalledWith(1, apiPostPath, postPaginatedMock);

            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(postPaginatedMock);
            expect(
                await service.findAll(
                    { page: postPaginatedMock.page, take: postPaginatedMock.data.length },
                    apiPostPath,
                ),
            ).toEqual(postPaginatedMock);
            expect(spyRedisSet).toHaveBeenNthCalledWith(1, apiPostPath, postPaginatedMock);
        });

        it('should throw error if author not exist', async () => {
            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(null);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(null);

            const authorId = 'not-existing-author';

            await expect(
                service.findAll({ page: 1, take: 1, authorId }, `${apiPostPath}/${postMock.id}?authorId=${authorId}`),
            ).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('findOne', () => {
        it('should get one post successfully', async () => {
            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            const spyRedisSet: jest.SpyInstance = jest.spyOn(mockRedisService, 'set');

            expect(await service.findOne(postMock.id, `${apiPostPath}/${postMock.id}`)).toEqual(postMock);
            expect(spyRedisSet).toHaveBeenCalledWith(`${apiPostPath}/${postMock.id}`, postMock);
        });

        it('should get one post from cache', async () => {
            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            const spyRedisSet: jest.SpyInstance = jest.spyOn(mockRedisService, 'set');

            expect(await service.findOne(postMock.id, `${apiPostPath}/${postMock.id}`)).toEqual(postMock);
            expect(spyRedisSet).toHaveBeenNthCalledWith(1, `${apiPostPath}/${postMock.id}`, postMock);

            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(postMock);

            expect(await service.findOne(postMock.id, `${apiPostPath}/${postMock.id}`)).toEqual(postMock);
            expect(spyRedisSet).toHaveBeenNthCalledWith(1, `${apiPostPath}/${postMock.id}`, postMock);
        });

        it('should throw error if post not exist', async () => {
            jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(null);

            const spyRedisSet: jest.SpyInstance = jest.spyOn(mockRedisService, 'set');

            await expect(service.findOne(postMock.id, `${apiPostPath}/${postMock.id}`)).rejects.toThrow(
                EntityNotFoundError,
            );
            expect(spyRedisSet).not.toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should create new post successfully', async () => {
            jest.spyOn(postRepository, 'create').mockImplementationOnce(jest.fn());

            jest.spyOn(postRepository, 'save').mockResolvedValueOnce(postMock);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(authorMock);

            const result = await service.create(createPostDto, authorMock.id);

            expect(result).toEqual(postMock);
            expect(result.authorId).toEqual(authorMock.id);
        });

        it('should throw error if author is not exist', async () => {
            const createPostDto: CreatePostDto = {
                name: 'post name',
                description: 'post description',
            };

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(null);

            await expect(service.create(createPostDto, authorMock.id)).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('update', () => {
        it('should successfully update post', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(authorMock);

            const updatedPostDto = {
                ...postMock,
                name: 'updated post',
            };

            const updateResult: UpdateResult = {
                raw: '',
                affected: 1,
                generatedMaps: [],
            };

            const spyRedisMDel: jest.SpyInstance = jest.spyOn(mockRedisService, 'mDel');

            jest.spyOn(postRepository, 'create').mockImplementationOnce(jest.fn(() => updatedPostDto));

            jest.spyOn(postRepository, 'update').mockResolvedValueOnce(updateResult);

            expect(await service.update(postMock.id, updatedPostDto, postMock.authorId)).toEqual(updatedPostDto);
            expect(spyRedisMDel).toHaveBeenCalled();
        });

        it('should throw error if user is not author of post', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(authorMock);

            const updatedPostDto = {
                ...postMock,
                name: 'updated post',
            };

            await expect(service.update(postMock.id, updatedPostDto, 'not-author-id')).rejects.toThrow(
                OnlyAuthorManipulationError,
            );
        });

        it('should throw error if user is not exist', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(null);

            const updatedPostDto = {
                ...postMock,
                name: 'updated post',
            };

            await expect(service.update(postMock.id, updatedPostDto, postMock.authorId)).rejects.toThrow(
                EntityNotFoundError,
            );
        });
    });

    describe('delete', () => {
        it('should successfully delete post', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(authorMock);

            const deleteResult: DeleteResult = {
                raw: '',
                affected: 1,
            };

            const spyRedisMDel: jest.SpyInstance = jest.spyOn(mockRedisService, 'mDel');

            jest.spyOn(postRepository, 'delete').mockResolvedValueOnce(deleteResult);

            expect(await service.delete(postMock.id, authorMock.id)).toEqual(postMock);
            expect(spyRedisMDel).toHaveBeenCalled();
        });

        it('should throw error if user is not author of post', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(authorMock);

            await expect(service.delete(postMock.id, 'not-author-id')).rejects.toThrow(OnlyAuthorManipulationError);
        });

        it('should throw error if user is not exist', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            jest.spyOn(mockUserService, 'findOneById').mockResolvedValueOnce(null);

            await expect(service.delete(postMock.id, 'not-author-id')).rejects.toThrow(EntityNotFoundError);
        });
    });
});
