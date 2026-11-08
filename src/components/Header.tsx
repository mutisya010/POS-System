import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenHeldOrders: () => void;
  onOpenShiftSummary: () => void;
  onOpenCustomItem: () => void;
  onToggleMobileCart?: () => void;
  isTabletOrDesktop: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenHeldOrders,
  onOpenShiftSummary,
  onOpenCustomItem,
  onToggleMobileCart,
  isTabletOrDesktop,
}) => {
  const {
    theme,
    themeMode,
    toggleTheme,
    storeSettings,
    searchQuery,
    setSearchQuery,
    heldOrders,
    shiftStats,
    cartSummary,
  } = usePOS();

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
      {/* Brand & Terminal Hub */}
      <View style={styles.brandSection}>
        <View style={[styles.terminalBadge, { backgroundColor: theme.sidebarTeal }]}>
          <Ionicons name="storefront" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.brandTextContainer}>
          <Text style={[styles.storeName, { color: theme.textPrimary }]} numberOfLines={1}>
            {storeSettings.storeName}
          </Text>
          <View style={styles.terminalMeta}>
            <View style={[styles.liveIndicator, { backgroundColor: theme.success }]} />
            <Text style={[styles.terminalId, { color: theme.textSecondary }]}>
              {storeSettings.terminalId} • {shiftStats.cashierName.split(' ')[0]}
            </Text>
          </View>
        </View>
      </View>

      {/* Global Search & Barcode Input Field */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search items, SKU, or scan barcode..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Triggers */}
      <View style={styles.actionsSection}>
        {/* Custom Open-Price Keypad Item Entry */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.tealChipBg, borderColor: 'transparent' }]}
          onPress={onOpenCustomItem}
          accessibilityLabel="Custom Item Keypad"
        >
          <Ionicons name="calculator-outline" size={18} color={theme.tealChipText} />
          {isTabletOrDesktop && (
            <Text style={[styles.actionLabel, { color: theme.tealChipText }]}>+ Custom</Text>
          )}
        </TouchableOpacity>

        {/* Barcode Scanner Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onOpenScanner}
          accessibilityLabel="Open Barcode Scanner"
        >
          <Ionicons name="barcode-outline" size={18} color={theme.primary} />
          {isTabletOrDesktop && (
            <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Scan</Text>
          )}
        </TouchableOpacity>

        {/* Parked / Held Tickets */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onOpenHeldOrders}
          accessibilityLabel="Held Orders"
        >
          <Ionicons name="pause-circle-outline" size={18} color={theme.warning} />
          {isTabletOrDesktop && (
            <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Parked</Text>
          )}
          {heldOrders.length > 0 && (
            <View style={[styles.counterBadge, { backgroundColor: theme.warning }]}>
              <Text style={styles.counterText}>{heldOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Register / Shift Metrics */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onOpenShiftSummary}
          accessibilityLabel="Register Shift Stats"
        >
          <Ionicons name="stats-chart-outline" size={18} color={theme.success} />
          {isTabletOrDesktop && (
            <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Shift</Text>
          )}
        </TouchableOpacity>

        {/* Theme Toggle (Dark / Light) */}
        <TouchableOpacity
          style={[styles.iconOnlyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={toggleTheme}
          accessibilityLabel="Toggle Dark / Light Mode"
        >
          <Ionicons
            name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={themeMode === 'dark' ? '#F2A541' : '#238F8A'}
          />
        </TouchableOpacity>

        {/* Compact Mobile Cart Toggle Button */}
        {!isTabletOrDesktop && onToggleMobileCart && (
          <TouchableOpacity
            style={[styles.mobileCartButton, { backgroundColor: theme.primary }]}
            onPress={onToggleMobileCart}
            accessibilityLabel="View Cart"
          >
            <Ionicons name="cart" size={20} color="#FFFFFF" />
            {cartSummary.itemCount > 0 && (
              <View style={[styles.mobileCartBadge, { backgroundColor: theme.danger }]}>
                <Text style={styles.mobileCartBadgeText}>{cartSummary.itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
    gap: 14,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 190,
  },
  terminalBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  terminalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  terminalId: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 520,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    padding: 0,
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    position: 'relative',
  },
  iconOnlyBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  counterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  mobileCartButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mobileCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  mobileCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    fontWeight: '800',
  },
});
