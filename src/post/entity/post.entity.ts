import { ApiProperty } from '@nestjs/swagger';
import { User } from '@user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'posts' })
export class Post {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @Column({ name: 'author_id', nullable: false })
    authorId: string;

    @ApiProperty()
    @ManyToOne(() => User, (user) => user.id, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'author_id' })
    author: User;
}
