import { Product } from "../../../types";

export interface CartItem extends Product {
  quantity: number;
  availableStock: number;
  discountValue: number;
  discountType: "Fixed" | "Percentage";
}
