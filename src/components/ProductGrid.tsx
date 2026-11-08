import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from './ProductCard';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';

export const ProductGrid: React.FC = () => {
  const { filteredProducts, theme, searchQuery } = usePOS();
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (Math.abs(width - containerWidth) > 10) {
      setContainerWidth(width);
    }
  };

  // Determine dynamic column count based on available container width
  const numColumns = containerWidth > 1100 ? 4 : containerWidth > 700 ? 3 : 2;
  const gap = 12;
  const padding = 16;
  const cardWidth = containerWidth > 0
    ? (containerWidth - padding * 2 - (numColumns - 1) * gap) / numColumns
    : 160;

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard product={item} cardWidth={cardWidth} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} onLayout={onLayout}>
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No products found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            {searchQuery
              ? `No matches for "${searchQuery}". Try another keyword or scan a barcode.`
              : 'There are no items available in this category.'}
          </Text>
        </View>
      ) : (
        <FlatList
          key={`grid-${numColumns}`}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
          contentContainerStyle={[styles.listContent, { padding }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 18,
  },
});

