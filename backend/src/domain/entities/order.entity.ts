export type OrderType = "monthly" | "private_sale" | "special";
export type OrderStatus = "open" | "in_progress" | "completed";

export interface Order {
  id: string;
  type: OrderType;
  targetDate: Date;
  description: string | null;
  status: OrderStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithRelations extends Order {
  wishes?: Wish[];
  baskets?: Basket[];
  creator?: User;
}

// Avoid circular imports — use import type
import type { Wish } from "./wish.entity.js";
import type { Basket } from "./basket.entity.js";
import type { User } from "./user.entity.js";
