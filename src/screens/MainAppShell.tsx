import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePOS } from '../context/POSContext';
import { Sidebar, ActiveNavScreen } from '../components/Sidebar';
import { DashboardTopNav } from '../components/DashboardTopNav';
import { DashboardScreen } from './DashboardScreen';
import { POSTerminalScreen } from './POSTerminalScreen';
import { OrdersScreen } from './OrdersScreen';
import { ProductsScreen } from './ProductsScreen';
import { CustomersScreen } from './CustomersScreen';
import { ReportsScreen } from './ReportsScreen';
import { ReturnsScreen } from './ReturnsScreen';
import { DiscountsScreen } from './DiscountsScreen';
import { UsersScreen } from './UsersScreen';
import { SettingsScreen } from './SettingsScreen';
import { LoginScreen } from './LoginScreen';
import { CommandPaletteModal } from '../components/CommandPaletteModal';
import { InventoryStudioModal } from '../components/InventoryStudioModal';
import { SettingsModal } from '../components/SettingsModal';

export const MainAppShell: React.FC = () => {
  const { width } = useWindowDimensions();
  const { theme } = usePOS();

  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ActiveNavScreen>('settings');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener on Web & Desktop
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show persistent sidebar on tablets & desktop terminals (>= 900px)
  const showSidebar = width >= 900;

  const handleNavigate = (screen: ActiveNavScreen) => {
    setActiveScreen(screen);
  };

  // If terminal is locked, render the Login & Operator Authentication screen
  if (isTerminalLocked) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F4FAFF' }]}>
        <StatusBar style="dark" />
        <LoginScreen onUnlock={() => setIsTerminalLocked(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#3EAAA5' }]}>
      <StatusBar style="light" />

      <View style={[styles.root, { backgroundColor: theme.background }]}>
        {/* Persistent Left Sidebar */}
        {showSidebar && (
          <Sidebar
            activeScreen={activeScreen}
            onNavigate={handleNavigate}
            onLockTerminal={() => setIsTerminalLocked(true)}
            onLogout={() => setIsTerminalLocked(true)}
          />
        )}

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Dashboard Top Header Navigation */}
          <DashboardTopNav
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setActiveScreen('settings')}
            onLockTerminal={() => setIsTerminalLocked(true)}
            onLogout={() => setIsTerminalLocked(true)}
          />

          {/* Active Screen View */}
          <View style={styles.screenView}>
            {activeScreen === 'dashboard' ? (
              <DashboardScreen
                onStartNewSale={() => setActiveScreen('sales')}
                onOpenInventory={() => setActiveScreen('products')}
              />
            ) : activeScreen === 'orders' ? (
              <OrdersScreen onManualOrder={() => setActiveScreen('sales')} />
            ) : activeScreen === 'products' ? (
              <ProductsScreen />
            ) : activeScreen === 'customers' ? (
              <CustomersScreen onStartSaleWithCustomer={() => setActiveScreen('sales')} />
            ) : activeScreen === 'reports' ? (
              <ReportsScreen />
            ) : activeScreen === 'returns' ? (
              <ReturnsScreen />
            ) : activeScreen === 'discounts' ? (
              <DiscountsScreen />
            ) : activeScreen === 'users' ? (
              <UsersScreen />
            ) : activeScreen === 'settings' ? (
              <SettingsScreen />
            ) : (
              <POSTerminalScreen />
            )}
          </View>
        </View>

        {/* Global Command Palette (Ctrl+K) */}
        <CommandPaletteModal
          visible={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={(screen) => handleNavigate(screen)}
        />

        {/* Inventory Studio Modal */}
        <InventoryStudioModal
          visible={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
        />

        {/* Terminal Settings Modal */}
        <SettingsModal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  screenView: {
    flex: 1,
    overflow: 'hidden',
  },
});
