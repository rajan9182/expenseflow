import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Surface, Avatar, ActivityIndicator } from 'react-native-paper';
import { accountAPI } from '../../services/api';
import { COLORS } from '../../constants/Theme';
import { formatCurrency } from '../../utils/helpers';
import { Landmark, CreditCard, Wallet } from 'lucide-react-native';

export default function AccountsScreen() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAccounts = async () => {
        try {
            const response = await accountAPI.getAll();
            setAccounts(response.data.accounts);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'bank': return <Landmark size={24} color="white" />;
            case 'card': return <CreditCard size={24} color="white" />;
            default: return <Wallet size={24} color="white" />;
        }
    };

    const renderAccountItem = ({ item }: { item: any }) => (
        <Surface style={[styles.card, { borderLeftColor: item.color || COLORS.primary }]} elevation={2}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.color || COLORS.primary }]}>
                    {getAccountIcon(item.type)}
                </View>
                <View style={styles.nameHeader}>
                    <Text style={styles.accountName}>{item.name}</Text>
                    <Text style={styles.accountType}>{item.type === 'bank' ? 'बैंक खाता' : item.type === 'cash' ? 'नकद' : 'कार्ड'}</Text>
                </View>
            </View>

            <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>उपलब्ध राशि</Text>
                <Text style={styles.balanceValue}>{formatCurrency(item.balance || 0)}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.createdBy}>बनाया: {item.createdBy?.name || 'स्वयं'}</Text>
                <Text style={styles.status}>सक्रिय (Active)</Text>
            </View>
        </Surface>
    );

    return (
        <View style={styles.container}>
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={accounts}
                    renderItem={renderAccountItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        fetchAccounts();
                    }}
                    ListHeaderComponent={
                        <Text style={styles.totalBalanceText}>
                            कुल संपत्ति: {formatCurrency(accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0))}
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>कोई खाता नहीं मिला।</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    totalBalanceText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '600',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    nameHeader: {
        flex: 1,
    },
    accountName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    accountType: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    balanceSection: {
        marginBottom: 20,
    },
    balanceLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    balanceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
    },
    createdBy: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    status: {
        fontSize: 11,
        color: COLORS.success,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
    }
});
