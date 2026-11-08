import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { POSSubHeader } from '../components/POSSubHeader';
import { CartPanel } from '../components/CartPanel';
import { ProductCard } from '../components/ProductCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { ScannerModal } from '../components/ScannerModal';
import { HeldOrdersModal } from '../components/HeldOrdersModal';
import { ShiftSummaryModal } from '../components/ShiftSummaryModal';
import { CustomItemModal } from '../components/CustomItemModal';

export const POSTerminalScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const {
    theme,
    filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    lastCompletedOrder,
  } = usePOS();

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHeldOrdersOpen, setIsHeldOrdersOpen] = useState(false);
  const [isShiftSummaryOpen, setIsShiftSummaryOpen] = useState(false);
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);

  const handleCheckoutSuccess = () => {
    setIsReceiptOpen(true);
  };

  // Determine column count for the product matrix
  const isLarge = width >= 1200;
  const numColumns = isLarge ? 4 : 3;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* 1. Sub-Header Status Bar */}
      <POSSubHeader />

      {/* 2. Main Terminal Content (Split Screen: Catalog Matrix on Left, POS Terminal Cart on Right) */}
      <View style={styles.terminalBody}>
        {/* Left Column: Catalog Matrix */}
        <View style={styles.catalogColumn}>
          {/* Top Search & Hardware Barcode Status Bar */}
          <View style={[styles.searchBarcodeRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="search" size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Search products by name, barcode or SKU... (Enter)"
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Laser Barcode Scanner Online Status Card */}
            <TouchableOpacity
              style={[styles.laserBarcodeCard, { backgroundColor: theme.tealChipBg, borderColor: theme.primary }]}
              onPress={() => setIsScannerOpen(true)}
            >
              <Ionicons name="barcode-outline" size={16} color={theme.tealChipText} />
              <Text style={[styles.laserCardText, { color: theme.tealChipText }]}>Laser Barcode</Text>
              <View style={[styles.onlinePill, { backgroundColor: theme.successBg }]}>
                <Text style={[styles.onlinePillText, { color: theme.success }]}>ONLINE</Text>
              </View>
              <Text style={styles.barcodeGlyphs}>[|||||||]</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter Chips Bar */}
          <View style={[styles.categoryRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? '#006A66' : theme.surface,
                        borderColor: isSelected ? '#006A66' : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Product Cards Matrix Grid */}
          <ScrollView
            style={styles.gridScroll}
            contentContainerStyle={styles.gridScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <View
                  key={product.id}
                  style={[
                    styles.gridItemWrapper,
                    { width: isLarge ? '23.8%' : '31.8%' },
                  ]}
                >
                  <ProductCard product={product} cardWidth={180} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Right Column: Transaction Cart Ledger (POS Terminal) */}
        <CartPanel onOpenCheckout={() => setIsCheckoutOpen(true)} position="right" />
      </View>

      {/* Checkout & Payment Modal */}
      <CheckoutModal
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Thermal Receipt Preview Modal */}
      <ReceiptModal
        visible={isReceiptOpen && lastCompletedOrder !== null}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Barcode Scanner Modal */}
      <ScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* Parked / Held Tickets Modal */}
      <HeldOrdersModal
        visible={isHeldOrdersOpen}
        onClose={() => setIsHeldOrdersOpen(false)}
      />

      {/* Register Shift Reconciliation Modal */}
      <ShiftSummaryModal
        visible={isShiftSummaryOpen}
        onClose={() => setIsShiftSummaryOpen(false)}
      />

      {/* Open-Price Keypad Custom Item Modal */}
      <CustomItemModal
        visible={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  terminalBody: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  catalogColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  searchBarcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchBox: {
    flex: 1,
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
  laserBarcodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
  },
  laserCardText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  onlinePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlinePillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  barcodeGlyphs: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
    color: '#006A66',
  },
  categoryRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  gridScroll: {
    flex: 1,
  },
  gridScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItemWrapper: {
    minWidth: 170,
  },
});
