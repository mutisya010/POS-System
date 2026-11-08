import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { PaymentMethodType, PaymentTender } from '../types/pos';
import { formatCurrency } from '../utils/formatters';
import { triggerFeedback } from '../utils/sound';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ visible, onClose, onSuccess }) => {
  const { theme, storeSettings, cartSummary, completeCheckout } = usePOS();

  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('cash');
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardStatus, setCardStatus] = useState<'idle' | 'authorizing' | 'approved'>('idle');
  const [mpesaPhone, setMpesaPhone] = useState<string>('0712 345 678');
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'prompting' | 'verified'>('idle');

  // Split payment state
  const [splitFirstAmount, setSplitFirstAmount] = useState<number>(0);
  const [splitFirstMethod] = useState<'cash' | 'card'>('cash');
  const [splitSecondMethod] = useState<'cash' | 'card'>('card');

  const tipAmount = tipPercentage > 0 ? cartSummary.total * (tipPercentage / 100) : 0;
  const grandTotal = cartSummary.total + tipAmount;

  useEffect(() => {
    if (visible) {
      setCashTendered(grandTotal);
      setSplitFirstAmount(Math.floor(grandTotal / 2));
      setCardStatus('idle');
      setIsProcessing(false);
    }
  }, [visible, grandTotal]);

  const changeDue = Math.max(0, cashTendered - grandTotal);

  const getQuickCashButtons = () => {
    const ceil5 = Math.ceil(grandTotal / 5) * 5;
    const ceil10 = Math.ceil(grandTotal / 10) * 10;
    const ceil20 = Math.ceil(grandTotal / 20) * 20;
    const ceil50 = Math.ceil(grandTotal / 50) * 50;
    const ceil100 = Math.ceil(grandTotal / 100) * 100;

    const values = Array.from(
      new Set([grandTotal, ceil5, ceil10, ceil20, ceil50, ceil100].filter((v) => v >= grandTotal))
    ).slice(0, 5);

    return values;
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    triggerFeedback.tap();

    const tenders: PaymentTender[] = [];

    if (activeMethod === 'cash') {
      tenders.push({
        method: 'cash',
        amount: grandTotal,
        tendered: cashTendered,
        change: changeDue,
      });
    } else if (activeMethod === 'card') {
      setCardStatus('authorizing');
      await new Promise((r) => setTimeout(r, 1200));
      setCardStatus('approved');
      await new Promise((r) => setTimeout(r, 600));
      tenders.push({
        method: 'card',
        amount: grandTotal,
        reference: 'AUTH-' + Math.floor(100000 + Math.random() * 900000),
      });
    } else if (activeMethod === 'mobile') {
      setMpesaStatus('prompting');
      await new Promise((r) => setTimeout(r, 1200));
      setMpesaStatus('verified');
      await new Promise((r) => setTimeout(r, 600));
      tenders.push({
        method: 'mobile',
        amount: grandTotal,
        reference: 'MPESA-QK' + Math.floor(100000 + Math.random() * 900000),
      });
    } else if (activeMethod === 'split') {
      const part1 = Math.min(splitFirstAmount, grandTotal);
      const part2 = Math.max(0, grandTotal - part1);
      tenders.push({
        method: splitFirstMethod,
        amount: part1,
      });
      tenders.push({
        method: splitSecondMethod,
        amount: part2,
      });
    }

    try {
      await completeCheckout(tenders, tipAmount);
      setIsProcessing(false);
      onClose();
      onSuccess();
    } catch {
      setIsProcessing(false);
      triggerFeedback.error();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Tender Checkout</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {cartSummary.itemCount} items • Terminal {storeSettings.terminalId}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.background }]}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* Total To Collect Banner */}
            <View style={[styles.totalBanner, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View>
                <Text style={[styles.bannerLabel, { color: theme.textSecondary }]}>TOTAL TO COLLECT</Text>
                <Text style={[styles.numericRegister, { color: theme.textPrimary }]}>
                  {formatCurrency(grandTotal, storeSettings.currencySymbol)}
                </Text>
              </View>

              {/* Tip Selection Chips */}
              <View style={styles.tipSection}>
                <Text style={[styles.tipLabel, { color: theme.textSecondary }]}>Tip:</Text>
                <View style={styles.tipChips}>
                  {[0, 10, 15, 20].map((pct) => (
                    <TouchableOpacity
                      key={pct}
                      style={[
                        styles.tipChip,
                        {
                          backgroundColor: tipPercentage === pct ? theme.primary : theme.surface,
                          borderColor: tipPercentage === pct ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setTipPercentage(pct)}
                    >
                      <Text
                        style={[
                          styles.tipChipText,
                          { color: tipPercentage === pct ? '#FFF' : theme.textPrimary },
                        ]}
                      >
                        {pct === 0 ? 'No Tip' : `${pct}%`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Payment Method Selector Tabs */}
            <View style={styles.methodTabs}>
              {[
                { id: 'cash', label: 'Cash Tender', icon: 'cash-outline' },
                { id: 'card', label: 'Credit / Debit', icon: 'card-outline' },
                { id: 'mobile', label: 'Mobile Pay', icon: 'phone-portrait-outline' },
                { id: 'split', label: 'Split Tender', icon: 'git-branch-outline' },
              ].map((tab) => {
                const isSelected = activeMethod === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.methodTab,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      triggerFeedback.tap();
                      setActiveMethod(tab.id as PaymentMethodType);
                    }}
                  >
                    <Ionicons
                      name={tab.icon as any}
                      size={20}
                      color={isSelected ? '#FFFFFF' : theme.accent}
                    />
                    <Text
                      style={[
                        styles.methodTabLabel,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cash Tender Interface with Tactile Quick Buttons */}
            {activeMethod === 'cash' && (
              <View style={[styles.tenderPanel, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.panelTitle, { color: theme.textSecondary }]}>
                  Quick Cash Tendered:
                </Text>

                <View style={styles.quickCashGrid}>
                  {getQuickCashButtons().map((val, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.quickCashBtn,
                        {
                          backgroundColor: cashTendered === val ? theme.primary : theme.surface,
                          borderColor: cashTendered === val ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setCashTendered(val)}
                    >
                      <Text
                        style={[
                          styles.quickCashText,
                          { color: cashTendered === val ? '#FFF' : theme.textPrimary },
                        ]}
                      >
                        {val === grandTotal ? 'Exact ' : ''}
                        {formatCurrency(val, storeSettings.currencySymbol)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Change Due Highlight Box (Success chip #EAF8F1 bg, #32B67A text) */}
                <View
                  style={[
                    styles.changeBox,
                    {
                      backgroundColor: changeDue > 0 ? theme.successBg : theme.surface,
                      borderColor: changeDue > 0 ? theme.success : theme.border,
                    },
                  ]}
                >
                  <View>
                    <Text style={[styles.changeLabel, { color: theme.textSecondary }]}>CHANGE TO RETURN</Text>
                    <Text
                      style={[
                        styles.changeAmount,
                        { color: changeDue > 0 ? theme.success : theme.textPrimary },
                      ]}
                    >
                      {formatCurrency(changeDue, storeSettings.currencySymbol)}
                    </Text>
                  </View>
                  <Ionicons
                    name={changeDue > 0 ? 'checkmark-circle' : 'cash-outline'}
                    size={36}
                    color={changeDue > 0 ? theme.success : theme.textSecondary}
                  />
                </View>
              </View>
            )}

            {/* Card Terminal Interface */}
            {activeMethod === 'card' && (
              <View style={[styles.tenderPanel, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.cardReaderContainer}>
                  <View
                    style={[
                      styles.cardReaderIconCircle,
                      {
                        backgroundColor:
                          cardStatus === 'approved' ? theme.successBg : theme.surface,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        cardStatus === 'approved'
                          ? 'checkmark-done-circle'
                          : cardStatus === 'authorizing'
                            ? 'sync-outline'
                            : 'radio-outline'
                      }
                      size={44}
                      color={cardStatus === 'approved' ? theme.success : theme.primary}
                    />
                  </View>
                  <Text style={[styles.cardStatusTitle, { color: theme.textPrimary }]}>
                    {cardStatus === 'authorizing'
                      ? 'Authorizing EMV Chip with Bank...'
                      : cardStatus === 'approved'
                        ? 'Approved! Transaction Verified'
                        : 'Insert, Tap or Swipe Card on Terminal'}
                  </Text>
                  <Text style={[styles.cardStatusSubtitle, { color: theme.textSecondary }]}>
                    EMV Chip • NFC Contactless • Magstripe
                  </Text>
                </View>
              </View>
            )}

            {/* Mobile Pay Interface */}
            {activeMethod === 'mobile' && (
              <View style={[styles.tenderPanel, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.cardReaderContainer}>
                  <Ionicons name="qr-code-outline" size={52} color={theme.primary} />
                  <Text style={[styles.cardStatusTitle, { color: theme.textPrimary }]}>
                    Present Device or Scan QR Code
                  </Text>
                  <Text style={[styles.cardStatusSubtitle, { color: theme.textSecondary }]}>
                    Apple Pay, Google Wallet & Instant Payment Codes
                  </Text>
                </View>
              </View>
            )}

            {/* Split Tender Interface */}
            {activeMethod === 'split' && (
              <View style={[styles.tenderPanel, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.panelTitle, { color: theme.textSecondary }]}>
                  Split Sale into 2 Tenders:
                </Text>

                <View style={styles.splitRow}>
                  <Text style={[styles.splitLabel, { color: theme.textPrimary }]}>
                    Tender 1 (Cash):
                  </Text>
                  <View style={styles.splitChips}>
                    {[10, 20, Math.floor(grandTotal / 2)].map((amt) => (
                      <TouchableOpacity
                        key={amt}
                        style={[
                          styles.splitAmtChip,
                          {
                            backgroundColor: splitFirstAmount === amt ? theme.primary : theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                        onPress={() => setSplitFirstAmount(amt)}
                      >
                        <Text
                          style={[
                            styles.splitAmtText,
                            { color: splitFirstAmount === amt ? '#FFF' : theme.textPrimary },
                          ]}
                        >
                          {formatCurrency(amt, storeSettings.currencySymbol)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.splitRow}>
                  <Text style={[styles.splitLabel, { color: theme.textPrimary }]}>
                    Tender 2 (Card):
                  </Text>
                  <Text style={[styles.splitRemaining, { color: theme.primaryDark }]}>
                    {formatCurrency(
                      Math.max(0, grandTotal - splitFirstAmount),
                      storeSettings.currencySymbol
                    )}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: isProcessing ? 0.7 : 1,
                },
              ]}
              onPress={handleProcessPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.confirmContent}>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmText}>
                    COMPLETE SALE ({formatCurrency(grandTotal, storeSettings.currencySymbol)})
                  </Text>
                </View>
              )}
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
    backgroundColor: 'rgba(17, 29, 35, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#263238',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    gap: 16,
  },
  totalBanner: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  bannerLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  numericRegister: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  tipSection: {
    alignItems: 'flex-end',
  },
  tipLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    marginBottom: 6,
  },
  tipChips: {
    flexDirection: 'row',
    gap: 6,
  },
  tipChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tipChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  methodTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    minHeight: 52,
  },
  methodTabLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    textAlign: 'center',
  },
  tenderPanel: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  panelTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    marginBottom: 12,
  },
  quickCashGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickCashBtn: {
    flex: 1,
    minWidth: 96,
    minHeight: 52,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCashText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  changeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  changeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  changeAmount: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  cardReaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  cardReaderIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardStatusTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    textAlign: 'center',
  },
  cardStatusSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  splitLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  splitChips: {
    flexDirection: 'row',
    gap: 6,
  },
  splitAmtChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  splitAmtText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  splitRemaining: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
