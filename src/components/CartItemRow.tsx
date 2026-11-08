import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types/pos';
import { usePOS } from '../context/POSContext';
import { formatCurrency } from '../utils/formatters';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { theme, storeSettings, updateQuantity, removeFromCart } = usePOS();

  const lineSubtotal = item.product.price * item.quantity;
  const lineDiscount = item.discountPercent ? lineSubtotal * (item.discountPercent / 100) : 0;
  const finalLineTotal = lineSubtotal - lineDiscount;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {/* Product Image Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {item.product.image ? (
          <Image source={{ uri: item.product.image }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.background }]}>
            <Ionicons name="cube-outline" size={18} color={theme.textSecondary} />
          </View>
        )}
      </View>

      {/* Item Title, Unit Price, SKU */}
      <View style={styles.infoCol}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={[styles.unitPrice, { color: theme.textSecondary }]}>
          {formatCurrency(item.product.price, storeSettings.currencySymbol)} each
        </Text>
        <Text style={[styles.skuText, { color: theme.textSecondary }]}>
          SKU: {item.product.sku}
        </Text>
      </View>

      {/* Stepper Counters ([-] [ qty ] [+]) */}
      <View style={[styles.stepperContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => updateQuantity(item.id, -1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="remove" size={13} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.qtyText, { color: theme.textPrimary }]}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => updateQuantity(item.id, 1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={13} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Line Total & Trash icon */}
      <View style={styles.rightCol}>
        <Text style={[styles.lineTotal, { color: theme.textPrimary }]}>
          {formatCurrency(finalLineTotal, storeSettings.currencySymbol)}
        </Text>
        <TouchableOpacity
          style={styles.trashBtn}
          onPress={() => removeFromCart(item.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="trash-outline" size={15} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  thumbnailContainer: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    marginBottom: 1,
  },
  unitPrice: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    fontVariant: ['tabular-nums'],
  },
  skuText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    height: 28,
  },
  stepperBtn: {
    width: 24,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  rightCol: {
    alignItems: 'flex-end',
    minWidth: 70,
    gap: 4,
  },
  lineTotal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  trashBtn: {
    padding: 2,
  },
});
