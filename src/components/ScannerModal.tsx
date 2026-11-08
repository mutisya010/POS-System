import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ visible, onClose }) => {
  const { theme, lookupBarcode, products } = usePOS();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(true);

  useEffect(() => {
    if (visible && !permission?.granted && Platform.OS !== 'web') {
      requestPermission();
    }
  }, [visible, permission]);

  const handleBarcodeScanned = (barcodeData: string) => {
    if (!barcodeData) return;
    const foundProduct = lookupBarcode(barcodeData);
    if (foundProduct) {
      setScannedFeedback(`Added: ${foundProduct.name}`);
      triggerFeedback.success();
      setTimeout(() => {
        setScannedFeedback(null);
        onClose();
      }, 700);
    } else {
      setScannedFeedback(`Barcode not found: ${barcodeData}`);
      triggerFeedback.error();
      setTimeout(() => {
        setScannedFeedback(null);
      }, 2000);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim().length === 0) return;
    handleBarcodeScanned(manualInput.trim());
    setManualInput('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="barcode-outline" size={22} color={theme.primaryLight} />
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Barcode Scanner</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Camera scanner & Bluetooth wedge listener
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

          {/* Scanner Viewport */}
          <View style={styles.body}>
            {/* Camera Viewport (Mobile & Supported Browsers) */}
            {cameraActive && permission?.granted ? (
              <View style={styles.cameraWrapper}>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                  }}
                  onBarcodeScanned={(result) => {
                    if (result.data) {
                      handleBarcodeScanned(result.data);
                    }
                  }}
                />
                {/* Targeting Reticle Frame */}
                <View style={styles.reticleOverlay}>
                  <View style={[styles.reticleFrame, { borderColor: theme.primaryLight }]}>
                    <View style={[styles.laserLine, { backgroundColor: theme.danger }]} />
                  </View>
                  <Text style={styles.reticleTip}>Align barcode within red laser line</Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.mockScannerContainer,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
              >
                <Ionicons name="hardware-chip-outline" size={48} color={theme.primaryLight} />
                <Text style={[styles.mockTitle, { color: theme.textPrimary }]}>
                  {Platform.OS === 'web'
                    ? 'Wedge Scanner & Quick Barcode Simulation'
                    : 'Camera access needed'}
                </Text>
                <Text style={[styles.mockSubtitle, { color: theme.textMuted }]}>
                  Bluetooth / USB handheld laser scanners type barcodes directly. Or test with one-tap
                  samples below.
                </Text>
                {!permission?.granted && Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={[styles.permBtn, { backgroundColor: theme.primary }]}
                    onPress={requestPermission}
                  >
                    <Text style={styles.permBtnText}>Grant Camera Permission</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Notification Feedback Toast */}
            {scannedFeedback && (
              <View style={[styles.feedbackBanner, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons
                  name={scannedFeedback.startsWith('Added') ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={scannedFeedback.startsWith('Added') ? theme.success : theme.danger}
                />
                <Text
                  style={[
                    styles.feedbackText,
                    {
                      color: scannedFeedback.startsWith('Added') ? theme.success : theme.danger,
                    },
                  ]}
                >
                  {scannedFeedback}
                </Text>
              </View>
            )}

            {/* Manual Barcode / SKU Input (Hardware wedge scanner input target) */}
            <View style={styles.manualSection}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                USB / Bluetooth Scanner Wedge or Manual SKU:
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Scan or type barcode (e.g. 012345678901)..."
                  placeholderTextColor={theme.textMuted}
                  value={manualInput}
                  onChangeText={setManualInput}
                  onSubmitEditing={handleManualSubmit}
                  autoFocus
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: theme.primary }]}
                  onPress={handleManualSubmit}
                >
                  <Text style={styles.addBtnText}>Lookup</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick-Test Barcode Simulator Chips */}
            <View style={styles.sampleSection}>
              <Text style={[styles.sampleTitle, { color: theme.textMuted }]}>
                Click to simulate scanning real item barcodes:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sampleChips}>
                {products.slice(0, 6).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.sampleChip,
                      { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    ]}
                    onPress={() => handleBarcodeScanned(item.barcode)}
                  >
                    <Ionicons name="barcode" size={14} color={theme.primaryLight} />
                    <Text style={[styles.sampleChipText, { color: theme.textPrimary }]}>
                      {item.name} ({item.barcode})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
    maxWidth: 580,
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
    gap: 16,
  },
  cameraWrapper: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  reticleOverlay: {
    ...StyleSheet.absoluteFill as any,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleFrame: {
    width: 200,
    height: 120,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laserLine: {
    width: '90%',
    height: 2,
  },
  reticleTip: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mockScannerContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mockTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  mockSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 380,
  },
  permBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  permBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '700',
  },
  manualSection: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputField: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addBtn: {
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sampleSection: {
    gap: 8,
  },
  sampleTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  sampleChips: {
    gap: 8,
    paddingVertical: 4,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  sampleChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

