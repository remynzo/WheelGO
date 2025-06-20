

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TelaLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false); // Estado para controlar o loading

  const navigation = useNavigation<NavigationProps>();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://192.168.200.191:3001/api/users/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);

        Alert.alert('Sucesso!', 'Login realizado com sucesso!');
      } else {
        Alert.alert('Erro no Login', data.message || 'Não foi possível fazer o login.');
      }

    } catch (error) {
      setLoading(false);
      console.error('Erro de Conexão:', error);
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <View className="flex-1 justify-center bg-white p-8">
      <Text className="text-3xl font-bold text-gray-800 mb-8">
        Boas-vindas de volta!
      </Text>

      <TextInput
        className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
        placeholder="digite o seu e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-4"
        placeholder="digite a sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      
      <TouchableOpacity className="self-start mb-8">
        <Text className="text-blue-600 font-semibold">Esqueceu a sua senha?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="bg-blue-600 w-full py-4 rounded-lg flex-row justify-center items-center"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">
            Entrar
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-8">
        <Text className="text-gray-500">Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text className="text-blue-600 font-bold">Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TelaLogin;

