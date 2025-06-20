import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/AppNavigator'; // Importa o nosso tipo de navegação

const TelaBoasVindas = () => {
  // --- CORREÇÃO 3: Usar o tipo correto com o useNavigation ---
  const navigation = useNavigation<NavigationProps>();

  return (
    <View className="flex-1 justify-center items-center bg-white w-full p-8">
      <Image
        source={require('../../assets/images/LogoWheelGo.png')}
        className="w-32 h-32 mb-4"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-gray-800 mb-12">
        Bem-vindo(a) ao WheelGO!
      </Text>
      <TouchableOpacity
        className="bg-gray-800 w-full py-4 rounded-lg mb-4"
        onPress={() => navigation.navigate('Cadastro')} // O erro aqui desaparece!
      >
        <Text className="text-white text-center font-bold text-lg">
          Registar-se
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-blue-600 w-full py-4 rounded-lg"
        onPress={() => navigation.navigate('Login')} // O erro aqui desaparece!
      >
        <Text className="text-white text-center font-bold text-lg">
          Entrar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaBoasVindas;