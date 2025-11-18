import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TelaMenu = () => {
  const navigation = useNavigation();

  const opcoes = [
    { id: 1, nome: 'Minhas Avaliações', icon: 'chatbox-ellipses-outline', acao: () => Alert.alert('Em breve', 'Histórico de avaliações virá na próxima versão!') },
    { id: 2, nome: 'Favoritos', icon: 'heart-outline', acao: () => Alert.alert('Em breve', 'Lista de favoritos virá na próxima versão!') },
    { id: 3, nome: 'Configurações', icon: 'settings-outline', acao: () => Alert.alert('Em breve', 'Configurações do app.') },
    { id: 4, nome: 'Ajuda e Suporte', icon: 'help-buoy-outline', acao: () => Alert.alert('Suporte', 'Entre em contato: suporte@wheelgo.com') },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Menu</Text>
        
        {opcoes.map((opcao) => (
          <TouchableOpacity 
            key={opcao.id} 
            className="flex-row items-center p-4 mb-3 bg-gray-50 rounded-xl border border-gray-100"
            onPress={opcao.acao}
          >
            <View className="bg-white p-2 rounded-full mr-4">
                <Ionicons name={opcao.icon as any} size={24} color="#2563eb" />
            </View>
            <Text className="text-lg text-gray-700 font-medium flex-1">{opcao.nome}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default TelaMenu;