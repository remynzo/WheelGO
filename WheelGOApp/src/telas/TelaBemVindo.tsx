import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'TelaBemVindo'>;

const TelaBemVindo = ({ navigation }: Props) => {
  return (
    <View className="flex-1 bg-blue-500 justify-center items-center p-6">
      {/* Logo ou Ícone (Se tiver a imagem, descomente a linha abaixo) */}
      {/* <Image source={require('../../assets/images/LogoWheelGo.png')} className="w-32 h-32 mb-8" /> */}
      
      <Text className="text-4xl font-bold text-white mb-2">WheelGO</Text>
      <Text className="text-lg text-blue-100 text-center mb-12">
        Acessibilidade em todo lugar, para todos.
      </Text>

      <TouchableOpacity 
        className="bg-white w-full py-4 rounded-full mb-4 shadow-md"
        onPress={() => navigation.navigate('TelaLogin')}
      >
        <Text className="text-blue-600 text-center font-bold text-lg">Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-blue-700 w-full py-4 rounded-full shadow-md border border-blue-400"
        onPress={() => navigation.navigate('TelaCadastro')}
      >
        <Text className="text-white text-center font-bold text-lg">Criar Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaBemVindo;