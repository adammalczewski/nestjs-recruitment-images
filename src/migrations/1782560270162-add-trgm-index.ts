import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrgmIndex1782560270162 implements MigrationInterface {
    name = 'AddTrgmIndex1782560270162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        await queryRunner.query(`CREATE INDEX "trgm_idx" ON "image" USING gist ("title" gist_trgm_ops)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "trgm_idx"`);
    }

}
