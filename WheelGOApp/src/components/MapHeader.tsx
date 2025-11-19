// WheelGOApp/src/components/MapHeader.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text, Image, FlatList } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const CATEGORIAS = [
  { id: 'all', nome: 'Todos', icon: 'layer-group' },
  { id: 'restaurant', nome: 'Comida', icon: 'utensils' },
  { id: 'supermarket', nome: 'Mercados', icon: 'shopping-basket' },
  { id: 'hotel', nome: 'Hotéis', icon: 'bed' },
  { id: 'hospital', nome: 'Saúde', icon: 'briefcase-medical' },
  { id: 'store', nome: 'Lojas', icon: 'shopping-bag' },
  { id: 'bank', nome: 'Bancos', icon: 'money-bill-wave' },
  { id: 'park', nome: 'Lazer', icon: 'tree' },
];

interface Props {
  navigation: any;
  onCategoryPress: (catId: string) => void;
  query?: string;
  onChangeQuery?: (text: string) => void;
  showSuggestions?: boolean;
  suggestions?: any[];
  onSelectSuggestion?: (placeId: string, desc: string) => void;
  setShowSuggestions?: (show: boolean) => void;
}

const MapHeader = ({ 
    navigation, onCategoryPress, 
    query, onChangeQuery, showSuggestions, suggestions, onSelectSuggestion, setShowSuggestions 
}: Props) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
   
    <View 
      className="absolute top-6 left-5 right-5" 
      style={{ zIndex: 2000, elevation: 20 }} 
      pointerEvents="box-none" 
    >
      
      {/* Barra de Busca */}
      <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg shadow-black/20 border border-gray-100 dark:border-gray-700 relative">
        <TouchableOpacity className="p-2" onPress={() => navigation.navigate('TelaMenu')}>
            <Ionicons name="menu" size={24} color={isDark ? "#E5E7EB" : "#374151"} />
        </TouchableOpacity>
        
        <View className="flex-1 ml-2 justify-center">
            <TextInput 
                placeholder="Buscar local..." 
                className="text-base text-gray-700 dark:text-gray-100 font-medium py-0"
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={onChangeQuery}
                textAlignVertical="center"
                onFocus={() => { if(suggestions && suggestions.length > 0 && setShowSuggestions) setShowSuggestions(true); }}
            />
        </View>
        
        <TouchableOpacity 
            className="p-1 rounded-full"
            onPress={() => navigation.navigate('TelaUsuario')}
        >
            {user?.foto ? (
                <Image source={{ uri: user.foto }} className="w-9 h-9 rounded-full border-2 border-blue-600 dark:border-blue-400" />
            ) : (
                <View className="bg-blue-100 dark:bg-gray-700 p-2 rounded-full">
                    <Ionicons name="person" size={20} color={isDark ? "#60A5FA" : "#2563eb"} />
                </View>
            )}
        </TouchableOpacity>
      </View>

      {/* LISTA DE SUGESTÕES (Dropdown) */}
      {showSuggestions && suggestions && suggestions.length > 0 && onSelectSuggestion && (
        <View 
            className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-hidden mt-2"
            
            onStartShouldSetResponder={() => true}
            style={{ zIndex: 2001, elevation: 21 }} 
        >
            <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled" 
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        className="p-4 border-b border-gray-100 dark:border-gray-700 flex-row items-center active:bg-gray-50 dark:active:bg-gray-700"
                        onPress={() => onSelectSuggestion(item.place_id, item.description)}
                    >
                        <Ionicons name="location-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                {item.structured_formatting?.main_text || item.description}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                                {item.structured_formatting?.secondary_text || ''}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
      )}

      {/* Filtros de Categoria */}
      {(!showSuggestions || !suggestions || suggestions.length === 0) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ paddingRight: 20 }}>
            {CATEGORIAS.map((cat) => (
            <TouchableOpacity 
                key={cat.id}
                onPress={() => onCategoryPress(cat.id)} 
                className="flex-row items-center px-5 py-3 rounded-full mr-3 shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
                <FontAwesome5 
                    name={cat.icon as any} 
                    size={14} 
                    color={isDark ? "#E5E7EB" : "#4B5563"} 
                />
                <Text className="ml-2 font-bold text-gray-600 dark:text-gray-200">{cat.nome}</Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MapHeader;