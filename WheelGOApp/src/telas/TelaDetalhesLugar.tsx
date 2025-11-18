// WheelGOApp/src/telas/TelaDetalhesLugar.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import API_BASE_URL from '../apiConfig';;
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AppStackParamList, 'TelaDetalhesLugar'>;

// Interface para nossas avaliações vindas do backend
interface Avaliacao {
  _id: string;
  nota: number;
  texto: string;
  user: {
    name: string;
  };
}

const TelaDetalhesLugar = ({ route, navigation }: Props) => {
  // Recebe os dados passados pela TelaMapa
  const { placeId, nomeLugar, endereco } = route.params;
  
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // Hook para saber se a tela está ativa

  // Função para buscar as avaliações do nosso backend
  const fetchAvaliacoes = async () => {
    setLoading(true);
    try {
      // Faz a chamada para sua API
      const response = await fetch(`${API_BASE_URL}/api/avaliacoes/${placeId}`);
      
      if (response.status === 404) {
        setAvaliacoes([]); // Se não tiver avaliações (404), lista vazia
      } else if (!response.ok) {
        throw new Error('Erro ao buscar avaliações');
      } else {
        const data = await response.json();
        setAvaliacoes(data);
      }
    } catch (error: any) {
      console.error(error);
      // Não vamos alertar erro se for apenas falha de conexão ou vazio, para não travar a UI
    } finally {
      setLoading(false);
    }
  };

  // Recarrega as avaliações toda vez que a tela ganha foco (útil quando volta da tela de avaliar)
  useEffect(() => {
    if (isFocused) {
      fetchAvaliacoes();
    }
  }, [placeId, isFocused]);

  const handleAvaliarPress = () => {
    navigation.navigate('TelaNovaAvaliacao', { placeId, nomeLugar });
  };

  // Renderiza o cabeçalho da lista (Info do lugar + Botão)
  const renderHeader = () => (
    <View className="mb-4">
      <Text className="text-2xl font-bold text-gray-800 mb-1">{nomeLugar}</Text>
      <Text className="text-sm text-gray-500 mb-4">{endereco}</Text>
      
      <TouchableOpacity 
        className="bg-blue-600 py-3 px-4 rounded-lg flex-row justify-center items-center"
        onPress={handleAvaliarPress}
      >
        <Ionicons name="add-circle-outline" size={24} color="white" />
        <Text className="text-white font-bold ml-2 text-lg">Avaliar Acessibilidade</Text>
      </TouchableOpacity>

      <View className="mt-6 border-b border-gray-200 pb-2">
        <Text className="text-xl font-bold text-gray-700">O que dizem:</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white p-5">
      {loading ? (
        <View className="flex-1 justify-center items-center">
            <Text className="text-lg font-bold mb-4">{nomeLugar}</Text>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2 text-gray-500">Carregando avaliações...</Text>
        </View>
      ) : (
        <FlatList
          data={avaliacoes}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="p-4 bg-gray-50 rounded-xl mb-3 border border-gray-100 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                 <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome 
                        key={star} 
                        name={star <= item.nota ? "star" : "star-o"} 
                        size={14} 
                        color="#FFD700" 
                      />
                    ))}
                 </View>
                 <Text className="text-xs text-gray-400">{item.user?.name || 'Anônimo'}</Text>
              </View>
              <Text className="text-base text-gray-700 leading-5">{item.texto}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View className="py-10 items-center">
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
                <Text className="text-center text-gray-500 mt-2">Ninguém avaliou este local ainda.</Text>
                <Text className="text-center text-gray-400 text-sm">Seja o primeiro!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default TelaDetalhesLugar;