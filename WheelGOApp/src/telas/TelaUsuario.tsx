import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import API_URL from '../apiConfig';

const TelaUsuario = () => {
  const { user, logout, updateUser, token } = useAuth();
  const { isDark } = useTheme();
  
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user?.foto || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.foto) {
        setProfileImageUrl(user.foto);
    }
  }, [user]);

  const pickImage = async (fromCamera: boolean) => {
    try {
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permissão', 'Precisamos de acesso à câmera/galeria.');
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      };

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        await uploadImageToServer({
          uri: file.uri,
          type: 'image/jpeg',
          fileName: file.fileName || `avatar_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Erro no seletor:', error);
    }
  };

  const uploadImageToServer = async (file: { uri: string; type: string; fileName: string }) => {
    setLoading(true);
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
      const data = JSON.parse(textResponse);
        
      if (response.ok && data?.url) {
        const novaUrl = data.url;

        const updateResponse = await fetch(`${API_URL}/api/users/profile`, {
             method: 'PUT',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({ foto: novaUrl }) 
        });

        if (updateResponse.ok && user) {
            await updateUser({ ...user, foto: novaUrl });
            setProfileImageUrl(novaUrl);
            Alert.alert("Sucesso", "Foto de perfil salva!");
        } else {
            Alert.alert("Aviso", "Foto enviada, mas erro ao salvar no perfil.");
        }
      } else {
        Alert.alert('Erro', 'O servidor não devolveu a URL da imagem.');
      }
    } catch (err) {
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 p-6 items-center">
      
      {/* Avatar */}
      <View className="mb-6 relative">
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            className="w-32 h-32 rounded-full border-4 border-blue-500"
          />
        ) : (
          <View className="w-32 h-32 rounded-full bg-blue-100 dark:bg-gray-700 items-center justify-center border-4 border-white shadow-sm">
            <Ionicons name="person" size={80} color={isDark ? "#93c5fd" : "#2563eb"} />
          </View>
        )}
        
        {loading && (
            <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
                <ActivityIndicator color="white" />
            </View>
        )}

        <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white">
            <Ionicons name="camera" size={20} color="white" />
        </View>
      </View>

      {/* Botões */}
      <View className="flex-row space-x-4 mb-8 w-full justify-center px-4 gap-4">
        <TouchableOpacity 
            onPress={() => pickImage(true)}
            className="flex-1 bg-blue-600 py-3 rounded-xl flex-row justify-center items-center shadow-md"
        >
            <Ionicons name="camera-outline" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={() => pickImage(false)}
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 py-3 rounded-xl flex-row justify-center items-center shadow-sm"
        >
            <Ionicons name="images-outline" size={20} color={isDark ? "#93c5fd" : "#374151"} />
            <Text className="font-bold ml-2 text-gray-700 dark:text-gray-200">Galeria</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        {user?.nome} {user?.sobrenome}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-lg mb-10">{user?.email}</Text>

      <TouchableOpacity
        className="bg-red-50 dark:bg-red-900/30 w-full py-4 rounded-xl flex-row justify-center items-center border border-red-100 dark:border-red-800 mt-auto mb-4"
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text className="text-red-500 font-bold ml-2 text-lg">Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaUsuario;
