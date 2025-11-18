import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import API_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext'; // Importa useAuth para pegar o token
import { Ionicons, FontAwesome } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AppStackParamList, 'TelaNovaAvaliacao'>;

const TelaNovaAvaliacao = ({ route, navigation }: Props) => {
  const { placeId, nomeLugar } = route.params;
  const { token } = useAuth(); // Pega o token do usuário logado
  
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (nota === 0) {
      Alert.alert('Nota obrigatória', 'Por favor, selecione uma nota de 1 a 5.');
      return;
    }
    
    if (!comentario.trim()) {
        Alert.alert('Comentário obrigatório', 'Por favor, escreva sobre a acessibilidade do local.');
        return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/avaliacoes/novaAvaliacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho
        },
        body: JSON.stringify({
          IDlugar: placeId,
          nota: nota,
          texto: comentario,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar avaliação');
      }

      Alert.alert('Sucesso!', 'Sua avaliação foi publicada.');
      navigation.goBack(); // Volta para a tela de detalhes

    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível enviar sua avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-xl text-center text-gray-500 mb-2">Avaliando</Text>
      <Text className="text-3xl font-bold text-center text-gray-800 mb-8">{nomeLugar}</Text>
      
      {/* Seletor de Estrelas */}
      <View className="items-center mb-8">
        <Text className="text-lg font-medium mb-4 text-gray-600">Qual sua nota para a acessibilidade?</Text>
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setNota(i)} className="p-2">
                <FontAwesome 
                name={i <= nota ? 'star' : 'star-o'} 
                size={48} 
                color="#FFD700" 
                />
            </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Campo de Texto */}
      <Text className="text-lg font-medium mb-2 text-gray-600">Seu comentário:</Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-base h-40 text-gray-700 mb-8"
        placeholder="Descreva as rampas, banheiros, portas..."
        placeholderTextColor="#9ca3af"
        value={comentario}
        onChangeText={setComentario}
        multiline
        textAlignVertical="top"
      />

      {/* Botão Enviar */}
      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex-row justify-center items-center"
        onPress={handleSalvar}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="white" />
        ) : (
            <>
                <Ionicons name="send" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Publicar Avaliação</Text>
            </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TelaNovaAvaliacao;