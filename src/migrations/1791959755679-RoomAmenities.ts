import type { MigrationInterface, QueryRunner } from 'typeorm';

const BULLET = /^\s*[-•*]\s+/;
/** Título tipo "**Incluye los siguientes servicios:**" que antecedía la lista. */
const INCLUDES_HEADER = /^\s*\*\*[^*]*incluye[^*]*\*\*\s*$/i;

/**
 * Agrega "lo que incluye" como etiquetas y pasa a ellas las listas que ya
 * estaban escritas en las descripciones ("- Wifi"), quitándolas del texto.
 */
export class RoomAmenities1791959755679 implements MigrationInterface {
  name = 'RoomAmenities1791959755679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD "amenities" jsonb NOT NULL DEFAULT '[]'`,
    );
    const rooms = (await queryRunner.query(
      `SELECT "id", "description" FROM "rooms"`,
    )) as { id: string; description: string }[];
    for (const room of rooms) {
      const amenities: string[] = [];
      const kept: string[] = [];
      for (const line of room.description.replace(/\r\n/g, '\n').split('\n')) {
        if (BULLET.test(line)) {
          const item = line
            .replace(BULLET, '')
            .replace(/[.;,]\s*$/, '')
            .trim();
          if (item && !amenities.includes(item)) amenities.push(item);
        } else if (!INCLUDES_HEADER.test(line)) {
          kept.push(line);
        }
      }
      if (amenities.length === 0) continue;
      const description = kept
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      await queryRunner.query(
        `UPDATE "rooms" SET "amenities" = $1, "description" = $2 WHERE "id" = $3`,
        [JSON.stringify(amenities), description, room.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Devuelve las etiquetas a la descripción como lista antes de borrar la columna.
    await queryRunner.query(`
      UPDATE "rooms" SET "description" = "description" || E'\n\n' || (
        SELECT string_agg('- ' || item, E'\n') FROM jsonb_array_elements_text("amenities") AS item
      )
      WHERE jsonb_array_length("amenities") > 0
    `);
    await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "amenities"`);
  }
}
