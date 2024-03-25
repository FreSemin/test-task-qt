import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTakenError, EntityNotFoundError } from '@common/utils';
import { genSalt, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { EntitiesTypes } from '@common/constants';
import { RegisterDto } from '@auth/dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) {}

    private async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(Number(this.configService.get<number>('CRYPT_SALT', 10)));

        return await hash(password, salt);
    }

    async create(registerDto: RegisterDto): Promise<User> {
        const existingUser = await this.findOneByEmail(registerDto.email);

        if (existingUser) {
            throw new EmailTakenError(registerDto.email);
        }

        const hashedPassword = await this.hashPassword(registerDto.password);

        const newUser = await this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
        });

        return await this.userRepository.save(newUser);
    }

    async findOneById(id: string): Promise<User | null> {
        return await this.userRepository.findOneBy({ id });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email });
    }

    async findOneByEmailOrId(emailOrId: string): Promise<User> {
        if (isUUID(emailOrId)) {
            const user = await this.findOneById(emailOrId);

            if (!user) {
                throw new EntityNotFoundError(EntitiesTypes.USER, emailOrId);
            }

            return user;
        }

        const user = await this.findOneByEmail(emailOrId);

        if (!user) {
            throw new EntityNotFoundError(EntitiesTypes.USER, emailOrId);
        }

        return user;
    }
}
