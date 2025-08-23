
import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';


import TelaBoasVindas from '../telas/TelaBemVindo'; 
import TelaLogin from '../telas/TelaLogin';
import TelaCadastro from '../telas/TelaCadastro';
import TelaMapa from '../telas/TelaMapa'



export type RootStackParamList = {
  BoasVindas: undefined;
  Login: undefined;
  Cadastro: undefined;
  Mapa: undefined;
};


export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size="large"/>
      </View>
    )
  }
  else

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        { token ? (

          <Stack.Screen name="Mapa" component={TelaMapa} />
        ) : (
         
          <>
            <Stack.Screen name="BoasVindas" component={TelaBoasVindas} />
            <Stack.Screen name="Login" component={TelaLogin} />
            <Stack.Screen name="Cadastro" component={TelaCadastro} />
          </>
        )}
      </Stack.Navigator>
   </NavigationContainer>
  );
};

export default AppNavigator;
