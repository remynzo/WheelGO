import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext'; 
import TelaMinhasAvaliacoes from '../telas/TelaMinhasAvaliacoes';
import TelaBemVindo from '../telas/TelaBemVindo';
import TelaLogin from '../telas/TelaLogin';
import TelaCadastro from '../telas/TelaCadastro';
import TelaMapa from '../telas/TelaMapa';
import TelaDetalhesLugar from '../telas/TelaDetalhesLugar';
import TelaNovaAvaliacao from '../telas/TelaNovaAvaliacao';
import TelaUsuario from '../telas/TelaUsuario';
import TelaMenu from '../telas/TelaMenu';
import TelaRanking from '../telas/TelaRanking';
import TelaConfiguracoes from '../telas/TelaConfiguracoes';
import { useTheme } from '../context/ThemeContext'; // DARK MODE aqui

export type AppStackParamList = {
  TelaMapa: undefined;
  TelaUsuario: undefined;
  TelaMenu: undefined;
  TelaMinhasAvaliacoes: undefined;
  TelaConfiguracoes: undefined;
  TelaDetalhesLugar: { 
    placeId: string;
    nomeLugar: string;
    endereco: string;
    localizacao: { lat: number; lng: number };
  };
  TelaNovaAvaliacao: {
    placeId: string;
    nomeLugar: string;
    avaliacaoExistente?: {
        _id: string;
        nota: number;
        texto: string;
        fotos: string[];
    };
  };
  TelaRanking: {
    categoriaId: string;
    categoriaNome: string;
    userLocation: { lat: number; lng: number };
  };
};

export type AuthStackParamList = {
  TelaBemVindo: undefined;
  TelaLogin: undefined;
  TelaCadastro: undefined;
};

const AppStack = createNativeStackNavigator<AppStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { isDark } = useTheme(); // 👈 Correção AQUI!

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const screenHeaderStyle = {
    headerStyle: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
    },
    headerTitleStyle: {
      color: isDark ? '#ffffff' : '#000000',
    },
    headerTintColor: isDark ? '#ffffff' : '#000000',
  };

  return (
    <NavigationContainer>
      {user ? (
        <AppStack.Navigator
          screenOptions={{
            headerShown: true,
            ...screenHeaderStyle,
          }}
        >
          <AppStack.Screen name="TelaMapa" component={TelaMapa} options={{ headerShown: false }}/>
          <AppStack.Screen name="TelaUsuario" component={TelaUsuario} options={{ title: 'Meu Perfil' }} />
          <AppStack.Screen name="TelaMenu" component={TelaMenu} options={{ title: 'Menu' }} />
          <AppStack.Screen name="TelaDetalhesLugar" component={TelaDetalhesLugar} options={{ headerShown: false }} />
          <AppStack.Screen name="TelaNovaAvaliacao" component={TelaNovaAvaliacao} options={{ title: 'Avaliar' }} />
          <AppStack.Screen name="TelaRanking" component={TelaRanking} options={{ headerShown: false }} />
          <AppStack.Screen name="TelaMinhasAvaliacoes" component={TelaMinhasAvaliacoes} options={{ headerShown: false, title: 'Minhas Avaliações' }} />
          <AppStack.Screen name="TelaConfiguracoes" component={TelaConfiguracoes} options={{ headerShown: false }} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="TelaBemVindo" component={TelaBemVindo} />
          <AuthStack.Screen name="TelaLogin" component={TelaLogin} />
          <AuthStack.Screen name="TelaCadastro" component={TelaCadastro} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
