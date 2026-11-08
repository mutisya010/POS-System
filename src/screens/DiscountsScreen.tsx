import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';

export interface PromotionScheme {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  code: string;
  typeBadge: string;
  typeBadgeColor?: string;
  typeBadgeBg?: string;
  isCustomBadge?: boolean;
  scopePrimary: string;
  scopeSecondary: string;
  usedCount: number;
  totalQuota: number;
  quotaLabel: string;
  progressPct: number;
  isExpired?: boolean;
}

const INITIAL_PROMOTIONS: PromotionScheme[] = [
  {
    id: 'p-1',
    name: 'Weekend Grocery Saver',
    subtitle: 'Nairobi Supermarket Chain Wide',
    icon: 'bag-handle-outline',
    code: 'WEEKEND20',
    typeBadge: '15%\nOFF',
    typeBadgeBg: '#90F0EA',
    typeBadgeColor: '#006A66',
    scopePrimary: 'Cart ≥ KSh 1,500',
    scopeSecondary: 'Cap: KSh 600',
    usedCount: 482,
    totalQuota: 1000,
    quotaLabel: '482 / 1,000',
    progressPct: 48,
  },
  {
    id: 'p-2',
    name: 'LOYALTY5 - Tier Exclusive',
    subtitle: 'Gold & Platinum Registered Members',
    icon: 'ribbon-outline',
    code: 'LOYALTY5',
    typeBadge: 'KSh\n150\nOFF',
    typeBadgeBg: '#E3F0F8',
    typeBadgeColor: '#006A66',
    scopePrimary: 'Gold VIP Patrons',
    scopeSecondary: 'Per M-Pesa ID',
    usedCount: 1294,
    totalQuota: 1500,
    quotaLabel: '1,294 used',
    progressPct: 86,
  },
  {
    id: 'p-3',
    name: 'Fresh Bakery Sunset 20%',
    subtitle: 'Daily Markdown (18:00 - 21:00)',
    icon: 'nutrition-outline',
    code: 'BAKERY20',
    typeBadge: '20%\nOFF',
    typeBadgeBg: '#90F0EA',
    typeBadgeColor: '#006A66',
    scopePrimary: 'Bakery & Deli',
    scopeSecondary: 'Category Auto',
    usedCount: 189,
    totalQuota: 200,
    quotaLabel: '189 / 200 today',
    progressPct: 95,
  },
  {
    id: 'p-4',
    name: 'Barista Morning Brew BOGO',
    subtitle: 'Coffee Counter Special',
    icon: 'cafe-outline',
    code: 'COFFEEBOGO',
    typeBadge: 'Buy\n1\nGet\n1',
    typeBadgeBg: '#E3F0F8',
    typeBadgeColor: '#006A66',
    isCustomBadge: true,
    scopePrimary: 'Espresso & Latte',
    scopeSecondary: 'SKU #4802-09',
    usedCount: 310,
    totalQuota: 500,
    quotaLabel: '310 / 500',
    progressPct: 62,
  },
  {
    id: 'p-5',
    name: 'Elianto Cooking Oil Bundle',
    subtitle: 'Family Cart Essentials',
    icon: 'cube-outline',
    code: 'ELIANTO2L',
    typeBadge: 'KSh\n220\nOFF',
    typeBadgeBg: '#E3F0F8',
    typeBadgeColor: '#006A66',
    scopePrimary: '2x Elianto 2L Jars',
    scopeSecondary: 'SKU #7712-40',
    usedCount: 0,
    totalQuota: 400,
    quotaLabel: '0 / 400 Starts Nov...',
    progressPct: 0,
  },
  {
    id: 'p-6',
    name: 'Mashujaa Flash 25%',
    subtitle: 'Holiday 24-hr Mega Clearance',
    icon: 'flash-outline',
    code: 'SHUJAA25',
    typeBadge: '25%\nOFF',
    typeBadgeBg: '#E8ECEF',
    typeBadgeColor: '#8A969B',
    scopePrimary: 'Storewide Sale',
    scopeSecondary: 'Min KSh 3,000',
    usedCount: 2000,
    totalQuota: 2000,
    quotaLabel: '2,000 / 2,000',
    progressPct: 100,
    isExpired: true,
  },
];

export const DiscountsScreen: React.FC = () => {
  const { theme } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1180;

  const [promos, setPromos] = useState<PromotionScheme[]>(INITIAL_PROMOTIONS);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Flash' | 'Category' | 'VIP' | 'Expired'>('All');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Active & Scheduled');

  // Form State matching right rail
  const [formName, setFormName] = useState('Nairobi Super Weekend Deal');
  const [formCode, setFormCode] = useState('NAIROBI10');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed' | 'bogo' | 'waive'>('percent');
  const [discountVal, setDiscountVal] = useState('15');
  const [maxCap, setMaxCap] = useState('1000');
  const [minSpend, setMinSpend] = useState('1200');
  const [applicableScope, setApplicableScope] = useState('Entire Store Cart');
  const [startDate, setStartDate] = useState('11/01/2024');
  const [endDate, setEndDate] = useState('11/15/2024');
  const [noExpiry, setNoExpiry] = useState(false);
  const [totalRedemptions, setTotalRedemptions] = useState('500');
  const [customerLimit, setCustomerLimit] = useState('1 Redemption');
  const [autoApply, setAutoApply] = useState(true);

  const handleCopyCode = (code: string) => {
    triggerFeedback.tap();
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  const handleAutoGenerateCode = () => {
    triggerFeedback.tap();
    const prefix = formName.trim().substring(0, 4).toUpperCase() || 'DEAL';
    setFormCode(`${prefix}${Math.floor(10 + Math.random() * 90)}`);
  };

  const handleSaveCampaign = () => {
    if (!formName.trim() || !formCode.trim()) {
      triggerFeedback.warning();
      alert('Please fill in promotion name and coupon code.');
      return;
    }

    const newPromo: PromotionScheme = {
      id: `p-${Date.now()}`,
      name: formName.trim(),
      subtitle: applicableScope,
      icon: discountType === 'bogo' ? 'cafe-outline' : 'pricetag-outline',
      code: formCode.trim().toUpperCase(),
      typeBadge: discountType === 'percent' ? `${discountVal}%\nOFF` : `KSh\n${discountVal}\nOFF`,
      typeBadgeBg: '#90F0EA',
      typeBadgeColor: '#006A66',
      scopePrimary: `Cart ≥ KSh ${minSpend}`,
      scopeSecondary: `Cap: KSh ${maxCap}`,
      usedCount: 0,
      totalQuota: parseInt(totalRedemptions, 10) || 500,
      quotaLabel: `0 / ${totalRedemptions}`,
      progressPct: 0,
    };

    setPromos([newPromo, ...promos]);
    triggerFeedback.success();
    alert(`Promotion "${newPromo.name}" has been deployed and synced to all POS registers!`);
  };

  const filteredPromos = promos.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchQ =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q);

    let matchTab = true;
    if (activeTab === 'Active') matchTab = !p.isExpired;
    if (activeTab === 'Expired') matchTab = !!p.isExpired;
    if (activeTab === 'VIP') matchTab = p.name.includes('LOYALTY') || p.name.includes('VIP');
    if (activeTab === 'Flash') matchTab = p.name.includes('Flash') || p.name.includes('Sunset');
    if (activeTab === 'Category') matchTab = p.name.includes('Bakery') || p.name.includes('Oil') || p.name.includes('Brew');

    return matchQ && matchTab;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F4FAFF' }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Toolbar */}
      <View style={styles.topHeader}>
        <View style={styles.headingCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={[styles.breadcrumb, { color: '#6D7A78' }]}>
              Register Hub &gt; Discounts &amp; Promotions
            </Text>
            <View style={[styles.liveSyncBadge, { backgroundColor: '#90F0EA' }]}>
              <Text style={[styles.liveSyncText, { color: '#006A66' }]}>LIVE POS SYNC</Text>
            </View>
          </View>

          <Text style={[styles.heading, { color: '#111D23' }]}>Discounts &amp; Promotions</Text>
          <Text style={[styles.subheading, { color: '#3D4948' }]}>
            Configure campaign vouchers, percentage markdowns, BOGO bundles, and automated customer loyalty rewards across Nairobi Flagship registers.
          </Text>
        </View>

        {/* Top Right Actions matching screenshot */}
        <View style={styles.topActionsContainer}>
          <View style={styles.topActionsRow1}>
            <TouchableOpacity
              style={[styles.btnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
              onPress={() => {
                triggerFeedback.tap();
                alert('Opening Promo Rules & Threshold Limits configuration...');
              }}
            >
              <Ionicons name="options-outline" size={14} color="#111D23" />
              <Text style={[styles.btnWhiteText, { color: '#111D23' }]}>Promo Rules &amp; Limits</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
              onPress={() => {
                triggerFeedback.tap();
                alert('Exporting promotions redemption report to CSV/Excel...');
              }}
            >
              <Ionicons name="download-outline" size={14} color="#111D23" />
              <Text style={[styles.btnWhiteText, { color: '#111D23' }]}>Export Report</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnCreatePromo, { backgroundColor: '#006A66' }]}
            onPress={() => {
              triggerFeedback.tap();
              setFormName('');
              setFormCode('');
            }}
          >
            <Ionicons name="add-circle" size={16} color="#FFFFFF" />
            <Text style={styles.btnCreatePromoText}>+ Create New Promo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Four Operational KPI Cards */}
      <View style={styles.kpiRow}>
        {/* Active Campaigns */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>ACTIVE CAMPAIGNS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="pricetag-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.kpiValue, { color: '#111D23' }]}>14</Text>
            <Text style={[styles.kpiValueSub, { color: '#006A66' }]}>Live in POS</Text>
          </View>
          <View style={styles.kpiSubRow}>
            <Text style={[styles.kpiSubText, { color: '#32B67A' }]}>+3 launched this week</Text>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>Lane 1-8</Text>
          </View>
        </View>

        {/* Scheduled Promos */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>SCHEDULED PROMOS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="calendar-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.kpiValue, { color: '#111D23' }]}>5</Text>
            <Text style={[styles.kpiValueSub, { color: '#8A969B' }]}>Upcoming</Text>
          </View>
          <View style={styles.kpiSubRow}>
            <Text style={[styles.kpiSubText, { color: '#6D7A78' }]}>Starting within 7 days</Text>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>Jamhuri Sale</Text>
          </View>
        </View>

        {/* Expired / Audited */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>EXPIRED / AUDITED</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="time-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.kpiValue, { color: '#111D23' }]}>38</Text>
            <Text style={[styles.kpiValueSub, { color: '#8A969B' }]}>Archived</Text>
          </View>
          <View style={styles.kpiSubRow}>
            <Text style={[styles.kpiSubText, { color: '#6D7A78' }]}>Last 90 days audit pool</Text>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>99.4% Valid</Text>
          </View>
        </View>

        {/* Claimed Discount Value */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>CLAIMED DISCOUNT VALUE</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="wallet-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 4 }}>
            <Text style={[styles.currencyPrefix, { color: '#111D23' }]}>KSh</Text>
            <Text style={[styles.kpiValue, { color: '#111D23' }]}>324,850.00</Text>
          </View>
          <View style={styles.kpiSubRow}>
            <Text style={[styles.kpiSubText, { color: '#6D7A78' }]}>2,410 patrons (M-Pesa / Till)</Text>
            <Text style={[styles.kpiSubGreen, { color: '#32B67A' }]}>+18.2% MoM</Text>
          </View>
        </View>
      </View>

      {/* 3. Filter Chips Row & Search Bar */}
      <View style={styles.filterSection}>
        {/* Filter Chips matching screenshot */}
        <View style={styles.chipsRow}>
          {(
            [
              { id: 'All', label: 'All (19)' },
              { id: 'Active', label: 'Active (14)' },
              { id: 'Flash', label: 'Flash Deals (3)' },
              { id: 'Category', label: 'Category Specific (5)' },
              { id: 'VIP', label: 'VIP / Loyalty (4)' },
              { id: 'Expired', label: 'Expired (38)' },
            ] as const
          ).map((c) => {
            const isActive = activeTab === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.filterChip,
                  isActive
                    ? { backgroundColor: '#006A66' }
                    : { backgroundColor: '#E3F0F8' },
                ]}
                onPress={() => {
                  triggerFeedback.tap();
                  setActiveTab(c.id);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? '#FFFFFF' : '#006A66' },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Scope Notice */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 }}>
          <Text style={[styles.scopeLabel, { color: '#6D7A78' }]}>Lane Scope:</Text>
          <TouchableOpacity>
            <Text style={[styles.scopeValue, { color: '#006A66' }]}>All Registers</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Dropdown Row */}
        <View style={styles.searchBarRow}>
          <View style={[styles.searchField, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <Ionicons name="search" size={15} color="#8A969B" />
            <TextInput
              style={[styles.searchInput, { color: '#111D23' }]}
              placeholder="Search coupon code, campaign name, or SKU..."
              placeholderTextColor="#8A969B"
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={15} color="#8A969B" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Department Filter */}
          <TouchableOpacity
            style={[styles.dropdownFilter, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              const depts = ['All', 'Groceries', 'Beverages', 'Bakery & Deli', 'Liquor'];
              const next = depts[(depts.indexOf(departmentFilter) + 1) % depts.length];
              setDepartmentFilter(next);
              triggerFeedback.tap();
            }}
          >
            <Text style={[styles.dropdownFilterLabel, { color: '#6D7A78' }]}>Department:</Text>
            <Text style={[styles.dropdownFilterVal, { color: '#111D23' }]}>{departmentFilter}</Text>
            <Ionicons name="chevron-down" size={13} color="#6D7A78" />
          </TouchableOpacity>

          {/* Status Filter */}
          <TouchableOpacity style={[styles.dropdownFilter, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <Text style={[styles.dropdownFilterLabel, { color: '#6D7A78' }]}>Status:</Text>
            <Text style={[styles.dropdownFilterVal, { color: '#111D23' }]}>All Active &amp; Scheduled</Text>
            <Ionicons name="chevron-down" size={13} color="#6D7A78" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Main Body: Left Table & Right Rail Form */}
      <View style={[styles.bodyLayout, isWide && styles.bodyLayoutWide]}>
        {/* Left Column: Data Table & Auto-Detection Banner */}
        <View style={styles.leftTableCol}>
          <View style={[styles.tableCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            {/* Table Header Row */}
            <View style={[styles.tblHeaderRow, { backgroundColor: '#FFFFFF', borderBottomColor: '#E8ECEF' }]}>
              <Text style={[styles.th, { flex: 2.2 }]}>PROMOTION &amp; CAMPAIGN</Text>
              <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>COUPON CODE</Text>
              <Text style={[styles.th, { width: 75, textAlign: 'center' }]}>TYPE &amp; VALUE</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>APPLICABLE SCOPE</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>USAGE / QUOTA</Text>
            </View>

            {/* Table Rows */}
            {filteredPromos.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.tblRow,
                  { borderBottomColor: '#E8ECEF' },
                  item.isExpired && { opacity: 0.75 },
                ]}
              >
                {/* Promotion & Campaign */}
                <View style={[styles.campaignCell, { flex: 2.2 }]}>
                  <View style={[styles.promoIconWrap, { backgroundColor: '#E3F0F8' }]}>
                    <Ionicons name={item.icon} size={15} color="#006A66" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.promoName,
                        { color: '#111D23' },
                        item.isExpired && styles.strikethroughText,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.promoSubtitle, { color: '#6D7A78' }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Coupon Code Chip with Copy */}
                <View style={{ width: 120, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.couponCodeChip, { borderColor: '#E8ECEF', backgroundColor: '#F4FAFF' }]}
                    onPress={() => handleCopyCode(item.code)}
                  >
                    <Text style={[styles.couponCodeText, { color: '#006A66' }]}>{item.code}</Text>
                    <Ionicons name="copy-outline" size={12} color="#006A66" />
                  </TouchableOpacity>
                </View>

                {/* Type & Value Badge */}
                <View style={{ width: 75, alignItems: 'center' }}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: item.typeBadgeBg || '#90F0EA' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: item.typeBadgeColor || '#006A66' },
                      ]}
                    >
                      {item.typeBadge}
                    </Text>
                  </View>
                </View>

                {/* Applicable Scope */}
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.scopePrimary, { color: '#111D23' }]}>{item.scopePrimary}</Text>
                  <Text style={[styles.scopeSecondary, { color: '#6D7A78' }]}>{item.scopeSecondary}</Text>
                </View>

                {/* Usage / Quota Progress */}
                <View style={{ flex: 1.5, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.quotaLabel, { color: '#111D23' }]}>{item.quotaLabel}</Text>
                    <Text style={[styles.progressPctText, { color: '#6D7A78' }]}>{item.progressPct}%</Text>
                  </View>
                  <View style={[styles.quotaTrack, { backgroundColor: '#E8ECEF' }]}>
                    <View
                      style={[
                        styles.quotaFill,
                        {
                          width: `${item.progressPct}%`,
                          backgroundColor: item.isExpired ? '#8A969B' : '#006A66',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}

            {/* Table Footer */}
            <View style={[styles.tblFooter, { borderTopColor: '#E8ECEF' }]}>
              <Text style={[styles.tblFooterText, { color: '#8A969B' }]}>
                Showing 6 of 19 promotion schemes
              </Text>

              <View style={styles.paginationCluster}>
                <TouchableOpacity style={[styles.pageBtnNav, { borderColor: '#E8ECEF' }]}>
                  <Text style={[styles.pageBtnNavText, { color: '#6D7A78' }]}>Previous</Text>
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

                <TouchableOpacity style={[styles.pageBtnNav, { borderColor: '#E8ECEF' }]}>
                  <Text style={[styles.pageBtnNavText, { color: '#6D7A78' }]}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Cashier Lane Auto-Detection Active Banner matching screenshot */}
          <View style={[styles.autoDetectBanner, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={[styles.bannerIconWrap, { backgroundColor: '#3FAFA9' }]}>
              <Ionicons name="calculator-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: '#111D23' }]}>
                Cashier Lane Auto-Detection Active
              </Text>
              <Text style={[styles.bannerSub, { color: '#6D7A78' }]}>
                When a patron phone matches Landmark Loyalty or cart threshold is reached, qualifying coupons are suggested right on Cashier registers.
              </Text>
            </View>
            <TouchableOpacity style={[styles.bannerBtn, { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.bannerBtnText, { color: '#111D23' }]}>Configure Register Rules</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Rail: Create New Promotion Studio Form (Matching screenshot) */}
        <View style={[styles.rightFormCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Form Header */}
          <View style={styles.formHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={[styles.formHeaderIcon, { backgroundColor: '#90F0EA' }]}>
                <Ionicons name="pricetag" size={15} color="#006A66" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formTitle, { color: '#111D23' }]}>Create New Promotion</Text>
                <Text style={[styles.formSub, { color: '#6D7A78' }]}>Deploy instantly across all registers</Text>
              </View>
            </View>

            <View style={[styles.stepBadge, { backgroundColor: '#90F0EA' }]}>
              <Text style={[styles.stepBadgeText, { color: '#006A66' }]}>STEP 1 OF 2</Text>
            </View>
          </View>

          {/* Field 1: Promotion / Campaign Name */}
          <Text style={[styles.fieldLabel, { color: '#111D23' }]}>Promotion / Campaign Name</Text>
          <TextInput
            style={[styles.inputField, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF', color: '#111D23' }]}
            value={formName}
            onChangeText={setFormName}
            placeholder="e.g. Nairobi Super Weekend Deal"
          />

          {/* Field 2: Coupon / POS Barcode Code */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text style={[styles.fieldLabel, { color: '#111D23', marginTop: 0 }]}>Coupon / POS Barcode Code</Text>
            <TouchableOpacity onPress={handleAutoGenerateCode} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="refresh" size={12} color="#006A66" />
              <Text style={[styles.autoGenText, { color: '#006A66' }]}>Auto-generate</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputWithIconRow, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <TextInput
              style={[styles.inputWithIcon, { color: '#111D23' }]}
              value={formCode}
              onChangeText={setFormCode}
              placeholder="e.g. NAIROBI10"
              autoCapitalize="characters"
            />
            <Ionicons name="barcode-outline" size={18} color="#6D7A78" />
          </View>

          {/* Field 3: Discount Type Grid */}
          <Text style={[styles.fieldLabel, { color: '#111D23', marginTop: 12 }]}>Discount Type</Text>
          <View style={styles.discountTypeGrid}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                discountType === 'percent'
                  ? { backgroundColor: '#006A66', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setDiscountType('percent')}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: discountType === 'percent' ? '#FFFFFF' : '#111D23' },
                ]}
              >
                Percentage %
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                discountType === 'fixed'
                  ? { backgroundColor: '#006A66', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setDiscountType('fixed')}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: discountType === 'fixed' ? '#FFFFFF' : '#111D23' },
                ]}
              >
                Fixed KSh OFF
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                discountType === 'bogo'
                  ? { backgroundColor: '#006A66', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setDiscountType('bogo')}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: discountType === 'bogo' ? '#FFFFFF' : '#111D23' },
                ]}
              >
                Buy X Get Y
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                discountType === 'waive'
                  ? { backgroundColor: '#006A66', borderColor: '#006A66' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' },
              ]}
              onPress={() => setDiscountType('waive')}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: discountType === 'waive' ? '#FFFFFF' : '#111D23' },
                ]}
              >
                Waive Service / Bag
              </Text>
            </TouchableOpacity>
          </View>

          {/* Row: Discount Value & Max Discount Cap */}
          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: '#111D23' }]}>Discount Value</Text>
              <View style={[styles.unitInputWrap, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
                <TextInput
                  style={[styles.unitInput, { color: '#111D23' }]}
                  value={discountVal}
                  onChangeText={setDiscountVal}
                  keyboardType="numeric"
                />
                <Text style={[styles.unitLabel, { color: '#6D7A78' }]}>%</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: '#111D23' }]}>Max Discount Cap</Text>
              <View style={[styles.unitInputWrap, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
                <TextInput
                  style={[styles.unitInput, { color: '#111D23' }]}
                  value={maxCap}
                  onChangeText={setMaxCap}
                  keyboardType="numeric"
                />
                <Text style={[styles.unitLabel, { color: '#6D7A78' }]}>KSh</Text>
              </View>
            </View>
          </View>

          {/* Row: Min Basket Spend & Applicable Scope */}
          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: '#111D23' }]}>Min. Basket Spend</Text>
              <View style={[styles.unitInputWrap, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
                <TextInput
                  style={[styles.unitInput, { color: '#111D23' }]}
                  value={minSpend}
                  onChangeText={setMinSpend}
                  keyboardType="numeric"
                />
                <Text style={[styles.unitLabel, { color: '#6D7A78' }]}>KSh</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: '#111D23' }]}>Applicable Scope</Text>
              <TouchableOpacity
                style={[styles.dropdownSelect, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}
                onPress={() => {
                  const scopes = ['Entire Store Cart', 'Bakery & Deli', 'Beverages', 'Dry Groceries'];
                  const next = scopes[(scopes.indexOf(applicableScope) + 1) % scopes.length];
                  setApplicableScope(next);
                  triggerFeedback.tap();
                }}
              >
                <Text style={[styles.dropdownSelectText, { color: '#111D23' }]} numberOfLines={1}>
                  {applicableScope}
                </Text>
                <Ionicons name="chevron-down" size={13} color="#6D7A78" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Campaign Schedule with Perpetual Checkbox */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text style={[styles.fieldLabel, { color: '#111D23', marginTop: 0 }]}>Campaign Schedule</Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              onPress={() => setNoExpiry(!noExpiry)}
            >
              <Ionicons
                name={noExpiry ? 'checkbox' : 'square-outline'}
                size={14}
                color={noExpiry ? '#006A66' : '#6D7A78'}
              />
              <Text style={[styles.perpetualText, { color: '#6D7A78' }]}>No expiry (Perpetual)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subFieldLabel, { color: '#6D7A78' }]}>Starts</Text>
              <View style={[styles.unitInputWrap, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
                <TextInput
                  style={[styles.unitInput, { color: '#111D23' }]}
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <Ionicons name="calendar-outline" size={14} color="#6D7A78" />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.subFieldLabel, { color: '#6D7A78' }]}>Ends</Text>
              <View style={[styles.unitInputWrap, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
                <TextInput
                  style={[styles.unitInput, { color: '#111D23' }]}
                  value={endDate}
                  onChangeText={setEndDate}
                  editable={!noExpiry}
                />
                <Ionicons name="calendar-outline" size={14} color="#6D7A78" />
              </View>
            </View>
          </View>

          {/* Row: Store Total Redemptions & Per-Customer Limit */}
          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: '#111D23' }]}>Store Total Redemptions</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF', color: '#111D23' }]}
                value={totalRedemptions}
                onChangeText={setTotalRedemptions}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: '#111D23' }]}>Per-Customer Limit</Text>
              <TouchableOpacity
                style={[styles.dropdownSelect, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}
                onPress={() => {
                  const limits = ['1 Redemption', '2 Redemptions', 'Unlimited'];
                  const next = limits[(limits.indexOf(customerLimit) + 1) % limits.length];
                  setCustomerLimit(next);
                  triggerFeedback.tap();
                }}
              >
                <Text style={[styles.dropdownSelectText, { color: '#111D23' }]}>{customerLimit}</Text>
                <Ionicons name="chevron-down" size={13} color="#6D7A78" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch: Auto-apply at POS checkout */}
          <View style={[styles.switchCard, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: '#111D23' }]}>Auto-apply at POS checkout</Text>
              <Text style={[styles.switchSub, { color: '#6D7A78' }]}>
                Trigger automatically when customer cart meets criteria without cashier key-in.
              </Text>
            </View>
            <Switch
              value={autoApply}
              onValueChange={setAutoApply}
              trackColor={{ false: '#E8ECEF', true: '#90F0EA' }}
              thumbColor={autoApply ? '#006A66' : '#FFFFFF'}
            />
          </View>

          {/* Form Actions */}
          <TouchableOpacity
            style={[styles.btnSaveCampaign, { backgroundColor: '#3FAFA9' }]}
            onPress={handleSaveCampaign}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.btnSaveCampaignText}>Save &amp; Activate Campaign</Text>
          </TouchableOpacity>

          <View style={styles.btnSecondaryRow}>
            <TouchableOpacity
              style={[styles.btnDraft, { backgroundColor: '#E3F0F8' }]}
              onPress={() => {
                triggerFeedback.tap();
                alert('Campaign saved to draft pool.');
              }}
            >
              <Text style={[styles.btnDraftText, { color: '#006A66' }]}>Save as Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnDraft, { backgroundColor: '#E3F0F8' }]}
              onPress={() => {
                triggerFeedback.tap();
                setFormName('');
                setFormCode('');
              }}
            >
              <Text style={[styles.btnDraftText, { color: '#006A66' }]}>Reset Form</Text>
            </TouchableOpacity>
          </View>

          {/* Register Cashier Preview Box */}
          <View style={[styles.previewBox, { backgroundColor: '#E8F6F5', borderColor: '#90F0EA' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Ionicons name="receipt-outline" size={14} color="#006A66" />
              <Text style={[styles.previewTitle, { color: '#006A66' }]}>Register Cashier Preview</Text>
            </View>
            <Text style={[styles.previewQuote, { color: '#006A66' }]}>
              &quot;Patron receives {discountVal}% OFF cart when spending min KSh {minSpend}. Max savings KSh {maxCap}. Auto-applies at register.&quot;
            </Text>
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
  breadcrumb: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  liveSyncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveSyncText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
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
  btnCreatePromo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
  },
  btnCreatePromoText: {
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
  },
  kpiValueSub: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  currencyPrefix: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  kpiSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  kpiSubText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  kpiSubMuted: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  kpiSubGreen: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  filterSection: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  scopeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  scopeValue: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  searchBarRow: {
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
  dropdownFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  dropdownFilterLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  dropdownFilterVal: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  bodyLayout: {
    flexDirection: 'column',
    gap: 16,
  },
  bodyLayoutWide: {
    flexDirection: 'row',
  },
  leftTableCol: {
    flex: 1.8,
    gap: 14,
  },
  tableCard: {
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
    height: 60,
    borderBottomWidth: 1,
  },
  campaignCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
    color: '#8A969B',
  },
  promoSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  couponCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  couponCodeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    lineHeight: 12,
  },
  scopePrimary: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  scopeSecondary: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  quotaLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  progressPctText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  quotaTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    borderRadius: 3,
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
  pageBtnNav: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnNavText: {
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
  autoDetectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  bannerSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  bannerBtn: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  rightFormCard: {
    flex: 1.2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  formHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  formSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stepBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 6,
    marginBottom: 3,
  },
  subFieldLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  autoGenText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  perpetualText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  inputField: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  inputWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  discountTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBtn: {
    flex: 1,
    minWidth: '46%',
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  unitInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  unitInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  dropdownSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  dropdownSelectText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 4,
    gap: 10,
  },
  switchTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  switchSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 14,
  },
  btnSaveCampaign: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 8,
    marginTop: 4,
  },
  btnSaveCampaignText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  btnSecondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnDraft: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDraftText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  previewBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
  },
  previewTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  previewQuote: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    lineHeight: 15,
  },
});
