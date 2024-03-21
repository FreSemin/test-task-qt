import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTakenError } from '@common/utils';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const existingUser = await this.findOneByEmail(createUserDto.email);

        if (existingUser) {
            throw new EmailTakenError();
        }

        const newUser = await this.userRepository.create(createUserDto);

        return await this.userRepository.save(newUser);
    }

    async findOneByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({ email });
    }
}
