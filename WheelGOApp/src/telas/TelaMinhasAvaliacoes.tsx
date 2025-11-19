import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StatusBar, Image, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<AppStackParamList, 'TelaMinhasAvaliacoes'>;

interface MinhaAvaliacao {
  _id: string;
  IDlugar: string;
  nota: number;
  texto: string;
  createdAt: string;
  fotos?: string[];
  nomeLugar?: string;
  enderecoLugar?: string;
}

const TelaMinhasAvaliacoes = () => {
  const navigation = useNavigation<any>(); 
  const { token } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<MinhaAvaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMinhasAvaliacoes();
  }, []);
  
  const fetchMinhasAvaliacoes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/avaliacoes/minhas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao buscar suas avaliações');

      const data = await response.json();

      const avaliacoesComNomes = await Promise.all(
        data.map(async (av: MinhaAvaliacao) => {
          try {
            const googleRes = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${av.IDlugar}&fields=name,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
            );
            const googleJson = await googleRes.json();

            if (googleJson.status === 'OK') {
              return {
                ...av,
                nomeLugar: googleJson.result.name,
                enderecoLugar: googleJson.result.formatted_address,
              };
            }
          } catch (e) {
            console.error('Erro ao buscar nome no Google:', e);
          }

          return {
            ...av,
            nomeLugar: 'Local não identificado',
            enderecoLugar: '',
          };
        })
      );

      setAvaliacoes(avaliacoesComNomes.reverse()); // Ordena do mais recente para o mais antigo
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (idAvaliacao: string) => {
    Alert.alert(
      "Excluir Avaliação",
      "Tem certeza que deseja apagar esta avaliação?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            try {
                // setLoading(true); // Opcional: pode travar a tela inteira, melhor não usar aqui para UX fluida
                const response = await fetch(`${API_URL}/api/avaliacoes/${idAvaliacao}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    setAvaliacoes(prev => prev.filter(a => a._id !== idAvaliacao));
                    Alert.alert("Sucesso", "Avaliação excluída.");
                } else {
                    Alert.alert("Erro", "Não foi possível excluir.");
                }
            } catch (e) {
                console.error(e);
                Alert.alert("Erro", "Falha de conexão.");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <View className="pt-12 pb-4 px-6 bg-white shadow-sm flex-row items-center mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-100 rounded-full mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-gray-900">Minhas Avaliações</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={avaliacoes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-50">
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-lg font-medium">Você ainda não avaliou nada.</Text>
              <Text className="text-gray-400 text-center px-10 mt-2">Suas contribuições aparecerão aqui.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden">
                
                {/* 1. Área clicável para ir aos detalhes */}
                <TouchableOpacity
                  className="p-4 pb-2"
                  onPress={() => {
                    if (item.nomeLugar && item.nomeLugar !== 'Local não identificado') {
                      navigation.navigate('TelaDetalhesLugar', {
                        placeId: item.IDlugar,
                        nomeLugar: item.nomeLugar,
                        endereco: item.enderecoLugar || '',
                        localizacao: { lat: 0, lng: 0 },
                      });
                    }
                  }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                        {item.nomeLugar || 'Carregando...'}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-1">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </Text>
                    </View>

                    <View className="bg-blue-50 px-2 py-1 rounded-lg flex-row items-center">
                      <Text className="font-bold text-blue-700 mr-1">{item.nota}</Text>
                      <FontAwesome5 name="star" solid size={10} color="#2563eb" />
                    </View>
                  </View>

                  <Text className="text-gray-600 text-sm leading-5 mb-3 italic" numberOfLines={3}>
                    "{item.texto}"
                  </Text>

                  {item.fotos && item.fotos.length > 0 && (
                    <Image
                      source={{ uri: item.fotos[0] }}
                      className="w-full h-32 rounded-xl bg-gray-100 mb-2"
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>

                {/* 2. Barra de Ações (Editar / Excluir) */}
                <View className="flex-row border-t border-gray-100 bg-gray-50 px-4 py-3 justify-end gap-3">
                    <TouchableOpacity 
                        className="flex-row items-center bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm"
                        onPress={() => navigation.navigate('TelaNovaAvaliacao', {
                            placeId: item.IDlugar,
                            nomeLugar: item.nomeLugar || 'Local',
                            avaliacaoExistente: { 
                                _id: item._id,
                                nota: item.nota,
                                texto: item.texto,
                                fotos: item.fotos || []
                            }
                        })}
                    >
                        <Ionicons name="pencil" size={14} color="#4B5563" />
                        <Text className="text-gray-600 font-bold ml-1 text-xs">Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-row items-center bg-red-50 border border-red-100 px-3 py-2 rounded-lg"
                        onPress={() => handleDelete(item._id)}
                    >
                        <Ionicons name="trash" size={14} color="#EF4444" />
                        <Text className="text-red-500 font-bold ml-1 text-xs">Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TelaMinhasAvaliacoes;