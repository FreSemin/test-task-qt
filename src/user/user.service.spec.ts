import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTakenError, EntityNotFoundError } from '@common/utils';
import { RegisterDto } from '@auth/dto';

const userMock: User = {
    id: 'f2e1593c-bf97-4421-bd07-375440610dd2',
    name: 'user1',
    email: 'email1@gmail.com',
    password: '12345678',
    posts: [],
};

describe('UserService', () => {
    let service: UserService;
    let userRepository: Repository<User>;

    const mockUserRepository = {
        create: jest.fn(),
        findOneBy: jest.fn(),
        save: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create user successfully', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

            const registerDto: RegisterDto = {
                email: 'email123@gmail.com',
                name: 'user1',
                password: '12345678',
                retypedPassword: '12345678',
            };

            const createdUser: User = {
                id: 'f2e1593c-bf97-4421-bd07-375440610dd2',
                email: registerDto.email,
                name: registerDto.name,
                password: registerDto.password,
                posts: [],
            };

            jest.spyOn(userRepository, 'save').mockResolvedValueOnce(createdUser);

            expect(await service.create(registerDto)).toEqual(createdUser);
        });

        it('should throw error if email already taken', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(userMock);

            const registerDto: RegisterDto = {
                email: userMock.email,
                name: 'user1',
                password: '12345678',
                retypedPassword: '12345678',
            };

            await expect(service.create(registerDto)).rejects.toThrow(EmailTakenError);
        });
    });

    describe('findOneById', () => {
        it('should get one user by id successfully', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(userMock);

            expect(await service.findOneById(userMock.id)).toEqual(userMock);
        });

        it('should get null if user not found by id', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

            expect(await service.findOneById(userMock.id)).toEqual(null);
        });
    });

    describe('findOneByEmail', () => {
        it('should get one user by email successfully', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(userMock);

            expect(await service.findOneByEmail(userMock.email)).toEqual(userMock);
        });

        it('should get null if user not found by email', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

            expect(await service.findOneByEmail(userMock.email)).toEqual(null);
        });
    });

    describe('findOneByEmailOrId', () => {
        it('should get one user by id successfully', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(userMock);

            const spyFindById: jest.SpyInstance = jest.spyOn(service, 'findOneById');
            const spyFindByEmail: jest.SpyInstance = jest.spyOn(service, 'findOneByEmail');

            expect(await service.findOneByEmailOrId(userMock.id)).toEqual(userMock);
            expect(spyFindById).toHaveBeenCalled();
            expect(spyFindByEmail).not.toHaveBeenCalled();
        });

        it('should throw error on get one user by id if user not exist', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

            const spyFindById: jest.SpyInstance = jest.spyOn(service, 'findOneById');
            const spyFindByEmail: jest.SpyInstance = jest.spyOn(service, 'findOneByEmail');

            await expect(service.findOneByEmailOrId(userMock.id)).rejects.toThrow(EntityNotFoundError);

            expect(spyFindById).toHaveBeenCalled();
            expect(spyFindByEmail).not.toHaveBeenCalled();
        });

        it('should get one user by email successfully', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(userMock);

            const spyFindById: jest.SpyInstance = jest.spyOn(service, 'findOneById');
            const spyFindByEmail: jest.SpyInstance = jest.spyOn(service, 'findOneByEmail');

            expect(await service.findOneByEmailOrId(userMock.email)).toEqual(userMock);
            expect(spyFindById).not.toHaveBeenCalled();
            expect(spyFindByEmail).toHaveBeenCalled();
        });

        it('should throw error on get one user by email if user not exist', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

            const spyFindById: jest.SpyInstance = jest.spyOn(service, 'findOneById');
            const spyFindByEmail: jest.SpyInstance = jest.spyOn(service, 'findOneByEmail');

            await expect(service.findOneByEmailOrId(userMock.email)).rejects.toThrow(EntityNotFoundError);

            expect(spyFindById).not.toHaveBeenCalled();
            expect(spyFindByEmail).toHaveBeenCalled();
        });
    });
});
