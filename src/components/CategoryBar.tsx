import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, theme, products } = usePOS();

  const handleSelect = (id: string) => {
    triggerFeedback.tap();
    setSelectedCategory(id);
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return products.length;
    return products.filter((p) => p.categoryId === categoryId).length;
  };

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => handleSelect(cat.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={isSelected ? '#FFFFFF' : theme.accent}
              />
              <Text
                style={[
                  styles.categoryTitle,
                  {
                    color: isSelected ? '#FFFFFF' : theme.textPrimary,
                    fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_500Medium',
                  },
                ]}
              >
                {cat.name}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : theme.tealChipBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.tealChipText,
                    },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 8,
    minHeight: 40,
  },
  categoryTitle: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
