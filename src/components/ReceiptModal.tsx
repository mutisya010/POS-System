import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { usePOS } from '../context/POSContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { generateReceiptHtml } from '../utils/receiptGenerator';
import { triggerFeedback } from '../utils/sound';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ visible, onClose }) => {
  const { theme, storeSettings, lastCompletedOrder } = usePOS();
  const [isPrinting, setIsPrinting] = useState(false);

  if (!lastCompletedOrder) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    triggerFeedback.tap();
    try {
      const html = generateReceiptHtml(lastCompletedOrder, storeSettings);
      await Print.printAsync({ html });
      triggerFeedback.success();
    } catch (err) {
      console.warn('Print error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    setIsPrinting(true);
    triggerFeedback.tap();
    try {
      const html = generateReceiptHtml(lastCompletedOrder, storeSettings);
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
          });
        }
      }
      triggerFeedback.success();
    } catch (err) {
      console.warn('Share error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="receipt" size={22} color={theme.success} />
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Sale Completed</Text>
                <Text style={[styles.orderNumber, { color: theme.textMuted }]}>
                  {lastCompletedOrder.orderNumber}
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

          {/* Thermal Receipt Visual Simulation */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            <View style={styles.thermalReceipt}>
              {/* Store details */}
              <View style={styles.receiptCenter}>
                <Text style={styles.receiptStoreName}>{storeSettings.storeName}</Text>
                <Text style={styles.receiptTagline}>{storeSettings.tagline}</Text>
                <Text style={styles.receiptMeta}>{storeSettings.address}</Text>
                <Text style={styles.receiptMeta}>
                  Tel: {storeSettings.phone} • Tax ID: {storeSettings.taxId}
                </Text>
              </View>

              <View style={styles.receiptDivider} />

              {/* Order Meta */}
              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptTextBold}>Order #{lastCompletedOrder.orderNumber}</Text>
                <Text style={styles.receiptText}>Reg: {storeSettings.terminalId}</Text>
              </View>
              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptText}>{formatDateTime(lastCompletedOrder.createdAt)}</Text>
                <Text style={styles.receiptText}>Cashier: {lastCompletedOrder.cashierName.split(' ')[0]}</Text>
              </View>

              <View style={styles.receiptDivider} />

              {/* Items List */}
              {lastCompletedOrder.items.map((item) => {
                const lineTotal = item.product.price * item.quantity;
                return (
                  <View key={item.id} style={styles.receiptItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.receiptItemTitle}>{item.product.name}</Text>
                      <Text style={styles.receiptItemSub}>
                        {item.quantity} x {formatCurrency(item.product.price, storeSettings.currencySymbol)}
                        {item.discountPercent ? ` (-${item.discountPercent}%)` : ''}
                      </Text>
                      {item.notes ? (
                        <Text style={styles.receiptItemNote}>* {item.notes}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.receiptItemPrice}>
                      {formatCurrency(lineTotal, storeSettings.currencySymbol)}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.receiptDivider} />

              {/* Totals */}
              <View style={styles.receiptTotalRow}>
                <Text style={styles.receiptText}>Subtotal:</Text>
                <Text style={styles.receiptText}>
                  {formatCurrency(lastCompletedOrder.subtotal, storeSettings.currencySymbol)}
                </Text>
              </View>
              {lastCompletedOrder.discountTotal > 0 && (
                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptText}>Discount:</Text>
                  <Text style={styles.receiptText}>
                    -{formatCurrency(lastCompletedOrder.discountTotal, storeSettings.currencySymbol)}
                  </Text>
                </View>
              )}
              <View style={styles.receiptTotalRow}>
                <Text style={styles.receiptText}>Tax:</Text>
                <Text style={styles.receiptText}>
                  {formatCurrency(lastCompletedOrder.taxTotal, storeSettings.currencySymbol)}
                </Text>
              </View>
              {lastCompletedOrder.tip > 0 && (
                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptText}>Tip:</Text>
                  <Text style={styles.receiptText}>
                    {formatCurrency(lastCompletedOrder.tip, storeSettings.currencySymbol)}
                  </Text>
                </View>
              )}

              <View style={[styles.receiptTotalRow, styles.receiptGrandTotalRow]}>
                <Text style={styles.receiptGrandTotalText}>TOTAL PAID:</Text>
                <Text style={styles.receiptGrandTotalText}>
                  {formatCurrency(lastCompletedOrder.total, storeSettings.currencySymbol)}
                </Text>
              </View>

              {/* Tenders */}
              {lastCompletedOrder.tenders.map((tender, i) => (
                <View key={i} style={styles.receiptTotalRow}>
                  <Text style={[styles.receiptText, { textTransform: 'capitalize' }]}>
                    {tender.method} Paid:
                  </Text>
                  <Text style={styles.receiptText}>
                    {formatCurrency(tender.amount, storeSettings.currencySymbol)}
                  </Text>
                </View>
              ))}

              {lastCompletedOrder.changeDue > 0 && (
                <View style={[styles.receiptTotalRow, { marginTop: 4 }]}>
                  <Text style={styles.receiptTextBold}>Change Returned:</Text>
                  <Text style={styles.receiptTextBold}>
                    {formatCurrency(lastCompletedOrder.changeDue, storeSettings.currencySymbol)}
                  </Text>
                </View>
              )}

              <View style={styles.receiptDivider} />

              {/* Footer */}
              <View style={styles.receiptCenter}>
                <Text style={styles.receiptFooterText}>{storeSettings.receiptFooter}</Text>
                <Text style={styles.receiptBarcode}>||||| ||| |||| || |||||</Text>
                <Text style={styles.receiptBarcodeNum}>{lastCompletedOrder.orderNumber}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={handleShare}
              disabled={isPrinting}
            >
              <Ionicons name="share-outline" size={18} color={theme.textPrimary} />
              <Text style={[styles.shareBtnText, { color: theme.textPrimary }]}>Share / PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.printBtn, { backgroundColor: theme.primary }]}
              onPress={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Ionicons name="print" size={18} color="#FFF" />
                  <Text style={styles.printBtnText}>Print Receipt</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.newSaleBtn, { backgroundColor: theme.success }]}
              onPress={onClose}
            >
              <Text style={styles.newSaleBtnText}>New Sale</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  orderNumber: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  thermalReceipt: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  receiptCenter: {
    alignItems: 'center',
  },
  receiptStoreName: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  receiptTagline: {
    color: '#4B5563',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  receiptMeta: {
    color: '#4B5563',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  receiptDivider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: '#333333',
    marginVertical: 10,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  receiptText: {
    color: '#111827',
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  receiptTextBold: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  receiptItemTitle: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  receiptItemSub: {
    color: '#4B5563',
    fontSize: 10,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  receiptItemNote: {
    color: '#6B7280',
    fontSize: 10,
    fontStyle: 'italic',
  },
  receiptItemPrice: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  receiptGrandTotalRow: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopColor: '#000',
    borderBottomColor: '#000',
    paddingVertical: 4,
    marginVertical: 6,
  },
  receiptGrandTotalText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  receiptFooterText: {
    color: '#4B5563',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  receiptBarcode: {
    color: '#111827',
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  receiptBarcodeNum: {
    color: '#6B7280',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  printBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  printBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  newSaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  newSaleBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

