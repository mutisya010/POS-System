import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { SalesChart } from '../components/SalesChart';
import { triggerFeedback } from '../utils/sound';
import { ExportReportModal } from '../components/ExportReportModal';

interface DashboardScreenProps {
  onStartNewSale: () => void;
  onOpenInventory: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onStartNewSale,
  onOpenInventory,
}) => {
  const { theme, storeSettings, setLastCompletedOrder } = usePOS();
  const { width } = useWindowDimensions();

  const isWide = width >= 1024;
  const [salesFilter, setSalesFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [topSellingFilter, setTopSellingFilter] = useState<'Today' | 'This Week'>('Today');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Realistic recent transactions from the Nairobi Flagship lane
  const recentTransactions = [
    {
      id: '#TXN-8841',
      customer: 'Wanjiku Mwangi',
      time: 'Today, 14:42',
      items: 4,
      total: 'KSh 3,450.00',
      payment: 'M-Pesa',
      paymentType: 'mpesa',
      status: 'Completed',
    },
    {
      id: '#TXN-8840',
      customer: 'Brian Ochieng',
      time: 'Today, 14:31',
      items: 2,
      total: 'KSh 1,200.00',
      payment: 'Card',
      paymentType: 'card',
      status: 'Completed',
    },
    {
      id: '#TXN-8839',
      customer: 'Sarah Kimani',
      time: 'Today, 14:18',
      items: 1,
      total: 'KSh 850.00',
      payment: 'M-Pesa',
      paymentType: 'mpesa',
      status: 'Completed',
    },
    {
      id: '#TXN-8838',
      customer: 'Walk-in Customer',
      time: 'Today, 13:58',
      items: 6,
      total: 'KSh 4,120.00',
      payment: 'Cash',
      paymentType: 'cash',
      status: 'Completed',
    },
    {
      id: '#TXN-8837',
      customer: 'Daniel Kiprop',
      time: 'Today, 13:40',
      items: 1,
      total: 'KSh 620.00',
      payment: 'M-Pesa',
      paymentType: 'mpesa',
      status: 'Completed',
    },
  ];

  // Top selling products by shift
  const topSellingItems = [
    {
      name: 'Cappuccino Deluxe',
      category: 'Beverages',
      sold: '84 sold',
      revenue: 'KSh 16,800',
      unitPrice: '@200 ea',
      color: '#3FAFA9',
    },
    {
      name: 'Tusker Malt Can',
      category: 'Liquor',
      sold: '62 sold',
      revenue: 'KSh 15,500',
      unitPrice: '@250 ea',
      color: '#006A66',
    },
    {
      name: 'Brookside Fresh Milk 500ml',
      category: 'Dairy',
      sold: '55 sold',
      revenue: 'KSh 3,850',
      unitPrice: '@70 ea',
      color: '#06B6D4',
    },
    {
      name: 'Java House House Blend 500g',
      category: 'Pantry',
      sold: '28 sold',
      revenue: 'KSh 22,400',
      unitPrice: '@800 ea',
      color: '#D97706',
    },
    {
      name: 'Mumias Pure Sugar 1kg',
      category: 'Dry Goods',
      sold: '24 sold',
      revenue: 'KSh 3,840',
      unitPrice: '@160 ea',
      color: '#EC4899',
    },
  ];

  // Stock reorder alert triggers
  const stockTriggers = [
    {
      name: 'Highland Mineral Water 500ml',
      stockText: 'Only 4 left (Min: 25)',
      badge: 'CRITICAL LOW',
      badgeType: 'critical',
    },
    {
      name: 'Dawa Tea Infusion 250g',
      stockText: '8 left (Min: 30)',
      badge: 'LOW STOCK',
      badgeType: 'warning',
    },
    {
      name: 'Golden Fry Cooking Oil 2L',
      stockText: '3 left (Min: 15)',
      badge: 'CRITICAL LOW',
      badgeType: 'critical',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Dashboard Welcome & Action Bar */}
      <View style={styles.topBanner}>
        <View>
          <Text style={[styles.storeMetaText, { color: theme.primaryDark }]}>
            Store Active • Lane #01  |  Fri, Oct 25, 2024
          </Text>
          <Text style={[styles.welcomeHeading, { color: theme.textPrimary }]}>
            Welcome back, John!
          </Text>
          <Text style={[styles.welcomeSubheading, { color: theme.textSecondary }]}>
            Here's what's happening with your store today.
          </Text>
        </View>

        <View style={styles.topActionsRow}>
          {/* Active Shift Selector */}
          <TouchableOpacity style={[styles.shiftPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.shiftPillLabel, { color: theme.textSecondary }]}>ACTIVE SHIFT</Text>
            <Text style={[styles.shiftPillValue, { color: theme.textPrimary }]}>
              Shift A - Morning (07:00 - 15:00)
            </Text>
            <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Export Report Action */}
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {
              triggerFeedback.tap();
              setIsExportModalOpen(true);
            }}
          >
            <Ionicons name="download-outline" size={14} color={theme.textPrimary} />
            <Text style={[styles.exportBtnText, { color: theme.textPrimary }]}>
              Export Daily Report
            </Text>
          </TouchableOpacity>

          {/* Primary + New Sale Action */}
          <TouchableOpacity
            style={[styles.newSaleBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              triggerFeedback.tap();
              onStartNewSale();
            }}
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.newSaleBtnText}>+ New Sale</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Four KPI Metric Cards */}
      <View style={styles.kpiGrid}>
        {/* Total Sales */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>TOTAL SALES</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: theme.tealChipBg }]}>
              <Ionicons name="receipt-outline" size={16} color={theme.tealChipText} />
            </View>
          </View>
          <Text style={[styles.kpiCurrency, { color: theme.textPrimary }]}>KSh</Text>
          <Text style={[styles.kpiAmount, { color: theme.textPrimary }]}>48,920.45</Text>
          <View style={styles.kpiTrendRow}>
            <Ionicons name="trending-up" size={14} color={theme.success} />
            <Text style={[styles.kpiTrendValue, { color: theme.success }]}>+12.5%</Text>
            <Text style={[styles.kpiTrendSub, { color: theme.textSecondary }]}>from yesterday</Text>
          </View>
        </View>

        {/* Total Orders */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>TOTAL ORDERS</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: theme.tealChipBg }]}>
              <Ionicons name="bag-handle-outline" size={16} color={theme.tealChipText} />
            </View>
          </View>
          <Text style={[styles.kpiAmountSolo, { color: theme.textPrimary }]}>128</Text>
          <View style={styles.kpiTrendRow}>
            <Ionicons name="trending-up" size={14} color={theme.success} />
            <Text style={[styles.kpiTrendValue, { color: theme.success }]}>+8.2%</Text>
            <Text style={[styles.kpiTrendSub, { color: theme.textSecondary }]}>from yesterday</Text>
          </View>
        </View>

        {/* Customers Served */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>CUSTOMERS SERVED</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: theme.tealChipBg }]}>
              <Ionicons name="people-outline" size={16} color={theme.tealChipText} />
            </View>
          </View>
          <Text style={[styles.kpiAmountSolo, { color: theme.textPrimary }]}>256</Text>
          <View style={styles.kpiTrendRow}>
            <Ionicons name="trending-up" size={14} color={theme.success} />
            <Text style={[styles.kpiTrendValue, { color: theme.success }]}>+5.4%</Text>
            <Text style={[styles.kpiTrendSub, { color: theme.textSecondary }]}>from yesterday</Text>
          </View>
        </View>

        {/* Avg Order Value */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>AVG. ORDER VALUE</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: theme.tealChipBg }]}>
              <Ionicons name="card-outline" size={16} color={theme.tealChipText} />
            </View>
          </View>
          <Text style={[styles.kpiCurrency, { color: theme.textPrimary }]}>KSh</Text>
          <Text style={[styles.kpiAmount, { color: theme.textPrimary }]}>382.20</Text>
          <View style={styles.kpiTrendRow}>
            <Ionicons name="trending-up" size={14} color={theme.success} />
            <Text style={[styles.kpiTrendValue, { color: theme.success }]}>+3.1%</Text>
            <Text style={[styles.kpiTrendSub, { color: theme.textSecondary }]}>from yesterday</Text>
          </View>
        </View>
      </View>

      {/* 3. Middle Section: Sales Overview Chart (2/3) + Top Selling (1/3) */}
      <View style={[styles.flexRowWrap, isWide && styles.flexRowNoWrap]}>
        {/* Sales Overview Card */}
        <View style={[styles.mainCard, { flex: 2, backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Sales Overview</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Continuous gross turnover vs registered lane targets
              </Text>
            </View>

            <View style={styles.chartControlsRow}>
              {/* Daily / Weekly / Monthly / Yearly Toggle */}
              <View style={[styles.filterPillGroup, { backgroundColor: theme.background, borderColor: theme.border }]}>
                {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.filterTab,
                      salesFilter === tab && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setSalesFilter(tab)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        { color: salesFilter === tab ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date dropdown */}
              <View style={[styles.dateDropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
                <Text style={[styles.dateDropdownText, { color: theme.textPrimary }]}>
                  Oct 18 - Oct 25, 2024
                </Text>
                <Ionicons name="chevron-down" size={11} color={theme.textSecondary} />
              </View>
            </View>
          </View>

          {/* Spline Area Chart */}
          <SalesChart />

          {/* 3 Bottom Insights */}
          <View style={[styles.chartInsightRow, { borderTopColor: theme.border }]}>
            <View style={styles.insightItem}>
              <View style={[styles.insightIconCircle, { backgroundColor: theme.tealChipBg }]}>
                <Ionicons name="flash-outline" size={14} color={theme.tealChipText} />
              </View>
              <View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>Peak Checkout Hour</Text>
                <Text style={[styles.insightValue, { color: theme.textPrimary }]}>
                  2:00 PM - 3:00 PM <Text style={{ color: theme.primaryDark }}>(KSh 12,450)</Text>
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={[styles.insightIconCircle, { backgroundColor: theme.tealChipBg }]}>
                <Ionicons name="trending-up-outline" size={14} color={theme.tealChipText} />
              </View>
              <View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>Estimated Gross Margin</Text>
                <Text style={[styles.insightValue, { color: theme.textPrimary }]}>
                  KSh 18,220.00 <Text style={{ color: theme.success }}>(37.2%)</Text>
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={[styles.insightIconCircle, { backgroundColor: theme.tealChipBg }]}>
                <Ionicons name="barcode-outline" size={14} color={theme.tealChipText} />
              </View>
              <View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>Total Shift Volume</Text>
                <Text style={[styles.insightValue, { color: theme.textPrimary }]}>
                  142 Barcode Scans
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Selling Card */}
        <View style={[styles.mainCard, { flex: 1, backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Top Selling</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Bestselling items by shift
              </Text>
            </View>

            {/* Today / This Week Filter */}
            <View style={[styles.filterPillGroup, { backgroundColor: theme.background, borderColor: theme.border }]}>
              {(['Today', 'This Week'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.filterTab,
                    topSellingFilter === t && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setTopSellingFilter(t)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: topSellingFilter === t ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bestselling items list */}
          <View style={styles.bestsellerList}>
            {topSellingItems.map((item, idx) => (
              <View key={idx} style={[styles.bestsellerItem, { borderBottomColor: theme.border }]}>
                <View style={[styles.itemThumbnail, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name="cart" size={16} color={item.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.bestsellerName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.bestsellerMeta, { color: theme.textSecondary }]}>
                    <Text style={{ color: theme.primaryDark }}>{item.category}</Text> • {item.sold}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.bestsellerRevenue, { color: theme.primaryDark }]}>
                    {item.revenue}
                  </Text>
                  <Text style={[styles.bestsellerUnit, { color: theme.textSecondary }]}>
                    {item.unitPrice}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 4. Bottom Section: Recent Transactions (2/3) + Stock Reorder Triggers (1/3) */}
      <View style={[styles.flexRowWrap, isWide && styles.flexRowNoWrap, { marginTop: 14 }]}>
        {/* Recent Transactions Table */}
        <View style={[styles.mainCard, { flex: 2, backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Recent Transactions</Text>
              <View style={[styles.feedBadge, { backgroundColor: theme.tealChipBg }]}>
                <Text style={[styles.feedBadgeText, { color: theme.tealChipText }]}>Lane 01 Feed</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.tableFilterBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="funnel-outline" size={13} color={theme.textSecondary} />
                <TextInput
                  style={[styles.tableFilterInput, { color: theme.textPrimary }]}
                  placeholder="Filter receipt or name..."
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <TouchableOpacity>
                <Text style={[styles.viewAllLink, { color: theme.primaryDark }]}>View All ›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transactions Table */}
          <View style={styles.tableWrapper}>
            {/* Header */}
            <View style={[styles.txnTableHeader, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
              <Text style={[styles.thCol, { width: 90, color: theme.textSecondary }]}>TXN ID</Text>
              <Text style={[styles.thCol, { flex: 1.4, color: theme.textSecondary }]}>CUSTOMER</Text>
              <Text style={[styles.thCol, { width: 95, color: theme.textSecondary }]}>DATE & TIME</Text>
              <Text style={[styles.thCol, { width: 50, textAlign: 'center', color: theme.textSecondary }]}>ITEMS</Text>
              <Text style={[styles.thCol, { width: 100, textAlign: 'right', color: theme.textSecondary }]}>TOTAL</Text>
              <Text style={[styles.thCol, { width: 85, textAlign: 'center', color: theme.textSecondary }]}>PAYMENT</Text>
              <Text style={[styles.thCol, { width: 95, textAlign: 'center', color: theme.textSecondary }]}>STATUS</Text>
              <Text style={[styles.thCol, { width: 65, textAlign: 'right', color: theme.textSecondary }]}>ACTIONS</Text>
            </View>

            {/* Rows */}
            {recentTransactions.map((tx) => (
              <View key={tx.id} style={[styles.txnTableRow, { borderBottomColor: theme.border }]}>
                {/* ID */}
                <Text style={[styles.txId, { width: 90, color: theme.primaryDark }]}>{tx.id}</Text>

                {/* Customer */}
                <Text style={[styles.txCustomer, { flex: 1.4, color: theme.textPrimary }]} numberOfLines={1}>
                  {tx.customer}
                </Text>

                {/* Time */}
                <Text style={[styles.txTime, { width: 95, color: theme.textSecondary }]}>{tx.time}</Text>

                {/* Items */}
                <Text style={[styles.txItems, { width: 50, textAlign: 'center', color: theme.textPrimary }]}>
                  {tx.items}
                </Text>

                {/* Total */}
                <Text style={[styles.txTotal, { width: 100, textAlign: 'right', color: theme.textPrimary }]}>
                  {tx.total}
                </Text>

                {/* Payment Badge */}
                <View style={{ width: 85, alignItems: 'center' }}>
                  <View
                    style={[
                      styles.paymentBadge,
                      {
                        backgroundColor:
                          tx.paymentType === 'mpesa'
                            ? theme.successBg
                            : tx.paymentType === 'card'
                            ? theme.tealChipBg
                            : theme.warningBg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        tx.paymentType === 'mpesa'
                          ? 'phone-portrait-outline'
                          : tx.paymentType === 'card'
                          ? 'card-outline'
                          : 'cash-outline'
                      }
                      size={11}
                      color={
                        tx.paymentType === 'mpesa'
                          ? theme.success
                          : tx.paymentType === 'card'
                          ? theme.tealChipText
                          : theme.warning
                      }
                    />
                    <Text
                      style={[
                        styles.paymentBadgeText,
                        {
                          color:
                            tx.paymentType === 'mpesa'
                              ? theme.success
                              : tx.paymentType === 'card'
                              ? theme.tealChipText
                              : theme.warning,
                        },
                      ]}
                    >
                      {tx.payment}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={{ width: 95, alignItems: 'center' }}>
                  <View style={[styles.statusCompletedBadge, { backgroundColor: theme.successBg }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                    <Text style={[styles.statusCompletedText, { color: theme.success }]}>{tx.status}</Text>
                  </View>
                </View>

                {/* Action Icons */}
                <View style={{ width: 65, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
                  <TouchableOpacity style={styles.actionIconBtn}>
                    <Ionicons name="receipt-outline" size={15} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIconBtn}>
                    <Ionicons name="eye-outline" size={15} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stock Reorder Triggers Card */}
        <View style={[styles.mainCard, { flex: 1, backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="warning-outline" size={16} color={theme.warning} />
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Stock Reorder Triggers</Text>
              </View>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                3 inventory items below buffer thresholds
              </Text>
            </View>
          </View>

          {/* Trigger items list */}
          <View style={styles.reorderList}>
            {stockTriggers.map((item, idx) => (
              <View key={idx} style={[styles.reorderItem, { borderBottomColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reorderName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.reorderStock, { color: theme.textSecondary }]}>
                    {item.stockText}
                  </Text>
                </View>

                <View
                  style={[
                    styles.triggerBadge,
                    {
                      backgroundColor:
                        item.badgeType === 'critical' ? theme.dangerBg : theme.warningBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.triggerBadgeText,
                      {
                        color:
                          item.badgeType === 'critical' ? theme.danger : theme.warning,
                      },
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Restock action button */}
          <TouchableOpacity
            style={[styles.restockActionBtn, { backgroundColor: theme.tealChipBg, borderColor: theme.border }]}
            onPress={() => {
              triggerFeedback.tap();
              onOpenInventory();
            }}
          >
            <Ionicons name="cube-outline" size={16} color={theme.tealChipText} />
            <Text style={[styles.restockActionBtnText, { color: theme.tealChipText }]}>
              Restock / View Inventory
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Export Report Form Modal */}
      <ExportReportModal
        visible={isExportModalOpen}
        defaultReportType="sales_summary"
        onClose={() => setIsExportModalOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    gap: 14,
  },
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  storeMetaText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  welcomeHeading: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 2,
  },
  welcomeSubheading: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  shiftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  shiftPillLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  shiftPillValue: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  exportBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  newSaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 8,
    gap: 6,
  },
  newSaleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  kpiGrid: {
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
    shadowColor: '#263238',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  kpiIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiCurrency: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    lineHeight: 16,
  },
  kpiAmount: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  kpiAmountSolo: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  kpiTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  kpiTrendValue: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  kpiTrendSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  flexRowWrap: {
    flexDirection: 'column',
    gap: 14,
  },
  flexRowNoWrap: {
    flexDirection: 'row',
  },
  mainCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#263238',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  chartControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPillGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  filterTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterTabText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  dateDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
  },
  dateDropdownText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  chartInsightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
    gap: 10,
    flexWrap: 'wrap',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  insightValue: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  bestsellerList: {
    gap: 10,
  },
  bestsellerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  itemThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestsellerName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  bestsellerMeta: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  bestsellerRevenue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  bestsellerUnit: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  feedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  feedBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  tableFilterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    width: 170,
  },
  tableFilterInput: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  viewAllLink: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  tableWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  txnTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderBottomWidth: 1,
  },
  thCol: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  txnTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderBottomWidth: 1,
  },
  txId: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  txCustomer: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  txTime: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  txItems: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  txTotal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  statusCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusCompletedText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  actionIconBtn: {
    padding: 4,
  },
  reorderList: {
    gap: 8,
    marginBottom: 14,
  },
  reorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  reorderName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  reorderStock: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  triggerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  triggerBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  restockActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
  },
  restockActionBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});

