import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Surface, Avatar, ActivityIndicator, Searchbar, FAB } from 'react-native-paper';
import { expenseAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Filter, Receipt, Plus } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();

    const fetchExpenses = async () => {
        try {
            const response = await expenseAPI.getAll();
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchExpenses();
    };

    const filteredExpenses = expenses.filter((ex: any) =>
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderExpenseItem = ({ item }: { item: any }) => (
        <Surface style={styles.card} elevation={1}>
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Avatar.Icon
                        size={48}
                        icon="receipt"
                        style={{ backgroundColor: COLORS.primary + '10' }}
                        color={COLORS.primary}
                    />
                </View>
                <View style={styles.mainInfo}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.category}>{item.category?.name || 'अनकैटेगराइज्ड'}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.date}>{formatDate(item.date)}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.owner}>{item.user?.name === user?.name ? 'आपने' : item.user?.name}</Text>
                    </View>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={[
                        styles.amount,
                        { color: item.type === 'income' ? COLORS.success : COLORS.error }
                    ]}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    <Text style={styles.account}>{item.account?.name}</Text>
                </View>
            </View>
        </Surface>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="खर्च खोजें..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor={COLORS.primary}
                />
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredExpenses}
                    renderItem={renderExpenseItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>कोई खर्च नहीं मिला।</Text>
                        </View>
                    }
                />
            )}

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => { }}
                color="white"
                label="खर्च जोड़ें"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchBar: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        elevation: 0,
    },
    searchInput: {
        fontSize: 14,
        minHeight: 0,
    },
    filterBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
    },
    mainInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    category: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    date: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    },
    owner: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.primary,
    },
    amountContainer: {
        alignItems: 'flex-end',
        marginLeft: 12,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    account: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    }
});
