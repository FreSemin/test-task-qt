import { UserEntity } from '@user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'posts' })
export class PostEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @CreateDateColumn()
    published_at: Date;

    @Column({ nullable: false })
    authorId: string;

    @ManyToOne(() => UserEntity, (user) => user.id, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'authorId' })
    author: UserEntity;
}
