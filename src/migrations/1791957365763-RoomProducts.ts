import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomProducts1791957365763 implements MigrationInterface {
  name = 'RoomProducts1791957365763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "room_products" ("room_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_89412aea9d10aba2d48fbc6072a" PRIMARY KEY ("room_id", "product_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f8e67d72cb53c6a9f8cf4e1cc" ON "room_products"  ("room_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_950900c828e26e27ec9d87ce59" ON "room_products"  ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "room_products" ADD CONSTRAINT "FK_5f8e67d72cb53c6a9f8cf4e1cc2" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_products" ADD CONSTRAINT "FK_950900c828e26e27ec9d87ce595" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "room_products" DROP CONSTRAINT "FK_950900c828e26e27ec9d87ce595"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_products" DROP CONSTRAINT "FK_5f8e67d72cb53c6a9f8cf4e1cc2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_950900c828e26e27ec9d87ce59"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f8e67d72cb53c6a9f8cf4e1cc"`,
    );
    await queryRunner.query(`DROP TABLE "room_products"`);
  }
}
