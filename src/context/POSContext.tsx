import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CartItem,
  Category,
  Order,
  PaymentTender,
  Product,
  ShiftStats,
  StoreSettings,
  ThemeMode,
} from '../types/pos';
import { getTheme, ThemeColors } from '../constants/theme';
import { INITIAL_STORE_SETTINGS, MOCK_CATEGORIES, MOCK_PRODUCTS } from '../constants/mockData';
import { generateOrderNumber } from '../utils/formatters';
import { triggerFeedback } from '../utils/sound';

interface CartSummary {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  itemCount: number;
}

interface POSContextType {
  themeMode: ThemeMode;
  theme: ThemeColors;
  toggleTheme: () => void;

  products: Product[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];

  cart: CartItem[];
  cartSummary: CartSummary;
  orderDiscountPercent: number;
  setOrderDiscountPercent: (pct: number) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  setItemQuantity: (cartItemId: string, qty: number) => void;
  setItemDiscount: (cartItemId: string, discountPct: number) => void;
  setItemNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;

  holdCurrentOrder: (customerRef?: string) => boolean;
  heldOrders: Order[];
  recallHeldOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;

  completeCheckout: (tenders: PaymentTender[], tip: number) => Promise<Order>;
  lookupBarcode: (barcode: string) => Product | null;

  storeSettings: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  shiftStats: ShiftStats;
  resetShift: (openingCash: number) => void;

  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  orderHistory: Order[];
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: '@pos_theme_mode',
  STORE_SETTINGS: '@pos_store_settings',
  SHIFT_STATS: '@pos_shift_stats',
  ORDER_HISTORY: '@pos_order_history',
  HELD_ORDERS: '@pos_held_orders',
  PRODUCTS: '@pos_products',
};

const DEFAULT_SAMPLE_CART: CartItem[] = [
  {
    id: 'cart-1',
    product: MOCK_PRODUCTS[0], // Cappuccino Deluxe (BEV-882, KSh 350)
    quantity: 2,
  },
  {
    id: 'cart-2',
    product: MOCK_PRODUCTS[5], // Deli Club Sandwich (BAK-104, KSh 250)
    quantity: 1,
  },
  {
    id: 'cart-3',
    product: MOCK_PRODUCTS[7], // Highland Mineral Water (BEV-301, KSh 80)
    quantity: 3,
  },
  {
    id: 'cart-4',
    product: MOCK_PRODUCTS[9], // Golden Fry Cooking Oil (GRO-912, KSh 350)
    quantity: 1,
  },
];

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cart, setCart] = useState<CartItem[]>(DEFAULT_SAMPLE_CART);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(5);
  const [heldOrders, setHeldOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  const [shiftStats, setShiftStats] = useState<ShiftStats>({
    shiftId: 'SHIFT-' + Date.now().toString().slice(-4),
    openedAt: new Date().toISOString(),
    cashierName: 'Alex Rivera (Lead Cashier)',
    openingCash: 200.0,
    totalSales: 0,
    orderCount: 0,
    cashCollected: 0,
    cardCollected: 0,
    mobileCollected: 0,
  });

  // Load persisted state on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [savedTheme, savedSettings, savedShift, savedHistory, savedHeld] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.STORE_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.SHIFT_STATS),
          AsyncStorage.getItem(STORAGE_KEYS.ORDER_HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.HELD_ORDERS),
        ]);

        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme);
        }
        if (savedSettings) {
          setStoreSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
        }
        if (savedShift) {
          setShiftStats(JSON.parse(savedShift));
        }
        if (savedHistory) {
          setOrderHistory(JSON.parse(savedHistory));
        }
        if (savedHeld) {
          setHeldOrders(JSON.parse(savedHeld));
        }
      } catch (err) {
        console.warn('Failed to load POS cached settings', err);
      }
    };
    loadSavedData();
  }, []);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    AsyncStorage.setItem(STORAGE_KEYS.THEME, next).catch(() => {});
    triggerFeedback.tap();
  };

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q)
      );
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  // Cart financial summary calculation
  const cartSummary = useMemo<CartSummary>(() => {
    let rawSubtotal = 0;
    let itemDiscounts = 0;
    let taxAccumulator = 0;
    let itemCount = 0;

    cart.forEach((item) => {
      const linePrice = item.product.price * item.quantity;
      rawSubtotal += linePrice;
      itemCount += item.quantity;

      const itemDisc = item.discountPercent ? linePrice * (item.discountPercent / 100) : 0;
      itemDiscounts += itemDisc;

      const lineAfterDisc = linePrice - itemDisc;
      const effectiveTaxRate = item.product.taxRate ?? storeSettings.taxRateDefault;
      taxAccumulator += lineAfterDisc * effectiveTaxRate;
    });

    const globalDiscount =
      orderDiscountPercent > 0 ? (rawSubtotal - itemDiscounts) * (orderDiscountPercent / 100) : 0;
    const totalDiscounts = itemDiscounts + globalDiscount;
    const taxableSubtotal = Math.max(0, rawSubtotal - totalDiscounts);
    const taxTotal = taxableSubtotal * storeSettings.taxRateDefault;
    const grandTotal = Math.max(0, taxableSubtotal + taxTotal);

    return {
      subtotal: rawSubtotal,
      discountTotal: totalDiscounts,
      taxTotal,
      total: grandTotal,
      itemCount,
    };
  }, [cart, orderDiscountPercent, storeSettings.taxRateDefault]);

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    triggerFeedback.tap();
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        updated[existingIndex] = {
          ...current,
          quantity: current.quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    triggerFeedback.warning();
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    triggerFeedback.tap();
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const setItemQuantity = (cartItemId: string, qty: number) => {
    triggerFeedback.tap();
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.id !== cartItemId);
      }
      return prev.map((item) => (item.id === cartItemId ? { ...item, quantity: qty } : item));
    });
  };

  const setItemDiscount = (cartItemId: string, discountPct: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, discountPercent: Math.min(100, Math.max(0, discountPct)) } : item
      )
    );
  };

  const setItemNote = (cartItemId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, notes: note } : item))
    );
  };

  const clearCart = () => {
    triggerFeedback.selection();
    setCart([]);
    setOrderDiscountPercent(0);
  };

  // Barcode quick lookup
  const lookupBarcode = (barcode: string): Product | null => {
    const cleaned = barcode.trim().toLowerCase();
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === cleaned ||
        p.sku.toLowerCase() === cleaned ||
        p.id.toLowerCase() === cleaned
    );
    if (found) {
      addToCart(found, 1);
      triggerFeedback.success();
      return found;
    }
    triggerFeedback.error();
    return null;
  };

  // Hold & Recall orders
  const holdCurrentOrder = (customerRef?: string): boolean => {
    if (cart.length === 0) return false;

    const heldOrder: Order = {
      id: `HELD-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      items: [...cart],
      subtotal: cartSummary.subtotal,
      discountTotal: cartSummary.discountTotal,
      taxTotal: cartSummary.taxTotal,
      tip: 0,
      total: cartSummary.total,
      tenders: [],
      changeDue: 0,
      status: 'held',
      createdAt: new Date().toISOString(),
      cashierName: shiftStats.cashierName,
      heldName: customerRef || `Customer #${heldOrders.length + 1}`,
    };

    const updated = [heldOrder, ...heldOrders];
    setHeldOrders(updated);
    AsyncStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(updated)).catch(() => {});
    clearCart();
    triggerFeedback.selection();
    return true;
  };

  const recallHeldOrder = (orderId: string) => {
    const target = heldOrders.find((o) => o.id === orderId);
    if (!target) return;

    setCart(target.items);
    const remaining = heldOrders.filter((o) => o.id !== orderId);
    setHeldOrders(remaining);
    AsyncStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(remaining)).catch(() => {});
    triggerFeedback.success();
  };

  const deleteHeldOrder = (orderId: string) => {
    const remaining = heldOrders.filter((o) => o.id !== orderId);
    setHeldOrders(remaining);
    AsyncStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(remaining)).catch(() => {});
    triggerFeedback.warning();
  };

  // Complete checkout
  const completeCheckout = async (tenders: PaymentTender[], tip: number = 0): Promise<Order> => {
    const totalTendered = tenders.reduce((acc, t) => acc + (t.tendered ?? t.amount), 0);
    const finalTotalWithTip = cartSummary.total + tip;
    const changeDue = Math.max(0, totalTendered - finalTotalWithTip);

    const completedOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      items: [...cart],
      subtotal: cartSummary.subtotal,
      discountTotal: cartSummary.discountTotal,
      taxTotal: cartSummary.taxTotal,
      tip,
      total: finalTotalWithTip,
      tenders,
      changeDue,
      status: 'completed',
      createdAt: new Date().toISOString(),
      cashierName: shiftStats.cashierName,
    };

    // Update inventory stock counts
    setProducts((prev) =>
      prev.map((prod) => {
        const inCart = cart.find((c) => c.product.id === prod.id);
        if (inCart) {
          return { ...prod, stock: Math.max(0, prod.stock - inCart.quantity) };
        }
        return prod;
      })
    );

    // Update Shift Totals
    const cashPortion = tenders
      .filter((t) => t.method === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
    const cardPortion = tenders
      .filter((t) => t.method === 'card')
      .reduce((sum, t) => sum + t.amount, 0);
    const mobilePortion = tenders
      .filter((t) => t.method === 'mobile')
      .reduce((sum, t) => sum + t.amount, 0);

    const newShiftStats: ShiftStats = {
      ...shiftStats,
      totalSales: shiftStats.totalSales + finalTotalWithTip,
      orderCount: shiftStats.orderCount + 1,
      cashCollected: shiftStats.cashCollected + cashPortion,
      cardCollected: shiftStats.cardCollected + cardPortion,
      mobileCollected: shiftStats.mobileCollected + mobilePortion,
    };

    setShiftStats(newShiftStats);
    AsyncStorage.setItem(STORAGE_KEYS.SHIFT_STATS, JSON.stringify(newShiftStats)).catch(() => {});

    // Save to order history
    const updatedHistory = [completedOrder, ...orderHistory];
    setOrderHistory(updatedHistory);
    AsyncStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(updatedHistory.slice(0, 50))).catch(
      () => {}
    );

    // Set last completed order for receipt modal
    setLastCompletedOrder(completedOrder);

    // Clear active cart
    clearCart();
    triggerFeedback.success();

    return completedOrder;
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...newSettings };
    setStoreSettings(updated);
    AsyncStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(updated)).catch(() => {});
  };

  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated)).catch(() => {});
    triggerFeedback.success();
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated)).catch(() => {});
    triggerFeedback.tap();
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated)).catch(() => {});
    triggerFeedback.warning();
  };

  const resetShift = (openingCash: number) => {
    const freshShift: ShiftStats = {
      shiftId: 'SHIFT-' + Date.now().toString().slice(-4),
      openedAt: new Date().toISOString(),
      cashierName: shiftStats.cashierName,
      openingCash,
      totalSales: 0,
      orderCount: 0,
      cashCollected: 0,
      cardCollected: 0,
      mobileCollected: 0,
    };
    setShiftStats(freshShift);
    AsyncStorage.setItem(STORAGE_KEYS.SHIFT_STATS, JSON.stringify(freshShift)).catch(() => {});
    triggerFeedback.success();
  };

  return (
    <POSContext.Provider
      value={{
        themeMode,
        theme,
        toggleTheme,

        products,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filteredProducts,

        cart,
        cartSummary,
        orderDiscountPercent,
        setOrderDiscountPercent,
        addToCart,
        removeFromCart,
        updateQuantity,
        setItemQuantity,
        setItemDiscount,
        setItemNote,
        clearCart,

        holdCurrentOrder,
        heldOrders,
        recallHeldOrder,
        deleteHeldOrder,

        completeCheckout,
        lookupBarcode,

        storeSettings,
        updateStoreSettings,

        addProduct,
        updateProduct,
        deleteProduct,

        shiftStats,
        resetShift,

        lastCompletedOrder,
        setLastCompletedOrder,
        orderHistory,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

