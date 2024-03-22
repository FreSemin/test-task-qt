import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTakenError, EntityNotFoundError } from '@common/utils';
import { genSalt, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { EMAIL_TAKEN_TEXT, ENTITY_BY_VALUE_NOT_FOUND_TEXT, EntitiesTypes } from '@common/constants';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly configService: ConfigService,
    ) {}

    private async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(Number(this.configService.get<number>('CRYPT_SALT', 10)));

        return await hash(password, salt);
    }

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const existingUser = await this.findOneByEmail(createUserDto.email);

        if (existingUser) {
            throw new EmailTakenError(EMAIL_TAKEN_TEXT(createUserDto.email));
        }

        const hashedPassword = await this.hashPassword(createUserDto.password);

        const newUser = await this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return await this.userRepository.save(newUser);
    }

    async findOneById(id: string): Promise<UserEntity | null> {
        return await this.userRepository.findOneBy({ id });
    }

    async findOneByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({ email });
    }

    async findOneByEmailOrId(emailOrId: string): Promise<UserEntity | null> {
        if (isUUID(emailOrId)) {
            const user = await this.findOneById(emailOrId);

            if (!user) {
                throw new EntityNotFoundError(ENTITY_BY_VALUE_NOT_FOUND_TEXT(EntitiesTypes.USER, emailOrId));
            }

            return user;
        }

        const user = await this.findOneByEmail(emailOrId);

        if (!user) {
            throw new EntityNotFoundError(ENTITY_BY_VALUE_NOT_FOUND_TEXT(EntitiesTypes.USER, emailOrId));
        }

        return user;
    }
}
