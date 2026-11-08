import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/pos';
import { usePOS } from '../context/POSContext';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  cardWidth: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, cardWidth }) => {
  const { theme, storeSettings, addToCart, cart } = usePOS();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  // Determine badge label & style
  let badgeLabel = `Stock: ${product.stock}`;
  let badgeBg = '#FFFFFF';
  let badgeColor = '#263238';

  if (product.sku === 'BAK-102') {
    badgeLabel = 'Fresh Daily';
    badgeBg = '#E0F2FE';
    badgeColor = '#0284C7';
  } else if (product.sku === 'BEV-205' || isLowStock) {
    badgeLabel = `Low Stock: ${product.stock}`;
    badgeBg = '#FEF3C7';
    badgeColor = '#D97706';
  } else if (product.sku === 'BEV-999') {
    badgeLabel = 'Premium';
    badgeBg = '#D1FAE5';
    badgeColor = '#059669';
  } else if (isOutOfStock) {
    badgeLabel = 'Out of Stock';
    badgeBg = '#FEE2E2';
    badgeColor = '#DC2626';
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: theme.surface,
          borderColor: qtyInCart > 0 ? theme.primary : theme.border,
          borderWidth: qtyInCart > 0 ? 2 : 1,
        },
      ]}
      onPress={() => !isOutOfStock && addToCart(product)}
      activeOpacity={0.8}
      disabled={isOutOfStock}
    >
      {/* Product Image Area with Top-Left Badge */}
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.background }]}>
            <Ionicons name="cube-outline" size={36} color={theme.textSecondary} />
          </View>
        )}

        {/* Top-Left Badge */}
        <View style={[styles.stockBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.stockBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
        </View>

        {/* Cart Quantity Badge if in cart */}
        {qtyInCart > 0 && (
          <View style={[styles.cartIndicator, { backgroundColor: theme.primary }]}>
            <Text style={styles.cartIndicatorText}>{qtyInCart}</Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={styles.content}>
        {/* SKU Code */}
        <Text style={[styles.skuText, { color: theme.textSecondary }]}>{product.sku}</Text>

        {/* Product Name */}
        <Text style={[styles.productName, { color: theme.textPrimary }]} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Price & Quick Add Button */}
        <View style={styles.bottomRow}>
          <Text style={[styles.priceTag, { color: theme.primaryDark }]}>
            {formatCurrency(product.price, storeSettings.currencySymbol)}
          </Text>

          <View
            style={[
              styles.quickAddBtn,
              {
                backgroundColor: qtyInCart > 0 ? theme.primary : theme.tealChipBg,
              },
            ]}
          >
            <Ionicons
              name="cart"
              size={15}
              color={qtyInCart > 0 ? '#FFFFFF' : theme.tealChipText}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#263238',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  stockBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cartIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  cartIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  content: {
    padding: 10,
  },
  skuText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceTag: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  quickAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
