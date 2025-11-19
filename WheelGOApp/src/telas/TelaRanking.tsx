// WheelGOApp/src/telas/TelaRanking.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { GOOGLE_MAPS_API_KEY } from '@env';
import API_URL from '../apiConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // Importar Theme

type Props = NativeStackScreenProps<AppStackParamList, 'TelaRanking'>;

interface PlaceRanked {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  acessibilidadeMedia: number;
  totalAvaliacoesAcessibilidade: number;
  geometry: { location: { lat: number; lng: number } };
}

interface AvaliacaoBackend {
  IDlugar: string;
  nota: number;
}

const IMPORTANT_KEYWORDS = ["Federzoni", "McDonald's", "Bella Sushi", "Supermercado"];

const TelaRanking = ({ route, navigation }: Props) => {
  const { isDark } = useTheme(); // Pegar tema
  const { categoriaId, categoriaNome, userLocation } = route.params;
  const [locais, setLocais] = useState<PlaceRanked[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const googlePlaces = await fetchGooglePlaces();
      const nossasAvaliacoes = await fetchNossasAvaliacoes();

      const locaisComNotas = googlePlaces.map((place: any) => {
        const avaliacoesDoLugar = nossasAvaliacoes.filter(a => a.IDlugar === place.place_id);
        let media = 0;
        if (avaliacoesDoLugar.length > 0) {
          const soma = avaliacoesDoLugar.reduce((acc, curr) => acc + curr.nota, 0);
          media = soma / avaliacoesDoLugar.length;
        }

        return {
          place_id: place.place_id,
          name: place.name,
          vicinity: place.vicinity || place.formatted_address,
          rating: place.rating,
          acessibilidadeMedia: media,
          totalAvaliacoesAcessibilidade: avaliacoesDoLugar.length,
          geometry: place.geometry
        } as PlaceRanked;
      });

      const ordenados = locaisComNotas.sort((a, b) => {
        if (b.acessibilidadeMedia !== a.acessibilidadeMedia) {
          return b.acessibilidadeMedia - a.acessibilidadeMedia;
        }
        return b.totalAvaliacoesAcessibilidade - a.totalAvaliacoesAcessibilidade;
      });

      setLocais(ordenados);
    } catch (error) {
      console.error("Erro ao montar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGooglePlaces = async () => {
    const radius = 5000;
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.lat},${userLocation.lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    const allResults: Record<string, any> = {};

    if (categoriaId === 'all') {
      const urlsTipos = [baseUrl, `${baseUrl}&type=supermarket`, `${baseUrl}&type=restaurant`, `${baseUrl}&type=hospital`, `${baseUrl}&type=store`];
      const promisesKeywords = IMPORTANT_KEYWORDS.map(kw => 
        fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(kw)}&location=${userLocation.lat},${userLocation.lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`)
          .then(res => res.json())
      );
      const responsesTipos = await Promise.all(urlsTipos.map(url => fetch(url).then(res => res.json())));
      const responsesKeywords = await Promise.all(promisesKeywords);

      [...responsesTipos, ...responsesKeywords].forEach(json => {
        if (json.status === 'OK' && Array.isArray(json.results)) {
          json.results.forEach((res: any) => {
            if (res.place_id) allResults[res.place_id] = res;
          });
        }
      });
    } else {
      const res = await fetch(`${baseUrl}&type=${categoriaId}`);
      const json = await res.json();
      if (json.status === 'OK') {
        json.results.forEach((res: any) => {
          if (res.place_id) allResults[res.place_id] = res;
        });
      }
    }
    return Object.values(allResults);
  };

  const fetchNossasAvaliacoes = async (): Promise<AvaliacaoBackend[]> => {
    try {
      const res = await fetch(`${API_URL}/api/avaliacoes`);
      if (res.ok) return await res.json();
      return [];
    } catch (e) { return []; }
  };

  const getMedalha = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View className="pt-12 pb-4 px-6 bg-white dark:bg-gray-800 shadow-sm flex-row items-center">
         <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full mr-4">
             <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#374151"} />
         </TouchableOpacity>
         <View>
             <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Ranking de Acessibilidade</Text>
             <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">Top {categoriaNome}</Text>
         </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-4 text-gray-500 dark:text-gray-400">Calculando notas...</Text>
        </View>
      ) : (
        <FlatList
          data={locais}
          keyExtractor={(item) => item.place_id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
                onPress={() => navigation.navigate('TelaDetalhesLugar', {
                    placeId: item.place_id,
                    nomeLugar: item.name,
                    endereco: item.vicinity,
                    localizacao: item.geometry.location
                })}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center"
            >
                <View className="w-12 items-center justify-center mr-2">
                    <Text className="text-2xl font-black text-gray-800 dark:text-gray-100">{getMedalha(index)}</Text>
                </View>

                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 dark:text-white mb-1" numberOfLines={1}>{item.name}</Text>
                    
                    <View className="flex-row items-center">
                        <View className={`px-2 py-1 rounded-md flex-row items-center mr-3 ${
                            item.acessibilidadeMedia > 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                            <Text className={`font-bold mr-1 ${
                                item.acessibilidadeMedia > 0 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {item.acessibilidadeMedia > 0 ? item.acessibilidadeMedia.toFixed(1) : '-'}
                            </Text>
                            <FontAwesome5 name="wheelchair" size={12} color={item.acessibilidadeMedia > 0 ? "#1d4ed8" : "#9ca3af"} />
                        </View>

                        <Text className="text-xs text-gray-400">
                            {item.totalAvaliacoesAcessibilidade} avaliações
                        </Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={isDark ? "#4B5563" : "#D1D5DB"} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
              <View className="items-center mt-20">
                  <Text className="text-gray-400">Nenhum local encontrado.</Text>
              </View>
          }
        />
      )}
    </View>
  );
};

export default TelaRanking;