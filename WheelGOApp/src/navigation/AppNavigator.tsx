import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext'; 

import TelaBemVindo from '../telas/TelaBemVindo';
import TelaLogin from '../telas/TelaLogin';
import TelaCadastro from '../telas/TelaCadastro';
import TelaMapa from '../telas/TelaMapa';
import TelaDetalhesLugar from '../telas/TelaDetalhesLugar';
import TelaNovaAvaliacao from '../telas/TelaNovaAvaliacao';
// Importando as novas telas (que vamos criar já já)
import TelaUsuario from '../telas/TelaUsuario';
import TelaMenu from '../telas/TelaMenu';

export type AppStackParamList = {
  TelaMapa: undefined;
  TelaUsuario: undefined; // Nova rota
  TelaMenu: undefined;    // Nova rota
  TelaDetalhesLugar: { 
    placeId: string;
    nomeLugar: string;
    endereco: string;
    localizacao: { lat: number; lng: number };
  };
  TelaNovaAvaliacao: {
    placeId: string;
    nomeLugar: string;
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppStack.Navigator screenOptions={{ headerShown: false }}> 
          <AppStack.Screen name="TelaMapa" component={TelaMapa} />
          <AppStack.Screen 
            name="TelaUsuario" 
            component={TelaUsuario} 
            options={{ headerShown: true, title: 'Meu Perfil' }} 
          />
          <AppStack.Screen 
            name="TelaMenu" 
            component={TelaMenu} 
            options={{ headerShown: true, title: 'Menu' }} 
          />
          <AppStack.Screen 
            name="TelaDetalhesLugar" 
            component={TelaDetalhesLugar} 
            options={{ headerShown: true, title: 'Detalhes' }} 
          />
          <AppStack.Screen 
            name="TelaNovaAvaliacao" 
            component={TelaNovaAvaliacao} 
            options={{ headerShown: true, title: 'Avaliar' }} 
          />
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