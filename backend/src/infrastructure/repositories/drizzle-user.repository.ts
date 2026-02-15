import type { IUserRepository } from "../../domain/ports/user.repository.port.js";
import type { User } from "../../domain/entities/user.entity.js";
import type { Database } from "../db/index.js";

export function createDrizzleUserRepository(db: Database): IUserRepository {
  return {
    async findAll() {
      return db.query.user.findMany({
        orderBy: (user, { asc }) => [asc(user.name)],
      }) as Promise<User[]>;
    },
  };
}
