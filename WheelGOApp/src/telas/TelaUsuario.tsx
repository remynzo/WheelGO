import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import API_BASE_URL from '../apiConfig'; // Importa com o nome padronizado

const TelaUsuario = () => {
  const { user, logout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const pickImage = async (fromCamera: boolean) => {
  const { status } = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert('Permissão negada', 'Você precisa permitir o acesso à câmera ou galeria.');
    return;
  }

  const result = await (fromCamera
    ? ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        quality: 0.7,
      })
    : ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        quality: 0.7,
      }));

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const file = result.assets[0];
    await uploadImageToServer({
      uri: file.uri,
      type: file.type || 'image/jpeg',
      fileName: file.fileName ?? 'avatar.jpg',
    });
  }
};


  const uploadImageToServer = async (file: {
    uri: string;
    type?: string;
    fileName?: string | null;
  }) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName ?? 'avatar.jpg',
    } as any); // <- 👈 Aqui está o fix do TypeScript

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (data?.url) {
        setProfileImageUrl(data.url);
      } else {
        Alert.alert('Erro', 'Servidor não retornou a URL da imagem.');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      Alert.alert('Erro', 'Não foi possível enviar a imagem.');
    }
  };

  return (
    <View className="flex-1 bg-white p-6 items-center">
      {/* Avatar */}
      <TouchableOpacity onPress={() => pickImage(false)}>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 20 }}
          />
        ) : (
          <View className="bg-blue-100 p-6 rounded-full mb-6">
            <Ionicons name="person" size={80} color="#2563eb" />
          </View>
        )}
      </TouchableOpacity>

      {/* Botões de galeria e câmera */}
      <View className="flex-row space-x-4 mb-6">
        <Button title="Galeria" onPress={() => pickImage(false)} />
        <Button title="Câmera" onPress={() => pickImage(true)} />
      </View>

      {/* Informações do Usuário */}
      <Text className="text-2xl font-bold text-gray-800 mb-1">
        {user?.nome} {user?.sobrenome}
      </Text>
      <Text className="text-gray-500 text-lg mb-8">{user?.email}</Text>

      {/* Estatísticas */}
      <View className="flex-row justify-around w-full mb-10">
        <View className="items-center">
          <Text className="text-xl font-bold text-blue-600">0</Text>
          <Text className="text-gray-500">Avaliações</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-blue-600">0</Text>
          <Text className="text-gray-500">Favoritos</Text>
        </View>
      </View>

      {/* Botão de Logout */}
      <TouchableOpacity
        className="bg-red-50 w-full py-4 rounded-xl flex-row justify-center items-center border border-red-100"
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text className="text-red-500 font-bold ml-2 text-lg">Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaUsuario;
