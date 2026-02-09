import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { analyticsAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await analyticsAPI.getStats('this-month');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const categoryData = stats?.categoryBreakdown || [];
    const maxCategoryAmount = Math.max(...categoryData.map((c: any) => c.total), 1);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Surface style={styles.headerCard} elevation={2}>
                <Text style={styles.headerTitle}>कुल खर्च का विश्लेषण</Text>
                <Text style={styles.totalAmount}>{formatCurrency(stats?.totalExpenses || 0)}</Text>
                <Text style={styles.subtext}>इस महीने का कुल खर्च</Text>
            </Surface>

            <Text style={styles.sectionTitle}>श्रेणी (Category) के अनुसार खर्च</Text>
            {categoryData.length === 0 ? (
                <Text style={styles.emptyText}>कोई डेटा उपलब्ध नहीं है।</Text>
            ) : (
                categoryData.map((category: any, index: number) => (
                    <Surface key={index} style={styles.categoryCard} elevation={1}>
                        <View style={styles.categoryHeader}>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.categoryValue}>{formatCurrency(category.total)}</Text>
                        </View>
                        <ProgressBar
                            progress={category.total / maxCategoryAmount}
                            color={COLORS.primary}
                            style={styles.progressBar}
                        />
                        <Text style={styles.percentage}>
                            {((category.total / (stats?.totalExpenses || 1)) * 100).toFixed(1)}% हिस्सा
                        </Text>
                    </Surface>
                ))
            )}

            <Surface style={styles.healthCard} elevation={2}>
                <View style={styles.healthHeader}>
                    <Text style={styles.healthTitle}>आर्थिक स्वास्थ्य (Health Score)</Text>
                    <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{stats?.savingsRate || 0}/100</Text>
                    </View>
                </View>
                <Text style={styles.healthDesc}>
                    आपका बचत दर {stats?.savingsRate || 0}% है। {stats?.savingsRate > 20 ? 'शानदार बचत!' : 'बचत बढ़ाने की कोशिश करें।'}
                </Text>
            </Surface>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    totalAmount: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtext: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        marginLeft: 4,
    },
    categoryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    categoryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.background,
    },
    percentage: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 6,
        textAlign: 'right',
    },
    healthCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        borderLeftWidth: 6,
        borderLeftColor: COLORS.success,
    },
    healthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    healthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scoreBadge: {
        backgroundColor: COLORS.success + '15',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    scoreText: {
        color: COLORS.success,
        fontWeight: 'bold',
    },
    healthDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 20,
    }
});
