import type { IUserRepository } from "../../../domain/ports/user.repository.port.js";

export function listUsersUseCase(userRepo: IUserRepository) {
  return async () => {
    const users = await userRepo.findAll();
    return users.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  };
}
