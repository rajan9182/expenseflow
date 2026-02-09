import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Surface, Avatar, ActivityIndicator, Chip, FAB } from 'react-native-paper';
import { debtAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Handshake, AlertCircle } from 'lucide-react-native';

export default function DebtsScreen() {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDebts = async () => {
        try {
            const response = await debtAPI.getAll();
            setDebts(response.data.debts);
        } catch (error) {
            console.error('Failed to fetch debts', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDebts();
    }, []);

    const renderDebtItem = ({ item }: { item: any }) => {
        const isLent = item.type === 'lent';
        const remaining = item.amount - (item.paidAmount || 0);

        return (
            <Surface style={styles.card} elevation={1}>
                <View style={styles.cardTop}>
                    <View style={styles.debtInfo}>
                        <Text style={styles.debtTitle}>{item.title}</Text>
                        <Text style={styles.debtPerson}>{item.personName}</Text>
                    </View>
                    <Chip
                        style={[styles.typeChip, { backgroundColor: isLent ? COLORS.success + '15' : COLORS.error + '15' }]}
                        textStyle={{ color: isLent ? COLORS.success : COLORS.error, fontSize: 10 }}
                    >
                        {isLent ? 'दिया हुआ (Lent)' : 'लिया हुआ (Borrowed)'}
                    </Chip>
                </View>

                <View style={styles.amountRow}>
                    <View>
                        <Text style={styles.label}>कुल राशि</Text>
                        <Text style={styles.mainAmount}>{formatCurrency(item.amount)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View>
                        <Text style={styles.label}>बाकी है</Text>
                        <Text style={[styles.mainAmount, { color: COLORS.primary }]}>{formatCurrency(remaining)}</Text>
                    </View>
                </View>

                <View style={styles.cardBottom}>
                    <View style={styles.metaInfo}>
                        <Text style={styles.dateText}>{formatDate(item.createdAt)} को</Text>
                        <Text style={styles.ownerText}>द्वारा: {item.user?.name}</Text>
                    </View>
                    <Avatar.Icon
                        size={32}
                        icon={isLent ? 'arrow-up' : 'arrow-down'}
                        color="white"
                        style={{ backgroundColor: isLent ? COLORS.success : COLORS.error }}
                    />
                </View>
            </Surface>
        );
    };

    return (
        <View style={styles.container}>
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={debts}
                    renderItem={renderDebtItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        fetchDebts();
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AlertCircle size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>कोई कर्ज़ या उधार नहीं है।</Text>
                        </View>
                    }
                />
            )}
            <FAB
                icon="plus"
                label="कर्ज़ जोड़ें"
                style={styles.fab}
                onPress={() => { }}
                color="white"
            />
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
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    debtInfo: {
        flex: 1,
    },
    debtTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    debtPerson: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    typeChip: {
        height: 24,
        borderRadius: 6,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 4,
    },
    mainAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.border,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaInfo: {
        flex: 1,
    },
    dateText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    ownerText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        marginTop: 12,
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    }
});
