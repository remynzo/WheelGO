// WheelGOApp/src/telas/TelaDetalhesLugar.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import API_URL from '../apiConfig';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; 

type Props = NativeStackScreenProps<AppStackParamList, 'TelaDetalhesLugar'>;

interface Avaliacao {
  _id: string;
  nota: number;
  texto: string;
  createdAt?: string;
  fotos?: string[];
  user: {
    nome: string;
    foto?: string;
  };
}

const TelaDetalhesLugar = ({ route, navigation }: Props) => {
  const { placeId, nomeLugar, endereco } = route.params;
  const { isDark } = useTheme(); // <--- Pega o estado do tema
  
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaGeral, setMediaGeral] = useState(0);
  
  const isFocused = useIsFocused();

  const fetchAvaliacoes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/avaliacoes/${placeId}`);
      
      if (response.status === 404) {
        setAvaliacoes([]);
        setMediaGeral(0);
      } else if (!response.ok) {
        throw new Error('Erro ao buscar avaliações');
      } else {
        const data: Avaliacao[] = await response.json();
        const ordenadas = data.reverse(); 
        setAvaliacoes(ordenadas);
        
        if (data.length > 0) {
            const total = data.reduce((acc, curr) => acc + curr.nota, 0);
            setMediaGeral(total / data.length);
        } else {
            setMediaGeral(0);
        }
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAvaliacoes();
    }
  }, [placeId, isFocused]);

  const renderHeader = () => (
    <View className="bg-white dark:bg-gray-900 mb-2 pt-4 px-1">
      <View className="pb-4">
        <Text className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1 leading-tight">{nomeLugar}</Text>
        <View className="flex-row items-start mt-1">
            <Ionicons name="location-sharp" size={16} color={isDark ? "#9CA3AF" : "#4B5563"} style={{marginTop: 2}} />
            <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1 flex-1 leading-5">{endereco}</Text>
        </View>
      </View>

      {/* Card de Nota Geral */}
      <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex-row items-center justify-between mb-6 border border-blue-100 dark:border-blue-800">
          <View>
              <Text className="text-blue-900 dark:text-blue-200 font-bold text-base">Acessibilidade Geral</Text>
              <Text className="text-blue-600 dark:text-blue-400 text-xs mt-1">{avaliacoes.length} avaliações</Text>
          </View>
          <View className="items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm flex-row">
              <Text className="text-2xl font-black text-gray-900 dark:text-white mr-1">{mediaGeral > 0 ? mediaGeral.toFixed(1) : '-'}</Text>
              <FontAwesome name="star" size={18} color="#FFD700" />
          </View>
      </View>
      
      <TouchableOpacity 
        className="bg-blue-600 py-3 rounded-xl flex-row justify-center items-center shadow-md mb-6"
        onPress={() => navigation.navigate('TelaNovaAvaliacao', { placeId, nomeLugar })}
      >
        <Ionicons name="add-circle" size={20} color="white" />
        <Text className="text-white font-bold ml-2 text-base">Escrever Avaliação</Text>
      </TouchableOpacity>

      <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Comentários</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        className="absolute top-12 left-4 z-50 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-md"
      >
        <Ionicons name="arrow-back" size={24} color={isDark ? "#E5E7EB" : "#374151"} />
      </TouchableOpacity>

      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={avaliacoes}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              {/* Cabeçalho Avaliação */}
              <View className="flex-row items-center mb-2">
                 {item.user?.foto ? (
                     <Image source={{ uri: item.user.foto }} className="w-8 h-8 rounded-full mr-3 bg-gray-200 dark:bg-gray-700" />
                 ) : (
                     <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
                         <Ionicons name="person" size={16} color="#2563eb" />
                     </View>
                 )}
                 
                 <View className="flex-1">
                     <Text className="font-bold text-gray-800 dark:text-gray-200 text-sm">{item.user?.nome || 'Usuário'}</Text>
                     <View className="flex-row mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesome 
                            key={star} 
                            name={star <= item.nota ? "star" : "star-o"} 
                            size={10} 
                            color="#FFD700" 
                            style={{ marginRight: 1 }}
                          />
                        ))}
                     </View>
                 </View>
              </View>

              {/* Texto */}
              <Text className="text-gray-700 dark:text-gray-300 text-sm leading-5 mb-2">{item.texto}</Text>
              
              {/* Fotos da Avaliação */}
              {item.fotos && item.fotos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1">
                    {item.fotos.map((fotoUrl, index) => (
                        <Image 
                            key={index}
                            source={{ uri: fotoUrl }} 
                            className="w-24 h-24 rounded-lg mr-2 bg-gray-200 dark:bg-gray-700"
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View className="py-8 items-center">
                <Text className="text-gray-400 text-sm">Nenhuma avaliação ainda.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default TelaDetalhesLugar;