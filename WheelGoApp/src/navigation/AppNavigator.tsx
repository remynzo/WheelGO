
import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// --- CORREÇÃO PRINCIPAL: Caminhos de importação ---
// Se o AppNavigator está em 'src/navigation', o caminho para 'src/telas' é '../telas/'.
// Além disso, garante que o nome do ficheiro e o nome do componente exportado batem certo.
import TelaBoasVindas from '../telas/TelaBemVindo'; // Corrigido (Garanta que o nome do arquivo seja TelaBoasVindas.tsx)
import TelaLogin from '../telas/TelaLogin';
import TelaCadastro from '../telas/TelaCadastro';


// --- CORREÇÃO 1: Definir os tipos para as nossas rotas ---
// Criamos um "mapa" que diz ao TypeScript quais telas existem.
// 'undefined' significa que não esperamos passar parâmetros para essas telas.
export type RootStackParamList = {
  BoasVindas: undefined;
  Login: undefined;
  Cadastro: undefined;
};

// Criamos um tipo para a propriedade de navegação que as nossas telas vão usar.
export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="BoasVindas" // A primeira tela a ser mostrada
        screenOptions={{
          headerShown: false, // Esconde o cabeçalho padrão em todas as telas
        }}
      >
        <Stack.Screen name="BoasVindas" component={TelaBoasVindas} />
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        {/* Futuramente, teremos outra pilha para as telas de dentro do app (mapa, perfil, etc.) */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
