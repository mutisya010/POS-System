import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';

interface ReturnItemLine {
  id: string;
  name: string;
  sku: string;
  origQty: number;
  unitPrice: number;
  returnQty: number;
  isSelected: boolean;
  reasonCode: string;
  disposition: 'Damaged / Discard' | 'Supplier RMA Return' | 'Keep with Customer' | 'Restocked';
  image: string;
}

interface AuditReturnRecord {
  rmaId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  dateTime: string;
  returnedItems: string;
  reasonCode: string;
  reasonColor: string;
  reasonBg: string;
  refundAmount: number;
  refundMode: 'M-Pesa' | 'Store Credit' | 'Cash';
  stockStatus: string;
  stockStatusBg: string;
  stockStatusColor: string;
  staff: string;
}

const SAMPLE_RETURN_LINES: ReturnItemLine[] = [
  {
    id: 'item-1',
    name: 'Cappuccino Deluxe',
    sku: 'SKU-BVG-9021',
    origQty: 2,
    unitPrice: 350.0,
    returnQty: 1,
    isSelected: true,
    reasonCode: 'Wrong Item',
    disposition: 'Damaged / Discard',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=120&q=80',
  },
  {
    id: 'item-2',
    name: 'Golden Fry Cooking Oil 1L',
    sku: 'SKU-GRO-4412',
    origQty: 1,
    unitPrice: 350.0,
    returnQty: 1,
    isSelected: true,
    reasonCode: 'Defective Seal',
    disposition: 'Supplier RMA Return',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&q=80',
  },
  {
    id: 'item-3',
    name: 'Highland Water 500ml',
    sku: 'SKU-BVG-1028',
    origQty: 3,
    unitPrice: 80.0,
    returnQty: 0,
    isSelected: false,
    reasonCode: '—',
    disposition: 'Keep with Customer',
    image: 'https://images.unsplash.com/photo-1559839914-1b333857e4e1?w=120&q=80',
  },
  {
    id: 'item-4',
    name: 'Artisan Bread Loaf',
    sku: 'SKU-BAK-7721',
    origQty: 1,
    unitPrice: 80.0,
    returnQty: 0,
    isSelected: false,
    reasonCode: '—',
    disposition: 'Keep with Customer',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&q=80',
  },
];

const RECENT_AUDIT_RETURNS: AuditReturnRecord[] = [
  {
    rmaId: 'RMA-4402',
    orderId: '#ORD-98416',
    customerName: 'Daniel Kiprop',
    customerPhone: '0700 889 123',
    dateTime: 'Today 14:10',
    returnedItems: '1x Brookside Milk 500ml',
    reasonCode: 'Expired Product',
    reasonBg: '#FFDAD6',
    reasonColor: '#BA1A1A',
    refundAmount: 65.0,
    refundMode: 'M-Pesa',
    stockStatus: 'Discarded',
    stockStatusBg: '#FFDAD6',
    stockStatusColor: '#BA1A1A',
    staff: 'John Doe',
  },
  {
    rmaId: 'RMA-4401',
    orderId: '#ORD-98380',
    customerName: 'Sarah Kimani',
    customerPhone: '0721 345 890',
    dateTime: 'Today 11:25',
    returnedItems: '1x Java House Blend 375g',
    reasonCode: 'Wrong Item Picked',
    reasonBg: '#E3F0F8',
    reasonColor: '#006A66',
    refundAmount: 350.0,
    refundMode: 'Store Credit',
    stockStatus: 'Restocked',
    stockStatusBg: '#E8F6F5',
    stockStatusColor: '#006A66',
    staff: 'Mercy C.',
  },
  {
    rmaId: 'RMA-4400',
    orderId: '#ORD-98312',
    customerName: 'Brian Ochieng',
    customerPhone: '0711 987 654',
    dateTime: 'Yesterday 16:45',
    returnedItems: '2x Dettol Herbal Soap',
    reasonCode: 'Changed Mind',
    reasonBg: '#E3F0F8',
    reasonColor: '#006A66',
    refundAmount: 840.0,
    refundMode: 'Cash',
    stockStatus: 'Restocked',
    stockStatusBg: '#E8F6F5',
    stockStatusColor: '#006A66',
    staff: 'John Doe',
  },
  {
    rmaId: 'RMA-4399',
    orderId: '#ORD-98290',
    customerName: 'Grace Njeri',
    customerPhone: '0799 112 233',
    dateTime: '23 Oct 2024',
    returnedItems: '1x Mumias Sugar 1kg',
    reasonCode: 'Packaging Torn',
    reasonBg: '#FEF6EC',
    reasonColor: '#F2A541',
    refundAmount: 180.0,
    refundMode: 'Cash',
    stockStatus: 'Damaged Bin',
    stockStatusBg: '#FEF6EC',
    stockStatusColor: '#F2A541',
    staff: 'Kelvin M.',
  },
  {
    rmaId: 'RMA-4398',
    orderId: '#ORD-98244',
    customerName: 'Walk-in Customer',
    customerPhone: 'Anonymous Checkout',
    dateTime: '22 Oct 2024',
    returnedItems: '1x Elianto Pure Corn Oil 1L',
    reasonCode: 'Counterfeit Seal',
    reasonBg: '#FFDAD6',
    reasonColor: '#BA1A1A',
    refundAmount: 460.0,
    refundMode: 'M-Pesa',
    stockStatus: 'Pending Lab',
    stockStatusBg: '#E3F0F8',
    stockStatusColor: '#6D7A78',
    staff: 'Mgr Approved',
  },
];

export const ReturnsScreen: React.FC = () => {
  const { theme } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1180;

  const [returnItems, setReturnItems] = useState<ReturnItemLine[]>(SAMPLE_RETURN_LINES);
  const [refundDestination, setRefundDestination] = useState<'mpesa' | 'cash' | 'credit' | 'card'>('mpesa');
  const [searchReceipt, setSearchReceipt] = useState('#ORD-98420');
  const [phoneNumber, setPhoneNumber] = useState('0722 123 456');
  const [auditNotes, setAuditNotes] = useState(
    'Customer brought back unopened oil with cracked neck seal. Coffee replaced with store credit earlier.'
  );

  // Filter state for bottom table
  const [auditFilterText, setAuditFilterText] = useState('');
  const [reasonDropdown, setReasonDropdown] = useState('All Reasons');
  const [statusDropdown, setStatusDropdown] = useState('All Statuses');

  const toggleItemSelect = (id: string) => {
    triggerFeedback.tap();
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextSelected = !item.isSelected;
          return {
            ...item,
            isSelected: nextSelected,
            returnQty: nextSelected ? 1 : 0,
            disposition: nextSelected ? 'Damaged / Discard' : 'Keep with Customer',
          };
        }
        return item;
      })
    );
  };

  const updateItemQty = (id: string, delta: number) => {
    triggerFeedback.tap();
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextQty = Math.max(0, Math.min(item.origQty, item.returnQty + delta));
          return {
            ...item,
            returnQty: nextQty,
            isSelected: nextQty > 0,
            disposition: nextQty > 0 ? item.disposition : 'Keep with Customer',
          };
        }
        return item;
      })
    );
  };

  const selectedItems = returnItems.filter((i) => i.isSelected && i.returnQty > 0);
  const grossRefund = selectedItems.reduce((sum, i) => sum + i.returnQty * i.unitPrice, 0);
  const vatAdjustment = (grossRefund * 0.16) / 1.16;
  const netRefundPayable = grossRefund;

  const handleAuthorizeRefund = async () => {
    triggerFeedback.success();
    const slipHtml = `
      <html>
        <head>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 320px; margin: 0 auto; color: #111; font-size: 12px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #333; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
          </style>
        </head>
        <body>
          <div class="center bold">LANDMARK STORES POS</div>
          <div class="center">REVERSE LOGISTICS & REFUND CREDIT</div>
          <div class="center">RMA REFUND VOUCHER #RMA-4403</div>
          <div class="line"></div>
          <div class="row"><span>Original Order:</span><span class="bold">#ORD-98420</span></div>
          <div class="row"><span>Customer:</span><span>Wanjiku Mwangi</span></div>
          <div class="row"><span>Tender:</span><span>M-Pesa B2C Instant</span></div>
          <div class="row"><span>Target Phone:</span><span>${phoneNumber}</span></div>
          <div class="line"></div>
          <div class="bold">RETURNED MERCHANDISE:</div>
          ${selectedItems
            .map(
              (i) => `
            <div class="row">
              <span>${i.returnQty}x ${i.name}</span>
              <span class="bold">KSh ${(i.returnQty * i.unitPrice).toFixed(2)}</span>
            </div>
            <div style="font-size: 10px; color: #555;">[${i.disposition}]</div>
          `
            )
            .join('')}
          <div class="line"></div>
          <div class="row"><span>Gross Value:</span><span>KSh ${grossRefund.toFixed(2)}</span></div>
          <div class="row"><span>VAT 16% Restitution:</span><span>-KSh ${vatAdjustment.toFixed(2)}</span></div>
          <div class="line"></div>
          <div class="row bold" style="font-size: 15px;"><span>NET REFUND ISSUED:</span><span>KSh ${netRefundPayable.toFixed(2)}</span></div>
          <div class="line"></div>
          <div class="center">SAFARICOM B2C TRANSACTION DISPATCHED</div>
          <div class="center">THANK YOU FOR SHOPPING AT LANDMARK STORES</div>
        </body>
      </html>
    `;
    try {
      await Print.printAsync({ html: slipHtml });
    } catch (e) {
      console.warn(e);
    }
  };

  const filteredAuditRecords = RECENT_AUDIT_RETURNS.filter((r) => {
    const q = auditFilterText.toLowerCase().trim();
    const matchQ =
      q === '' ||
      r.rmaId.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerPhone.includes(q);
    const matchReason = reasonDropdown === 'All Reasons' || r.reasonCode.includes(reasonDropdown);
    return matchQ && matchReason;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F4FAFF' }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Toolbar */}
      <View style={styles.topHeader}>
        <View style={styles.headingCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="apps-outline" size={13} color="#006A66" />
            <Text style={[styles.tagline, { color: '#006A66' }]}>OPERATIONAL REGISTER CONSOLE</Text>
          </View>
          <Text style={[styles.heading, { color: '#111D23' }]}>Returns &amp; Refunds Management</Text>
          <Text style={[styles.subheading, { color: '#3D4948' }]}>
            Verify customer receipts, authorize merchandise returns, inspect condition, and process instant refunds via M-Pesa, Cash, or Store Credit.
          </Text>
        </View>

        {/* Top-Right Action Buttons */}
        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={[styles.btnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              triggerFeedback.tap();
              alert('Policy: Perishables returnable within 24h. Non-perishables within 30 days with receipt.');
            }}
          >
            <Ionicons name="document-text-outline" size={14} color="#111D23" />
            <Text style={[styles.btnWhiteText, { color: '#111D23' }]}>Policy Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              triggerFeedback.tap();
              alert('Exporting Returns & Refunds Audit Log to CSV/Excel...');
            }}
          >
            <Ionicons name="download-outline" size={14} color="#111D23" />
            <Text style={[styles.btnWhiteText, { color: '#111D23' }]}>Export Return Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnNewRma, { backgroundColor: '#006A66' }]}
            onPress={() => {
              triggerFeedback.tap();
              setSearchReceipt('');
            }}
          >
            <Ionicons name="add-circle" size={16} color="#FFFFFF" />
            <Text style={styles.btnNewRmaText}>+ New Return RMA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Four Operational KPI Cards */}
      <View style={styles.kpiRow}>
        {/* Total Returns (Month) */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>TOTAL RETURNS (MONTH)</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="swap-horizontal-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.kpiValueLarge, { color: '#111D23' }]}>84</Text>
            <Text style={[styles.kpiValueSub, { color: '#111D23' }]}>Returns</Text>
          </View>
          <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>↗+3.2% vs last month (81)</Text>
        </View>

        {/* Pending Inspection */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>PENDING INSPECTION</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF6EC' }]}>
              <Ionicons name="briefcase-outline" size={16} color="#F2A541" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.kpiValueLarge, { color: '#111D23' }]}>6</Text>
            <Text style={[styles.kpiValueSub, { color: '#111D23' }]}>Requests</Text>
          </View>
          <View style={styles.alertSubRow}>
            <View style={[styles.alertBadge, { backgroundColor: '#FEF6EC' }]}>
              <Text style={[styles.alertBadgeText, { color: '#F2A541' }]}>Alert</Text>
            </View>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>3 awaiting manager override</Text>
          </View>
        </View>

        {/* Approved & Restocked */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>APPROVED &amp; RESTOCKED</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="cube-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.kpiValueLarge, { color: '#111D23' }]}>72</Text>
            <Text style={[styles.kpiValueSub, { color: '#111D23' }]}>Restocked</Text>
          </View>
          <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>@91.8% restock resolution rate</Text>
        </View>

        {/* Total Refunded Value */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>TOTAL REFUNDED VALUE</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="wallet-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValueLarge, { color: '#111D23', marginVertical: 4 }]}>
            KSh 148,650.00
          </Text>
          <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>
            M-Pesa 68% • Cash 24% • Credit...
          </Text>
        </View>
      </View>

      {/* 3. Top Processing Terminal Split Section: Left Line Items & Right Settlement Rail */}
      <View style={[styles.processRow, isWide && styles.processRowWide]}>
        {/* Left Column: Process New Return / Exchange */}
        <View style={[styles.processCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Card Header */}
          <View style={styles.processHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="document-text-outline" size={16} color="#111D23" />
              <Text style={[styles.processTitle, { color: '#111D23' }]}>Process New Return / Exchange</Text>
            </View>

            <View style={[styles.scannerArmedBadge, { backgroundColor: '#E8F6F5' }]}>
              <View style={[styles.greenDot, { backgroundColor: '#32B67A' }]} />
              <Text style={[styles.scannerArmedText, { color: '#006A66' }]}>Receipt Scanner Armed</Text>
            </View>
          </View>

          {/* Receipt Lookup Bar */}
          <View style={styles.lookupBar}>
            <View style={[styles.lookupInputWrap, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
              <Ionicons name="barcode-outline" size={16} color="#6D7A78" />
              <TextInput
                style={[styles.lookupInput, { color: '#111D23' }]}
                value={searchReceipt}
                onChangeText={setSearchReceipt}
                placeholder="Scan or enter Receipt #ORD-..."
              />
              {searchReceipt ? (
                <TouchableOpacity onPress={() => setSearchReceipt('')}>
                  <Ionicons name="close" size={16} color="#8A969B" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity style={[styles.btnLookup, { backgroundColor: '#006A66' }]}>
              <Ionicons name="search" size={14} color="#FFFFFF" />
              <Text style={styles.btnLookupText}>Lookup Order</Text>
            </TouchableOpacity>
          </View>

          {/* Verified Order Banner matching screenshot */}
          <View style={[styles.verifiedOrderBanner, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 }}>
              <Ionicons name="shield-checkmark" size={18} color="#006A66" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={[styles.orderNumTitle, { color: '#111D23' }]}>#ORD-98420</Text>
                  <View style={[styles.laneBadge, { backgroundColor: '#E3F0F8' }]}>
                    <Text style={[styles.laneBadgeText, { color: '#006A66' }]}>
                      Lane #01 • Cashier John Doe
                    </Text>
                  </View>
                  <View style={[styles.goldBadge, { backgroundColor: '#FEF6EC' }]}>
                    <Text style={[styles.goldBadgeText, { color: '#F2A541' }]}>Gold VIP</Text>
                  </View>
                </View>
                <Text style={[styles.customerLine, { color: '#6D7A78' }]}>
                  Customer: <Text style={{ color: '#111D23', fontWeight: '600' }}>Wanjiku Mwangi (0722 123 456)</Text> • Purchased: Oct 25, 2024, 14:42 EAT
                </Text>
              </View>
            </View>

            <View style={[styles.eligibleBadge, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <Text style={[styles.eligibleBadgeText, { color: '#111D23' }]}>Eligible (Day 2 of 30)</Text>
            </View>
          </View>

          {/* Select Items for Restock & Refund Section */}
          <View style={styles.itemsSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 }}>
              <View>
                <Text style={[styles.sectionTitle, { color: '#111D23' }]}>Select Items for Restock &amp; Refund</Text>
                <Text style={[styles.sectionSub, { color: '#6D7A78' }]}>
                  Check items returned by customer, designate disposition status, and select reason code.
                </Text>
              </View>
              <View style={[styles.markedBadge, { backgroundColor: '#E8F6F5' }]}>
                <Text style={[styles.markedBadgeText, { color: '#006A66' }]}>2 of 4 Line Items Marked</Text>
              </View>
            </View>

            {/* Table Header */}
            <View style={[styles.itemsTblHeader, { backgroundColor: '#F4FAFF' }]}>
              <Text style={[styles.th, { width: 50, textAlign: 'center' }]}>SELECT</Text>
              <Text style={[styles.th, { flex: 2 }]}>PURCHASED ITEM &amp; SKU</Text>
              <Text style={[styles.th, { width: 95, textAlign: 'center' }]}>QTY TO RETURN</Text>
              <Text style={[styles.th, { width: 95, textAlign: 'center' }]}>RETURN REASON CODE</Text>
              <Text style={[styles.th, { width: 130, textAlign: 'right' }]}>PHYSICAL DISPOSITION</Text>
            </View>

            {/* Line Items */}
            {returnItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  { borderBottomColor: '#E8ECEF' },
                  item.isSelected && { backgroundColor: '#FAFCFD' },
                ]}
              >
                {/* Select Checkbox */}
                <TouchableOpacity
                  style={{ width: 50, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => toggleItemSelect(item.id)}
                >
                  <Ionicons
                    name={item.isSelected ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={item.isSelected ? '#006A66' : '#8A969B'}
                  />
                </TouchableOpacity>

                {/* Purchased Item & SKU */}
                <View style={[styles.itemDetailCell, { flex: 2 }]}>
                  <Image source={{ uri: item.image }} style={styles.itemThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: '#111D23' }]}>{item.name}</Text>
                    <Text style={[styles.itemSku, { color: '#6D7A78' }]}>
                      {item.sku} • Orig: {item.origQty} @ KSh {item.unitPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Qty Stepper */}
                <View style={{ width: 95, alignItems: 'center' }}>
                  {item.isSelected ? (
                    <View style={[styles.stepperWrap, { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' }]}>
                      <TouchableOpacity onPress={() => updateItemQty(item.id, -1)} style={styles.stepBtn}>
                        <Text style={styles.stepBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.stepValText, { color: '#111D23' }]}>{item.returnQty}</Text>
                      <TouchableOpacity onPress={() => updateItemQty(item.id, 1)} style={styles.stepBtn}>
                        <Text style={styles.stepBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={[styles.zeroQtyText, { color: '#8A969B' }]}>0 of {item.origQty}</Text>
                  )}
                </View>

                {/* Return Reason Code Dropdown */}
                <View style={{ width: 95, alignItems: 'center' }}>
                  {item.isSelected ? (
                    <TouchableOpacity style={[styles.reasonSelect, { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' }]}>
                      <Text style={[styles.reasonSelectText, { color: '#111D23' }]}>{item.reasonCode.substring(0, 5)}...</Text>
                      <Ionicons name="chevron-down" size={11} color="#6D7A78" />
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ color: '#8A969B' }}>—</Text>
                  )}
                </View>

                {/* Physical Disposition Chip */}
                <View style={{ width: 130, alignItems: 'flex-end' }}>
                  {item.disposition === 'Damaged / Discard' ? (
                    <View style={[styles.dispBadge, { backgroundColor: '#FFDAD6' }]}>
                      <Ionicons name="trash-outline" size={11} color="#BA1A1A" />
                      <Text style={[styles.dispBadgeText, { color: '#BA1A1A' }]}>Damaged / Discard</Text>
                    </View>
                  ) : item.disposition === 'Supplier RMA Return' ? (
                    <View style={[styles.dispBadge, { backgroundColor: '#FEF6EC' }]}>
                      <Ionicons name="return-down-back" size={11} color="#F2A541" />
                      <Text style={[styles.dispBadgeText, { color: '#F2A541' }]}>Supplier RMA Return</Text>
                    </View>
                  ) : (
                    <Text style={[styles.keepText, { color: '#8A969B' }]}>Keep with Customer</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Bottom Policy Callout Box matching screenshot */}
          <View style={[styles.policyCallout, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#006A66" />
              <Text style={[styles.calloutText, { color: '#6D7A78' }]}>
                Supervisor authorization code required if refund exceed KSh 2,500.00 or spans perishable categories.
              </Text>
            </View>
            <Text style={[styles.policyStandardText, { color: '#006A66' }]}>
              Policy: Active Standard
            </Text>
          </View>
        </View>

        {/* Right Rail: Refund Settlement Studio Drawer */}
        <View style={[styles.settlementCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Header */}
          <View style={styles.settleHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="return-down-back" size={16} color="#006A66" />
              <Text style={[styles.settleTitle, { color: '#111D23' }]}>Refund Settlement</Text>
            </View>
            <View style={[styles.rmaDraftBadge, { backgroundColor: '#E8F6F5' }]}>
              <Text style={[styles.rmaDraftText, { color: '#006A66' }]}>RMA-Draft</Text>
            </View>
          </View>

          <Text style={[styles.subStepLabel, { color: '#6D7A78' }]}>SELECT REFUND DESTINATION</Text>

          {/* 2x2 Grid of Tender Buttons */}
          <View style={styles.tendersGrid}>
            <TouchableOpacity
              style={[
                styles.tenderBtn,
                refundDestination === 'mpesa'
                  ? { backgroundColor: '#E8F6F5', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setRefundDestination('mpesa')}
            >
              <Ionicons name="phone-portrait-outline" size={16} color={refundDestination === 'mpesa' ? '#006A66' : '#263238'} />
              <Text style={[styles.tenderTitle, { color: '#111D23' }]}>M-Pesa Reversal</Text>
              <Text style={[styles.tenderSub, { color: '#6D7A78' }]}>Instant API Dispatch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tenderBtn,
                refundDestination === 'cash'
                  ? { backgroundColor: '#E8F6F5', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setRefundDestination('cash')}
            >
              <Ionicons name="cash-outline" size={16} color="#263238" />
              <Text style={[styles.tenderTitle, { color: '#111D23' }]}>Cash Drawer</Text>
              <Text style={[styles.tenderSub, { color: '#6D7A78' }]}>Till Register #01</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tenderBtn,
                refundDestination === 'credit'
                  ? { backgroundColor: '#E8F6F5', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setRefundDestination('credit')}
            >
              <Ionicons name="ticket-outline" size={16} color="#263238" />
              <Text style={[styles.tenderTitle, { color: '#111D23' }]}>Store Credit</Text>
              <Text style={[styles.tenderSub, { color: '#6D7A78' }]}>Print Gift Voucher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tenderBtn,
                refundDestination === 'card'
                  ? { backgroundColor: '#E8F6F5', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setRefundDestination('card')}
            >
              <Ionicons name="card-outline" size={16} color="#263238" />
              <Text style={[styles.tenderTitle, { color: '#111D23' }]}>Original Card</Text>
              <Text style={[styles.tenderSub, { color: '#6D7A78' }]}>Via Bank Gateway</Text>
            </TouchableOpacity>
          </View>

          {/* M-Pesa B2C Target Details Box */}
          <View style={[styles.b2cBox, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="phone-portrait-outline" size={14} color="#006A66" />
                <Text style={[styles.b2cTitle, { color: '#111D23' }]}>M-Pesa B2C Target</Text>
              </View>
              <Text style={[styles.verifiedSafaricom, { color: '#32B67A' }]}>Verified Safaricom</Text>
            </View>

            <Text style={[styles.b2cLabel, { color: '#6D7A78', marginTop: 6 }]}>Phone Number</Text>
            <TextInput
              style={[styles.phoneInput, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF', color: '#111D23' }]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <Text style={[styles.b2cLabel, { color: '#6D7A78', marginTop: 6 }]}>Recipient Identity (National ID / MPESA)</Text>
            <Text style={[styles.b2cName, { color: '#111D23' }]}>Wanjiku Mwangi</Text>
          </View>

          {/* Cashier Audit Notes */}
          <View style={{ gap: 4 }}>
            <Text style={[styles.notesLabel, { color: '#6D7A78' }]}>CASHIER AUDIT NOTES</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF', color: '#111D23' }]}
              value={auditNotes}
              onChangeText={setAuditNotes}
              multiline
            />
          </View>

          {/* Calculation Ledger */}
          <View style={[styles.ledgerSummary, { borderTopColor: '#E8ECEF' }]}>
            <View style={styles.summaryLine}>
              <Text style={[styles.sumLabel, { color: '#6D7A78' }]}>Gross Returned Value ({selectedItems.length} items)</Text>
              <Text style={[styles.sumVal, { color: '#111D23' }]}>KSh {grossRefund.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryLine}>
              <Text style={[styles.sumLabel, { color: '#6D7A78' }]}>Tax (16% VAT Adjusted)</Text>
              <Text style={[styles.sumVal, { color: '#BA1A1A' }]}>-KSh {vatAdjustment.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryLine}>
              <Text style={[styles.sumLabel, { color: '#6D7A78' }]}>Restocking Restitution Fee</Text>
              <Text style={[styles.sumVal, { color: '#111D23' }]}>KSh 0.00 <Text style={{ color: '#8A969B' }}>(Waived)</Text></Text>
            </View>

            {/* Net Refund Payable */}
            <View style={[styles.netRefundCard, { borderTopColor: '#E8ECEF' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.netRefundLabel, { color: '#6D7A78' }]}>NET REFUND PAYABLE</Text>
                <View style={[styles.immediateBadge, { backgroundColor: '#90F0EA' }]}>
                  <Text style={[styles.immediateBadgeText, { color: '#006A66' }]}>Immediate</Text>
                </View>
              </View>
              <Text style={[styles.netRefundNumber, { color: '#006A66' }]}>
                KSh {netRefundPayable.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.btnAuthorize, { backgroundColor: '#006A66' }]}
            onPress={handleAuthorizeRefund}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.btnAuthorizeText}>
              Authorize &amp; Issue Refund (KSh {netRefundPayable.toFixed(2)})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnDiscard} onPress={() => triggerFeedback.tap()}>
            <Ionicons name="close-circle-outline" size={14} color="#8A969B" />
            <Text style={[styles.btnDiscardText, { color: '#6D7A78' }]}>Discard / Cancel Return</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Bottom Audit Table Section: "Recent Returns & Dispositions" matching screenshot */}
      <View style={[styles.bottomAuditCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
        {/* Header with Search and Dropdowns */}
        <View style={styles.auditHeaderRow}>
          <View>
            <Text style={[styles.auditTableTitle, { color: '#111D23' }]}>
              Recent Returns &amp; Dispositions
            </Text>
            <Text style={[styles.auditTableSub, { color: '#6D7A78' }]}>
              Comprehensive audit trail of customer returns across all Nairobi registers.
            </Text>
          </View>

          {/* Search and Filter Dropdowns */}
          <View style={styles.auditFilterCluster}>
            <View style={[styles.auditSearchWrap, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
              <Ionicons name="filter" size={13} color="#6D7A78" />
              <TextInput
                style={[styles.auditSearchInput, { color: '#111D23' }]}
                placeholder="Filter RMA or order..."
                placeholderTextColor="#8A969B"
                value={auditFilterText}
                onChangeText={setAuditFilterText}
              />
            </View>

            <TouchableOpacity style={[styles.auditDropdown, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
              <Text style={[styles.auditDropdownText, { color: '#111D23' }]}>{reasonDropdown}</Text>
              <Ionicons name="chevron-down" size={12} color="#6D7A78" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.auditDropdown, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
              <Text style={[styles.auditDropdownText, { color: '#111D23' }]}>{statusDropdown}</Text>
              <Ionicons name="chevron-down" size={12} color="#6D7A78" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnRefresh, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
              <Ionicons name="refresh" size={14} color="#6D7A78" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Audit Table */}
        <View style={[styles.auditTableWrapper, { borderColor: '#E8ECEF' }]}>
          <View style={[styles.tblHeaderRow, { backgroundColor: '#F4FAFF' }]}>
            <Text style={[styles.auditTh, { width: 75 }]}>RMA ID</Text>
            <Text style={[styles.auditTh, { width: 85 }]}>ORIGINAL ORDER</Text>
            <Text style={[styles.auditTh, { flex: 1.4 }]}>CUSTOMER</Text>
            <Text style={[styles.auditTh, { width: 85 }]}>DATE &amp; TIME</Text>
            <Text style={[styles.auditTh, { flex: 1.5 }]}>RETURNED ITEMS</Text>
            <Text style={[styles.auditTh, { width: 110 }]}>REASON CODE</Text>
            <Text style={[styles.auditTh, { width: 85, textAlign: 'right' }]}>REFUND AMOUNT</Text>
            <Text style={[styles.auditTh, { width: 85, textAlign: 'center' }]}>REFUND MODE</Text>
            <Text style={[styles.auditTh, { width: 95, textAlign: 'center' }]}>STOCK STATUS</Text>
            <Text style={[styles.auditTh, { width: 80 }]}>STAFF</Text>
            <Text style={[styles.auditTh, { width: 65, textAlign: 'right' }]}>ACTION</Text>
          </View>

          {filteredAuditRecords.map((item, idx) => (
            <View
              key={item.rmaId}
              style={[
                styles.auditRow,
                { borderBottomColor: '#E8ECEF' },
                idx % 2 === 1 && { backgroundColor: '#FAFCFD' },
              ]}
            >
              <Text style={[styles.cellBold, { width: 75, color: '#111D23' }]}>{item.rmaId}</Text>
              <Text style={[styles.cellLink, { width: 85, color: '#006A66' }]}>{item.orderId}</Text>

              <View style={{ flex: 1.4 }}>
                <Text style={[styles.cellBold, { color: '#111D23' }]}>{item.customerName}</Text>
                <Text style={[styles.cellSub, { color: '#8A969B' }]}>{item.customerPhone}</Text>
              </View>

              <Text style={[styles.cellSub, { width: 85, color: '#111D23' }]}>{item.dateTime}</Text>
              <Text style={[styles.cellRegular, { flex: 1.5, color: '#111D23' }]}>{item.returnedItems}</Text>

              <View style={{ width: 110 }}>
                <View style={[styles.auditBadge, { backgroundColor: item.reasonBg }]}>
                  <Text style={[styles.auditBadgeText, { color: item.reasonColor }]} numberOfLines={1}>
                    {item.reasonCode}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cellBold, { width: 85, textAlign: 'right', color: '#111D23' }]}>
                KSh {item.refundAmount.toFixed(2)}
              </Text>

              <View style={{ width: 85, alignItems: 'center' }}>
                <Text style={[styles.cellSub, { color: '#006A66', fontWeight: '600' }]}>{item.refundMode}</Text>
              </View>

              <View style={{ width: 95, alignItems: 'center' }}>
                <View style={[styles.auditBadge, { backgroundColor: item.stockStatusBg }]}>
                  <Text style={[styles.auditBadgeText, { color: item.stockStatusColor }]}>
                    {item.stockStatus}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cellSub, { width: 80, color: '#6D7A78' }]}>{item.staff}</Text>

              <TouchableOpacity style={{ width: 65, alignItems: 'flex-end' }}>
                <Text style={[styles.viewSlipText, { color: '#006A66' }]}>View Slip</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.tableFooterRow}>
          <Text style={[styles.footerCountText, { color: '#8A969B' }]}>
            Showing 1 - 5 of 84 recorded transactions (October 2024)
          </Text>

          <View style={styles.paginationCluster}>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <Text style={{ color: '#6D7A78' }}>&lt;</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#006A66' }]}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <Text style={{ color: '#111D23' }}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <Text style={{ color: '#111D23' }}>3</Text>
            </TouchableOpacity>
            <Text style={{ color: '#8A969B' }}>...</Text>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <Text style={{ color: '#111D23' }}>17</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <Text style={{ color: '#6D7A78' }}>&gt;</Text>
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
    maxWidth: 620,
  },
  tagline: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
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
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnWhiteText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  btnNewRma: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
  },
  btnNewRmaText: {
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
    minWidth: 200,
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
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValueLarge: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiValueSub: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  kpiSubMuted: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  alertSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  alertBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  processRow: {
    flexDirection: 'column',
    gap: 16,
  },
  processRowWide: {
    flexDirection: 'row',
  },
  processCard: {
    flex: 1.8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  processHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  processTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  scannerArmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  scannerArmedText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  lookupBar: {
    flexDirection: 'row',
    gap: 8,
  },
  lookupInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  lookupInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  btnLookup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 8,
  },
  btnLookupText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  verifiedOrderBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  orderNumTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  laneBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  laneBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  goldBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goldBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  customerLine: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  eligibleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  eligibleBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  itemsSection: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  markedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  markedBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  itemsTblHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  th: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    color: '#6D7A78',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  itemDetailCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  itemName: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  itemSku: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    height: 28,
  },
  stepBtn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111D23',
  },
  stepValText: {
    width: 20,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  zeroQtyText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  reasonSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
  },
  reasonSelectText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  dispBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  dispBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  keepText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  policyCallout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  calloutText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  policyStandardText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  settlementCard: {
    flex: 1.2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  settleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settleTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  rmaDraftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rmaDraftText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  subStepLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  tendersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tenderBtn: {
    flex: 1,
    minWidth: '47%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  tenderTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
  },
  tenderSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  b2cBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 2,
  },
  b2cTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  verifiedSafaricom: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  b2cLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  phoneInput: {
    height: 34,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  b2cName: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginTop: 1,
  },
  notesLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  notesInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
  },
  ledgerSummary: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
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
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  netRefundCard: {
    borderTopWidth: 1,
    paddingTop: 6,
    marginTop: 4,
  },
  netRefundLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  immediateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  immediateBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  netRefundNumber: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  btnAuthorize: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 8,
    marginTop: 4,
  },
  btnAuthorizeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  btnDiscard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  btnDiscardText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  bottomAuditCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  auditTableTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  auditTableSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  auditFilterCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  auditSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
  },
  auditSearchInput: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    width: 140,
  },
  auditDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
  },
  auditDropdownText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  btnRefresh: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditTableWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tblHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  auditTh: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    color: '#6D7A78',
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cellBold: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  cellLink: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  cellRegular: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  cellSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  auditBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  auditBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  viewSlipText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  tableFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  footerCountText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  paginationCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
