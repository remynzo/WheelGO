// WheelGOApp/src/telas/TelaNovaAvaliacao.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator'; 
import API_URL from '../apiConfig'; 
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext'; // <--- Importa o Tema
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<AppStackParamList, 'TelaNovaAvaliacao'>;

const TelaNovaAvaliacao = ({ route, navigation }: Props) => {
  const { placeId, nomeLugar, avaliacaoExistente } = route.params as any; 
  const { token } = useAuth();
  const { isDark } = useTheme(); // <--- Pega se está escuro
  
  const [nota, setNota] = useState(avaliacaoExistente?.nota || 0);
  const [comentario, setComentario] = useState(avaliacaoExistente?.texto || '');
  const [fotoUri, setFotoUri] = useState<string | null>(avaliacaoExistente?.fotos?.[0] || null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!avaliacaoExistente;

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setFotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleSalvar = async () => {
    if (nota === 0) {
      Alert.alert('Nota obrigatória', 'Por favor, dê uma nota de 1 a 5 estrelas.');
      return;
    }
    
    if (!comentario.trim()) {
        Alert.alert('Comentário obrigatório', 'Por favor, conte-nos sobre a acessibilidade do local.');
        return;
    }

    setLoading(true);
    let finalFotoUrl = fotoUri;

    try {
      if (fotoUri && !fotoUri.startsWith('http')) {
        const formData = new FormData();
        formData.append('avatar', { 
          uri: fotoUri,
          type: 'image/jpeg',
          name: `review_${Date.now()}.jpg`,
        } as any);

        const uploadResponse = await fetch(`${API_URL}/api/uploads`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok && uploadData.url) {
          finalFotoUrl = uploadData.url;
        } else {
          throw new Error('Falha no upload da imagem.');
        }
      }

      const url = isEditing 
        ? `${API_URL}/api/avaliacoes/${avaliacaoExistente._id}`
        : `${API_URL}/api/avaliacoes/novaAvaliacao`;
        
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          IDlugar: placeId,
          nota: nota,
          texto: comentario,
          fotos: finalFotoUrl ? [finalFotoUrl] : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar avaliação');
      }

      Alert.alert('Sucesso!', isEditing ? 'Avaliação atualizada.' : 'Avaliação publicada com sucesso!');
      navigation.goBack();

    } catch (error: any) {
      console.error("Erro no salvamento:", error);
      Alert.alert('Erro', error.message || 'Não foi possível enviar sua avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 p-6">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-2 left-0 z-10 p-2">
         <Ionicons name="close" size={24} color={isDark ? "#E5E7EB" : "#374151"} />
      </TouchableOpacity>

      <Text className="text-xl text-center text-gray-500 dark:text-gray-400 mb-1 mt-2">
          {isEditing ? 'Editando Avaliação' : 'Avaliando'}
      </Text>
      <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">{nomeLugar}</Text>
      
      {/* Estrelas */}
      <View className="items-center mb-8">
        <Text className="text-base font-medium mb-3 text-gray-600 dark:text-gray-300">Nota de Acessibilidade</Text>
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setNota(i)} className="mx-1">
                <FontAwesome 
                  name={i <= nota ? 'star' : 'star-o'} 
                  size={42} 
                  color="#FFD700" 
                />
            </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Comentário */}
      <Text className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Seu comentário</Text>
      <TextInput
        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-base h-32 text-gray-800 dark:text-gray-100 mb-6"
        placeholder="O local tem rampas? O banheiro é acessível?"
        placeholderTextColor={isDark ? "#6B7280" : "#9ca3af"}
        value={comentario}
        onChangeText={setComentario}
        multiline
        textAlignVertical="top"
      />

      {/* Área de Foto */}
      <Text className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Foto do Local (Opcional)</Text>
      <TouchableOpacity 
        onPress={pickImage}
        className="flex-row items-center justify-center bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-48 mb-8 overflow-hidden relative"
      >
        {fotoUri ? (
          <>
            <Image source={{ uri: fotoUri }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full">
                <Ionicons name="pencil" size={16} color="white" />
            </View>
          </>
        ) : (
          <View className="items-center">
            <Ionicons name="camera-outline" size={32} color={isDark ? "#6B7280" : "#9CA3AF"} />
            <Text className="text-gray-400 dark:text-gray-500 mt-2">Toque para adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Botão Enviar */}
      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-2xl shadow-md flex-row justify-center items-center mb-10"
        onPress={handleSalvar}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="white" />
        ) : (
            <>
                <Ionicons name={isEditing ? "save-outline" : "send"} size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                    {isEditing ? 'Salvar Alterações' : 'Publicar Avaliação'}
                </Text>
            </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TelaNovaAvaliacao;