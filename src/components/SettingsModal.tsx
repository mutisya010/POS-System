import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { theme, storeSettings, updateStoreSettings, shiftStats } = usePOS();

  const [storeName, setStoreName] = useState(storeSettings.storeName);
  const [tagline, setTagline] = useState(storeSettings.tagline);
  const [address, setAddress] = useState(storeSettings.address);
  const [phone, setPhone] = useState(storeSettings.phone);
  const [taxId, setTaxId] = useState(storeSettings.taxId);
  const [taxRate, setTaxRate] = useState((storeSettings.taxRateDefault * 100).toFixed(2));
  const [currencySymbol, setCurrencySymbol] = useState(storeSettings.currencySymbol);
  const [terminalId, setTerminalId] = useState(storeSettings.terminalId);
  const [receiptFooter, setReceiptFooter] = useState(storeSettings.receiptFooter);

  const handleSave = () => {
    const rateNum = parseFloat(taxRate) / 100;
    updateStoreSettings({
      storeName: storeName.trim() || 'POS Terminal',
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      taxId: taxId.trim(),
      taxRateDefault: isNaN(rateNum) ? 0.0825 : rateNum,
      currencySymbol: currencySymbol.trim() || '$',
      terminalId: terminalId.trim() || 'POS-REG-01',
      receiptFooter: receiptFooter.trim(),
    });
    triggerFeedback.success();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconCircle, { backgroundColor: theme.tealChipBg }]}>
                <Ionicons name="settings-sharp" size={18} color={theme.tealChipText} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Terminal Configuration</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Store profile, tax rate, and receipt details
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.background }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primaryDark }]}>Store Identity</Text>
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Store / Business Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                  value={storeName}
                  onChangeText={setStoreName}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Tagline / Header Subtitle</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                  value={tagline}
                  onChangeText={setTagline}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Store Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Contact Phone</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Tax ID / VAT Number</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                    value={taxId}
                    onChangeText={setTaxId}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primaryDark }]}>
                Register & Financial Settings
              </Text>

              <View style={styles.rowFields}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Currency Symbol</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                    value={currencySymbol}
                    onChangeText={setCurrencySymbol}
                  />
                </View>

                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Default Sales Tax Rate (%)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                    value={taxRate}
                    onChangeText={setTaxRate}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Terminal Register ID</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                    value={terminalId}
                    onChangeText={setTerminalId}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Thermal Receipt Footer Note</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                  value={receiptFooter}
                  onChangeText={setReceiptFooter}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
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
    maxWidth: 600,
    maxHeight: '90%',
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  field: {
    gap: 4,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  multilineInput: {
    height: 60,
    paddingTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
});

