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
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';

export interface CustomerPatron {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  avatar: string;
  tier: 'Gold VIP' | 'Silver' | 'Bronze';
  ordersCount: number;
  totalSpend: number;
  storeCredit: number;
  redeemablePoints: number;
  preferredStore: string;
  frequentlyPurchased: { name: string; icon: any }[];
  recentReceipts: {
    receiptNo: string;
    date: string;
    register: string;
    amount: number;
    pointsDelta: string;
    isExchange?: boolean;
    returnedNote?: string;
  }[];
}

const SAMPLE_PATRONS: CustomerPatron[] = [
  {
    id: 'cust-1',
    name: 'Wanjiku Mwangi',
    code: 'CUST-8021',
    phone: '0722 123 456',
    email: 'wanjiku@example.co.ke',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    tier: 'Gold VIP',
    ordersCount: 28,
    totalSpend: 96400.0,
    storeCredit: 10000.0,
    redeemablePoints: 3420,
    preferredStore: 'Nairobi CBD Flagship',
    frequentlyPurchased: [
      { name: 'Cappuccino Deluxe', icon: 'cafe-outline' },
      { name: 'Tusker Malt 500ml', icon: 'beer-outline' },
      { name: 'Bio Fresh Milk 1L', icon: 'water-outline' },
    ],
    recentReceipts: [
      {
        receiptNo: '#LM-90281',
        date: 'Today, 11:20 AM',
        register: 'Register #01',
        amount: 3450.0,
        pointsDelta: '+34 pts',
      },
      {
        receiptNo: '#LM-89744',
        date: '14 Oct, 04:45 PM',
        register: 'Register #03',
        amount: 8920.0,
        pointsDelta: '+89 pts',
      },
      {
        receiptNo: '#LM-88120',
        date: '02 Oct, 01:15 PM',
        register: 'Exchange',
        amount: 0.0,
        pointsDelta: 'Returned 1 SKU',
        isExchange: true,
        returnedNote: 'Returned 1 SKU',
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'Brian Ochieng',
    code: 'CUST-6102',
    phone: '0711 987 654',
    email: 'bochieng@techsafari.ke',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    tier: 'Silver',
    ordersCount: 15,
    totalSpend: 42150.0,
    storeCredit: 2500.0,
    redeemablePoints: 1250,
    preferredStore: 'Westlands Mall Branch',
    frequentlyPurchased: [
      { name: 'Java House Kenya Blend', icon: 'cafe-outline' },
      { name: 'Golden Fry Cooking Oil 2L', icon: 'nutrition-outline' },
    ],
    recentReceipts: [
      {
        receiptNo: '#LM-89912',
        date: 'Yesterday, 03:10 PM',
        register: 'Register #02',
        amount: 2450.0,
        pointsDelta: '+24 pts',
      },
    ],
  },
  {
    id: 'cust-3',
    name: 'Sarah Kimani',
    code: 'CUST-4919',
    phone: '0721 345 890',
    email: 'skimani@mediaedge.co.ke',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    tier: 'Gold VIP',
    ordersCount: 34,
    totalSpend: 112800.0,
    storeCredit: 0.0,
    redeemablePoints: 4890,
    preferredStore: 'Nairobi CBD Flagship',
    frequentlyPurchased: [
      { name: 'Artisan Bread Loaf', icon: 'fast-food-outline' },
      { name: 'Highland Mineral Water', icon: 'water-outline' },
    ],
    recentReceipts: [
      {
        receiptNo: '#LM-89542',
        date: 'Oct 24, 02:29 PM',
        register: 'Register #01',
        amount: 5120.0,
        pointsDelta: '+51 pts',
      },
    ],
  },
  {
    id: 'cust-4',
    name: 'Amina Hassan',
    code: 'CUST-3882',
    phone: '0733 445 566',
    email: 'amina.hassan@coastalcorp.co.ke',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    tier: 'Bronze',
    ordersCount: 9,
    totalSpend: 19450.0,
    storeCredit: 0.0,
    redeemablePoints: 680,
    preferredStore: 'Mombasa Road Staging',
    frequentlyPurchased: [
      { name: 'Mumias Pure Sugar 1kg', icon: 'cube-outline' },
      { name: 'Kericho Gold Pure Black Tea', icon: 'cafe-outline' },
    ],
    recentReceipts: [
      {
        receiptNo: '#LM-89110',
        date: 'Oct 22, 10:40 AM',
        register: 'Register #04',
        amount: 8740.0,
        pointsDelta: '+87 pts',
      },
    ],
  },
  {
    id: 'cust-5',
    name: 'David Mutua',
    code: 'CUST-2194',
    phone: '0700 882 199',
    email: 'david.mutua@consult.co.ke',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    tier: 'Silver',
    ordersCount: 18,
    totalSpend: 53200.0,
    storeCredit: 1200.0,
    redeemablePoints: 1840,
    preferredStore: 'Kilimani Express',
    frequentlyPurchased: [
      { name: 'Dark Roast Beans 500g', icon: 'cafe-outline' },
      { name: 'Deli Club Sandwich', icon: 'fast-food-outline' },
    ],
    recentReceipts: [
      {
        receiptNo: '#LM-88890',
        date: 'Oct 19, 05:15 PM',
        register: 'Register #02',
        amount: 3200.0,
        pointsDelta: '+32 pts',
      },
    ],
  },
  {
    id: 'cust-6',
    name: 'Grace Njeri',
    code: 'CUST-1890',
    phone: '0799 112 233',
    email: 'grace.njeri@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    tier: 'Bronze',
    ordersCount: 4,
    totalSpend: 8620.0,
    storeCredit: 0.0,
    redeemablePoints: 310,
    preferredStore: 'Nairobi CBD Flagship',
    frequentlyPurchased: [
      { name: 'Fresh Orange Juice 500ml', icon: 'water-outline' },
      { name: 'Macadamia Choc Cookies', icon: 'nutrition-outline' },
    ],
    recentReceipts: [
      {
        receiptNo: '#LM-88214',
        date: 'Oct 12, 09:30 AM',
        register: 'Register #01',
        amount: 1450.0,
        pointsDelta: '+14 pts',
      },
    ],
  },
];

interface CustomersScreenProps {
  onStartSaleWithCustomer?: (patron: CustomerPatron) => void;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({ onStartSaleWithCustomer }) => {
  const { theme } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;

  const [patrons, setPatrons] = useState<CustomerPatron[]>(SAMPLE_PATRONS);
  const [selectedPatron, setSelectedPatron] = useState<CustomerPatron>(SAMPLE_PATRONS[0]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [statusFilter, setStatusFilter] = useState('Status: All');
  const [quickFilter, setQuickFilter] = useState<'all' | 'high_spend' | 'visited_week' | 'credit'>('all');
  const [smsNote, setSmsNote] = useState('');
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // New customer form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTier, setFormTier] = useState<'Gold VIP' | 'Silver' | 'Bronze'>('Silver');

  const filteredPatrons = patrons.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchQ =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q);

    const matchTier = tierFilter === 'All Tiers' || p.tier === tierFilter;

    let matchQuick = true;
    if (quickFilter === 'high_spend') matchQuick = p.totalSpend >= 50000;
    if (quickFilter === 'credit') matchQuick = p.storeCredit > 0;
    if (quickFilter === 'visited_week') matchQuick = p.ordersCount >= 10;

    return matchQ && matchTier && matchQuick;
  });

  const handleSendSMS = () => {
    if (!smsNote.trim()) return;
    triggerFeedback.success();
    alert(`SMS notice dispatched to ${selectedPatron.phone}: "${smsNote}"`);
    setSmsNote('');
  };

  const handleAddNewPatron = () => {
    if (!formName.trim() || !formPhone.trim()) {
      triggerFeedback.warning();
      alert('Please fill in customer name and phone number.');
      return;
    }

    const newPatron: CustomerPatron = {
      id: `cust-${Date.now()}`,
      name: formName.trim(),
      code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: formPhone.trim(),
      email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      tier: formTier,
      ordersCount: 0,
      totalSpend: 0,
      storeCredit: 0,
      redeemablePoints: 100, // Welcome points
      preferredStore: 'Nairobi CBD Flagship',
      frequentlyPurchased: [],
      recentReceipts: [],
    };

    setPatrons([newPatron, ...patrons]);
    setSelectedPatron(newPatron);
    setShowAddDrawer(false);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    triggerFeedback.success();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F4FAFF' }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Toolbar */}
      <View style={styles.topHeader}>
        <View style={styles.headingCol}>
          <Text style={[styles.tagline, { color: '#006A66' }]}>
            PATRON RELATIONSHIP HUB • Nairobi Central Branch
          </Text>
          <Text style={[styles.heading, { color: '#111D23' }]}>Customer Directory & Loyalty</Text>
          <Text style={[styles.subheading, { color: '#3D4948' }]}>
            Manage retail customers, transaction histories, store credit balances, and tiered loyalty points.
          </Text>
        </View>

        {/* Action Buttons Top Right matching screenshot */}
        <View style={styles.topActionsContainer}>
          <View style={styles.topActionsRow1}>
            <TouchableOpacity
              style={[styles.btnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
              onPress={() => {
                triggerFeedback.tap();
                alert('Exporting customer patron ledger to CSV/Excel...');
              }}
            >
              <Ionicons name="download-outline" size={14} color="#111D23" />
              <Text style={[styles.btnWhiteText, { color: '#111D23' }]}>Export Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnCyanPromo, { backgroundColor: '#90F0EA' }]}
              onPress={() => {
                triggerFeedback.tap();
                alert('Opening Bulk Promo SMS broadcast console...');
              }}
            >
              <Ionicons name="megaphone-outline" size={14} color="#006A66" />
              <Text style={[styles.btnCyanPromoText, { color: '#006A66' }]}>Send Promo SMS/Mail</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnAddCustomer, { backgroundColor: '#006A66' }]}
            onPress={() => {
              triggerFeedback.tap();
              setShowAddDrawer(true);
            }}
          >
            <Ionicons name="person-add" size={15} color="#FFFFFF" />
            <Text style={styles.btnAddCustomerText}>+ Add New Customer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Four Operational KPI Cards */}
      <View style={styles.kpiRow}>
        {/* Total Registered Customers */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>TOTAL REGISTERED CUSTOMERS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="people-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#111D23' }]}>1,284</Text>
          <View style={styles.kpiSubRow}>
            <View style={[styles.trendPill, { backgroundColor: '#90F0EA' }]}>
              <Ionicons name="trending-up" size={11} color="#006A66" />
              <Text style={[styles.trendPillText, { color: '#006A66' }]}>+18.2%</Text>
            </View>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>vs. previous quarter</Text>
          </View>
        </View>

        {/* Active Shoppers (Month) */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>ACTIVE SHOPPERS (MONTH)</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="bag-handle-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#111D23' }]}>642</Text>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.retentionLabel, { color: '#6D7A78' }]}>Retention Health</Text>
              <Text style={[styles.retentionValue, { color: '#111D23' }]}>50% Active</Text>
            </View>
            <View style={[styles.retentionTrack, { backgroundColor: '#E8ECEF' }]}>
              <View style={[styles.retentionFill, { width: '50%', backgroundColor: '#006A66' }]} />
            </View>
          </View>
        </View>

        {/* Loyalty Points Issued */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>LOYALTY POINTS ISSUED</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="ribbon-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={[styles.kpiValue, { color: '#111D23' }]}>148,200</Text>
            <Text style={[styles.ptsLabel, { color: '#6D7A78' }]}>pts</Text>
          </View>
          <Text style={[styles.kpiSubMuted, { color: '#8A969B', marginTop: 4 }]}>
            Redemption Liability: <Text style={{ color: '#111D23', fontWeight: '600' }}>KSh 148,200</Text>
          </Text>
        </View>

        {/* Avg Customer Lifetime Value */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>AVG CUSTOMER LIFETIME VALUE</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="wallet-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#111D23' }]}>KSh 14,850</Text>
          <Text style={[styles.kpiSubMuted, { color: '#8A969B', marginTop: 4 }]}>
            Top Tier VIP avg: <Text style={{ color: '#006A66', fontWeight: '600' }}>KSh 84,200</Text>
          </Text>
        </View>
      </View>

      {/* 3. Search & Filter Bar with Quick Filter Pills */}
      <View style={[styles.filterContainer, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
        {/* Top input & dropdowns row */}
        <View style={styles.filterTopRow}>
          <View style={[styles.searchField, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <Ionicons name="search" size={15} color="#8A969B" />
            <TextInput
              style={[styles.searchInput, { color: '#111D23' }]}
              placeholder="Search by name, 07XXXXXXXX, code..."
              placeholderTextColor="#8A969B"
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#8A969B" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Tiers dropdown */}
          <TouchableOpacity
            style={[styles.dropdownBtn, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              const tiers = ['All Tiers', 'Gold VIP', 'Silver', 'Bronze'];
              const next = tiers[(tiers.indexOf(tierFilter) + 1) % tiers.length];
              setTierFilter(next);
              triggerFeedback.tap();
            }}
          >
            <Text style={[styles.dropdownBtnText, { color: '#111D23' }]}>{tierFilter}</Text>
            <Ionicons name="chevron-down" size={13} color="#6D7A78" />
          </TouchableOpacity>

          {/* Status dropdown */}
          <TouchableOpacity style={[styles.dropdownBtn, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <Text style={[styles.dropdownBtnText, { color: '#111D23' }]}>{statusFilter}</Text>
            <Ionicons name="chevron-down" size={13} color="#6D7A78" />
          </TouchableOpacity>

          {/* Filter button */}
          <TouchableOpacity style={[styles.squareBtn, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <Ionicons name="options-outline" size={16} color="#6D7A78" />
          </TouchableOpacity>

          {/* Reset button */}
          <TouchableOpacity
            style={[styles.squareBtn, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              setSearch('');
              setTierFilter('All Tiers');
              setQuickFilter('all');
              triggerFeedback.tap();
            }}
          >
            <Ionicons name="refresh" size={16} color="#6D7A78" />
          </TouchableOpacity>
        </View>

        {/* Quick Filter Chips Row */}
        <View style={styles.quickFiltersRow}>
          <Text style={[styles.quickFilterLabel, { color: '#6D7A78' }]}>Quick Filter:</Text>
          <TouchableOpacity
            style={[
              styles.quickChip,
              quickFilter === 'all'
                ? { backgroundColor: '#006A66' }
                : { backgroundColor: '#E3F0F8' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setQuickFilter('all');
            }}
          >
            <Text
              style={[
                styles.quickChipText,
                { color: quickFilter === 'all' ? '#FFFFFF' : '#006A66' },
              ]}
            >
              All Patrons (1,284)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickChip,
              quickFilter === 'high_spend'
                ? { backgroundColor: '#006A66' }
                : { backgroundColor: '#E3F0F8' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setQuickFilter('high_spend');
            }}
          >
            <Text
              style={[
                styles.quickChipText,
                { color: quickFilter === 'high_spend' ? '#FFFFFF' : '#006A66' },
              ]}
            >
              High Spend (&gt;50k)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickChip,
              quickFilter === 'visited_week'
                ? { backgroundColor: '#006A66' }
                : { backgroundColor: '#E3F0F8' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setQuickFilter('visited_week');
            }}
          >
            <Text
              style={[
                styles.quickChipText,
                { color: quickFilter === 'visited_week' ? '#FFFFFF' : '#006A66' },
              ]}
            >
              Visited This Week (194)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickChip,
              quickFilter === 'credit'
                ? { backgroundColor: '#006A66' }
                : { backgroundColor: '#E3F0F8' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setQuickFilter('credit');
            }}
          >
            <Text
              style={[
                styles.quickChipText,
                { color: quickFilter === 'credit' ? '#FFFFFF' : '#006A66' },
              ]}
            >
              Available Credit Balances (41)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Split Screen: Customer Table (Left) & Profile Inspector (Right) */}
      <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
        {/* Left Column: Customer Directory Table */}
        <View style={[styles.tableCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Table Header Row */}
          <View style={[styles.tblHeaderRow, { backgroundColor: '#FFFFFF', borderBottomColor: '#E8ECEF' }]}>
            <Text style={[styles.th, { flex: 2 }]}>CUSTOMER</Text>
            <Text style={[styles.th, { flex: 2 }]}>CONTACT</Text>
            <Text style={[styles.th, { width: 100, textAlign: 'center' }]}>TIER</Text>
            <Text style={[styles.th, { width: 75, textAlign: 'center' }]}>ORDERS</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>TOTAL SPEND</Text>
          </View>

          {/* Table Rows */}
          {filteredPatrons.map((p) => {
            const isSelected = selectedPatron.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.tblRow,
                  { borderBottomColor: '#E8ECEF' },
                  isSelected && { backgroundColor: '#E8F6F5' },
                ]}
                onPress={() => {
                  triggerFeedback.tap();
                  setSelectedPatron(p);
                }}
                activeOpacity={0.8}
              >
                {/* Customer Column */}
                <View style={[styles.customerCell, { flex: 2 }]}>
                  {isSelected && <View style={[styles.activeDot, { backgroundColor: '#006A66' }]} />}
                  <Image source={{ uri: p.avatar }} style={styles.avatarImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.patronName, { color: '#111D23' }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={[styles.patronCode, { color: '#6D7A78' }]}>{p.code}</Text>
                  </View>
                </View>

                {/* Contact Column */}
                <View style={{ flex: 2 }}>
                  <Text style={[styles.contactPhone, { color: '#111D23' }]}>{p.phone}</Text>
                  <Text style={[styles.contactEmail, { color: '#6D7A78' }]} numberOfLines={1}>
                    {p.email}
                  </Text>
                </View>

                {/* Tier Badge */}
                <View style={{ width: 100, alignItems: 'center' }}>
                  <View
                    style={[
                      styles.tierBadge,
                      {
                        backgroundColor:
                          p.tier === 'Gold VIP'
                            ? '#90F0EA'
                            : p.tier === 'Silver'
                            ? '#E3F0F8'
                            : '#DDEAF2',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        p.tier === 'Gold VIP'
                          ? 'star'
                          : p.tier === 'Silver'
                          ? 'trophy'
                          : 'shield'
                      }
                      size={11}
                      color={p.tier === 'Gold VIP' ? '#006A66' : '#263238'}
                    />
                    <Text
                      style={[
                        styles.tierBadgeText,
                        { color: p.tier === 'Gold VIP' ? '#006A66' : '#263238' },
                      ]}
                    >
                      {p.tier}
                    </Text>
                  </View>
                </View>

                {/* Orders count */}
                <View style={{ width: 75, alignItems: 'center' }}>
                  <Text style={[styles.ordersCountText, { color: '#111D23' }]}>{p.ordersCount}</Text>
                </View>

                {/* Total Spend */}
                <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                  <Text style={[styles.totalSpendText, { color: '#111D23' }]}>
                    KSh {p.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Table Pagination Footer */}
          <View style={[styles.tblFooter, { borderTopColor: '#E8ECEF' }]}>
            <Text style={[styles.tblFooterText, { color: '#8A969B' }]}>
              Showing 1 - 6 of 1,284 patrons
            </Text>

            <View style={styles.paginationCluster}>
              <TouchableOpacity style={[styles.navPageBtn, { borderColor: '#E8ECEF' }]}>
                <Text style={[styles.navPageText, { color: '#6D7A78' }]}>&lt; Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#006A66' }]}>
                <Text style={styles.pageBtnActiveText}>1</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.pageBtnText, { color: '#111D23' }]}>2</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.pageBtnText, { color: '#111D23' }]}>3</Text>
              </TouchableOpacity>

              <Text style={{ color: '#8A969B', paddingHorizontal: 2 }}>...</Text>

              <TouchableOpacity style={[styles.pageBtn, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.pageBtnText, { color: '#111D23' }]}>214</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navPageBtn, { borderColor: '#E8ECEF' }]}>
                <Text style={[styles.navPageText, { color: '#6D7A78' }]}>Next &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right Column: Customer Profile Inspector Drawer */}
        <View style={[styles.profileDrawer, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Header with Photo, Name & Action Icons */}
          <View style={styles.profileHeader}>
            <Image source={{ uri: selectedPatron.avatar }} style={styles.largeAvatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.drawerName, { color: '#111D23' }]}>{selectedPatron.name}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="pencil" size={14} color="#6D7A78" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="print-outline" size={14} color="#6D7A78" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.memberBadge, { backgroundColor: '#90F0EA' }]}>
                <Ionicons name="star" size={12} color="#006A66" />
                <Text style={[styles.memberBadgeText, { color: '#006A66' }]}>
                  {selectedPatron.tier} Member
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Details List */}
          <View style={[styles.contactCard, { backgroundColor: '#F4FAFF' }]}>
            <View style={styles.contactItemRow}>
              <View style={styles.contactItemLabelRow}>
                <Ionicons name="call-outline" size={14} color="#6D7A78" />
                <Text style={[styles.contactItemLabel, { color: '#6D7A78' }]}>Mobile</Text>
              </View>
              <Text style={[styles.contactItemVal, { color: '#111D23' }]}>{selectedPatron.phone}</Text>
            </View>

            <View style={styles.contactItemRow}>
              <View style={styles.contactItemLabelRow}>
                <Ionicons name="mail-outline" size={14} color="#6D7A78" />
                <Text style={[styles.contactItemLabel, { color: '#6D7A78' }]}>Email</Text>
              </View>
              <Text style={[styles.contactItemVal, { color: '#111D23' }]}>{selectedPatron.email}</Text>
            </View>

            <View style={styles.contactItemRow}>
              <View style={styles.contactItemLabelRow}>
                <Ionicons name="location-outline" size={14} color="#6D7A78" />
                <Text style={[styles.contactItemLabel, { color: '#6D7A78' }]}>Preferred Store</Text>
              </View>
              <Text style={[styles.contactItemVal, { color: '#111D23' }]}>
                {selectedPatron.preferredStore}
              </Text>
            </View>
          </View>

          {/* Store Credit Balance & Redeemable Points Split Card */}
          <View style={styles.balanceSplitRow}>
            {/* Store Credit Balance */}
            <View style={[styles.balanceBox, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
              <Text style={[styles.boxLabel, { color: '#6D7A78' }]}>Store Credit Balance</Text>
              <Text style={[styles.boxVal, { color: '#006A66' }]}>
                KSh {selectedPatron.storeCredit.toLocaleString('en-US')}
              </Text>
              <Text style={[styles.boxSub, { color: '#8A969B' }]}>0 used / 100% available</Text>
            </View>

            {/* Redeemable Points */}
            <View style={[styles.balanceBox, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
              <Text style={[styles.boxLabel, { color: '#6D7A78' }]}>Redeemable Points</Text>
              <Text style={[styles.boxVal, { color: '#111D23' }]}>
                {selectedPatron.redeemablePoints.toLocaleString()} pts
              </Text>
              <Text style={[styles.boxSub, { color: '#8A969B' }]}>
                Worth KSh {selectedPatron.redeemablePoints.toLocaleString()} cash
              </Text>
            </View>
          </View>

          {/* Initiate Checkout for Patron Primary Button */}
          <TouchableOpacity
            style={[styles.btnInitiateCheckout, { backgroundColor: '#006A66' }]}
            onPress={() => {
              triggerFeedback.success();
              if (onStartSaleWithCustomer) {
                onStartSaleWithCustomer(selectedPatron);
              } else {
                alert(`Starting sale session with ${selectedPatron.name} (${selectedPatron.tier})`);
              }
            }}
          >
            <Ionicons name="bag-check-outline" size={16} color="#FFFFFF" />
            <Text style={styles.btnInitiateCheckoutText}>Initiate Checkout for Patron</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {/* Frequently Purchased Section */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: '#6D7A78' }]}>FREQUENTLY PURCHASED</Text>
              <TouchableOpacity>
                <Text style={[styles.sectionLink, { color: '#006A66' }]}>View Matrix</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chipsRow}>
              {selectedPatron.frequentlyPurchased.map((item, idx) => (
                <View key={idx} style={[styles.frequentChip, { backgroundColor: '#E3F0F8' }]}>
                  <Ionicons name={item.icon} size={12} color="#006A66" />
                  <Text style={[styles.frequentChipText, { color: '#111D23' }]}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent In-Store Receipts */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: '#6D7A78' }]}>RECENT IN-STORE RECEIPTS</Text>
              <Text style={[styles.sectionSub, { color: '#8A969B' }]}>Last 3 visits</Text>
            </View>

            <View style={styles.receiptsList}>
              {selectedPatron.recentReceipts.map((rcpt, idx) => (
                <View
                  key={idx}
                  style={[styles.receiptItem, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
                >
                  <View style={[styles.receiptIconWrap, { backgroundColor: '#E8F6F5' }]}>
                    <Ionicons
                      name={rcpt.isExchange ? 'refresh' : 'receipt-outline'}
                      size={15}
                      color="#006A66"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[styles.rcptNum, { color: '#111D23' }]}>{rcpt.receiptNo}</Text>
                      <Text style={[styles.rcptAmount, { color: '#111D23' }]}>
                        {rcpt.amount > 0 ? `KSh ${rcpt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'KSh 0.00 (Exch)'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                      <Text style={[styles.rcptMeta, { color: '#8A969B' }]}>
                        {rcpt.date} • {rcpt.register}
                      </Text>
                      <Text
                        style={[
                          styles.rcptPoints,
                          { color: rcpt.isExchange ? '#8A969B' : '#32B67A' },
                        ]}
                      >
                        {rcpt.pointsDelta}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Direct SMS Notice Drawer */}
          <View style={[styles.smsDrawer, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <Text style={[styles.smsTitle, { color: '#6D7A78' }]}>QUICK DIRECT SMS NOTICE</Text>
            <View style={styles.smsInputRow}>
              <TextInput
                style={[styles.smsInput, { color: '#111D23', backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
                placeholder="Send flash discount or note..."
                placeholderTextColor="#8A969B"
                value={smsNote}
                onChangeText={setSmsNote}
              />
              <TouchableOpacity
                style={[styles.btnSendSms, { backgroundColor: '#3FAFA9' }]}
                onPress={handleSendSMS}
              >
                <Ionicons name="send" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Drawer: Add New Customer */}
      {showAddDrawer && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.addDrawerContainer, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.drawerHeaderTop}>
              <Text style={[styles.drawerTitleText, { color: '#111D23' }]}>Add New Customer</Text>
              <TouchableOpacity onPress={() => setShowAddDrawer(false)}>
                <Ionicons name="close" size={20} color="#111D23" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 18 }}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={[styles.formInput, { borderColor: '#E8ECEF', color: '#111D23' }]}
                placeholder="e.g. Joy Wangari"
                placeholderTextColor="#8A969B"
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.inputLabel}>Phone (Safaricom / M-Pesa) *</Text>
              <TextInput
                style={[styles.formInput, { borderColor: '#E8ECEF', color: '#111D23' }]}
                placeholder="e.g. 0722 000 000"
                placeholderTextColor="#8A969B"
                value={formPhone}
                onChangeText={setFormPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.formInput, { borderColor: '#E8ECEF', color: '#111D23' }]}
                placeholder="e.g. joy.w@example.com"
                placeholderTextColor="#8A969B"
                value={formEmail}
                onChangeText={setFormEmail}
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Membership Tier</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {(['Gold VIP', 'Silver', 'Bronze'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.tierSelectChip,
                      { borderColor: '#E8ECEF' },
                      formTier === t && { backgroundColor: '#006A66', borderColor: '#006A66' },
                    ]}
                    onPress={() => setFormTier(t)}
                  >
                    <Text
                      style={[
                        styles.tierSelectText,
                        { color: formTier === t ? '#FFFFFF' : '#111D23' },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.drawerFooterRow}>
              <TouchableOpacity
                style={[styles.btnCancel, { borderColor: '#E8ECEF' }]}
                onPress={() => setShowAddDrawer(false)}
              >
                <Text style={{ color: '#6D7A78', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSave, { backgroundColor: '#006A66' }]}
                onPress={handleAddNewPatron}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    marginBottom: 4,
    textTransform: 'uppercase',
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
  topActionsContainer: {
    alignItems: 'flex-end',
    gap: 10,
  },
  topActionsRow1: {
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
  btnCyanPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
  },
  btnCyanPromoText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  btnAddCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
  },
  btnAddCustomerText: {
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
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendPillText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  kpiSubMuted: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  retentionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  retentionValue: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  retentionTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  retentionFill: {
    height: '100%',
    borderRadius: 3,
  },
  ptsLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  filterContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  filterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  searchField: {
    flex: 2,
    minWidth: 260,
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
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  dropdownBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  squareBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickFilterLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginRight: 4,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  quickChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 16,
  },
  mainLayoutWide: {
    flexDirection: 'row',
  },
  tableCard: {
    flex: 1.8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tblHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    color: '#6D7A78',
  },
  tblRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 56,
    borderBottomWidth: 1,
  },
  customerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  patronName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  patronCode: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
  },
  contactPhone: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  contactEmail: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  tierBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  ordersCountText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  totalSpendText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  tblFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  tblFooterText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  paginationCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navPageBtn: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPageText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActiveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  pageBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  profileDrawer: {
    flex: 1.2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  largeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#90F0EA',
  },
  drawerName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  iconBtn: {
    padding: 4,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    marginTop: 4,
  },
  memberBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  contactCard: {
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  contactItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactItemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactItemLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  contactItemVal: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  balanceSplitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  balanceBox: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 2,
  },
  boxLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  boxVal: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
  },
  boxSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  btnInitiateCheckout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  btnInitiateCheckoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  sectionWrap: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  sectionLink: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  frequentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  frequentChipText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  receiptsList: {
    gap: 6,
  },
  receiptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  receiptIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rcptNum: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  rcptAmount: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  rcptMeta: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  rcptPoints: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  smsDrawer: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  smsTitle: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  smsInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smsInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  btnSendSms: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  addDrawerContainer: {
    width: 440,
    maxHeight: '90%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  drawerTitleText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 10,
    marginBottom: 4,
    color: '#111D23',
  },
  formInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  tierSelectChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  tierSelectText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  drawerFooterRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  btnCancel: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSave: {
    flex: 1.5,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
