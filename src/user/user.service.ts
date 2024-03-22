import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genSalt, hash } from 'bcrypt';

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

    async findOneByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({ email });
    }
}
