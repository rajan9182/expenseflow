import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, Avatar, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, expenseAPI } from '../../services/api';
import { COLORS } from '../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw
} from 'lucide-react-native';
import { formatCurrency, formatDate } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recentExpenses, setRecentExpenses] = useState([]);

  const fetchData = async () => {
    try {
      const statsRes = await analyticsAPI.getStats('this-month');
      const expensesRes = await expenseAPI.getAll();
      setStats(statsRes.data.stats);
      setRecentExpenses(expensesRes.data.expenses.slice(0, 5));
    } catch (error) {
      console.error('Data fetch failed', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <LinearGradient
        colors={['#6366f1', '#a855f7']}
        style={styles.hero}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>नमस्ते, {user?.name}</Text>
            <Text style={styles.subGreeting}>आज का हिसाब-किताब</Text>
          </View>
          <Avatar.Text
            size={48}
            label={user?.name?.[0] || 'U'}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
        </View>

        <Surface style={styles.balanceCard} elevation={4}>
          <Text style={styles.balanceLabel}>कुल जमा (Net Balance)</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(stats?.netBalance || 0)}</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <TrendingUp size={20} color={COLORS.success} />
              </View>
              <View>
                <Text style={styles.statLabel}>आमदनी</Text>
                <Text style={[styles.statValue, { color: COLORS.success }]}>
                  {formatCurrency(stats?.totalIncome || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <TrendingDown size={20} color={COLORS.error} />
              </View>
              <View>
                <Text style={styles.statLabel}>कुल खर्च</Text>
                <Text style={[styles.statValue, { color: COLORS.error }]}>
                  {formatCurrency(stats?.totalExpenses || 0)}
                </Text>
              </View>
            </View>
          </View>
        </Surface>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>हाल ही के खर्च</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>सभी देखें</Text>
          </TouchableOpacity>
        </View>

        {recentExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>अभी कोई खर्च नहीं है।</Text>
          </View>
        ) : (
          recentExpenses.map((expense: any) => (
            <Surface key={expense._id} style={styles.expenseCard} elevation={1}>
              <View style={styles.expenseIconContainer}>
                <Avatar.Icon
                  size={40}
                  icon="receipt"
                  style={{ backgroundColor: COLORS.primary + '15' }}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle} numberOfLines={1}>{expense.title}</Text>
                <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
              </View>
              <View style={styles.expenseAmountContainer}>
                <Text style={[
                  styles.expenseAmount,
                  { color: expense.type === 'income' ? COLORS.success : COLORS.error }
                ]}>
                  {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                </Text>
                <Text style={styles.expenseOwner}>{expense.user?.name || 'स्वयं'}</Text>
              </View>
            </Surface>
          ))
        )}

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <Surface style={styles.actionIconSurface} elevation={2}>
              <Plus size={24} color={COLORS.primary} />
            </Surface>
            <Text style={styles.actionLabel}>खर्च जोड़ें</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Surface style={styles.actionIconSurface} elevation={2}>
              <RefreshCw size={24} color={COLORS.success} />
            </Surface>
            <Text style={styles.actionLabel}>ट्रांसफर</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Surface style={styles.actionIconSurface} elevation={2}>
              <Wallet size={24} color={COLORS.warning} />
            </Surface>
            <Text style={styles.actionLabel}>बजट देखें</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatar: {
    backgroundColor: 'white',
  },
  avatarLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: -60,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 15,
  },
  content: {
    marginTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  expenseIconContainer: {
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  expenseDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseOwner: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  actionIconSurface: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
  }
});
