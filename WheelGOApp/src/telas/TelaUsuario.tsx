import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const TelaUsuario = () => {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 bg-white p-6 items-center">
      {/* Avatar Grande */}
      <View className="bg-blue-100 p-6 rounded-full mb-6">
        <Ionicons name="person" size={80} color="#2563eb" />
      </View>

      {/* Informações do Usuário */}
      <Text className="text-2xl font-bold text-gray-800 mb-1">
        {user?.nome} {user?.sobrenome}
      </Text>
      <Text className="text-gray-500 text-lg mb-8">{user?.email}</Text>

      {/* Estatísticas (Visual apenas) */}
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