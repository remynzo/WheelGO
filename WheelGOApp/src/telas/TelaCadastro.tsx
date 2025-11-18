// WheelGOApp/src/telas/TelaCadastro.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator'; // Importa os tipos corretos
import API_URL from '../apiConfig'; // Importa a URL da API

// Define as props da tela usando a lista de rotas que criamos
type Props = NativeStackScreenProps<AuthStackParamList, 'TelaCadastro'>;

const TelaCadastro = ({ navigation }: Props) => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = async () => {
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não são iguais!');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nome,
          sobrenome: sobrenome,
          email: email,
          senha: senha,
          telefone: telefone,
          user: user,
        }),
      });
      const data = await response.json();

      if (response.ok){
        Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
        // Redireciona para o login após cadastro
        navigation.navigate('TelaLogin');
      } else {
        Alert.alert('Erro no registro', data.message || 'Algo deu errado.');
      }

    } catch (error) {
      console.error('Erro na rede:', error);
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-8">
        <Text className="text-3xl font-bold text-gray-800 mb-8">Crie sua conta</Text>

        {/* Campo de Nome */}
        <Text className="text-base text-gray-500 mb-2">Nome</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
          placeholder="Seu primeiro nome"
          placeholderTextColor="#9CA3AF"
          value={nome}
          onChangeText={setNome}
        />

        {/* Campo de Sobrenome */}
        <Text className="text-base text-gray-500 mb-2">Sobrenome</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
          placeholder="Seu sobrenome"
          placeholderTextColor="#9CA3AF"
          value={sobrenome}
          onChangeText={setSobrenome}
        />


        {/* Campo de User */}
        <Text className="text-base text-gray-500 mb-2">Usuário</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
          placeholder="Seu nome de usuário"
          placeholderTextColor="#9CA3AF"
          value={user}
          onChangeText={setUser}
          autoCapitalize="none"
        />

        {/* Campo de E-mail */}
        <Text className="text-base text-gray-500 mb-2">E-mail</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
          placeholder="seu.email@exemplo.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        
        <Text className="text-base text-gray-500 mb-2">Telefone</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
          placeholder="(XX) 00000 0000"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />

        {/* Campo de Senha */}
        <Text className="text-base text-gray-500 mb-2">Senha</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
          placeholder="Crie uma senha forte"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {/* Campo de Confirmar Senha */}
        <Text className="text-base text-gray-500 mb-2">Confirmar senha</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-8"
          placeholder="Repita sua senha"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        {/* Botão de Concluir */}
        <TouchableOpacity
          className="bg-blue-600 w-full py-4 rounded-lg"
          onPress={handleCadastro}
        >
          <Text className="text-white text-center font-bold text-lg">
            Concluir
          </Text>
        </TouchableOpacity>

        {/* Botão para navegar para o login */}
        <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Já tem uma conta? </Text>
            {/* Corrigido para navegar para 'TelaLogin' */}
            <TouchableOpacity onPress={() => navigation.navigate('TelaLogin')}>
                <Text className="text-blue-600 font-bold">Faça login</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaCadastro;