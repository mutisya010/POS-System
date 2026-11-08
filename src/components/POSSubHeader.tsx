import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';

export const POSSubHeader: React.FC = () => {
  const { theme, storeSettings } = usePOS();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      {/* Left cluster */}
      <View style={styles.leftCluster}>
        {/* Terminal Pill */}
        <View style={[styles.terminalPill, { backgroundColor: theme.tealChipBg }]}>
          <View style={[styles.onlineDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.terminalText, { color: theme.tealChipText }]}>
            TERMINAL {storeSettings.terminalId}
          </Text>
        </View>

        {/* Mesh Node Latency */}
        <View style={styles.metaPill}>
          <Ionicons name="globe-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            Mesh Node #04 (Latency 12ms)
          </Text>
        </View>

        {/* Sync Status */}
        <View style={[styles.syncPill, { backgroundColor: theme.tealChipBg }]}>
          <Ionicons name="sync-outline" size={12} color={theme.tealChipText} />
          <Text style={[styles.syncText, { color: theme.tealChipText }]}>
            Catalog Synchronized 14:02 EAT
          </Text>
        </View>
      </View>

      {/* Right cluster */}
      <View style={styles.rightCluster}>
        {/* Shift Duration */}
        <View style={styles.shiftTimePill}>
          <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.shiftTimeText, { color: theme.textSecondary }]}>
            Shift: 05h 42m
          </Text>
        </View>

        {/* Hotkeys */}
        <View style={styles.hotkeysPill}>
          <Ionicons name="keypad-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.hotkeysText, { color: theme.textSecondary }]}>
            Hotkeys [F1-F12]
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  terminalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  terminalText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  syncText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shiftTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shiftTimeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  hotkeysPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotkeysText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
});

