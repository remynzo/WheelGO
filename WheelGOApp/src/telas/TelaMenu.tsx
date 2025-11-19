import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext'; 

const TelaMenu = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { isDark } = useTheme();

  const opcoes = [
    { 
      id: 1, 
      nome: 'Minhas Avaliações', 
      icon: 'chatbox-ellipses-outline', 
      acao: () => navigation.navigate('TelaMinhasAvaliacoes' as never)
    },
    { 
      id: 2, 
      nome: 'Configurações', 
      icon: 'settings-outline', 
      acao: () => navigation.navigate('TelaConfiguracoes')
    },
    { 
      id: 3, 
      nome: 'Ajuda e Suporte', 
      icon: 'help-buoy-outline', 
      acao: () => Alert.alert('Suporte', 'Entre em contato: projetoEEFGI@gmail.com')
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Menu</Text>
        
        {opcoes.map((opcao) => (
          <TouchableOpacity 
            key={opcao.id} 
            className="flex-row items-center p-4 mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
            onPress={opcao.acao}
          >
            <View className="bg-white dark:bg-gray-700 p-2 rounded-full mr-4">
              <Ionicons 
                name={opcao.icon as any} 
                size={24} 
                color={isDark ? "#93c5fd" : "#2563eb"} 
              />
            </View>
            <Text className="text-lg font-medium flex-1 text-gray-700 dark:text-gray-200">{opcao.nome}</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#6b7280" : "#9ca3af"} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default TelaMenu;
