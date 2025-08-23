import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/AppNavigator'; // CORREÇÃO: Caminho do import
import API_BASE_URL from '../apiConfig';

const TelaCadastro = () => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const navigation = useNavigation<NavigationProps>();

  const handleCadastro = async () => {
    if (senha !== confirmarSenha) {
      console.log('As senhas não são iguais!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
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
        console.log('Utilizador registrado com sucesso!', data);
      } else {
        console.log('Erro no registro:', data.message);
      }

    } catch (error) {
      console.error('Erro na rede:', error);
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


        {/* Campo de Sobrenome */}
        <Text className="text-base text-gray-500 mb-2">User</Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg p-4 w-full mb-6"
          placeholder="Seu sobrenome"
          placeholderTextColor="#9CA3AF"
          value={user}
          onChangeText={setUser}
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
          keyboardType="numeric"
          value={telefone}
          onChangeText={setTelefone}
          autoCapitalize="none"
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
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-blue-600 font-bold">Faça login</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaCadastro;
