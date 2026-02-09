import React, { useState } from 'react';
import { StyleSheet, View, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const theme = useTheme();

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await login({ email, password });
            router.replace('/(tabs)');
        } catch (error) {
            alert('लॉगिन विफल रहा। कृपया विवरण जांचें।');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <LinearGradient
                    colors={['#6366f1', '#a855f7']}
                    style={styles.header}
                >
                    <View style={styles.logoContainer}>
                        <Surface style={styles.logoIcon} elevation={4}>
                            <Text style={styles.logoText}>₹</Text>
                        </Surface>
                        <Text style={styles.appName}>Expense Manager</Text>
                        <Text style={styles.appSubName}>परिवार के लिए</Text>
                    </View>
                </LinearGradient>

                <Surface style={styles.formContainer} elevation={0}>
                    <Text style={styles.welcomeText}>नमस्ते!</Text>
                    <Text style={styles.loginTitle}>लॉगिन करें</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ईमेल</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="example@mail.com"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            outlineColor={COLORS.border}
                            activeOutlineColor={COLORS.primary}
                            left={<TextInput.Icon icon={() => <User size={20} color={COLORS.textSecondary} />} />}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>पासवर्ड</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="आपका पासवर्ड"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            outlineColor={COLORS.border}
                            activeOutlineColor={COLORS.primary}
                            left={<TextInput.Icon icon={() => <Lock size={20} color={COLORS.textSecondary} />} />}
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>पासवर्ड भूल गए?</Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        labelStyle={styles.loginButtonLabel}
                    >
                        प्रारंभ करें <ArrowRight size={18} color="white" />
                    </Button>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>परिवार के साथ खर्च प्रबंधित करें</Text>
                    </View>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    header: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 60,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    appSubName: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    formContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        marginTop: -40,
        borderTopRightRadius: 60,
        paddingHorizontal: 32,
        paddingTop: 40,
    },
    welcomeText: {
        fontSize: 24,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'white',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 16,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loginButtonContent: {
        height: 56,
        flexDirection: 'row-reverse',
    },
    loginButtonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: 32,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
});
