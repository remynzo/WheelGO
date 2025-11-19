import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import API_URL from '../apiConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; 

type Props = NativeStackScreenProps<AuthStackParamList, 'TelaCadastro'>;

// --- CORREÇÃO: O Componente Auxiliar agora está FORA da função principal ---
// Isso impede que ele seja recriado a cada digitação
const InputField = ({ icon, placeholder, value, onChangeText, isPassword = false, keyboardType = 'default', togglePassword, showPassword }: any) => (
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
            autoCapitalize={isPassword || keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
        {isPassword && (
            <TouchableOpacity onPress={togglePassword}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
        )}
    </View>
);
// -----------------------------------------------------------------------

const TelaCadastro = ({ navigation }: Props) => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados individuais para mostrar senha (opcional, ou usa um geral)
  const [showPassword, setShowPassword] = useState(false);

  const handleCadastro = async () => {
    // 1. Validação de Campos Vazios
    if (!nome || !email || !senha || !user) {
        Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
        return;
    }

    // 2. Validação de Senha Forte
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$/;
    
    if (!passwordRegex.test(senha)) {
        Alert.alert(
            'Senha Fraca', 
            'Para sua segurança, a senha deve ter pelo menos:\n\n• 5 caracteres\n• 1 letra maiúscula\n• 1 letra minúscula\n• 1 número'
        );
        return;
    }

    // 3. Validação de Confirmação
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, sobrenome, email, senha, telefone, user }),
      });
      const data = await response.json();

      if (response.ok){
        Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.', [
            { text: 'OK', onPress: () => navigation.navigate('TelaLogin') }
        ]);
      } else {
        Alert.alert('Erro', data.message || 'Não foi possível criar a conta.');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Falha de conexão com o servidor.');
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
      Alert.alert("Google Login", "Funcionalidade em desenvolvimento para a versão 2.0!");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        
        <View className="px-6 pt-12 pb-6 bg-white">
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 self-start p-2 rounded-full mb-6">
                <Ionicons name="arrow-back" size={24} color="#4B5563" />
            </TouchableOpacity>
            
            <Text className="text-3xl font-bold text-gray-900">Crie sua conta</Text>
            <Text className="text-gray-500 text-base mt-1">Preencha os dados abaixo para começar.</Text>
        </View>

        <View className="px-6 pb-10">
            
            <Text className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Dados Pessoais</Text>
            <View className="flex-row gap-3">
                <View className="flex-1">
                    <InputField icon="person-outline" placeholder="Nome" value={nome} onChangeText={setNome} />
                </View>
                <View className="flex-1">
                    <InputField icon="person-outline" placeholder="Sobrenome" value={sobrenome} onChangeText={setSobrenome} />
                </View>
            </View>
            <InputField icon="at" placeholder="Nome de Usuário (@usuario)" value={user} onChangeText={setUser} />
            <InputField icon="call-outline" placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

            <Text className="text-sm font-bold text-gray-400 mb-3 mt-2 uppercase tracking-wider">Conta & Segurança</Text>
            <InputField icon="mail-outline" placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
            
            <InputField 
                icon="lock-closed-outline" 
                placeholder="Senha" 
                value={senha} 
                onChangeText={setSenha} 
                isPassword={true}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
            />
            
            <Text className="text-xs text-gray-400 mb-4 ml-1">Mínimo 5 caracteres, com letras (maiúscula/minúscula) e números.</Text>
            
            <InputField 
                icon="shield-checkmark-outline" 
                placeholder="Confirmar Senha" 
                value={confirmarSenha} 
                onChangeText={setConfirmarSenha} 
                isPassword={true}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
                className="bg-blue-600 w-full py-4 rounded-2xl shadow-lg shadow-blue-500/30 mt-4 mb-6"
                onPress={handleCadastro}
                disabled={loading}
            >
                <Text className="text-white text-center font-bold text-lg">
                    {loading ? 'Criando conta...' : 'Cadastrar'}
                </Text>
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

            <View className="flex-row justify-center mb-4">
                <Text className="text-gray-500">Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('TelaLogin')}>
                    <Text className="text-blue-600 font-bold">Faça Login</Text>
                </TouchableOpacity>
            </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TelaCadastro;