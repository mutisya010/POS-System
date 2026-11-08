import { TextStyle } from 'react-native';
import { ThemeMode } from '../types/pos';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;
  surfaceContainerLow: string;
  surfaceContainerHighest: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  sidebarTeal: string;
  accent: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  tealChipBg: string;
  tealChipText: string;
  cartBadge: string;
  keypadBg: string;
  keypadText: string;
  cardShadow: string;
}

export const lightTheme: ThemeColors = {
  background: '#F5F7F8', // Main canvas off-white base preventing screen glare
  surface: '#FFFFFF', // High-clarity checkout panels & card surface
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#E8F6F5', // Light teal tint
  surfaceContainerLow: '#E9F6FD',
  surfaceContainerHighest: '#D7E4EC',
  border: '#E8ECEF', // Border neutral
  borderSubtle: '#F0F3F5',
  textPrimary: '#263238', // Text Main deep charcoal slate
  textSecondary: '#8A969B', // Text secondary muted metadata
  textMuted: '#8A969B',
  primary: '#3FAFA9', // Primary Teal
  primaryLight: '#6DD7D1',
  primaryDark: '#238F8A', // Dark Teal
  primaryContainer: '#3FAFA9',
  onPrimaryContainer: '#003D3B',
  sidebarTeal: '#3EAAA5', // Sidebar Teal
  accent: '#238F8A',
  success: '#32B67A', // Feedback Success
  successBg: '#EAF8F1', // Success chip bg
  warning: '#F2A541', // Feedback Warning
  warningBg: '#FEF6EC', // Warning chip bg
  danger: '#E45B5B', // Feedback Danger / Void
  dangerBg: '#FCEDED', // Danger chip bg
  tealChipBg: '#E8F6F5',
  tealChipText: '#238F8A',
  cartBadge: '#3FAFA9',
  keypadBg: '#FFFFFF',
  keypadText: '#263238',
  cardShadow: 'rgba(38, 50, 56, 0.05)',
};

export const darkTheme: ThemeColors = {
  background: '#111D23',
  surface: '#1A262C',
  surfaceElevated: '#263238',
  surfaceHighlight: '#1B3C3B',
  surfaceContainerLow: '#152026',
  surfaceContainerHighest: '#2B3940',
  border: '#33444C',
  borderSubtle: '#223138',
  textPrimary: '#E6F3FB',
  textSecondary: '#9AA7AC',
  textMuted: '#7A888E',
  primary: '#3FAFA9',
  primaryLight: '#6DD7D1',
  primaryDark: '#238F8A',
  primaryContainer: '#1B5B57',
  onPrimaryContainer: '#E6F3FB',
  sidebarTeal: '#238F8A',
  accent: '#6DD7D1',
  success: '#32B67A',
  successBg: 'rgba(50, 182, 122, 0.15)',
  warning: '#F2A541',
  warningBg: 'rgba(242, 165, 65, 0.15)',
  danger: '#E45B5B',
  dangerBg: 'rgba(228, 91, 91, 0.15)',
  tealChipBg: 'rgba(63, 175, 169, 0.18)',
  tealChipText: '#6DD7D1',
  cartBadge: '#3FAFA9',
  keypadBg: '#263238',
  keypadText: '#E6F3FB',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export const getTheme = (mode: ThemeMode): ThemeColors => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
  },
  displaySm: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  headlineLg: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
  headlineMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  headlineSm: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  labelLg: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  labelSm: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  numericRegister: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
  },
};
