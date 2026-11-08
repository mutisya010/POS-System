import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';

interface DashboardTopNavProps {
  onSearch?: (q: string) => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onLockTerminal?: () => void;
  onLogout?: () => void;
}

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenSettings,
  onLockTerminal,
  onLogout,
}) => {
  const { theme, storeSettings } = usePOS();
  const handleLogoutPress = onLogout || onLockTerminal;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      {/* Left Breadcrumb Navigation */}
      <View style={styles.breadcrumbContainer}>
        <Ionicons name="desktop-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.crumbParent, { color: theme.textSecondary }]}>Register Hub</Text>
        <Text style={[styles.crumbSep, { color: theme.textSecondary }]}>›</Text>
        <Text style={[styles.crumbParent, { color: theme.textSecondary }]}>POS Lane</Text>
        <Text style={[styles.crumbActive, { color: theme.textPrimary }]}>Welcome back, John!</Text>
      </View>

      {/* Global Search Box (Ctrl+K) */}
      <TouchableOpacity
        style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}
        activeOpacity={0.8}
        onPress={onOpenSearch}
      >
        <Ionicons name="search" size={16} color={theme.textSecondary} />
        <Text style={[styles.searchInput, { color: theme.textSecondary }]}>
          Search anything... (Ctrl+K)
        </Text>
      </TouchableOpacity>

      {/* Right Status Controls */}
      <View style={styles.rightCluster}>
        {/* Register Status Pill */}
        <View style={[styles.statusPill, { backgroundColor: theme.tealChipBg, borderColor: theme.border }]}>
          <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.statusPillText, { color: theme.tealChipText }]}>
            {storeSettings.terminalId} - Online
          </Text>
        </View>

        {/* Store Location */}
        <View style={styles.locationPill}>
          <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]}>
            Nairobi Flagship
          </Text>
        </View>

        {/* Notifications Icon with Badge */}
        <TouchableOpacity
          style={styles.bellBtn}
          accessibilityLabel="Notifications"
          onPress={onOpenNotifications}
        >
          <Ionicons name="notifications-outline" size={18} color={theme.textPrimary} />
          <View style={[styles.bellBadge, { backgroundColor: theme.danger }]}>
            <Text style={styles.bellBadgeText}>3</Text>
          </View>
        </TouchableOpacity>

        {/* Lock Terminal Quick Button */}
        <TouchableOpacity
          style={styles.bellBtn}
          accessibilityLabel="Lock Terminal"
          onPress={onLockTerminal}
        >
          <Ionicons name="lock-closed-outline" size={17} color={theme.textPrimary} />
        </TouchableOpacity>

        {/* Cashier Account Dropdown */}
        <TouchableOpacity
          style={styles.cashierPill}
          onPress={onOpenSettings}
        >
          <View style={[styles.cashierAvatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.cashierAvatarText}>JD</Text>
          </View>
          <View>
            <Text style={[styles.cashierName, { color: theme.textPrimary }]}>John Doe</Text>
            <Text style={[styles.cashierId, { color: theme.textSecondary }]}>Cashier #402</Text>
          </View>
          <Ionicons name="chevron-down" size={14} color={theme.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Dedicated Log Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          accessibilityLabel="Log Out"
          onPress={handleLogoutPress}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={15} color="#BA1A1A" />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 16,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crumbParent: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  crumbSep: {
    fontSize: 12,
  },
  crumbActive: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 6,
  },
  searchBox: {
    flex: 1,
    maxWidth: 380,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  cashierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  cashierAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashierAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  cashierName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 14,
  },
  cashierId: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFDAD6',
    borderWidth: 1,
    borderColor: '#FFDAD6',
    marginLeft: 4,
  },
  logoutBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#BA1A1A',
  },
});

