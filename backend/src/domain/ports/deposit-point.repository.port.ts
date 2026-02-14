import type { DepositPoint } from "../entities/deposit-point.entity.js";

export interface IDepositPointRepository {
  findAll(): Promise<DepositPoint[]>;
  findById(id: string): Promise<DepositPoint | undefined>;
  findDefault(): Promise<DepositPoint | undefined>;
  create(data: Omit<DepositPoint, "id" | "createdAt" | "updatedAt">): Promise<DepositPoint>;
  update(id: string, data: Partial<DepositPoint>): Promise<DepositPoint | undefined>;
}
