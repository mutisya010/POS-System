import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { CartItemRow } from './CartItemRow';
import { formatCurrency } from '../utils/formatters';
import { triggerFeedback } from '../utils/sound';

interface CartPanelProps {
  onOpenCheckout: () => void;
  onCloseMobileDrawer?: () => void;
  isMobileModal?: boolean;
  position?: 'left' | 'right';
}

export const CartPanel: React.FC<CartPanelProps> = ({
  onOpenCheckout,
  onCloseMobileDrawer,
  isMobileModal = false,
  position = 'right',
}) => {
  const {
    cart,
    cartSummary,
    clearCart,
    holdCurrentOrder,
    orderDiscountPercent,
    setOrderDiscountPercent,
    storeSettings,
    theme,
    lookupBarcode,
  } = usePOS();

  const [skuInput, setSkuInput] = useState('');
  const [customerName, setCustomerName] = useState('Sarah Wambui (Loyalty #298)');
  const [customerTier, setCustomerTier] = useState('Tier: Gold • 450 Pts');
  const [hasPromo, setHasPromo] = useState(true);

  // Apply default 5% loyalty promo to match the reference ticket
  const discountAmount = hasPromo ? cartSummary.subtotal * 0.05 : 0;
  const taxableTotal = Math.max(0, cartSummary.subtotal - discountAmount);
  const vatInclusive = taxableTotal * (0.16 / 1.16);
  const payableTotal = taxableTotal;

  const handleAddSku = () => {
    if (!skuInput.trim()) return;
    const found = lookupBarcode(skuInput.trim());
    if (found) {
      setSkuInput('');
    } else {
      triggerFeedback.error();
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (Platform.OS === 'web') {
      if (window.confirm('Clear all items from this order ticket?')) {
        clearCart();
      }
    } else {
      Alert.alert('Void Order', 'Are you sure you want to void this ticket?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Void Order', style: 'destructive', onPress: clearCart },
      ]);
    }
  };

  const handleHold = () => {
    if (cart.length === 0) return;
    holdCurrentOrder(customerName);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderRightColor: theme.border,
          borderRightWidth: isMobileModal || position === 'right' ? 0 : 1,
          borderLeftColor: theme.border,
          borderLeftWidth: isMobileModal || position === 'left' ? 0 : 1,
        },
      ]}
    >
      {/* 1. Ticket Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="cart-outline" size={20} color={theme.primaryDark} />
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Current Sale</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Ticket #TXN-98420-KE</Text>
          </View>
        </View>

        <View style={[styles.lanePill, { backgroundColor: theme.tealChipBg }]}>
          <Text style={[styles.lanePillText, { color: theme.tealChipText }]}>Lane #01</Text>
        </View>
      </View>

      {/* 2. Customer Loyalty Card */}
      <View style={[styles.loyaltyCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={[styles.loyaltyAvatar, { backgroundColor: theme.tealChipBg }]}>
          <Ionicons name="person" size={14} color={theme.tealChipText} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.customerName, { color: theme.textPrimary }]} numberOfLines={1}>
              {customerName}
            </Text>
            <Ionicons name="checkmark-circle" size={13} color={theme.success} />
          </View>
          <Text style={[styles.customerTier, { color: theme.textSecondary }]}>{customerTier}</Text>
        </View>
        <TouchableOpacity>
          <Text style={[styles.changeCustomerText, { color: theme.primaryDark }]}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Barcode / SKU Quick Scan Bar */}
      <View style={[styles.scanBarContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={[styles.scanInputBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="barcode-outline" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.scanInput, { color: theme.textPrimary }]}
            placeholder="Scan or enter item SKU / Code..."
            placeholderTextColor={theme.textSecondary}
            value={skuInput}
            onChangeText={setSkuInput}
            onSubmitEditing={handleAddSku}
          />
        </View>
        <TouchableOpacity
          style={[styles.addSkuBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleAddSku}
        >
          <Text style={[styles.addSkuBtnText, { color: theme.textPrimary }]}>ADD</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Cart Items List */}
      <ScrollView style={styles.itemsScroll} contentContainerStyle={styles.itemsScrollContent}>
        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={36} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Items Added</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Tap products from catalog or scan barcodes to begin transaction
            </Text>
          </View>
        ) : (
          cart.map((item) => <CartItemRow key={item.id} item={item} />)
        )}
      </ScrollView>

      {/* 5. Pinned Bottom Calculation Ledger */}
      <View style={[styles.ledgerFooter, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {/* Subtotal */}
        <View style={styles.calcRow}>
          <Text style={[styles.calcLabel, { color: theme.textSecondary }]}>Subtotal</Text>
          <Text style={[styles.calcValue, { color: theme.textPrimary }]}>
            {formatCurrency(cartSummary.subtotal, storeSettings.currencySymbol)}
          </Text>
        </View>

        {/* Promo Code line */}
        {hasPromo && (
          <View style={styles.calcRow}>
            <View style={[styles.promoChip, { backgroundColor: theme.tealChipBg }]}>
              <Ionicons name="pricetag" size={11} color={theme.tealChipText} />
              <Text style={[styles.promoChipText, { color: theme.tealChipText }]}>'LOYALTY5' (-5%)</Text>
              <TouchableOpacity onPress={() => setHasPromo(false)}>
                <Ionicons name="close" size={12} color={theme.tealChipText} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.calcValue, { color: theme.primaryDark }]}>
              -{formatCurrency(discountAmount, storeSettings.currencySymbol)}
            </Text>
          </View>
        )}

        {/* VAT Line */}
        <View style={styles.calcRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.calcLabel, { color: theme.textSecondary }]}>VAT (16% inclusive)</Text>
            <Ionicons name="information-circle-outline" size={12} color={theme.textSecondary} />
          </View>
          <Text style={[styles.calcValue, { color: theme.textSecondary }]}>
            {formatCurrency(vatInclusive, storeSettings.currencySymbol)}
          </Text>
        </View>

        {/* Grand Total Row */}
        <View style={[styles.grandTotalRow, { borderTopColor: theme.border }]}>
          <View>
            <Text style={[styles.totalPayableLabel, { color: theme.textSecondary }]}>TOTAL PAYABLE</Text>
            <Text style={[styles.totalUnitsLabel, { color: theme.textSecondary }]}>
              {cart.length} items ({cartSummary.itemCount} units)
            </Text>
          </View>

          <Text style={[styles.payableAmountText, { color: theme.primaryDark }]}>
            {formatCurrency(payableTotal, storeSettings.currencySymbol)}
          </Text>
        </View>

        {/* Action Buttons Row (Void, Hold, Promo) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.smallActionBtn, { borderColor: theme.border }]}
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={13} color={theme.danger} />
            <Text style={[styles.smallActionText, { color: theme.danger }]}>Void</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallActionBtn, { borderColor: theme.border }]}
            onPress={handleHold}
          >
            <Ionicons name="pause-circle-outline" size={13} color={theme.textPrimary} />
            <Text style={[styles.smallActionText, { color: theme.textPrimary }]}>Hold</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallActionBtn, { borderColor: theme.border }]}
            onPress={() => setHasPromo(!hasPromo)}
          >
            <Ionicons name="pricetag-outline" size={13} color={theme.textPrimary} />
            <Text style={[styles.smallActionText, { color: theme.textPrimary }]}>Promo</Text>
          </TouchableOpacity>
        </View>

        {/* Big Solid Primary Pay Button */}
        <TouchableOpacity
          style={[
            styles.payNowBtn,
            {
              backgroundColor: theme.primary,
              opacity: cart.length === 0 ? 0.6 : 1,
            },
          ]}
          disabled={cart.length === 0}
          onPress={onOpenCheckout}
          activeOpacity={0.8}
        >
          <View style={styles.payNowContent}>
            <View style={styles.payIconCircle}>
              <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.payNowText}>
              Pay Now ({formatCurrency(payableTotal, storeSettings.currencySymbol)})
            </Text>
            <View style={styles.hotkeyTag}>
              <Text style={styles.hotkeyTagText}>[Space / F12]</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 380,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  lanePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lanePillText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  loyaltyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  loyaltyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  customerTier: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  changeCustomerText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  scanBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
  },
  scanInputBox: {
    flex: 1,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  scanInput: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  addSkuBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSkuBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  itemsScroll: {
    flex: 1,
  },
  itemsScrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    minHeight: 180,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 16,
  },
  ledgerFooter: {
    padding: 14,
    borderTopWidth: 1,
    gap: 6,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  calcLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  calcValue: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  promoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  totalPayableLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  totalUnitsLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  payableAmountText: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  smallActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  smallActionText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  payNowBtn: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#3FAFA9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  payNowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  payIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  hotkeyTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotkeyTagText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
});
