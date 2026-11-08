import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  time: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    initials: string;
    isVip: boolean;
    tier: string;
  };
  itemsCount: number;
  itemsDetail: {
    name: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }[];
  paymentMethod: 'M-Pesa' | 'Card' | 'Cash' | 'Bank Tx';
  paymentRef: string;
  subtotal: number;
  discount: number;
  discountCode?: string;
  vat: number;
  total: number;
  status: 'Completed' | 'Processing' | 'Refunded';
  lane: string;
  cashier: string;
}

const SAMPLE_ORDERS: OrderRecord[] = [
  {
    id: 'ord-1',
    orderNumber: '#ORD-98420',
    time: '14:42',
    date: '25 Oct 2024',
    customer: {
      name: 'Wanjiku Mwangi',
      phone: '0722 123 456',
      email: 'wanjiku@example.co.ke',
      initials: 'WM',
      isVip: true,
      tier: 'GOLD VIP',
    },
    itemsCount: 4,
    itemsDetail: [
      { name: 'Cappuccino Deluxe', qty: 2, unitPrice: 350.0, subtotal: 700.0 },
      { name: 'Artisan Bread Loaf', qty: 1, unitPrice: 80.0, subtotal: 80.0 },
      { name: 'Highland Water 500ml', qty: 3, unitPrice: 80.0, subtotal: 240.0 },
      { name: 'Golden Fry Cooking Oil 1L', qty: 1, unitPrice: 350.0, subtotal: 350.0 },
    ],
    paymentMethod: 'M-Pesa',
    paymentRef: 'QK7492PL89',
    subtotal: 1370.0,
    discount: 68.5,
    discountCode: 'LOYALTY5 (-5%)',
    vat: 179.52,
    total: 1301.5,
    status: 'Completed',
    lane: 'Lane #01',
    cashier: 'John Doe (#402)',
  },
  {
    id: 'ord-2',
    orderNumber: '#ORD-98419',
    time: '14:38',
    date: '25 Oct 2024',
    customer: {
      name: 'Brian Ochieng',
      phone: '0711 987 234',
      email: 'brian.o@example.com',
      initials: 'BO',
      isVip: false,
      tier: 'Standard',
    },
    itemsCount: 2,
    itemsDetail: [
      { name: 'Java House Kenya Blend 375g', qty: 2, unitPrice: 350.0, subtotal: 700.0 },
      { name: 'Tusker Malt Can 500ml', qty: 7, unitPrice: 250.0, subtotal: 1750.0 },
    ],
    paymentMethod: 'Card',
    paymentRef: 'VISA-4242',
    subtotal: 2450.0,
    discount: 0,
    vat: 337.93,
    total: 2450.0,
    status: 'Completed',
    lane: 'Lane #02',
    cashier: 'John Doe (#402)',
  },
  {
    id: 'ord-3',
    orderNumber: '#ORD-98418',
    time: '14:29',
    date: '25 Oct 2024',
    customer: {
      name: 'Sarah Kimani',
      phone: '0733 445 566',
      email: 'skimani@co.ke',
      initials: 'SK',
      isVip: true,
      tier: 'SILVER VIP',
    },
    itemsCount: 6,
    itemsDetail: [
      { name: 'Kericho Gold Pure Black Tea 100pk', qty: 4, unitPrice: 255.0, subtotal: 1020.0 },
      { name: 'Basmati Rice 2kg', qty: 4, unitPrice: 250.0, subtotal: 1000.0 },
      { name: 'Golden Fry Cooking Oil 2L', qty: 3, unitPrice: 680.0, subtotal: 2040.0 },
      { name: 'Artisan Bread Loaf', qty: 2, unitPrice: 80.0, subtotal: 160.0 },
      { name: 'Brookside Fresh Milk 500ml', qty: 10, unitPrice: 65.0, subtotal: 650.0 },
      { name: 'Macadamia Choc Cookies', qty: 2, unitPrice: 125.0, subtotal: 250.0 },
    ],
    paymentMethod: 'M-Pesa',
    paymentRef: 'QL1928374M',
    subtotal: 5120.0,
    discount: 0,
    vat: 706.21,
    total: 5120.0,
    status: 'Processing',
    lane: 'Lane #01',
    cashier: 'John Doe (#402)',
  },
  {
    id: 'ord-4',
    orderNumber: '#ORD-98417',
    time: '14:15',
    date: '25 Oct 2024',
    customer: {
      name: 'Walk-in Customer',
      phone: 'Counter Direct',
      email: 'direct@counter.lan',
      initials: 'WC',
      isVip: false,
      tier: 'Guest',
    },
    itemsCount: 1,
    itemsDetail: [
      { name: 'Cappuccino Deluxe', qty: 1, unitPrice: 350.0, subtotal: 350.0 },
    ],
    paymentMethod: 'Cash',
    paymentRef: 'CASH-TENDER-01',
    subtotal: 350.0,
    discount: 0,
    vat: 48.28,
    total: 350.0,
    status: 'Completed',
    lane: 'Lane #03',
    cashier: 'John Doe (#402)',
  },
  {
    id: 'ord-5',
    orderNumber: '#ORD-98416',
    time: '13:58',
    date: '25 Oct 2024',
    customer: {
      name: 'Daniel Kiprop',
      phone: '0700 889 123',
      email: 'dkiprop@mail.com',
      initials: 'DK',
      isVip: false,
      tier: 'Standard',
    },
    itemsCount: 3,
    itemsDetail: [
      { name: 'Elianto Pure Corn Oil 1L', qty: 1, unitPrice: 460.0, subtotal: 460.0 },
      { name: 'Mocha Caramel', qty: 2, unitPrice: 420.0, subtotal: 840.0 },
      { name: 'Artisan Bread Loaf', qty: 1, unitPrice: 80.0, subtotal: 80.0 },
      { name: 'Kericho Gold Pure Black Tea 100pk', qty: 2, unitPrice: 255.0, subtotal: 510.0 },
    ],
    paymentMethod: 'M-Pesa',
    paymentRef: 'REV-QK994102',
    subtotal: -1890.0,
    discount: 0,
    vat: -260.69,
    total: -1890.0,
    status: 'Refunded',
    lane: 'Lane #01',
    cashier: 'John Doe (#402)',
  },
  {
    id: 'ord-6',
    orderNumber: '#ORD-98415',
    time: '13:41',
    date: '25 Oct 2024',
    customer: {
      name: 'Amina Hassan',
      phone: '0728 554 112',
      email: 'ahassan@corp.co.ke',
      initials: 'AH',
      isVip: true,
      tier: 'PLATINUM VIP',
    },
    itemsCount: 5,
    itemsDetail: [
      { name: 'Java House Kenya Blend 375g', qty: 12, unitPrice: 350.0, subtotal: 4200.0 },
      { name: 'Mumias Pure Sugar 1kg', qty: 15, unitPrice: 180.0, subtotal: 2700.0 },
      { name: 'Dark Roast Beans 500g', qty: 2, unitPrice: 650.0, subtotal: 1300.0 },
      { name: 'Highland Mineral Water 500ml', qty: 6, unitPrice: 80.0, subtotal: 480.0 },
      { name: 'Ceremonial Matcha Tin', qty: 1, unitPrice: 60.0, subtotal: 60.0 },
    ],
    paymentMethod: 'Bank Tx',
    paymentRef: 'KCB-EFT-99120',
    subtotal: 8740.0,
    discount: 0,
    vat: 1205.52,
    total: 8740.0,
    status: 'Completed',
    lane: 'Lane #04',
    cashier: 'John Doe (#402)',
  },
];

interface OrdersScreenProps {
  onManualOrder: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ onManualOrder }) => {
  const { theme, storeSettings } = usePOS();
  const { width } = useWindowDimensions();

  const isWide = width >= 1100;
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord>(SAMPLE_ORDERS[0]);
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Range'>('This Week');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'All' | 'M-Pesa' | 'Card' | 'Cash' | 'Bank Tx'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Processing' | 'Refunded'>('All');
  const [laneFilter, setLaneFilter] = useState('All Lanes');
  const [page, setPage] = useState(1);

  // Filtered orders list
  const filteredOrders = SAMPLE_ORDERS.filter((ord) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      q === '' ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.customer.name.toLowerCase().includes(q) ||
      ord.customer.phone.includes(q) ||
      ord.paymentRef.toLowerCase().includes(q);

    const matchMethod = methodFilter === 'All' || ord.paymentMethod === methodFilter;
    const matchStatus = statusFilter === 'All' || ord.status === statusFilter;

    return matchQ && matchMethod && matchStatus;
  });

  const handlePrintSlip = async () => {
    triggerFeedback.tap();
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; padding: 24px; max-width: 320px; margin: 0 auto; color: #111; font-size: 12px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #333; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .total { font-size: 15px; font-weight: bold; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 15px;">LANDMARK STORES POS</div>
          <div class="center">Nairobi Flagship • ${selectedOrder.lane}</div>
          <div class="center">KRA PIN: P051239840Z</div>
          <div class="center">Tel: +254 700 123 456</div>
          <div class="line"></div>
          <div class="row"><span>Order:</span><span class="bold">${selectedOrder.orderNumber}</span></div>
          <div class="row"><span>Date:</span><span>${selectedOrder.date} ${selectedOrder.time} EAT</span></div>
          <div class="row"><span>Cashier:</span><span>${selectedOrder.cashier}</span></div>
          <div class="row"><span>Customer:</span><span class="bold">${selectedOrder.customer.name}</span></div>
          ${selectedOrder.customer.isVip ? `<div class="row"><span>Tier:</span><span>${selectedOrder.customer.tier}</span></div>` : ''}
          <div class="line"></div>
          <div class="bold" style="margin-bottom: 4px;">PURCHASED ITEMS:</div>
          ${selectedOrder.itemsDetail
            .map(
              (item) => `
            <div class="row">
              <span>${item.qty}x ${item.name}</span>
              <span class="bold">KSh ${item.subtotal.toFixed(2)}</span>
            </div>
          `
            )
            .join('')}
          <div class="line"></div>
          <div class="row"><span>Subtotal:</span><span>KSh ${selectedOrder.subtotal.toFixed(2)}</span></div>
          ${
            selectedOrder.discount > 0
              ? `<div class="row"><span>Discount (${selectedOrder.discountCode || 'VIP'}):</span><span>-KSh ${selectedOrder.discount.toFixed(2)}</span></div>`
              : ''
          }
          <div class="row"><span>VAT (16% inclusive):</span><span>KSh ${selectedOrder.vat.toFixed(2)}</span></div>
          <div class="line"></div>
          <div class="row total"><span>TOTAL PAID:</span><span>KSh ${selectedOrder.total.toFixed(2)}</span></div>
          <div class="row"><span>Payment:</span><span>${selectedOrder.paymentMethod} Express</span></div>
          <div class="row"><span>Ref:</span><span>${selectedOrder.paymentRef}</span></div>
          <div class="line"></div>
          <div class="center" style="margin-top: 10px;">CU INVOICE NUMBER: 0142981</div>
          <div class="center bold">*** THANK YOU FOR SHOPPING WITH US ***</div>
        </body>
      </html>
    `;
    try {
      await Print.printAsync({ html });
    } catch (err) {
      console.warn('Print error', err);
    }
  };

  const handleDownloadInvoice = async () => {
    triggerFeedback.tap();
    const invoiceHtml = `
      <html>
        <body style="font-family: sans-serif; padding: 40px; color: #263238;">
          <h1 style="color: #006a66;">LANDMARK STORES - TAX INVOICE</h1>
          <p><strong>Invoice Number:</strong> INV-${selectedOrder.orderNumber.replace('#ORD-', '')}</p>
          <p><strong>Date:</strong> ${selectedOrder.date} ${selectedOrder.time} EAT</p>
          <p><strong>Customer:</strong> ${selectedOrder.customer.name} (${selectedOrder.customer.phone})</p>
          <p><strong>Total Amount:</strong> KSh ${selectedOrder.total.toFixed(2)}</p>
          <p><strong>KRA E-TIMS Serial:</strong> KRADCA0098421</p>
        </body>
      </html>
    `;
    if (Platform.OS === 'web') {
      handlePrintSlip();
    } else {
      try {
        const { uri } = await Print.printToFileAsync({ html: invoiceHtml });
        await Sharing.shareAsync(uri);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F5F7F8' }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Toolbar */}
      <View style={styles.topHeader}>
        <View style={styles.headingCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.heading, { color: '#111D23' }]}>Orders & Transactions</Text>
            <View style={[styles.laneRangeBadge, { backgroundColor: '#E3F0F8' }]}>
              <Text style={[styles.laneRangeText, { color: '#006A66' }]}>Store Lane #01-#04</Text>
            </View>
          </View>
          <Text style={[styles.subheading, { color: '#6D7A78' }]}>
            Monitor, review and manage completed, pending, and refunded retail transactions across store lanes.
          </Text>
        </View>

        {/* Stacked Right Controls matching reference screenshot */}
        <View style={styles.topRightControls}>
          {/* Row 1: Date tabs and Export */}
          <View style={styles.topRightRow1}>
            <View style={[styles.dateTabsGroup, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              {(['Today', 'Yesterday', 'This Week', 'This Month', 'Range'] as const).map((tab) => {
                const isActive = dateFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.dateTab,
                      isActive && { backgroundColor: '#E8F6F5' },
                    ]}
                    onPress={() => {
                      triggerFeedback.tap();
                      setDateFilter(tab);
                    }}
                  >
                    <Text
                      style={[
                        styles.dateTabText,
                        {
                          color: isActive ? '#006A66' : '#6D7A78',
                          fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                        },
                      ]}
                    >
                      {tab === 'Range' ? '📅 Range' : tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.actionBtnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
              onPress={() => {
                triggerFeedback.tap();
                alert('Exporting transactions to CSV/Excel...');
              }}
            >
              <Ionicons name="download-outline" size={14} color="#111D23" />
              <Text style={[styles.actionBtnText, { color: '#111D23' }]}>Export</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Summary and + Manual Order */}
          <View style={styles.topRightRow2}>
            <TouchableOpacity
              style={[styles.actionBtnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
              onPress={() => {
                triggerFeedback.tap();
                handlePrintSlip();
              }}
            >
              <Ionicons name="reader-outline" size={14} color="#111D23" />
              <Text style={[styles.actionBtnText, { color: '#111D23' }]}>Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.manualOrderBtn, { backgroundColor: '#006A66' }]}
              onPress={() => {
                triggerFeedback.tap();
                onManualOrder();
              }}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.manualOrderBtnText}>Manual Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Four Operational KPI Cards */}
      <View style={styles.kpiRow}>
        {/* Total Orders */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>TOTAL ORDERS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="receipt-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#111D23' }]}>1,482</Text>
          <View style={styles.kpiSubRow}>
            <View style={[styles.trendBadge, { backgroundColor: '#EAF8F1' }]}>
              <Ionicons name="trending-up" size={12} color="#32B67A" />
              <Text style={[styles.kpiTrend, { color: '#32B67A' }]}>+8.4%</Text>
            </View>
            <Text style={[styles.kpiSubText, { color: '#8A969B' }]}>vs. last rolling week</Text>
          </View>
        </View>

        {/* Completed Orders */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>COMPLETED ORDERS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#111D23' }]}>1,418</Text>
          <View style={styles.kpiProgressRow}>
            <View style={[styles.fulfillmentBadge, { backgroundColor: '#E8F6F5' }]}>
              <Text style={[styles.fulfillmentText, { color: '#006A66' }]}>95.7% fulfillment</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: '#E8ECEF' }]}>
              <View style={[styles.progressFill, { backgroundColor: '#006A66', width: '95.7%' }]} />
            </View>
          </View>
        </View>

        {/* Pending / Processing */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>PENDING / PROCESSING</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="hourglass-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#111D23' }]}>42</Text>
          <View style={styles.kpiSubRow}>
            <Text style={[styles.kpiSubText, { color: '#263238' }]}>Awaiting lane dispatch</Text>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>2.8% total</Text>
          </View>
        </View>

        {/* Refunded & Voids */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>REFUNDED & VOIDS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#FFDAD6' }]}>
              <Ionicons name="arrow-undo-outline" size={16} color="#BA1A1A" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#111D23' }]}>22</Text>
          <View style={styles.kpiSubRow}>
            <View style={[styles.trendBadge, { backgroundColor: '#FFDAD6' }]}>
              <Text style={[styles.refundRate, { color: '#BA1A1A' }]}>1.5% rate</Text>
            </View>
            <Text style={[styles.refundTotal, { color: '#BA1A1A' }]}>KSh 34,200</Text>
          </View>
        </View>
      </View>

      {/* 3. Search & Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
        {/* Search */}
        <View style={[styles.searchField, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
          <Ionicons name="search" size={15} color="#8A969B" />
          <TextInput
            style={[styles.searchInput, { color: '#111D23' }]}
            placeholder="Search Order ID, customer, phone, or receipt..."
            placeholderTextColor="#8A969B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={15} color="#8A969B" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Method dropdown */}
        <TouchableOpacity
          style={[styles.filterDropdown, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}
          onPress={() => {
            const methods: ('All' | 'M-Pesa' | 'Card' | 'Cash' | 'Bank Tx')[] = ['All', 'M-Pesa', 'Card', 'Cash', 'Bank Tx'];
            const next = methods[(methods.indexOf(methodFilter) + 1) % methods.length];
            setMethodFilter(next);
            triggerFeedback.tap();
          }}
        >
          <Text style={[styles.dropdownLabel, { color: '#6D7A78' }]}>Payment Method:</Text>
          <Text style={[styles.dropdownValue, { color: '#111D23' }]}>
            {methodFilter === 'All' ? 'All' : methodFilter}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#6D7A78" />
        </TouchableOpacity>

        {/* Status dropdown */}
        <TouchableOpacity
          style={[styles.filterDropdown, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}
          onPress={() => {
            const statuses: ('All' | 'Completed' | 'Processing' | 'Refunded')[] = ['All', 'Completed', 'Processing', 'Refunded'];
            const next = statuses[(statuses.indexOf(statusFilter) + 1) % statuses.length];
            setStatusFilter(next);
            triggerFeedback.tap();
          }}
        >
          <Text style={[styles.dropdownLabel, { color: '#6D7A78' }]}>Status:</Text>
          <Text style={[styles.dropdownValue, { color: '#111D23' }]}>
            {statusFilter === 'All' ? 'All Orders' : statusFilter}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#6D7A78" />
        </TouchableOpacity>

        {/* Register dropdown */}
        <TouchableOpacity style={[styles.filterDropdown, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
          <Text style={[styles.dropdownLabel, { color: '#6D7A78' }]}>Register:</Text>
          <Text style={[styles.dropdownValue, { color: '#111D23' }]}>{laneFilter}</Text>
          <Ionicons name="chevron-down" size={12} color="#6D7A78" />
        </TouchableOpacity>

        {/* Funnel Icon */}
        <TouchableOpacity style={[styles.funnelBtn, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
          <Ionicons name="filter" size={16} color="#6D7A78" />
        </TouchableOpacity>
      </View>

      {/* 4. Split Body: Transaction Ledger (Left) & Active Order Details (Right) */}
      <View style={[styles.contentRow, isWide && styles.contentRowWide]}>
        {/* Left Side: Transaction Ledger Table */}
        <View style={[styles.ledgerCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Header */}
          <View style={styles.ledgerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.ledgerTitle, { color: '#111D23' }]}>Transaction Ledger</Text>
              <Text style={[styles.entriesText, { color: '#8A969B' }]}>1,482 Entries</Text>
            </View>

            <TouchableOpacity style={styles.sortToggle}>
              <Text style={[styles.sortText, { color: '#6D7A78' }]}>Sort: Recent First</Text>
              <Ionicons name="swap-vertical" size={14} color="#6D7A78" />
            </TouchableOpacity>
          </View>

          {/* Table Header Row */}
          <View style={[styles.tableHeader, { backgroundColor: '#FFFFFF', borderBottomColor: '#E8ECEF' }]}>
            <Text style={[styles.thText, { width: 95 }]}>ORDER ID</Text>
            <Text style={[styles.thText, { width: 75 }]}>TIME & DATE</Text>
            <Text style={[styles.thText, { flex: 1.4 }]}>CUSTOMER</Text>
            <Text style={[styles.thText, { width: 50, textAlign: 'center' }]}>ITEMS</Text>
            <Text style={[styles.thText, { width: 85, textAlign: 'center' }]}>METHOD</Text>
            <Text style={[styles.thText, { width: 95, textAlign: 'right' }]}>TOTAL (KSH)</Text>
            <Text style={[styles.thText, { width: 95, textAlign: 'center' }]}>STATUS</Text>
            <Text style={[styles.thText, { width: 65, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {/* Table Rows */}
          {filteredOrders.map((ord) => {
            const isSelected = selectedOrder.id === ord.id;
            return (
              <TouchableOpacity
                key={ord.id}
                style={[
                  styles.tableRow,
                  { borderBottomColor: '#E8ECEF' },
                  isSelected && { backgroundColor: '#E8F6F5' },
                ]}
                onPress={() => {
                  triggerFeedback.tap();
                  setSelectedOrder(ord);
                }}
                activeOpacity={0.8}
              >
                {/* Order ID with active square/dot */}
                <View style={[styles.orderIdCol, { width: 95 }]}>
                  {isSelected && <View style={[styles.activeRowDot, { backgroundColor: '#006A66' }]} />}
                  <Text style={[styles.orderIdText, { color: isSelected ? '#006A66' : '#263238' }]}>
                    {ord.orderNumber}
                  </Text>
                </View>

                {/* Time & Date */}
                <View style={{ width: 75 }}>
                  <Text style={[styles.timeText, { color: '#111D23' }]}>{ord.time}</Text>
                  <Text style={[styles.dateText, { color: '#8A969B' }]}>{ord.date}</Text>
                </View>

                {/* Customer */}
                <View style={{ flex: 1.4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.customerName, { color: '#111D23' }]} numberOfLines={1}>
                      {ord.customer.name}
                    </Text>
                    {ord.customer.isVip && (
                      <View style={[styles.vipBadge, { backgroundColor: '#E3F0F8' }]}>
                        <Text style={[styles.vipBadgeText, { color: '#006A66' }]}>VIP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.customerPhone, { color: '#8A969B' }]}>
                    {ord.customer.phone}
                  </Text>
                </View>

                {/* Items */}
                <View style={{ width: 50, alignItems: 'center' }}>
                  <Text style={[styles.itemsCount, { color: '#111D23' }]}>
                    {ord.itemsCount}{' '}
                    <Text style={[styles.itemsUnit, { color: '#8A969B' }]}>pk</Text>
                  </Text>
                </View>

                {/* Method Pill */}
                <View style={{ width: 85, alignItems: 'center' }}>
                  <View
                    style={[
                      styles.methodBadge,
                      {
                        backgroundColor:
                          ord.paymentMethod === 'M-Pesa'
                            ? '#90F0EA'
                            : ord.paymentMethod === 'Card'
                            ? '#E3F0F8'
                            : ord.paymentMethod === 'Cash'
                            ? '#FEF6EC'
                            : '#DDEAF2',
                      },
                    ]}
                  >
                    {ord.paymentMethod === 'M-Pesa' && (
                      <View style={[styles.mPesaDot, { backgroundColor: '#006A66' }]} />
                    )}
                    {ord.paymentMethod === 'Card' && (
                      <Ionicons name="card-outline" size={11} color="#263238" />
                    )}
                    {ord.paymentMethod === 'Cash' && (
                      <Ionicons name="cash-outline" size={11} color="#F2A541" />
                    )}
                    {ord.paymentMethod === 'Bank Tx' && (
                      <Ionicons name="business-outline" size={11} color="#263238" />
                    )}
                    <Text
                      style={[
                        styles.methodText,
                        {
                          color:
                            ord.paymentMethod === 'M-Pesa'
                              ? '#006A66'
                              : ord.paymentMethod === 'Cash'
                              ? '#F2A541'
                              : '#263238',
                        },
                      ]}
                    >
                      {ord.paymentMethod}
                    </Text>
                  </View>
                </View>

                {/* Total */}
                <View style={{ width: 95, alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.rowTotal,
                      {
                        color: ord.total < 0 ? '#BA1A1A' : '#111D23',
                      },
                    ]}
                  >
                    {ord.total < 0 ? `-${Math.abs(ord.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ord.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>

                {/* Status */}
                <View style={{ width: 95, alignItems: 'center' }}>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          ord.status === 'Completed'
                            ? '#EAF8F1'
                            : ord.status === 'Processing'
                            ? '#E3F0F8'
                            : '#FFDAD6',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            ord.status === 'Completed'
                              ? '#32B67A'
                              : ord.status === 'Processing'
                              ? '#006A66'
                              : '#BA1A1A',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            ord.status === 'Completed'
                              ? '#32B67A'
                              : ord.status === 'Processing'
                              ? '#006A66'
                              : '#BA1A1A',
                        },
                      ]}
                    >
                      {ord.status}
                    </Text>
                  </View>
                </View>

                {/* Actions Icons */}
                <View style={{ width: 65, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => setSelectedOrder(ord)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#6D7A78" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={handlePrintSlip}
                  >
                    <Ionicons name="receipt-outline" size={16} color="#6D7A78" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Pagination Footer */}
          <View style={[styles.paginationRow, { borderTopColor: '#E8ECEF' }]}>
            <Text style={[styles.paginationCount, { color: '#8A969B' }]}>
              Showing 1 - 6 of 1,482 orders
            </Text>

            <View style={styles.pageNumbers}>
              <TouchableOpacity style={[styles.pageBtn, { borderColor: '#E8ECEF' }]}>
                <Ionicons name="chevron-back" size={13} color="#6D7A78" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pageNumberBtn, { backgroundColor: '#006A66' }]}>
                <Text style={styles.pageNumberActive}>1</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pageNumberBtn, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.pageNumberText, { color: '#111D23' }]}>2</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pageNumberBtn, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.pageNumberText, { color: '#111D23' }]}>3</Text>
              </TouchableOpacity>

              <Text style={{ color: '#8A969B', paddingHorizontal: 2 }}>...</Text>

              <TouchableOpacity style={[styles.pageNumberBtn, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.pageNumberText, { color: '#111D23' }]}>247</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pageBtn, { borderColor: '#E8ECEF' }]}>
                <Ionicons name="chevron-forward" size={13} color="#6D7A78" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right Side: Active Order Details Inspector Card */}
        <View style={[styles.detailDrawer, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Order Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: '#E8ECEF' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.drawerHeaderIcon, { backgroundColor: '#E8F6F5' }]}>
                <Ionicons name="document-text" size={18} color="#006A66" />
              </View>
              <View>
                <Text style={[styles.drawerOrderNum, { color: '#111D23' }]}>
                  {selectedOrder.orderNumber}
                </Text>
                <Text style={[styles.drawerOrderMeta, { color: '#8A969B' }]}>
                  {selectedOrder.lane} • {selectedOrder.date.replace(' 2024', '')}, {selectedOrder.time} EAT
                </Text>
              </View>
            </View>

            <View style={[styles.completedBadge, { backgroundColor: '#EAF8F1' }]}>
              <View style={[styles.onlineDot, { backgroundColor: '#32B67A' }]} />
              <Text style={[styles.completedText, { color: '#32B67A' }]}>
                {selectedOrder.status}
              </Text>
            </View>
          </View>

          {/* Customer Profile Banner */}
          <View style={[styles.customerBanner, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={[styles.customerAvatar, { backgroundColor: '#006A66' }]}>
              <Text style={styles.customerAvatarText}>{selectedOrder.customer.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.custName, { color: '#111D23' }]}>
                  {selectedOrder.customer.name}
                </Text>
                <View style={[styles.goldBadge, { backgroundColor: '#90F0EA' }]}>
                  <Text style={[styles.goldBadgeText, { color: '#006A66' }]}>
                    {selectedOrder.customer.tier}
                  </Text>
                </View>
              </View>
              <Text style={[styles.custMeta, { color: '#8A969B' }]}>
                {selectedOrder.customer.phone} • {selectedOrder.customer.email}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#006A66" />
          </View>

          {/* Cashier & Station Footer */}
          <View style={[styles.cashierRow, { borderBottomColor: '#E8ECEF' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="person-outline" size={12} color="#8A969B" />
              <Text style={[styles.cashierLine, { color: '#8A969B' }]}>
                Cashier: {selectedOrder.cashier}
              </Text>
            </View>
            <Text style={[styles.stationLine, { color: '#8A969B' }]}>
              Station #01
            </Text>
          </View>

          {/* Purchased Items Section */}
          <View style={styles.itemsSection}>
            <View style={styles.itemsHeaderRow}>
              <Text style={[styles.itemsSectionTitle, { color: '#6D7A78' }]}>
                PURCHASED ITEMS ({selectedOrder.itemsDetail.length})
              </Text>
              <Text style={[styles.itemsQtyHeader, { color: '#8A969B' }]}>Qty • Subtotal</Text>
            </View>

            {selectedOrder.itemsDetail.map((item, idx) => (
              <View key={idx} style={styles.itemLine}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: '#111D23' }]}>{item.name}</Text>
                  <Text style={[styles.itemQtyFormula, { color: '#8A969B' }]}>
                    {item.qty} × KSh {item.unitPrice.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.itemSubtotal, { color: '#111D23' }]}>
                  KSh {item.subtotal.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Calculation Ledger (Light Blue/Teal container matching screenshot) */}
          <View style={[styles.ledgerSummary, { backgroundColor: '#F4FAFF' }]}>
            <View style={styles.summaryLine}>
              <Text style={[styles.sumLabel, { color: '#6D7A78' }]}>Subtotal</Text>
              <Text style={[styles.sumVal, { color: '#111D23' }]}>
                KSh {selectedOrder.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {selectedOrder.discount > 0 && (
              <View style={styles.summaryLine}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="pricetag-outline" size={12} color="#006A66" />
                  <Text style={[styles.sumLabel, { color: '#006A66' }]}>
                    {selectedOrder.discountCode || 'LOYALTY5 (-5%)'}
                  </Text>
                </View>
                <Text style={[styles.sumVal, { color: '#006A66' }]}>
                  -KSh {selectedOrder.discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryLine}>
              <Text style={[styles.sumLabel, { color: '#8A969B' }]}>
                VAT (16% standard inclusive)
              </Text>
              <Text style={[styles.sumVal, { color: '#8A969B' }]}>
                KSh {selectedOrder.vat.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.grandTotalLine, { borderTopColor: '#E8ECEF' }]}>
              <Text style={[styles.grandTotalLabel, { color: '#111D23' }]}>Grand Total</Text>
              <Text style={[styles.grandTotalVal, { color: '#006A66' }]}>
                KSh {selectedOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Payment Method Card */}
          <View style={[styles.paymentCard, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={[styles.paymentCardIcon, { backgroundColor: '#006A66' }]}>
              <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentCardTitle, { color: '#111D23' }]}>
                {selectedOrder.paymentMethod} Express
              </Text>
              <Text style={[styles.paymentCardRef, { color: '#8A969B' }]}>
                Ref: {selectedOrder.paymentRef}
              </Text>
            </View>
            <View style={[styles.settledBadge, { backgroundColor: '#E8F6F5' }]}>
              <Text style={[styles.settledText, { color: '#006A66' }]}>Settled</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsFooter}>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.printSlipBtn, { backgroundColor: '#006A66' }]}
                onPress={handlePrintSlip}
              >
                <Ionicons name="print-outline" size={15} color="#FFFFFF" />
                <Text style={styles.printSlipBtnText}>Print Slip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.taxInvoiceBtn, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
                onPress={handleDownloadInvoice}
              >
                <Ionicons name="download-outline" size={15} color="#111D23" />
                <Text style={[styles.taxInvoiceBtnText, { color: '#111D23' }]}>Tax Invoice</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.refundBtn}
              onPress={() => {
                triggerFeedback.warning();
                alert(`Initiating partial refund or void for ${selectedOrder.orderNumber}`);
              }}
            >
              <Ionicons name="refresh-outline" size={14} color="#BA1A1A" />
              <Text style={[styles.refundBtnText, { color: '#BA1A1A' }]}>
                Initiate Void / Partial Refund
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    gap: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  headingCol: {
    maxWidth: 580,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  subheading: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 3,
    lineHeight: 18,
  },
  laneRangeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  laneRangeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  topRightControls: {
    alignItems: 'flex-end',
    gap: 10,
  },
  topRightRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topRightRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTabsGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  dateTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dateTabText: {
    fontSize: 12,
  },
  actionBtnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  manualOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
  },
  manualOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 190,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  kpiSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiTrend: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  kpiSubText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  kpiProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fulfillmentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fulfillmentText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  kpiSubMuted: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginLeft: 'auto',
  },
  refundRate: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  refundTotal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginLeft: 'auto',
    fontVariant: ['tabular-nums'],
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    flexWrap: 'wrap',
  },
  searchField: {
    flex: 1.5,
    minWidth: 240,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  dropdownLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  dropdownValue: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  funnelBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'column',
    gap: 14,
  },
  contentRowWide: {
    flexDirection: 'row',
  },
  ledgerCard: {
    flex: 2,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ledgerTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  entriesText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderBottomWidth: 1,
  },
  thText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    color: '#6D7A78',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 54,
    borderBottomWidth: 1,
  },
  orderIdCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeRowDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  orderIdText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  vipBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  vipBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  customerPhone: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  itemsCount: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  itemsUnit: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  mPesaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  methodText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  rowTotal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  actionIcon: {
    padding: 3,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  paginationCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  pageNumberText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  detailDrawer: {
    flex: 1.1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  drawerHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerOrderNum: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  drawerOrderMeta: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  completedText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  customerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  custName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  goldBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  goldBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  custMeta: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  cashierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  cashierLine: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  stationLine: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  itemsSection: {
    gap: 8,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemsSectionTitle: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  itemsQtyHeader: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  itemQtyFormula: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  itemSubtotal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  ledgerSummary: {
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sumLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  sumVal: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  grandTotalVal: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  paymentCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCardTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  paymentCardRef: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  settledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  settledText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  actionsFooter: {
    gap: 8,
    marginTop: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  printSlipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    gap: 6,
  },
  printSlipBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  taxInvoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  taxInvoiceBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    gap: 6,
  },
  refundBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
