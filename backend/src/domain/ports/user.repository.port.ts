import type { User } from "../entities/user.entity.js";

export interface IUserRepository {
  findAll(): Promise<User[]>;
}
