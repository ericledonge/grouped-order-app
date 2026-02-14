export type BasketStatus =
  | "draft"
  | "awaiting_validation"
  | "validated"
  | "awaiting_customs"
  | "awaiting_reception"
  | "awaiting_delivery"
  | "available_pickup";

export interface Basket {
  id: string;
  name: string;
  status: BasketStatus;
  shippingCost: number | null;
  customsCost: number | null;
  orderId: string;
  createdBy: string;
  receivedAt: Date | null;
  availableAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BasketWithRelations extends Basket {
  wishes?: Wish[];
  order?: Order;
  creator?: User;
}

import type { Wish } from "./wish.entity.js";
import type { Order } from "./order.entity.js";
import type { User } from "./user.entity.js";
