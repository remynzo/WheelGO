import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'TelaLogin'>;

// --- CORREÇÃO: O Componente Auxiliar agora está FORA da função principal ---
const InputField = ({ icon, placeholder, value, onChangeText, isPassword = false, keyboardType = 'default', showPassword, togglePassword }: any) => (
    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4">
        <Ionicons name={icon} size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput
            className="flex-1 text-gray-700 text-base"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isPassword && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize="none"
        />
        {isPassword && (
            <TouchableOpacity onPress={togglePassword}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
        )}
    </View>
);
// -----------------------------------------------------------------------

const TelaLogin = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Campos vazios', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        await login(data.user, data.token);
      } else {
        Alert.alert('Falha no Login', data.message || 'E-mail ou senha incorretos.');
      }

    } catch (error) {
      setLoading(false);
      console.error('Erro de Conexão:', error);
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
    }
  };

  const handleGoogleLogin = () => {
      Alert.alert("Google Login", "Funcionalidade em breve!");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        
        <View className="px-8 pt-12 pb-8">
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 self-start p-2 rounded-full mb-8">
                <Ionicons name="arrow-back" size={24} color="#4B5563" />
            </TouchableOpacity>

            <Text className="text-4xl font-extrabold text-gray-900 mb-2">Bem-vindo!</Text>
            <Text className="text-lg text-gray-500">Faça login para continuar sua jornada.</Text>
        </View>

        <View className="px-8 pb-8">
            
            <InputField 
                icon="mail-outline" 
                placeholder="Seu e-mail" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
            />
            
            <InputField 
                icon="lock-closed-outline" 
                placeholder="Sua senha" 
                value={senha} 
                onChangeText={setSenha} 
                isPassword={true}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
            />
            
            <TouchableOpacity className="self-end mb-8">
                <Text className="text-blue-600 font-semibold">Esqueceu a senha?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                className="bg-blue-600 w-full py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex-row justify-center items-center mb-8"
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                <ActivityIndicator color="#fff" />
                ) : (
                <Text className="text-white text-center font-bold text-xl">Entrar</Text>
                )}
            </TouchableOpacity>

             <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="mx-4 text-gray-400 font-medium">ou continue com</Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <TouchableOpacity 
                onPress={handleGoogleLogin}
                className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-2xl mb-8"
            >
                <FontAwesome5 name="google" size={20} color="#DB4437" />
                <Text className="ml-3 text-gray-700 font-bold text-base">Google</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-auto mb-4">
                <Text className="text-gray-500 text-base">Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('TelaCadastro')}>
                    <Text className="text-blue-600 font-bold text-base">Cadastre-se</Text>
                </TouchableOpacity>
            </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TelaLogin;