import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { formatCurrency } from '../utils/formatters';
import { triggerFeedback } from '../utils/sound';

interface InventoryStudioModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InventoryStudioModal: React.FC<InventoryStudioModalProps> = ({ visible, onClose }) => {
  const { theme, storeSettings, products, updateProduct, addProduct, categories } = usePOS();

  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('20');
  const [newCategory, setNewCategory] = useState('retail');

  // Filtered products list
  const filteredList = products.filter((p) => {
    const matchesCat = selectedCatFilter === 'all' || p.categoryId === selectedCatFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      q.length === 0 ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    return matchesCat && matchesSearch;
  });

  const handleAdjustStock = (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    updateProduct(product.id, { stock: nextStock });
    triggerFeedback.tap();
  };

  const handleSaveNewProduct = () => {
    const priceNum = parseFloat(newPrice);
    const stockNum = parseInt(newStock, 10);

    if (!newName.trim() || isNaN(priceNum) || priceNum <= 0) {
      triggerFeedback.warning();
      return;
    }

    addProduct({
      name: newName.trim(),
      sku: newSku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: newBarcode.trim() || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      price: priceNum,
      categoryId: newCategory,
      stock: isNaN(stockNum) ? 0 : Math.max(0, stockNum),
      taxRate: storeSettings.taxRateDefault,
      color: theme.primary,
      description: 'Added via Inventory Studio',
    });

    // Reset form
    setNewName('');
    setNewSku('');
    setNewBarcode('');
    setNewPrice('');
    setNewStock('20');
    setShowAddForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Studio Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconCircle, { backgroundColor: theme.tealChipBg }]}>
                <Ionicons name="cube" size={20} color={theme.tealChipText} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Inventory Studio</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {products.length} catalog items • Stock control & catalog management
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.addProdBtn, { backgroundColor: theme.primary }]}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Ionicons name={showAddForm ? 'close' : 'add'} size={18} color="#FFFFFF" />
                <Text style={styles.addProdBtnText}>{showAddForm ? 'Cancel' : 'New Item'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.background }]}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Product Form Panel */}
          {showAddForm && (
            <View style={[styles.addFormContainer, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
              <Text style={[styles.formTitle, { color: theme.textPrimary }]}>Add New Catalog Product</Text>
              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Item Name *</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                    placeholder="e.g. Matcha Green Tea Latte"
                    placeholderTextColor={theme.textSecondary}
                    value={newName}
                    onChangeText={setNewName}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Selling Price ($) *</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                    placeholder="e.g. 5.50"
                    placeholderTextColor={theme.textSecondary}
                    value={newPrice}
                    onChangeText={setNewPrice}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Initial Stock</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                    placeholder="e.g. 25"
                    placeholderTextColor={theme.textSecondary}
                    value={newStock}
                    onChangeText={setNewStock}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>SKU Code</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                    placeholder="e.g. TEA-MAT-05"
                    placeholderTextColor={theme.textSecondary}
                    value={newSku}
                    onChangeText={setNewSku}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Barcode / UPC</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                    placeholder="e.g. 012345678920"
                    placeholderTextColor={theme.textSecondary}
                    value={newBarcode}
                    onChangeText={setNewBarcode}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Category</Text>
                  <View style={styles.categorySelectRow}>
                    {categories.filter((c) => c.id !== 'all').map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.catSelectChip,
                          {
                            backgroundColor: newCategory === cat.id ? theme.primary : theme.surface,
                            borderColor: newCategory === cat.id ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setNewCategory(cat.id)}
                      >
                        <Text
                          style={[
                            styles.catSelectChipText,
                            { color: newCategory === cat.id ? '#FFF' : theme.textPrimary },
                          ]}
                        >
                          {cat.name.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.formActionRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveNewProduct}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Product to Inventory</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Search & Filter Toolbar */}
          <View style={[styles.toolbar, { borderBottomColor: theme.border }]}>
            <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="search" size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Filter by title, SKU or barcode..."
                placeholderTextColor={theme.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChips}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.toolbarChip,
                    {
                      backgroundColor: selectedCatFilter === c.id ? theme.primary : theme.surface,
                      borderColor: selectedCatFilter === c.id ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCatFilter(c.id)}
                >
                  <Text
                    style={[
                      styles.toolbarChipText,
                      { color: selectedCatFilter === c.id ? '#FFF' : theme.textSecondary },
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tabular Inventory Matrix */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* Table Header Row */}
            <View style={[styles.tableHeader, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
              <Text style={[styles.colProduct, styles.thText, { color: theme.textSecondary }]}>ITEM / SKU</Text>
              <Text style={[styles.colCategory, styles.thText, { color: theme.textSecondary }]}>CATEGORY</Text>
              <Text style={[styles.colPrice, styles.thText, { color: theme.textSecondary }]}>PRICE</Text>
              <Text style={[styles.colStatus, styles.thText, { color: theme.textSecondary }]}>STATUS</Text>
              <Text style={[styles.colStock, styles.thText, { color: theme.textSecondary }]}>IN STOCK</Text>
              <Text style={[styles.colActions, styles.thText, { color: theme.textSecondary }]}>RESTOCK</Text>
            </View>

            {/* Table Rows */}
            {filteredList.map((item) => {
              const isOutOfStock = item.stock <= 0;
              const isLowStock = item.stock > 0 && item.stock <= 10;
              const statusBg = isOutOfStock ? theme.dangerBg : isLowStock ? theme.warningBg : theme.successBg;
              const statusColor = isOutOfStock ? theme.danger : isLowStock ? theme.warning : theme.success;
              const statusText = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Optimal';

              return (
                <View
                  key={item.id}
                  style={[styles.tableRow, { borderBottomColor: theme.border }]}
                >
                  {/* Product Title & SKU */}
                  <View style={styles.colProduct}>
                    <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.rowSku, { color: theme.textSecondary }]}>
                      {item.sku} • {item.barcode}
                    </Text>
                  </View>

                  {/* Category */}
                  <View style={styles.colCategory}>
                    <View style={[styles.categoryBadge, { backgroundColor: theme.tealChipBg }]}>
                      <Text style={[styles.categoryBadgeText, { color: theme.tealChipText }]}>
                        {item.categoryId}
                      </Text>
                    </View>
                  </View>

                  {/* Selling Price */}
                  <View style={styles.colPrice}>
                    <Text style={[styles.rowPrice, { color: theme.primaryDark }]}>
                      {formatCurrency(item.price, storeSettings.currencySymbol)}
                    </Text>
                  </View>

                  {/* Stock Status Badge */}
                  <View style={styles.colStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                  </View>

                  {/* Inventory Count */}
                  <View style={styles.colStock}>
                    <Text
                      style={[
                        styles.stockNumber,
                        { color: isOutOfStock ? theme.danger : theme.textPrimary },
                      ]}
                    >
                      {item.stock}
                    </Text>
                  </View>

                  {/* Quick Adjust Stepper */}
                  <View style={styles.colActions}>
                    <View style={[styles.adjustStepper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                      <TouchableOpacity
                        style={styles.adjustBtn}
                        onPress={() => handleAdjustStock(item, -1)}
                      >
                        <Ionicons name="remove" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.adjustBtn}
                        onPress={() => handleAdjustStock(item, 5)}
                      >
                        <Ionicons name="add" size={14} color={theme.primaryDark} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 29, 35, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 960,
    maxHeight: '92%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addProdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
  },
  addProdBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFormContainer: {
    padding: 20,
    borderBottomWidth: 1,
    gap: 14,
  },
  formTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formField: {
    flex: 1,
    minWidth: 180,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  fieldInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  catSelectChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  catSelectChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  formActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    width: 240,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    padding: 0,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  catChips: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  toolbarChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  toolbarChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    height: 40,
    borderBottomWidth: 1,
  },
  thText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    height: 52,
    borderBottomWidth: 1,
  },
  colProduct: {
    flex: 2.5,
    minWidth: 160,
  },
  colCategory: {
    flex: 1.2,
    minWidth: 100,
  },
  colPrice: {
    flex: 1,
    minWidth: 80,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  colStatus: {
    flex: 1.2,
    minWidth: 100,
    alignItems: 'center',
  },
  colStock: {
    flex: 1,
    minWidth: 70,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  colActions: {
    flex: 1,
    minWidth: 80,
    alignItems: 'flex-end',
  },
  rowTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  rowSku: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rowPrice: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  stockNumber: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  adjustStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  adjustBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

