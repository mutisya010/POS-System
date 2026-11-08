import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  sku: string;
  barcode: string;
  category: 'Beverages' | 'Dairy' | 'Groceries' | 'Snacks' | 'Personal Care' | 'Dry Goods';
  costPrice: number;
  sellingPrice: number;
  marginPct: number;
  availableStock: number;
  stockThreshold: number;
  image?: string;
  shelfLocation?: string;
}

const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Java House Kenya Blend 375g',
    brand: 'Java House Kenya',
    sku: 'SKU-BV-001',
    barcode: '616110023412',
    category: 'Beverages',
    costPrice: 245.0,
    sellingPrice: 350.0,
    marginPct: 31.4,
    availableStock: 85,
    stockThreshold: 20,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&q=80',
    shelfLocation: 'Aisle 3 • Shelf B',
  },
  {
    id: 'inv-2',
    name: 'Brookside Whole Milk 500ml',
    brand: 'Brookside Dairy',
    sku: 'SKU-DY-104',
    barcode: '616110091823',
    category: 'Dairy',
    costPrice: 52.0,
    sellingPrice: 65.0,
    marginPct: 20.0,
    availableStock: 12,
    stockThreshold: 30,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80',
    shelfLocation: 'Chiller 1',
  },
  {
    id: 'inv-3',
    name: 'Elianto Pure Corn Oil 1L',
    brand: 'Bidco Africa',
    sku: 'SKU-GR-410',
    barcode: '616110055102',
    category: 'Groceries',
    costPrice: 380.0,
    sellingPrice: 460.0,
    marginPct: 17.4,
    availableStock: 142,
    stockThreshold: 40,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80',
    shelfLocation: 'Aisle 5 • Shelf A',
  },
  {
    id: 'inv-4',
    name: 'Urban Bites Salt & Vinegar 120g',
    brand: 'Norda Industries',
    sku: 'SKU-SN-822',
    barcode: '616110034981',
    category: 'Snacks',
    costPrice: 110.0,
    sellingPrice: 160.0,
    marginPct: 31.2,
    availableStock: 0,
    stockThreshold: 25,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&q=80',
    shelfLocation: 'Aisle 2 • Endcap',
  },
  {
    id: 'inv-5',
    name: 'Dettol Herbal Soap Multi-Pack',
    brand: 'Reckitt Benckiser',
    sku: 'SKU-PC-503',
    barcode: '616110077239',
    category: 'Personal Care',
    costPrice: 320.0,
    sellingPrice: 420.0,
    marginPct: 23.8,
    availableStock: 54,
    stockThreshold: 15,
    image: 'https://images.unsplash.com/photo-1607006314644-84c48972f0f4?w=200&q=80',
    shelfLocation: 'Aisle 6 • Shelf D',
  },
  {
    id: 'inv-6',
    name: 'Kericho Gold Pure Black Tea 100pk',
    brand: 'Gold Crown Foods',
    sku: 'SKU-BV-331',
    barcode: '616110011408',
    category: 'Beverages',
    costPrice: 185.0,
    sellingPrice: 255.0,
    marginPct: 27.4,
    availableStock: 68,
    stockThreshold: 20,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&q=80',
    shelfLocation: 'Aisle 3 • Shelf A',
  },
];

export const ProductsScreen: React.FC = () => {
  const { theme, storeSettings } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;

  const [items, setItems] = useState<InventoryItem[]>(SAMPLE_INVENTORY);
  const [showAddDrawer, setShowAddDrawer] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'pricing' | 'stock' | 'supplier'>('basic');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // New product form
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Groceries' | 'Beverages' | 'Dairy' | 'Snacks' | 'Personal Care'>('Groceries');
  const [formBrand, setFormBrand] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSaveProduct = () => {
    if (!formName.trim()) {
      triggerFeedback.warning();
      return;
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: formName.trim(),
      brand: formBrand.trim() || 'Landmark Direct',
      sku: `SKU-${formCategory.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `6161100${Math.floor(10000 + Math.random() * 90000)}`,
      category: formCategory,
      costPrice: 150.0,
      sellingPrice: 220.0,
      marginPct: 31.8,
      availableStock: 50,
      stockThreshold: 15,
      shelfLocation: formDesc.trim() || 'Central Staging',
    };

    setItems([newItem, ...items]);
    setFormName('');
    setFormBrand('');
    setFormDesc('');
    triggerFeedback.success();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Toolbar */}
      <View style={styles.topHeader}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Products & Inventory</Text>
            <View style={[styles.syncBadge, { backgroundColor: theme.tealChipBg }]}>
              <Text style={[styles.syncBadgeText, { color: theme.tealChipText }]}>Active Lane 01 Sync</Text>
            </View>
          </View>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Manage your catalog, stock levels, suppliers and barcode SKUs across regional hubs.
          </Text>
        </View>

        <View style={styles.topActionsRow}>
          <TouchableOpacity style={[styles.btnWhite, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="cloud-upload-outline" size={14} color={theme.textPrimary} />
            <Text style={[styles.btnWhiteText, { color: theme.textPrimary }]}>Import CSV/Excel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnWhite, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="download-outline" size={14} color={theme.textPrimary} />
            <Text style={[styles.btnWhiteText, { color: theme.textPrimary }]}>Export Catalog</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnWhite, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="barcode-outline" size={14} color={theme.textPrimary} />
            <Text style={[styles.btnWhiteText, { color: theme.textPrimary }]}>Bulk Barcodes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimaryTeal, { backgroundColor: theme.primaryDark }]}
            onPress={() => setShowAddDrawer(true)}
          >
            <Ionicons name="add-circle" size={16} color="#FFFFFF" />
            <Text style={styles.btnPrimaryTealText}>+ Add New Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Four Operational KPI Cards */}
      <View style={styles.kpiRow}>
        {/* Total Products */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>TOTAL PRODUCTS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: theme.tealChipBg }]}>
              <Ionicons name="cube-outline" size={16} color={theme.tealChipText} />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>1,420</Text>
          <View style={styles.kpiSubRow}>
            <Ionicons name="trending-up" size={12} color={theme.success} />
            <Text style={[styles.kpiTrend, { color: theme.success }]}>+24 this month</Text>
            <Text style={[styles.kpiSubMuted, { color: theme.textSecondary }]}>• 98.2% catalog health</Text>
          </View>
        </View>

        {/* Available Stock */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>AVAILABLE STOCK</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: theme.tealChipBg }]}>
              <Ionicons name="business-outline" size={16} color={theme.tealChipText} />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>18,650</Text>
          <View style={styles.kpiSubRow}>
            <Text style={[styles.kpiSubText, { color: theme.textSecondary }]}>Central & Retail Depots</Text>
            <Text style={[styles.kpiSubVal, { color: theme.primaryDark }]}>KSh 6.4M Val.</Text>
          </View>
        </View>

        {/* Low Stock Alerts */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>LOW STOCK ALERTS</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: theme.warningBg }]}>
              <Ionicons name="warning-outline" size={16} color={theme.warning} />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>14</Text>
          <View style={styles.kpiSubRow}>
            <View style={[styles.urgentBadge, { backgroundColor: theme.tealChipBg }]}>
              <Text style={[styles.urgentBadgeText, { color: theme.tealChipText }]}>Urgent Reorder</Text>
            </View>
            <Text style={[styles.kpiSubText, { color: theme.textSecondary }]}>Across 3 categories</Text>
          </View>
        </View>

        {/* Out of Stock */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>OUT OF STOCK</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: theme.dangerBg }]}>
              <Ionicons name="close-circle-outline" size={16} color={theme.danger} />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: theme.danger }]}>3</Text>
          <View style={styles.kpiSubRow}>
            <View style={[styles.poBadge, { backgroundColor: theme.dangerBg }]}>
              <Text style={[styles.poBadgeText, { color: theme.danger }]}>PO Generated</Text>
            </View>
            <Text style={[styles.reviewPoText, { color: theme.danger }]}>Review PO ›</Text>
          </View>
        </View>
      </View>

      {/* 3. Search & Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="search" size={15} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search by product name, SKU, or barcode..."
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

        <TouchableOpacity style={[styles.dropdownPill, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.dropdownText, { color: theme.textPrimary }]}>All Categories</Text>
          <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.dropdownPill, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.dropdownText, { color: theme.textPrimary }]}>All Stock Levels</Text>
          <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.dropdownPill, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.dropdownText, { color: theme.textPrimary }]}>All Suppliers</Text>
          <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={styles.viewToggles}>
          <TouchableOpacity style={[styles.viewToggleBtn, { backgroundColor: theme.primaryDark }]}>
            <Ionicons name="list" size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.viewToggleBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Ionicons name="grid-outline" size={15} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Split Main Body: Inventory Table (Left) & Add Product Studio Panel (Right) */}
      <View style={[styles.splitBody, isWide && styles.splitBodyWide]}>
        {/* Left Column: Inventory Products Table */}
        <View style={[styles.tableContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Sub toolbar */}
          <View style={[styles.tableMetaBar, { borderBottomColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.metaCountText, { color: theme.textSecondary }]}>
                Showing {items.length} of 1,420 products
              </Text>
              <TouchableOpacity>
                <Text style={[styles.resetText, { color: theme.primaryDark }]}>↺ Reset Filters</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="square-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaActionText, { color: theme.textSecondary }]}>Select All Filtered</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="options-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaActionText, { color: theme.textSecondary }]}>Column Setup</Text>
              </View>
            </View>
          </View>

          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
            <Text style={[styles.thText, { width: 32 }]}>#</Text>
            <Text style={[styles.thText, { flex: 2 }]}>PRODUCT DETAILS</Text>
            <Text style={[styles.thText, { width: 110 }]}>SKU / BARCODE</Text>
            <Text style={[styles.thText, { width: 95 }]}>CATEGORY</Text>
            <Text style={[styles.thText, { width: 85, textAlign: 'right' }]}>COST PRICE</Text>
            <Text style={[styles.thText, { width: 95, textAlign: 'right' }]}>SELLING PRICE</Text>
            <Text style={[styles.thText, { width: 75, textAlign: 'center' }]}>MARGIN</Text>
            <Text style={[styles.thText, { width: 85, textAlign: 'right' }]}>AVAILABLE</Text>
          </View>

          {/* Table Rows */}
          {items.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            const isOut = item.availableStock === 0;
            return (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  { borderBottomColor: theme.border },
                  isSelected && { backgroundColor: theme.tealChipBg + '30' },
                ]}
              >
                {/* Checkbox */}
                <TouchableOpacity style={{ width: 32 }} onPress={() => toggleSelect(item.id)}>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={16}
                    color={isSelected ? theme.primaryDark : theme.textSecondary}
                  />
                </TouchableOpacity>

                {/* Product Photo & Details */}
                <View style={[styles.prodDetailsCol, { flex: 2 }]}>
                  <View style={styles.thumbnailWrap}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.thumbnail} />
                    ) : (
                      <Ionicons name="cube-outline" size={18} color={theme.textSecondary} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.prodName, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.prodBrand, { color: theme.textSecondary }]}>
                      {item.brand}
                    </Text>
                  </View>
                </View>

                {/* SKU / Barcode */}
                <View style={{ width: 110 }}>
                  <Text style={[styles.skuCode, { color: theme.textPrimary }]}>{item.sku}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="barcode-outline" size={11} color={theme.textSecondary} />
                    <Text style={[styles.barcodeCode, { color: theme.textSecondary }]}>{item.barcode}</Text>
                  </View>
                </View>

                {/* Category Badge */}
                <View style={{ width: 95 }}>
                  <View style={[styles.categoryBadge, { backgroundColor: theme.tealChipBg }]}>
                    <Text style={[styles.categoryBadgeText, { color: theme.tealChipText }]}>
                      {item.category}
                    </Text>
                  </View>
                </View>

                {/* Cost Price */}
                <View style={{ width: 85, alignItems: 'flex-end' }}>
                  <Text style={[styles.costPrice, { color: theme.textSecondary }]}>
                    KSh {item.costPrice.toFixed(2)}
                  </Text>
                </View>

                {/* Selling Price */}
                <View style={{ width: 95, alignItems: 'flex-end' }}>
                  <Text style={[styles.sellingPrice, { color: theme.textPrimary }]}>
                    KSh {item.sellingPrice.toFixed(2)}
                  </Text>
                </View>

                {/* Margin % */}
                <View style={{ width: 75, alignItems: 'center' }}>
                  <View style={[styles.marginBadge, { backgroundColor: theme.tealChipBg }]}>
                    <Text style={[styles.marginBadgeText, { color: theme.tealChipText }]}>
                      +{item.marginPct.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Available Stock & Progress Line */}
                <View style={{ width: 85, alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.stockQty,
                      { color: isOut ? theme.danger : theme.textPrimary },
                    ]}
                  >
                    {item.availableStock} Units
                  </Text>
                  <View style={[styles.stockBarTrack, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.stockBarFill,
                        {
                          backgroundColor: isOut ? theme.danger : theme.primaryDark,
                          width: `${Math.min(100, (item.availableStock / 150) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}

          {/* Pagination Footer */}
          <View style={[styles.paginationFooter, { borderTopColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.paginationMuted, { color: theme.textSecondary }]}>Rows per page: 10 ▾</Text>
              <Text style={[styles.paginationMuted, { color: theme.textSecondary }]}>1 - 6 of 1,420 entries</Text>
            </View>

            <View style={styles.paginationBtns}>
              <TouchableOpacity style={[styles.pageNavBtn, { borderColor: theme.border }]}>
                <Ionicons name="chevron-back" size={13} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pageNumberBtn, { backgroundColor: theme.primaryDark }]}>
                <Text style={styles.pageNumberActive}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageNumberBtn}>
                <Text style={[styles.pageNumberText, { color: theme.textPrimary }]}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageNumberBtn}>
                <Text style={[styles.pageNumberText, { color: theme.textPrimary }]}>3</Text>
              </TouchableOpacity>
              <Text style={{ color: theme.textSecondary }}>...</Text>
              <TouchableOpacity style={styles.pageNumberBtn}>
                <Text style={[styles.pageNumberText, { color: theme.textPrimary }]}>142</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pageNavBtn, { borderColor: theme.border }]}>
                <Ionicons name="chevron-forward" size={13} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right Column: Add New Product Studio Drawer */}
        {showAddDrawer && (
          <View style={[styles.studioDrawer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Header */}
            <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.headerPlusIcon, { backgroundColor: theme.tealChipBg }]}>
                  <Ionicons name="add" size={18} color={theme.tealChipText} />
                </View>
                <View>
                  <Text style={[styles.drawerTitle, { color: theme.textPrimary }]}>Add New Product</Text>
                  <Text style={[styles.drawerSub, { color: theme.textSecondary }]}>
                    Central Catalog Registry & Stock Mapping
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setShowAddDrawer(false)}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Sub-navigation tabs */}
            <View style={[styles.tabNavigation, { borderBottomColor: theme.border }]}>
              <TouchableOpacity
                style={[
                  styles.tabNavBtn,
                  activeFormTab === 'basic' && { borderBottomColor: theme.primaryDark, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveFormTab('basic')}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={activeFormTab === 'basic' ? theme.primaryDark : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.tabNavText,
                    { color: activeFormTab === 'basic' ? theme.primaryDark : theme.textSecondary },
                  ]}
                >
                  Basic Info
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabNavBtn,
                  activeFormTab === 'pricing' && { borderBottomColor: theme.primaryDark, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveFormTab('pricing')}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color={activeFormTab === 'pricing' ? theme.primaryDark : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.tabNavText,
                    { color: activeFormTab === 'pricing' ? theme.primaryDark : theme.textSecondary },
                  ]}
                >
                  Pricing & Tax
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabNavBtn,
                  activeFormTab === 'stock' && { borderBottomColor: theme.primaryDark, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveFormTab('stock')}
              >
                <Ionicons
                  name="cube-outline"
                  size={14}
                  color={activeFormTab === 'stock' ? theme.primaryDark : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.tabNavText,
                    { color: activeFormTab === 'stock' ? theme.primaryDark : theme.textSecondary },
                  ]}
                >
                  Stock Levels
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabNavBtn,
                  activeFormTab === 'supplier' && { borderBottomColor: theme.primaryDark, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveFormTab('supplier')}
              >
                <Ionicons
                  name="business-outline"
                  size={14}
                  color={activeFormTab === 'supplier' ? theme.primaryDark : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.tabNavText,
                    { color: activeFormTab === 'supplier' ? theme.primaryDark : theme.textSecondary },
                  ]}
                >
                  Supplier & Barcode
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Body */}
            <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerScrollContent}>
              {/* Product Name */}
              <View style={styles.formGroup}>
                <Text style={[styles.labelRequired, { color: theme.textPrimary }]}>Product Name *</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Kenya Highlands Tea 500g"
                  placeholderTextColor={theme.textSecondary}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              {/* Two Column: Category & Brand */}
              <View style={styles.twoColRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.labelRequired, { color: theme.textPrimary }]}>Primary Category *</Text>
                  <View style={[styles.selectBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Text style={[styles.selectValue, { color: theme.textPrimary }]}>{formCategory}</Text>
                    <Ionicons name="chevron-down" size={13} color={theme.textSecondary} />
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.labelOptional, { color: theme.textSecondary }]}>Brand / Manufacturer</Text>
                  <TextInput
                    style={[styles.inputBox, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                    placeholder="e.g. Java House Africa"
                    placeholderTextColor={theme.textSecondary}
                    value={formBrand}
                    onChangeText={setFormBrand}
                  />
                </View>
              </View>

              {/* Short Description */}
              <View style={styles.formGroup}>
                <Text style={[styles.labelOptional, { color: theme.textSecondary }]}>
                  Short Description / Floor Notes
                </Text>
                <TextInput
                  style={[styles.inputBox, styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="Shelf location, handling instructions, pack size..."
                  placeholderTextColor={theme.textSecondary}
                  value={formDesc}
                  onChangeText={setFormDesc}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Product Media Upload Box */}
              <View style={styles.formGroup}>
                <Text style={[styles.labelOptional, { color: theme.textSecondary }]}>Product Media</Text>
                <TouchableOpacity style={[styles.uploadDropZone, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <View style={[styles.uploadIconWrap, { backgroundColor: theme.tealChipBg }]}>
                    <Ionicons name="image-outline" size={24} color={theme.tealChipText} />
                  </View>
                  <Text style={[styles.uploadTitle, { color: theme.primaryDark }]}>
                    Click to upload or drag & drop
                  </Text>
                  <Text style={[styles.uploadSub, { color: theme.textSecondary }]}>
                    PNG, JPG or WebP up to 4MB (4:3 recommended)
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Sticky Action Footer */}
            <View style={[styles.drawerFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => setShowAddDrawer(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.saveAnotherBtn, { backgroundColor: theme.tealChipBg }]}
                  onPress={handleSaveProduct}
                >
                  <Text style={[styles.saveAnotherText, { color: theme.tealChipText }]}>
                    Save & Add Another
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveProductBtn, { backgroundColor: theme.primaryDark }]}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.saveProductText}>Save Product</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    gap: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  syncBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  subheading: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    maxWidth: 640,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  btnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnWhiteText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  btnPrimaryTeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
  },
  btnPrimaryTealText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  kpiRow: {
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
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  kpiSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiTrend: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  kpiSubMuted: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  kpiSubText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  kpiSubVal: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    marginLeft: 'auto',
  },
  urgentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  poBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  poBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  reviewPoText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 'auto',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1.5,
    minWidth: 240,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  dropdownText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  viewToggles: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 'auto',
    gap: 4,
  },
  viewToggleBtn: {
    width: 34,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitBody: {
    flexDirection: 'column',
    gap: 14,
  },
  splitBodyWide: {
    flexDirection: 'row',
  },
  tableContainer: {
    flex: 1.8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  metaCountText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  resetText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  metaActionText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderBottomWidth: 1,
  },
  thText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#8A969B',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
    borderBottomWidth: 1,
  },
  prodDetailsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  thumbnailWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  prodName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  prodBrand: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  skuCode: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  barcodeCode: {
    fontSize: 9,
    fontFamily: 'Inter_500Medium',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  costPrice: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    fontVariant: ['tabular-nums'],
  },
  sellingPrice: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  marginBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  marginBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  stockQty: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  stockBarTrack: {
    width: 60,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
  },
  paginationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  paginationMuted: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  paginationBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageNavBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  pageNumberText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  studioDrawer: {
    flex: 1.1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 740,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerPlusIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  drawerSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 14,
  },
  tabNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  tabNavText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    padding: 18,
    gap: 14,
  },
  formGroup: {
    gap: 4,
  },
  labelRequired: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  labelOptional: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  inputBox: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectBox: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  selectValue: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  textArea: {
    height: 70,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  uploadDropZone: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  uploadIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  uploadSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  drawerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  saveAnotherBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAnotherText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  saveProductBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveProductText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
});

