import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setAuthToken } from '../services/api';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setAuthToken(token);
                const response = await authAPI.getMe();
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to load user', error);
            await AsyncStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: any) => {
        try {
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;
            await AsyncStorage.setItem('token', token);
            setAuthToken(token);
            setUser(user);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
