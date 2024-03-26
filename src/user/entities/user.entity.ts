import { ApiProperty } from '@nestjs/swagger';
import { Post } from '@post/entity/post.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @ApiProperty()
    @OneToMany(() => Post, (post) => post.authorId)
    posts: Post[];
}
