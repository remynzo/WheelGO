// WheelGOApp/src/telas/TelaMapa.tsx
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { useMapManager, Place } from '../hooks/useMapManager'; 
import MapHeader from '../components/MapHeader';
import CustomMarker from '../components/CustomMarker'; // <--- Importa o Marcador Isolado
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
      <View style={[styles.centered, isDark && { backgroundColor: '#111827' }]}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#2563eb"} />
        <Text style={{ marginTop: 12, color: isDark ? '#d1d5db' : '#374151' }}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111827' }]}>
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

      {map.loadingPlaces && (
        <View style={[styles.searchingBox, isDark && { backgroundColor: '#1f2937' }]}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={{ marginLeft: 8, color: isDark ? '#60a5fa' : '#2563eb', fontSize: 12, fontWeight: '700' }}>Buscando...</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.recenterBtn, isDark && { backgroundColor: '#1f2937' }]}
        onPress={map.recenterMap}
      >
        <MaterialIcons name="my-location" size={28} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
  searchingBox: {
    position: 'absolute',
    top: 48,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 40,
  },

  recenterBtn: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default TelaMapa;