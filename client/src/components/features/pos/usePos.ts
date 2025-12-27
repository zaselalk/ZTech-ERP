import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import type { InputRef } from "antd";
import { productService } from "../../../services";
import { Product, Sale, Quotation } from "../../../types";
import { CartItem } from "./types";

export const usePos = () => {
  const [topSellers, setTopSellers] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscountInput, setCartDiscountInput] = useState<number>(0);
  const [cartDiscountType, setCartDiscountType] = useState<
    "Fixed" | "Percentage"
  >("Fixed");
  const [isCheckoutVisible, setIsCheckoutVisible] = useState<boolean>(false);
  const [isQuotationModalVisible, setIsQuotationModalVisible] =
    useState<boolean>(false);
  const [isQuotationListVisible, setIsQuotationListVisible] =
    useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [completedQuotation, setCompletedQuotation] =
    useState<Quotation | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [searchType, setSearchType] = useState<"name" | "barcode">("name");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchTimeout = useRef<number | null>(null);
  const searchInputRef = useRef<InputRef>(null);
  const cartRef = useRef<CartItem[]>(cart);

  // loading states
  const [loadingTopSellers, setLoadingTopSellers] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    fetchTopSellers();
  }, []);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchType]);

  const fetchTopSellers = async (): Promise<void> => {
    setLoadingTopSellers(true);
    try {
      const data = await productService.getTopSellers();
      setTopSellers(data);
    } catch (e) {
      message.error("Failed to load top sellers");
    } finally {
      setLoadingTopSellers(false);
    }
  };

  const handleSearch = async (query: string): Promise<void> => {
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    if (query) {
      setLoadingSearch(true);
      try {
        const data = await productService.searchProducts(query, searchType);

        if (searchType === "barcode" && data.length === 1) {
          const product = data[0];
          handleAddToCart(product);
          message.success(`Added ${product.name} to cart`);
          setSearchQuery("");
          setSearchResults(null);
          searchInputRef.current?.focus();
          return;
        }

        setSearchResults(data);
      } catch (e) {
        message.error("Failed to search for products");
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setSearchResults(null);
    }
  };

  const debouncedSearch = (query: string): void => {
    setSearchQuery(query);
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = window.setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleAddToCart = (product: Product): void => {
    const currentCart = cartRef.current;
    const availableQuantity = product.quantity ?? 0;

    if (availableQuantity <= 0) {
      message.warning(`${product.name} is out of stock`);
      // return; // Uncomment to block
    }

    const existing = currentCart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= existing.availableStock) {
        message.warning(
          `Only ${existing.availableStock} available for ${product.name}`
        );
        return;
      }
      setCart(
        currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...currentCart,
        {
          ...product,
          quantity: 1,
          availableStock: availableQuantity,
          discountValue: product.discount ?? 0,
          discountType: product.discount_type ?? "Fixed",
        },
      ]);
    }
  };

  const handleQuantityChange = (productId: number, quantity: number): void => {
    const cartItem = cart.find((item) => item.id === productId);
    let finalQuantity = quantity;
    if (cartItem && quantity > cartItem.availableStock) {
      message.warning(
        `Only ${cartItem.availableStock} available for ${cartItem.name}`
      );
      finalQuantity = cartItem.availableStock;
    }
    setCart(
      cart
        .map((item) =>
          item.id === productId ? { ...item, quantity: finalQuantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleItemDiscountApply = (
    productId: number,
    discount: { discountValue: number; discountType: "Fixed" | "Percentage" }
  ): void => {
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, ...discount } : item
      )
    );
    setEditingItem(null);
  };

  const calculateItemTotal = (item: CartItem): number => {
    let priceAfterDiscount = item.price;
    if (item.discountType === "Fixed") {
      priceAfterDiscount -= item.discountValue;
    } else if (item.discountType === "Percentage") {
      priceAfterDiscount *= 1 - item.discountValue / 100;
    }
    return Math.max(0, priceAfterDiscount) * item.quantity;
  };

  const subtotal = cart.reduce(
    (acc: number, item) => acc + item.price * item.quantity,
    0
  );
  const subtotalAfterItemDiscounts = cart.reduce(
    (acc, item) => acc + calculateItemTotal(item),
    0
  );
  const finalCartDiscount =
    cartDiscountType === "Fixed"
      ? cartDiscountInput
      : (subtotalAfterItemDiscounts * cartDiscountInput) / 100;
  const total = Math.max(0, subtotalAfterItemDiscounts - finalCartDiscount);

  const resetSale = (): void => {
    setCart([]);
    setCartDiscountInput(0);
    setCartDiscountType("Fixed");
    setIsCheckoutVisible(false);
    setCompletedSale(null);
    setEditingItem(null);
  };

  const refreshProductData = async (): Promise<void> => {
    // Refresh top sellers to get updated quantities
    await fetchTopSellers();
    // If there's a search active, refresh search results
    if (searchQuery) {
      await handleSearch(searchQuery);
    }
  };

  const handleClearCart = (): void => {
    setCart([]);
    setCartDiscountInput(0);
    setCartDiscountType("Fixed");
  };

  return {
    topSellers,
    cart,
    cartDiscountInput,
    cartDiscountType,
    isCheckoutVisible,
    isQuotationModalVisible,
    isQuotationListVisible,
    completedSale,
    completedQuotation,
    editingItem,
    searchResults,
    searchType,
    searchQuery,
    searchInputRef,
    loadingTopSellers,
    loadingSearch,
    subtotal,
    subtotalAfterItemDiscounts,
    total,
    setCartDiscountInput,
    setCartDiscountType,
    setIsCheckoutVisible,
    setIsQuotationModalVisible,
    setIsQuotationListVisible,
    setCompletedSale,
    setCompletedQuotation,
    setEditingItem,
    setSearchType,
    handleSearch,
    debouncedSearch,
    handleAddToCart,
    handleQuantityChange,
    handleItemDiscountApply,
    resetSale,
    handleClearCart,
    refreshProductData,
  };
};
