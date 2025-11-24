import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { useMapManager, Place } from '../hooks/useMapManager'; 
import MapHeader from '../components/MapHeader';
import CustomMarker from '../components/CustomMarker'; // Importando o marcador separado
import hidePOI from '../mapStyles/hidePOI';
import { useTheme } from '../context/ThemeContext';

const mapStyleDark = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

type TelaMapaProps = NativeStackScreenProps<AppStackParamList, 'TelaMapa'>;

const TelaMapa = ({ navigation }: TelaMapaProps) => {
  const map = useMapManager();
  const { isDark } = useTheme();

  const handleMarkerPress = (place: any) => {
    navigation.navigate('TelaDetalhesLugar', {
      placeId: place.place_id,
      nomeLugar: place.name,
      endereco: place.vicinity ?? '',
      localizacao: place.geometry.location,
    });
  };

  const handleOpenRanking = (catId: string) => {
    if (!map.location) return;
    const nomesCategorias: Record<string, string> = {
        'all': 'Todos', 'restaurant': 'Comida', 'supermarket': 'Mercados',
        'hotel': 'Hotéis', 'hospital': 'Saúde', 'store': 'Lojas',
        'bank': 'Bancos', 'park': 'Lazer'
    };
    navigation.navigate('TelaRanking', {
        categoriaId: catId,
        categoriaNome: nomesCategorias[catId] || 'Locais',
        userLocation: { lat: map.location.latitude, lng: map.location.longitude }
    });
  };

  const getIconForPlace = (place: Place) => {
    const name = (place.name ?? '').toLowerCase();
    const vicinity = (place.vicinity ?? '').toLowerCase();
    const mercadoRegex = /\b(supermercad|supermercado|mercado|merceari|grocery|supermarket|atacadista|assai|carrefour|federzoni)\b/i;
    const padariaRegex = /\b(padaria|pão|panificadora|bakery)\b/i;
    const farmaciaRegex = /\b(farmácia|farmacia|drogaria|pharmacy)\b/i;

    if (mercadoRegex.test(name) || mercadoRegex.test(vicinity)) return { name: 'shopping-basket', color: '#059669' }; 
    if (padariaRegex.test(name)) return { name: 'bread-slice', color: '#A16207' };
    if (farmaciaRegex.test(name)) return { name: 'prescription-bottle-alt', color: '#0EA5E9' };
    if (/pizz|sushi|hamburg|burger|kebab|churras|mac|mc|king/i.test(name)) return { name: 'utensils', color: '#EF4444' };

    return { name: 'map-marker-alt', color: '#8B5CF6' };
  };

  if (map.loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#2563eb"} />
        <Text className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <MapHeader 
        navigation={navigation}
        onCategoryPress={handleOpenRanking}
        query={map.query}
        onChangeQuery={map.onChangeQuery}
        showSuggestions={map.showSuggestions}
        suggestions={map.suggestions}
        onSelectSuggestion={map.onSelectSuggestion}
        setShowSuggestions={map.setShowSuggestions}
      />

      <MapView
        ref={map.mapViewRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={isDark ? mapStyleDark : hidePOI}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={map.location ? {
            latitude: map.location.latitude,
            longitude: map.location.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        } : undefined}
        // Conectando o evento de Viewport para carregar só o que está na tela
        onRegionChangeComplete={map.onRegionChangeComplete}
      >
        {map.places.map((place, idx) => {
          const icon = getIconForPlace(place);
          const iconName = typeof icon.name === 'string' ? icon.name : 'map-marker-alt';

          return (
            <CustomMarker
              key={place.place_id ?? idx}
              place={place}
              icon={icon}
              iconName={iconName}
              onPress={handleMarkerPress}
            />
          );
        })}
      </MapView>

      {/* Feedback Visual (Com NativeWind) */}
      {map.loadingPlaces && (
        <View className="absolute top-48 self-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md flex-row items-center z-40">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="ml-2 text-blue-600 dark:text-blue-400 text-xs font-bold">Buscando na área...</Text>
        </View>
      )}
      
      {map.isZoomedOut && (
        <View className="absolute top-48 self-center bg-gray-800/90 px-4 py-2 rounded-full shadow-md z-40">
            <Text className="text-white font-bold text-xs">Aproxime para ver locais</Text>
        </View>
      )}

      <TouchableOpacity 
        className="absolute bottom-8 right-6 bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg items-center justify-center active:bg-gray-100 dark:active:bg-gray-700"
        onPress={map.recenterMap}
      >
        <MaterialIcons name="my-location" size={28} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );
};

export default TelaMapa;