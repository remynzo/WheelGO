// WheelGOApp/src/telas/TelaLogin.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator'; // Importa os tipos corretos
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig'; // Importa com o nome padronizado

// Define as props da tela (agora ela sabe que faz parte da pilha AuthStack)
type Props = NativeStackScreenProps<AuthStackParamList, 'TelaLogin'>;

// Recebe 'navigation' diretamente via props
const TelaLogin = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      // Usa API_URL aqui
      const response = await fetch(`${API_URL}/api/users/login`, {
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
        // Login bem sucedido no Contexto
        await login(data.user, data.token);
        // O AppNavigator vai detectar a mudança de usuário e redirecionar pro Mapa automaticamente
        
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
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-4"
        placeholder="digite a sua senha"
        placeholderTextColor="#9CA3AF"
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
        {/* Corrigido para navegar para 'TelaCadastro' */}
        <TouchableOpacity onPress={() => navigation.navigate('TelaCadastro')}>
          <Text className="text-blue-600 font-bold">Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TelaLogin;