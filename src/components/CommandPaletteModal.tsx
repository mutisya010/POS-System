import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';
import { ActiveNavScreen } from './Sidebar';

interface CommandPaletteModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: ActiveNavScreen) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const { theme, products, addToCart } = usePOS();
  const [query, setQuery] = useState('');

  if (!visible) return null;

  const quickActions: { id: string; label: string; icon: any; screen: ActiveNavScreen }[] = [
    { id: 'act-sale', label: 'Start New Sale (POS Register Lane)', icon: 'cart-outline', screen: 'sales' },
    { id: 'act-orders', label: 'View Recent Orders & Transaction Ledger', icon: 'document-text-outline', screen: 'orders' },
    { id: 'act-inv', label: 'Open Product Inventory & Stock Registry', icon: 'cube-outline', screen: 'products' },
    { id: 'act-cust', label: 'Lookup Customer Directory & Loyalty Cards', icon: 'people-outline', screen: 'customers' },
    { id: 'act-rep', label: 'Generate Financial Audit & Daily Z-Report', icon: 'bar-chart-outline', screen: 'reports' },
    { id: 'act-ret', label: 'Process Customer Item Return / Exchange', icon: 'arrow-undo-outline', screen: 'returns' },
    { id: 'act-disc', label: 'Manage Promo Codes & Discounts', icon: 'pricetag-outline', screen: 'discounts' },
    { id: 'act-staff', label: 'Manage Cashier Roster & Lane Access', icon: 'person-circle-outline', screen: 'users' },
  ];

  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchedProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.barcode.includes(query)
      )
    : [];

  const handleAction = (screen: ActiveNavScreen) => {
    triggerFeedback.tap();
    onClose();
    onNavigate(screen);
  };

  const handleAddProduct = (p: any) => {
    triggerFeedback.scanBeep();
    addToCart(p);
    onClose();
    onNavigate('sales');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.paletteContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <View style={[styles.searchRow, { borderBottomColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.primaryDark} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Search products, orders, customers, or jump to screen..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            ) : (
              <View style={[styles.escChip, { backgroundColor: theme.borderSubtle }]}>
                <Text style={[styles.escText, { color: theme.textSecondary }]}>ESC</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.resultsScroll} keyboardShouldPersistTaps="handled">
            {/* Matched Products */}
            {matchedProducts.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PRODUCTS ({matchedProducts.length})</Text>
                {matchedProducts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.itemRow, { borderBottomColor: theme.borderSubtle }]}
                    onPress={() => handleAddProduct(p)}
                  >
                    <View style={[styles.itemIcon, { backgroundColor: theme.tealChipBg }]}>
                      <Ionicons name="cube-outline" size={16} color={theme.primaryDark} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{p.name}</Text>
                      <Text style={[styles.itemSub, { color: theme.textSecondary }]}>{p.sku} • Stock: {p.stock}</Text>
                    </View>
                    <Text style={[styles.itemPrice, { color: theme.primaryDark }]}>{formatCurrency(p.price)}</Text>
                    <View style={[styles.addChip, { backgroundColor: theme.primaryDark }]}>
                      <Text style={styles.addChipText}>+ Add to Cart</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Actions & Navigation */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>QUICK NAVIGATION</Text>
              {filteredActions.map((act) => (
                <TouchableOpacity
                  key={act.id}
                  style={[styles.itemRow, { borderBottomColor: theme.borderSubtle }]}
                  onPress={() => handleAction(act.screen)}
                >
                  <View style={[styles.itemIcon, { backgroundColor: theme.tealChipBg }]}>
                    <Ionicons name={act.icon} size={16} color={theme.primaryDark} />
                  </View>
                  <Text style={[styles.itemTitle, { color: theme.textPrimary, flex: 1 }]}>{act.label}</Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer Hints */}
          <View style={[styles.paletteFooter, { borderTopColor: theme.border, backgroundColor: theme.borderSubtle }]}>
            <Text style={[styles.footerHint, { color: theme.textSecondary }]}>
              Tip: Press <Text style={{ fontWeight: '700' }}>[Ctrl+K]</Text> or <Text style={{ fontWeight: '700' }}>[Cmd+K]</Text> anywhere to open Command Palette
            </Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 29, 35, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  paletteContainer: {
    width: '90%',
    maxWidth: 620,
    maxHeight: '75%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  escChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  escText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  resultsScroll: {
    maxHeight: 400,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Inter_700Bold',
    marginVertical: 8,
    paddingHorizontal: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    marginRight: 6,
  },
  addChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  paletteFooter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerHint: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});

