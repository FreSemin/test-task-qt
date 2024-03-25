import { User } from '@user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'posts' })
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'author_id', nullable: false })
    authorId: string;

    @ManyToOne(() => User, (user) => user.id, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'author_id' })
    author: User;
}
