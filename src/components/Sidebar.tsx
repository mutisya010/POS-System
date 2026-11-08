import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';

export type ActiveNavScreen = 'dashboard' | 'sales' | 'products' | 'customers' | 'orders' | 'reports' | 'returns' | 'discounts' | 'users' | 'settings';

interface SidebarProps {
  activeScreen: ActiveNavScreen;
  onNavigate: (screen: ActiveNavScreen) => void;
  onLockTerminal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  onLockTerminal,
  onLogout,
}) => {
  const { theme, storeSettings } = usePOS();
  const handleLogoutPress = onLogout || onLockTerminal;

  const navItems: { id: ActiveNavScreen; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { id: 'sales', label: 'Sales', icon: 'cart-outline' },
    { id: 'products', label: 'Products', icon: 'cube-outline' },
    { id: 'customers', label: 'Customers', icon: 'people-outline' },
    { id: 'orders', label: 'Orders', icon: 'document-text-outline' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart-outline' },
    { id: 'returns', label: 'Returns', icon: 'arrow-undo-outline' },
    { id: 'discounts', label: 'Discounts', icon: 'pricetag-outline' },
    { id: 'users', label: 'Users', icon: 'person-circle-outline' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  const handlePress = (id: ActiveNavScreen) => {
    triggerFeedback.tap();
    onNavigate(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#3EAAA5' }]}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Ionicons name="storefront" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.brandTextCol}>
          <Text style={styles.brandTitle}>LANDMARK</Text>
          <Text style={styles.brandSub}>STORES POS</Text>
        </View>
      </View>

      {/* Nav List */}
      <ScrollView style={styles.navScroll} contentContainerStyle={styles.navScrollContent} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive ? styles.navItemActive : styles.navItemInactive,
              ]}
              onPress={() => handlePress(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={isActive ? '#111D23' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.navItemText,
                  {
                    color: isActive ? '#111D23' : '#FFFFFF',
                    fontFamily: isActive ? 'Inter_700Bold' : 'Inter_500Medium',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Help Card */}
      <View style={styles.bottomSection}>
        <View style={styles.helpCard}>
          <View style={styles.helpIconCircle}>
            <Ionicons name="help-circle-outline" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpSubtitle}>POS Shift Manual & Desk</Text>
          </View>
        </View>

        {/* User Profile Card */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={handleLogoutPress}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>JD</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userRole}>Store Manager</Text>
          </View>
          <Ionicons name="lock-closed-outline" size={14} color="#FFFFFF" style={{ marginLeft: 'auto', opacity: 0.8 }} />
        </TouchableOpacity>

        {/* Dedicated Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogoutPress}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <Text style={styles.logoutBtnText}>Log Out / Lock Lane</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  navScroll: {
    flex: 1,
  },
  navScrollContent: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 42,
  },
  navItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navItemInactive: {
    backgroundColor: 'transparent',
  },
  navItemText: {
    fontSize: 13,
  },
  bottomSection: {
    paddingTop: 12,
    gap: 10,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    padding: 10,
    borderRadius: 10,
  },
  helpIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  helpSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#006A66',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});

