export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  costPrice?: number;
  categoryId: string;
  image?: string;
  stock: number;
  taxRate: number; // e.g. 0.08 for 8%
  color?: string;
  description?: string;
}

export interface CartItem {
  id: string; // unique item entry id in cart
  product: Product;
  quantity: number;
  discountPercent?: number; // item level discount
  notes?: string;
}

export type PaymentMethodType = 'cash' | 'card' | 'mobile' | 'split';

export interface PaymentTender {
  method: 'cash' | 'card' | 'mobile';
  amount: number;
  tendered?: number;
  change?: number;
  reference?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  tip: number;
  total: number;
  tenders: PaymentTender[];
  changeDue: number;
  status: 'completed' | 'held' | 'refunded';
  createdAt: string;
  cashierName: string;
  heldName?: string;
}

export interface ShiftStats {
  shiftId: string;
  openedAt: string;
  cashierName: string;
  openingCash: number;
  totalSales: number;
  orderCount: number;
  cashCollected: number;
  cardCollected: number;
  mobileCollected: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  taxId: string;
  taxRateDefault: number;
  receiptFooter: string;
  currencySymbol: string;
  terminalId: string;
  legalEntity?: string;
  branchCode?: string;
  officialEmail?: string;
  portalUrl?: string;
  currencyCode?: string;
  taxInclusivePricing?: boolean;
  zeroRatedVatRate?: number;
  vscuId?: string;
  embedFiscalQr?: boolean;
  realtimeKRaTransmittal?: boolean;
  paperWidth?: '80mm' | '58mm';
  showLogoAtTop?: boolean;
  printAddress?: boolean;
  printCashierAndLane?: boolean;
  displayLoyaltyTier?: boolean;
  itemizedVatBreakdown?: boolean;
  etimsQrAndSignature?: boolean;
  receiptHeaderGreeting?: string;
}

export type ThemeMode = 'dark' | 'light';

