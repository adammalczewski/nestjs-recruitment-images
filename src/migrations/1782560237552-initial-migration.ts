import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1782560237552 implements MigrationInterface {
    name = 'InitialMigration1782560237552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "image" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "url" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "image"`);
    }

}
