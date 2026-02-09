import { MD3LightTheme, configureFonts } from 'react-native-paper';

export const COLORS = {
  primary: '#6366f1',
  secondary: '#ec4899',
  accent: '#a855f7',
  background: '#f8fafc',
  surface: '#ffffff',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  card: {
    revenue: '#10b981',
    expense: '#ef4444',
    balance: '#6366f1',
    debt: '#f59e0b',
  },
  gradients: {
    primary: ['#6366f1', '#a855f7'],
    secondary: ['#ec4899', '#f43f5e'],
    glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],
  }
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    error: COLORS.error,
    background: COLORS.background,
    surface: COLORS.surface,
  },
  roundness: 16,
};
