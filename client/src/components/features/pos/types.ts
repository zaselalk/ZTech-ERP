import { Book } from "../../../types";

export interface CartItem extends Book {
  quantity: number;
  availableStock: number;
  discountValue: number;
  discountType: "Fixed" | "Percentage";
}
