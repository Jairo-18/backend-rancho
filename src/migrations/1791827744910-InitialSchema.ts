import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791827744910 implements MigrationInterface {
  name = 'InitialSchema1791827744910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role" AS ENUM('ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."user_role" NOT NULL DEFAULT 'ADMIN', "refresh_token_hash" character varying(64), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "horseback_rides" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(120) NOT NULL, "slug" character varying(140) NOT NULL, "description" text NOT NULL, "duration_minutes" integer NOT NULL, "price_per_person" integer, "schedule" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a6a210304ada2de666dae1f435a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4675ff7ea69fa1cb7265210054" ON "horseback_rides"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3852dc58f83e21f4f43474b748" ON "horseback_rides"  ("is_active") `,
    );
    await queryRunner.query(
      `CREATE TABLE "horseback_images" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "horseback_id" uuid NOT NULL, "url" character varying(500) NOT NULL, "storage_key" character varying(300) NOT NULL, "position" smallint NOT NULL DEFAULT '0', CONSTRAINT "PK_5c611fd6598b414ef45de0f1787" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1bd0373b6056307e0d1b8468c3" ON "horseback_images"  ("horseback_id", "position") `,
    );
    await queryRunner.query(
      `CREATE TABLE "room_images" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "room_id" uuid NOT NULL, "url" character varying(500) NOT NULL, "storage_key" character varying(300) NOT NULL, "is_cover" boolean NOT NULL DEFAULT false, "position" smallint NOT NULL DEFAULT '0', CONSTRAINT "PK_ac049009c777706919d50237ecf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_887b61756eb9160100f41f8e2f" ON "room_images"  ("room_id", "position") `,
    );
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(120) NOT NULL, "slug" character varying(140) NOT NULL, "description" text NOT NULL, "has_jacuzzi" boolean NOT NULL DEFAULT false, "capacity" integer, "weekday_price" integer NOT NULL, "weekend_price" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4a252a005ce573079b47a4f38e" ON "rooms"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dbec25e4e68cd34f27177200f3" ON "rooms"  ("is_active") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."price_rule_type" AS ENUM('FIXED', 'PERCENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "price_rules" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(120) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "room_id" uuid, "type" "public"."price_rule_type" NOT NULL, "value" integer NOT NULL, "priority" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_47753652e6ea2b6d9230a7d8cf" CHECK ("end_date" >= "start_date"), CONSTRAINT "PK_332f84d0bdaa08303a9292653f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2d576c6e4cc17908417c65614" ON "price_rules"  ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f9af9528475422091d632dc13c" ON "price_rules"  ("start_date", "end_date") `,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(120) NOT NULL, "slug" character varying(140) NOT NULL, "description" text NOT NULL, "price" integer NOT NULL, "image_url" character varying(500), "image_storage_key" character varying(300), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_464f927ae360106b783ed0b410" ON "products"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4dcd2cd0cf988da1681469a0f4" ON "products"  ("is_active") `,
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("key" character varying(64) NOT NULL, "value" jsonb NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "horseback_images" ADD CONSTRAINT "FK_b4d59f34ad5fef1a7dde3ae4453" FOREIGN KEY ("horseback_id") REFERENCES "horseback_rides"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_images" ADD CONSTRAINT "FK_5f4e74488214bfa1d5b6556ddd6" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_rules" ADD CONSTRAINT "FK_147b83f47a50c5852661f441dd5" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_rules" DROP CONSTRAINT "FK_147b83f47a50c5852661f441dd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_images" DROP CONSTRAINT "FK_5f4e74488214bfa1d5b6556ddd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "horseback_images" DROP CONSTRAINT "FK_b4d59f34ad5fef1a7dde3ae4453"`,
    );
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4dcd2cd0cf988da1681469a0f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_464f927ae360106b783ed0b410"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f9af9528475422091d632dc13c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2d576c6e4cc17908417c65614"`,
    );
    await queryRunner.query(`DROP TABLE "price_rules"`);
    await queryRunner.query(`DROP TYPE "public"."price_rule_type"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dbec25e4e68cd34f27177200f3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a252a005ce573079b47a4f38e"`,
    );
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_887b61756eb9160100f41f8e2f"`,
    );
    await queryRunner.query(`DROP TABLE "room_images"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1bd0373b6056307e0d1b8468c3"`,
    );
    await queryRunner.query(`DROP TABLE "horseback_images"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3852dc58f83e21f4f43474b748"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4675ff7ea69fa1cb7265210054"`,
    );
    await queryRunner.query(`DROP TABLE "horseback_rides"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_role"`);
  }
}
