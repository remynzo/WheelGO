import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthContextData {
    user: any;
    token: string | null;
    loading: boolean;
    login: (userData: any, token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    // Começa como true (booleano)
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadStorageData() {
            console.log('[Auth] Carregando dados...');
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("[Auth] Erro ao carregar:", error);
            } finally {
                console.log('[Auth] Dados carregados. Loading virando false.');
                // Força para false (booleano) ao terminar
                setLoading(false);
            }
        }

        loadStorageData();
    }, []);

    const login = async (userData: any, tokenValue: string) => {
        setUser(userData);
        setToken(tokenValue);
        try {
            await AsyncStorage.setItem('userToken', tokenValue);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error("[Auth] Erro no login:", error);
        }
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error("[Auth] Erro no logout:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading: !!loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

export default AuthProvider;