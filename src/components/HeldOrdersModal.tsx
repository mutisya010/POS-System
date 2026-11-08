import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { formatCurrency, formatTime } from '../utils/formatters';

interface HeldOrdersModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ visible, onClose }) => {
  const { theme, storeSettings, heldOrders, recallHeldOrder, deleteHeldOrder } = usePOS();

  const handleRecall = (orderId: string) => {
    recallHeldOrder(orderId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="pause-circle" size={22} color={theme.warning} />
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Parked / Held Orders</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  {heldOrders.length} {heldOrders.length === 1 ? 'ticket parked' : 'tickets parked'}
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

          {/* List of Held Orders */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {heldOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="documents-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Parked Orders</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                  When a customer needs to step aside, click "Hold" on the register ticket to park it.
                </Text>
              </View>
            ) : (
              heldOrders.map((order) => (
                <View
                  key={order.id}
                  style={[
                    styles.orderCard,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                        {order.heldName || 'Parked Ticket'}
                      </Text>
                      <Text style={[styles.cardMeta, { color: theme.textMuted }]}>
                        {order.orderNumber} • Parked at {formatTime(order.createdAt)}
                      </Text>
                    </View>
                    <Text style={[styles.cardTotal, { color: theme.primaryLight }]}>
                      {formatCurrency(order.total, storeSettings.currencySymbol)}
                    </Text>
                  </View>

                  {/* Summary of items */}
                  <Text style={[styles.cardItems, { color: theme.textSecondary }]} numberOfLines={2}>
                    {order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
                  </Text>

                  {/* Action buttons */}
                  <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                      style={[styles.deleteBtn, { borderColor: theme.border }]}
                      onPress={() => deleteHeldOrder(order.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.danger} />
                      <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Discard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.resumeBtn, { backgroundColor: theme.primary }]}
                      onPress={() => handleRecall(order.id)}
                    >
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                      <Text style={styles.resumeBtnText}>Resume Ticket</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
    maxWidth: 520,
    maxHeight: '85%',
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
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    maxWidth: 280,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  cardTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardItems: {
    fontSize: 12,
    marginVertical: 10,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 10,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resumeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

