import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { formatCurrency } from '../utils/formatters';
import { triggerFeedback } from '../utils/sound';

interface CustomItemModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({ visible, onClose }) => {
  const { theme, storeSettings, addToCart } = usePOS();
  const [amountStr, setAmountStr] = useState<string>('0.00');
  const [description, setDescription] = useState<string>('Custom Item');

  const handleKeyPress = (val: string) => {
    triggerFeedback.tap();
    if (val === 'C') {
      setAmountStr('0.00');
      return;
    }
    if (val === 'DEL') {
      const digits = amountStr.replace(/[^0-9]/g, '');
      const newDigits = digits.slice(0, -1);
      const num = parseInt(newDigits || '0', 10) / 100;
      setAmountStr(num.toFixed(2));
      return;
    }

    // Cent-shifting calculator logic (standard POS keypad)
    const digits = amountStr.replace(/[^0-9]/g, '');
    if (digits.length >= 7) return; // limit max amount

    let append = val;
    if (val === '00') append = '00';
    const newDigits = digits + append;
    const num = parseInt(newDigits, 10) / 100;
    setAmountStr(num.toFixed(2));
  };

  const handleAddItem = () => {
    const price = parseFloat(amountStr);
    if (isNaN(price) || price <= 0) {
      triggerFeedback.warning();
      return;
    }

    addToCart({
      id: `custom-${Date.now()}`,
      name: description.trim() || 'Custom Item',
      sku: 'MISC-OPEN',
      barcode: '',
      price,
      categoryId: 'retail',
      stock: 999,
      taxRate: storeSettings.taxRateDefault,
      color: '#6366F1',
      description: 'Manual open-price line item',
    });

    triggerFeedback.success();
    setAmountStr('0.00');
    setDescription('Custom Item');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="calculator-outline" size={22} color={theme.primaryLight} />
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Custom Item Entry</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Open-price manual ticket entry
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Amount Display & Description Input */}
          <View style={styles.body}>
            <View
              style={[
                styles.displayContainer,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: theme.primaryLight }]}>
                {storeSettings.currencySymbol}
              </Text>
              <Text style={[styles.displayAmount, { color: theme.textPrimary }]}>
                {amountStr}
              </Text>
            </View>

            <TextInput
              style={[
                styles.descInput,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="Item label (e.g. Tailoring fee, Misc retail)..."
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            {/* Tactile POS Numeric Keypad */}
            <View style={styles.keypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['C', '0', '00'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((k) => (
                    <TouchableOpacity
                      key={k}
                      style={[
                        styles.keyBtn,
                        {
                          backgroundColor: k === 'C' ? theme.dangerBg : theme.surfaceElevated,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => handleKeyPress(k)}
                    >
                      <Text
                        style={[
                          styles.keyBtnText,
                          { color: k === 'C' ? theme.danger : theme.textPrimary },
                        ]}
                      >
                        {k}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              <View style={styles.keypadRow}>
                <TouchableOpacity
                  style={[
                    styles.keyBtn,
                    styles.backspaceBtn,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                  ]}
                  onPress={() => handleKeyPress('DEL')}
                >
                  <Ionicons name="backspace-outline" size={22} color={theme.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.keyBtn,
                    styles.addBtn,
                    {
                      backgroundColor: parseFloat(amountStr) > 0 ? theme.success : theme.surfaceHighlight,
                    },
                  ]}
                  onPress={handleAddItem}
                  disabled={parseFloat(amountStr) <= 0}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>ADD TO TICKET</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    gap: 12,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  currencyPrefix: {
    fontSize: 26,
    fontWeight: '800',
    marginRight: 6,
  },
  displayAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  descInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  keypad: {
    gap: 8,
    marginTop: 4,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  backspaceBtn: {
    flex: 1,
  },
  addBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

