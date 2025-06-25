import React, { createContext, useState, useContext, useEffect, Children} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthContextData {
    user: any;
    token: string | null;
    loading: boolean;
    login: (userData: any, token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async ( userData: any, token: string) => {
        setUser(userData);
        setToken(token);

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
    }

    const logout = async () => {
        setUser(null);
        setToken(null);

        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value = {{ login , logout, token, user, loading }}>
            {children}
        </AuthContext.Provider>
    ); 
};


export default AuthProvider;