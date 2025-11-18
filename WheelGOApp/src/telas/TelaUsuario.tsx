// WheelGOApp/src/telas/TelaUsuario.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import API_URL from '../apiConfig';

const TelaUsuario = () => {
  const { user, logout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const pickImage = async (fromCamera: boolean) => {
    try {
      // 1. Pede permissão dependendo da fonte (Câmera ou Galeria)
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permissão negada', 'Você precisa permitir o acesso nas configurações.');
        return;
      }

      // 2. Abre a Câmera ou a Galeria
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Foto quadrada para perfil
        quality: 0.7,
      };

      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      // 3. Se o usuário escolheu/tirou uma foto, faz o upload
      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        await uploadImageToServer({
          uri: file.uri,
          type: file.type || 'image/jpeg',
          fileName: file.fileName || `foto_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Erro ao abrir câmera/galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera ou galeria.');
    }
  };

  const uploadImageToServer = async (file: {
    uri: string;
    type: string;
    fileName: string;
  }) => {
    const formData = new FormData();
    
    formData.append('avatar', {
      uri: file.uri,
      type: file.type,
      name: file.fileName,
    } as any);

    try {
      const response = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        body: formData,
      });

      const textResponse = await response.text(); 
      try {
          const data = JSON.parse(textResponse);
          if (response.ok && data?.url) {
            setProfileImageUrl(data.url);
            Alert.alert("Sucesso", "Foto de perfil atualizada!");
          } else {
            console.error("Erro servidor:", data);
            Alert.alert('Erro', 'O servidor não retornou a URL da imagem.');
          }
      } catch (e) {
          console.error("Resposta inválida:", textResponse);
          Alert.alert('Erro', 'Falha na comunicação com o servidor.');
      }

    } catch (err) {
      console.error('Erro no upload:', err);
      Alert.alert('Erro de Rede', 'Verifique se o backend está rodando.');
    }
  };

  return (
    <View className="flex-1 bg-white p-6 items-center">
      
      {/* Área do Avatar */}
      <View className="mb-6 relative">
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            className="w-32 h-32 rounded-full border-4 border-blue-500"
          />
        ) : (
          <View className="w-32 h-32 rounded-full bg-blue-100 items-center justify-center border-4 border-white shadow-sm">
            <Ionicons name="person" size={80} color="#2563eb" />
          </View>
        )}
        {/* Ícone de câmera flutuante para indicar edição */}
        <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white">
            <Ionicons name="camera" size={20} color="white" />
        </View>
      </View>

      {/* Botões de Ação (Câmera e Galeria) */}
      <View className="flex-row space-x-4 mb-8 w-full justify-center px-4 gap-4">
        <TouchableOpacity 
            onPress={() => pickImage(true)}
            className="flex-1 bg-blue-600 py-3 rounded-xl flex-row justify-center items-center shadow-md"
        >
            <Ionicons name="camera-outline" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={() => pickImage(false)}
            className="flex-1 bg-white border border-gray-200 py-3 rounded-xl flex-row justify-center items-center shadow-sm"
        >
            <Ionicons name="images-outline" size={20} color="#374151" />
            <Text className="text-gray-700 font-bold ml-2">Galeria</Text>
        </TouchableOpacity>
      </View>

      {/* Informações do Usuário */}
      <Text className="text-2xl font-bold text-gray-800 mb-1">
        {user?.nome} {user?.sobrenome}
      </Text>
      <Text className="text-gray-500 text-lg mb-10">{user?.email}</Text>

      {/* Botão de Logout */}
      <TouchableOpacity
        className="bg-red-50 w-full py-4 rounded-xl flex-row justify-center items-center border border-red-100 mt-auto mb-4"
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text className="text-red-500 font-bold ml-2 text-lg">Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaUsuario;