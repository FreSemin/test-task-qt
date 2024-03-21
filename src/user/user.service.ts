import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const newUser = await this.userRepository.create(createUserDto);

        return await this.userRepository.save(newUser);
    }
}
