export type WishStatus = "submitted" | "in_basket" | "validated" | "refused" | "paid" | "picked_up";

export type PaymentStatus = "pending" | "sent" | "received" | "partial";

export interface Wish {
  id: string;
  gameName: string;
  philibertReference: string;
  philibertUrl: string | null;
  status: WishStatus;
  unitPrice: number | null;
  shippingShare: number | null;
  customsShare: number | null;
  amountDue: number | null;
  paymentStatus: PaymentStatus;
  paymentSentAt: Date | null;
  paymentReceivedAt: Date | null;
  amountPaid: number | null;
  pickedUpAt: Date | null;
  userId: string;
  orderId: string;
  basketId: string | null;
  depositPointId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishWithRelations extends Wish {
  user?: User;
  order?: Order;
  basket?: Basket;
  depositPoint?: DepositPoint;
}

import type { User } from "./user.entity.js";
import type { Order } from "./order.entity.js";
import type { Basket } from "./basket.entity.js";
import type { DepositPoint } from "./deposit-point.entity.js";
