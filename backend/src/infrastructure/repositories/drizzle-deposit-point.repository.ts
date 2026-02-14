import { eq } from "drizzle-orm";
import type { IDepositPointRepository } from "../../domain/ports/deposit-point.repository.port.js";
import type { DepositPoint } from "../../domain/entities/deposit-point.entity.js";
import type { Database } from "../db/index.js";
import { depositPoint } from "../db/schema.js";

export function createDrizzleDepositPointRepository(db: Database): IDepositPointRepository {
  return {
    async findAll() {
      return db.query.depositPoint.findMany({
        orderBy: (dp, { asc }) => [asc(dp.name)],
      }) as Promise<DepositPoint[]>;
    },

    async findById(id: string) {
      return db.query.depositPoint.findFirst({
        where: eq(depositPoint.id, id),
      }) as Promise<DepositPoint | undefined>;
    },

    async findDefault() {
      return db.query.depositPoint.findFirst({
        where: eq(depositPoint.isDefault, true),
      }) as Promise<DepositPoint | undefined>;
    },

    async create(data) {
      const [result] = await db.insert(depositPoint).values(data).returning();
      return result as DepositPoint;
    },

    async update(id: string, data) {
      const [result] = await db
        .update(depositPoint)
        .set(data)
        .where(eq(depositPoint.id, id))
        .returning();
      return result as DepositPoint | undefined;
    },
  };
}
