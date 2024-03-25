import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostColumnsFix1711383660395 implements MigrationInterface {
    name = 'PostColumnsFix1711383660395';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"
        `);
        await queryRunner.query(`
            ALTER TABLE "posts" DROP COLUMN "published_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "posts" DROP COLUMN "authorId"
        `);
        await queryRunner.query(`
            ALTER TABLE "posts"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "posts"
            ADD "author_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "posts"
            ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"
        `);
        await queryRunner.query(`
            ALTER TABLE "posts" DROP COLUMN "author_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "posts" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "posts"
            ADD "authorId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "posts"
            ADD "published_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "posts"
            ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
}
