import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '@user/user.service';
import { RedisService } from '@redis/redis.service';
import { CreatePostDto } from './dto';
import { User } from '@user/entities/user.entity';
import { Post } from './entity/post.entity';
import { EntityNotFoundError } from '@common/utils';

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

describe('PostService', () => {
    let service: PostService;
    let postRepository: Repository<Post>;

    const mockPostRepository = {
        findOneBy: jest.fn((x) => x),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockUserService = {
        findOneById: jest.fn((x) => x),
    };

    const mockRedisService = {};

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

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should get one post successfully', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(postMock);

            expect(await service.findOne(postMock.id)).toEqual(postMock);
        });

        it('should throw error if post not exist', async () => {
            jest.spyOn(postRepository, 'findOneBy').mockResolvedValueOnce(null);

            await expect(service.findOne(postMock.id)).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('create', () => {
        it('should create new post successfully', async () => {
            jest.spyOn(postRepository, 'save').mockResolvedValueOnce(postMock);

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
});
