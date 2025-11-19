import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Importe o Hook do Tema
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, 'TelaConfiguracoes'>;

const TelaConfiguracoes = ({ navigation }: Props) => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme(); // Pegando o controle do tema
  
  const [notificacoes, setNotificacoes] = useState(true);
  const [localizacao, setLocalizacao] = useState(true);

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: logout }
    ]);
  };

  const ConfigItem = ({ icon, label, onPress, hasSwitch, switchValue, onSwitchChange, isDestructive = false }: any) => (
    <TouchableOpacity 
        onPress={hasSwitch ? () => onSwitchChange(!switchValue) : onPress}
        activeOpacity={hasSwitch ? 1 : 0.7}

        className="flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700 shadow-sm"
    >
        <View className="flex-row items-center">

            <View className={`p-2 rounded-full mr-3 ${isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-gray-700'}`}>
                <Ionicons name={icon} size={20} color={isDestructive ? '#EF4444' : '#2563eb'} />
            </View>

            <Text className={`text-base font-medium ${isDestructive ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                {label}
            </Text>
        </View>

        {hasSwitch ? (
            <Switch 
                value={switchValue} 
                onValueChange={onSwitchChange}
                trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
                thumbColor={switchValue ? "#2563eb" : "#f4f3f4"}
            />
        ) : (
            !isDestructive && <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        )}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (

      <Text className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1 mt-4">
          {title}
      </Text>
  );

  return (

    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white dark:bg-gray-800 shadow-sm flex-row items-center mb-2">
         <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full mr-4">
             <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#374151"} />
         </TouchableOpacity>
         <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        
        <SectionTitle title="Preferências" />

        <ConfigItem 
            icon="moon-outline" 
            label="Modo Escuro" 
            hasSwitch 
            switchValue={isDark} 
            onSwitchChange={toggleTheme} 
        />

        <ConfigItem 
            icon="notifications-outline" 
            label="Notificações Push" 
            hasSwitch 
            switchValue={notificacoes} 
            onSwitchChange={setNotificacoes} 
        />
        <ConfigItem 
            icon="location-outline" 
            label="Localização Precisa" 
            hasSwitch 
            switchValue={localizacao} 
            onSwitchChange={setLocalizacao} 
        />

        <SectionTitle title="Conta" />
        <ConfigItem 
            icon="person-outline" 
            label="Editar Perfil" 
            onPress={() => navigation.navigate('TelaUsuario' as any)} 
        />
        
        <SectionTitle title="Sobre" />
        <ConfigItem 
            icon="document-text-outline" 
            label="Termos de Uso" 
            onPress={() => {}} 
        />
        <View className="flex-row justify-between items-center px-4 py-2">
            <Text className="text-gray-400 text-xs">Versão do App</Text>
            <Text className="text-gray-400 text-xs font-bold">1.0.0 (Beta)</Text>
        </View>

        <View className="mt-8 mb-10">
            <ConfigItem 
                icon="log-out-outline" 
                label="Sair da Conta" 
                onPress={handleLogout} 
                isDestructive 
            />
        </View>

      </ScrollView>
    </View>
  );
};

export default TelaConfiguracoes;