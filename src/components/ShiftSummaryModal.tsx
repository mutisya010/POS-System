import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { formatCurrency, formatDateTime, formatTime } from '../utils/formatters';

interface ShiftSummaryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ visible, onClose }) => {
  const {
    theme,
    storeSettings,
    shiftStats,
    resetShift,
    orderHistory,
    setLastCompletedOrder,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'metrics' | 'history'>('metrics');

  const expectedDrawerCash = shiftStats.openingCash + shiftStats.cashCollected;

  const handleCloseShift = () => {
    const confirmAction = () => {
      resetShift(200.0); // Reset with fresh $200 float
      onClose();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Close current shift and reset register cash drawer?')) {
        confirmAction();
      }
    } else {
      Alert.alert(
        'Close Shift',
        'Are you sure you want to close this register shift and balance the drawer?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Close Shift & Reset', style: 'destructive', onPress: confirmAction },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="stats-chart" size={22} color={theme.success} />
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Register Shift Status</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  {shiftStats.shiftId} • Opened {formatTime(shiftStats.openedAt)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Subtabs */}
          <View style={[styles.subTabs, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.subTab,
                activeTab === 'metrics' && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab('metrics')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: activeTab === 'metrics' ? theme.primaryLight : theme.textMuted },
                ]}
              >
                Shift Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTab,
                activeTab === 'history' && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab('history')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: activeTab === 'history' ? theme.primaryLight : theme.textMuted },
                ]}
              >
                Recent Transactions ({orderHistory.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {activeTab === 'metrics' ? (
              <View style={styles.metricsContainer}>
                {/* Highlight Cards */}
                <View style={styles.statsGrid}>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    ]}
                  >
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>TOTAL SALES</Text>
                    <Text style={[styles.statValue, { color: theme.success }]}>
                      {formatCurrency(shiftStats.totalSales, storeSettings.currencySymbol)}
                    </Text>
                    <Text style={[styles.statSub, { color: theme.textSecondary }]}>
                      {shiftStats.orderCount} completed {shiftStats.orderCount === 1 ? 'sale' : 'sales'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    ]}
                  >
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                      EXPECTED CASH DRAWER
                    </Text>
                    <Text style={[styles.statValue, { color: theme.primaryLight }]}>
                      {formatCurrency(expectedDrawerCash, storeSettings.currencySymbol)}
                    </Text>
                    <Text style={[styles.statSub, { color: theme.textSecondary }]}>
                      Float: {formatCurrency(shiftStats.openingCash, storeSettings.currencySymbol)} + Cash: {formatCurrency(shiftStats.cashCollected, storeSettings.currencySymbol)}
                    </Text>
                  </View>
                </View>

                {/* Tender Breakdown Table */}
                <View
                  style={[
                    styles.tenderBreakdown,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.breakdownTitle, { color: theme.textPrimary }]}>
                    Payment Methods Reconciled:
                  </Text>

                  <View style={styles.breakdownRow}>
                    <View style={styles.methodInfo}>
                      <Ionicons name="cash-outline" size={18} color={theme.success} />
                      <Text style={[styles.methodName, { color: theme.textPrimary }]}>Cash Sales</Text>
                    </View>
                    <Text style={[styles.methodAmount, { color: theme.textPrimary }]}>
                      {formatCurrency(shiftStats.cashCollected, storeSettings.currencySymbol)}
                    </Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <View style={styles.methodInfo}>
                      <Ionicons name="card-outline" size={18} color={theme.primaryLight} />
                      <Text style={[styles.methodName, { color: theme.textPrimary }]}>Credit / Debit Card</Text>
                    </View>
                    <Text style={[styles.methodAmount, { color: theme.textPrimary }]}>
                      {formatCurrency(shiftStats.cardCollected, storeSettings.currencySymbol)}
                    </Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <View style={styles.methodInfo}>
                      <Ionicons name="phone-portrait-outline" size={18} color={theme.accent} />
                      <Text style={[styles.methodName, { color: theme.textPrimary }]}>Mobile Wallets</Text>
                    </View>
                    <Text style={[styles.methodAmount, { color: theme.textPrimary }]}>
                      {formatCurrency(shiftStats.mobileCollected, storeSettings.currencySymbol)}
                    </Text>
                  </View>
                </View>

                {/* Cashier & Terminal Information */}
                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>Terminal Details</Text>
                  <Text style={[styles.infoLine, { color: theme.textMuted }]}>
                    Terminal: {storeSettings.terminalId} • Cashier: {shiftStats.cashierName}
                  </Text>
                  <Text style={[styles.infoLine, { color: theme.textMuted }]}>
                    Shift Opened: {formatDateTime(shiftStats.openedAt)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.historyContainer}>
                {orderHistory.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Text style={{ color: theme.textMuted }}>No transactions completed yet</Text>
                  </View>
                ) : (
                  orderHistory.map((ord) => (
                    <TouchableOpacity
                      key={ord.id}
                      style={[
                        styles.historyRow,
                        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                      ]}
                      onPress={() => {
                        setLastCompletedOrder(ord);
                        onClose();
                      }}
                    >
                      <View>
                        <Text style={[styles.historyOrderNum, { color: theme.textPrimary }]}>
                          {ord.orderNumber}
                        </Text>
                        <Text style={[styles.historyTime, { color: theme.textMuted }]}>
                          {formatTime(ord.createdAt)} • {ord.items.length} items
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.historyTotal, { color: theme.success }]}>
                          {formatCurrency(ord.total, storeSettings.currencySymbol)}
                        </Text>
                        <Text style={[styles.historyTender, { color: theme.textMuted }]}>
                          {ord.tenders.map((t) => t.method).join(', ')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Action */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.closeShiftBtn, { backgroundColor: theme.danger }]}
              onPress={handleCloseShift}
            >
              <Ionicons name="lock-closed-outline" size={16} color="#FFFFFF" />
              <Text style={styles.closeShiftBtnText}>End Shift & Balance Drawer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '88%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  subTab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  metricsContainer: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
  },
  tenderBreakdown: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '500',
  },
  methodAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoLine: {
    fontSize: 11,
  },
  historyContainer: {
    gap: 8,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 30,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  historyOrderNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyTime: {
    fontSize: 11,
    marginTop: 2,
  },
  historyTotal: {
    fontSize: 14,
    fontWeight: '800',
  },
  historyTender: {
    fontSize: 11,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  closeShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeShiftBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

