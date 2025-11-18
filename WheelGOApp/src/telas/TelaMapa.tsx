// WheelGOApp/src/telas/TelaMapa.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import hidePOI from '../mapStyles/hidePOI';

type TelaMapaProps = NativeStackScreenProps<AppStackParamList, 'TelaMapa'>;

interface Place {
  place_id: string;
  name: string;
  vicinity?: string;
  types?: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const CATEGORIAS = [
  { id: 'all', nome: 'Todos', icon: 'layer-group' },
  { id: 'restaurant', nome: 'Comida', icon: 'utensils' },
  { id: 'hotel', nome: 'Hotéis', icon: 'bed' },
  { id: 'hospital', nome: 'Saúde', icon: 'briefcase-medical' },
  { id: 'store', nome: 'Lojas', icon: 'shopping-bag' },
  { id: 'bank', nome: 'Bancos', icon: 'money-bill-wave' },
  { id: 'park', nome: 'Lazer', icon: 'tree' },
];

const IMPORTANT_KEYWORDS = ["Federzoni Supermercados", "McDonald's", "Bella Sushi"];

const TelaMapa = ({ navigation }: TelaMapaProps) => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('all');

  // Autocomplete / search
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const mapViewRef = useRef<MapView | null>(null);
  // refs para markers para poder abrir callout
  const markerRefs = useRef<Record<string, Marker | null>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos da sua localização.');
          setLoading(false);
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (e) {
        console.error('Erro ao obter localização', e);
        Alert.alert('Erro', 'Não foi possível obter sua localização.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (location) fetchNearbyPlaces(location.latitude, location.longitude, categoriaAtiva);
  }, [location, categoriaAtiva]);

  // ------------------------ ICON HEURISTICS (mantive versão robusta) ------------------------
  const getIconForPlace = (place: Place) => {
    const types = (place.types ?? []).map(t => String(t).toLowerCase());
    const name = (place.name ?? '').toLowerCase();

    const mercadoRegex = /\b(supermercad|supermercado|mercado|merceari|grocery|supermarket)\b/i;
    const padariaRegex = /\b(padaria|pão|panificadora|bakery)\b/i;
    const farmaciaRegex = /\b(farmácia|farmacia|drogaria|pharmacy)\b/i;

    if (mercadoRegex.test(place.name ?? '') || mercadoRegex.test(place.vicinity ?? '')) return { name: 'shopping-basket', color: '#059669' };
    if (padariaRegex.test(place.name ?? '') || padariaRegex.test(place.vicinity ?? '')) return { name: 'bread-slice', color: '#A16207' };
    if (farmaciaRegex.test(place.name ?? '') || farmaciaRegex.test(place.vicinity ?? '')) return { name: 'prescription-bottle-alt', color: '#0EA5E9' };

    if (types.includes('grocery_or_supermarket') || types.includes('supermarket') || types.includes('convenience_store')) return { name: 'shopping-basket', color: '#059669' };
    if (types.includes('bakery')) return { name: 'bread-slice', color: '#A16207' };
    if (types.includes('pharmacy') || types.includes('drugstore')) return { name: 'prescription-bottle-alt', color: '#0EA5E9' };
    if (types.includes('restaurant') || types.includes('food') || types.includes('food_establishment')) return { name: 'utensils', color: '#EF4444' };
    if (types.includes('cafe')) return { name: 'coffee', color: '#7C3AED' };
    if (types.includes('bar')) return { name: 'glass-cheers', color: '#7C3AED' };
    if (types.includes('store') || types.includes('department_store') || types.includes('shopping_mall')) return { name: 'shopping-bag', color: '#0EA5E9' };
    if (types.includes('hospital') || types.includes('health')) return { name: 'briefcase-medical', color: '#DC2626' };
    if (types.includes('bank') || types.includes('atm')) return { name: 'money-bill-wave', color: '#064E3B' };
    if (types.includes('park') || types.includes('tourist_attraction')) return { name: 'tree', color: '#16A34A' };
    if (types.includes('lodging') || types.includes('hotel')) return { name: 'bed', color: '#0F172A' };

    if (/pizz|sushi|hamburg|burger|kebab|churras/i.test(name)) return { name: 'utensils', color: '#EF4444' };
    if (/mercad|supermercad|mercear|grocery/i.test(name)) return { name: 'shopping-basket', color: '#059669' };
    if (/farmaci|drogari|pharmacy/i.test(name)) return { name: 'prescription-bottle-alt', color: '#0EA5E9' };

    return { name: 'map-marker-alt', color: '#8B5CF6' };
  };
  // ------------------------ fim heurística ------------------------

  // ------------------------ FETCH NEARBY + TEXTSEARCH (mantido) ------------------------
  const fetchNearbyPlaces = async (lat: number, lng: number, type: string) => {
    setLoadingPlaces(true);
    const radius = 3000;
    try {
      if (!GOOGLE_MAPS_API_KEY) {
        console.error('GOOGLE_MAPS_API_KEY não configurada.');
        setPlaces([]);
        setLoadingPlaces(false);
        return;
      }
      const baseNearby = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
      const nearbyUrl = type === 'all' ? baseNearby : `${baseNearby}&type=${encodeURIComponent(type)}`;

      const allResults: Record<string, Place> = {};

      // nearbysearch
      try {
        const r = await fetch(nearbyUrl);
        const j = await r.json();
        if (j.status === 'OK' && Array.isArray(j.results)) {
          j.results.forEach((res: any) => {
            if (!res.place_id || !res.geometry?.location) return;
            const pid = res.place_id;
            allResults[pid] = {
              place_id: pid,
              name: res.name,
              vicinity: res.vicinity,
              types: res.types ?? [],
              geometry: {
                location: {
                  lat: Number(res.geometry.location.lat),
                  lng: Number(res.geometry.location.lng),
                },
              },
            } as Place;
          });
        } else {
          console.warn('NearbySearch status:', j.status);
        }
      } catch (e) {
        console.error('Erro nearbysearch', e);
      }

      // textsearch por keywords importantes
      if (type === 'all') {
        for (const kw of IMPORTANT_KEYWORDS) {
          const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            kw
          )}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
          try {
            const rr = await fetch(textUrl);
            const jj = await rr.json();
            if (jj.status === 'OK' && Array.isArray(jj.results)) {
              jj.results.forEach((res: any) => {
                if (!res.place_id || !res.geometry?.location) return;
                const pid = res.place_id;
                allResults[pid] = {
                  place_id: pid,
                  name: res.name,
                  vicinity: res.formatted_address ?? res.vicinity,
                  types: res.types ?? [],
                  geometry: {
                    location: {
                      lat: Number(res.geometry.location.lat),
                      lng: Number(res.geometry.location.lng),
                    },
                  },
                } as Place;
              });
            } else {
              if (jj.status !== 'ZERO_RESULTS') console.warn('TextSearch status', jj.status, 'for', kw);
            }
          } catch (e) {
            console.error('Erro textsearch', kw, e);
          }
        }
      }

      const merged = Object.values(allResults).filter(p => {
        const latN = Number(p.geometry?.location?.lat);
        const lngN = Number(p.geometry?.location?.lng);
        return !Number.isNaN(latN) && !Number.isNaN(lngN);
      }) as Place[];

      setPlaces(merged);
    } catch (error) {
      console.error('Erro geral ao buscar lugares:', error);
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };
  // ------------------------ fim fetch ------------------------

  // ------------------------ AUTOCOMPLETE SUGGESTIONS ------------------------
  const fetchAutocomplete = async (text: string) => {
    if (!GOOGLE_MAPS_API_KEY) return;
    if (!location) return; // precisa da localização para location bias
    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const locBias = `${location.latitude},${location.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      text
    )}&location=${locBias}&radius=3000&key=${GOOGLE_MAPS_API_KEY}&types=establishment&language=pt-BR`;

    try {
      const r = await fetch(url);
      const j = await r.json();
      if (j.status === 'OK' && Array.isArray(j.predictions)) {
        setSuggestions(j.predictions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (e) {
      console.error('Erro autocomplete', e);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const onChangeQuery = (text: string) => {
    setQuery(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // debounce 300ms
    // @ts-ignore
    debounceRef.current = setTimeout(() => fetchAutocomplete(text), 300);
  };

  // Ao selecionar sugestão: busca detalhes, adiciona lugar e centraliza
  const fetchPlaceDetailsAndGo = async (placeId: string, description?: string) => {
    if (!GOOGLE_MAPS_API_KEY) return;
    const fields = 'name,geometry,formatted_address,types';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${encodeURIComponent(
      fields
    )}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;

    try {
      const r = await fetch(url);
      const j = await r.json();
      if (j.status === 'OK' && j.result) {
        const res = j.result;
        if (!res.geometry?.location) {
          Alert.alert('Erro', 'Não foi possível obter localização do lugar.');
          return;
        }
        const newPlace: Place = {
          place_id: placeId,
          name: res.name,
          vicinity: res.formatted_address ?? description,
          types: res.types ?? [],
          geometry: {
            location: {
              lat: Number(res.geometry.location.lat),
              lng: Number(res.geometry.location.lng),
            },
          },
        };

        // mescla no places (substitui se mesmo place_id)
        setPlaces(prev => {
          const map: Record<string, Place> = {};
          prev.forEach(p => (map[p.place_id] = p));
          map[newPlace.place_id] = newPlace;
          return Object.values(map);
        });

        // fecha sugestões e atualiza input
        setQuery(newPlace.name);
        setShowSuggestions(false);
        setSuggestions([]);

        // anima para região e abre callout
        const region: Region = {
          latitude: newPlace.geometry.location.lat,
          longitude: newPlace.geometry.location.lng,
          latitudeDelta: 0.007,
          longitudeDelta: 0.006,
        };
        mapViewRef.current?.animateToRegion(region, 500);

        // esperar o marker renderizar, então abrir callout
        setTimeout(() => {
          const marker = markerRefs.current[newPlace.place_id];
          try {
            marker?.showCallout?.();
          } catch (e) {
            // silent
          }
        }, 600);
      } else {
        Alert.alert('Erro', 'Detalhes não encontrados para o lugar selecionado.');
      }
    } catch (e) {
      console.error('Erro place details', e);
      Alert.alert('Erro', 'Falha ao buscar detalhes do lugar.');
    }
  };
  // ------------------------ fim autocomplete ------------------------

  const handleMarkerPress = (place: Place) => {
    navigation.navigate('TelaDetalhesLugar', {
      placeId: place.place_id,
      nomeLugar: place.name,
      endereco: place.vicinity ?? '',
      localizacao: place.geometry.location,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Preparando o mapa...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={ref => (mapViewRef.current = ref)}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={hidePOI}
        showsPointsOfInterest={false}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={
          location
            ? ({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              } as Region)
            : undefined
        }
      >
        {places.map((place, idx) => {
          const lat = Number(place.geometry?.location?.lat);
          const lng = Number(place.geometry?.location?.lng);
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

          const icon = getIconForPlace(place);
          const iconName = typeof icon.name === 'string' && icon.name.trim() !== '' ? icon.name.trim() : 'map-marker-alt';

          return (
            <Marker
              ref={ref => {
                if (ref && place.place_id) markerRefs.current[place.place_id] = ref;
              }}
              key={place.place_id ?? idx}
              coordinate={{ latitude: lat, longitude: lng }}
              title={place.name}
              description={place.vicinity}
              zIndex={1000}
              {...(Platform.OS === 'android' ? { elevation: 6 } : {})}
              onPress={() => handleMarkerPress(place)}
              onCalloutPress={() => handleMarkerPress(place)}
            >
              <View style={[styles.iconWrap, { backgroundColor: icon.color ?? '#8B5CF6' }]}>
                <FontAwesome5 name={iconName as any} size={14} color="#fff" solid />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* HEADER + SEARCH */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('TelaMenu')}>
            <Ionicons name="menu" size={24} color="#374151" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Buscar local..."
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={onChangeQuery}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                // não esconder imediatamente para permitir toque na sugestão
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />

            {/* SUGGESTIONS DROPDOWN */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestions}>
                <FlatList
                  data={suggestions}
                  keyExtractor={item => item.place_id ?? item.description ?? item.id ?? JSON.stringify(item)}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableWithoutFeedback
                      onPress={() => fetchPlaceDetailsAndGo(item.place_id, item.description ?? item.structured_formatting?.main_text)}
                    >
                      <View style={styles.suggestionItem}>
                        <Text style={{ fontWeight: '700' }}>{item.structured_formatting?.main_text || item.description}</Text>
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>{item.structured_formatting?.secondary_text ?? item.description}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#DBEAFE' }]} onPress={() => navigation.navigate('TelaUsuario')}>
            <Ionicons name="person" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingRight: 20 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoriaAtiva(cat.id)}
              style={[
                styles.categoryBtn,
                categoriaAtiva === cat.id ? styles.categoryActive : styles.categoryInactive,
              ]}
            >
              <FontAwesome5 name={cat.icon as any} size={14} color={categoriaAtiva === cat.id ? '#fff' : '#4B5563'} />
              <Text style={[styles.categoryText, categoriaAtiva === cat.id ? { color: '#fff' } : { color: '#4B5563' }]}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loadingPlaces && (
        <View style={styles.loadingPlaces}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={{ marginLeft: 8, color: '#2563eb', fontWeight: '500', fontSize: 12 }}>Buscando locais...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.locBtn}
        onPress={() => {
          if (location && mapViewRef.current) {
            mapViewRef.current.animateToRegion(
              {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              } as Region,
              350
            );
            fetchNearbyPlaces(location.latitude, location.longitude, categoriaAtiva);
          }
        }}
      >
        <MaterialIcons name="my-location" size={28} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  loadingText: { marginTop: 12, color: '#6B7280', fontWeight: '500' },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  headerContainer: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 50 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 999, padding: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#EEF2FF' },
  iconBtn: { padding: 6, borderRadius: 999 },
  input: { flex: 1, marginLeft: 8, fontSize: 16, color: '#111827', paddingVertical: 4 },
  suggestions: { position: 'absolute', top: 44, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 8, maxHeight: 220, borderWidth: 1, borderColor: '#E5E7EB', zIndex: 100, elevation: 6 },
  suggestionItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, marginRight: 12, borderWidth: 1 },
  categoryActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  categoryInactive: { backgroundColor: '#fff', borderColor: '#E5E7EB' },
  categoryText: { marginLeft: 8, fontWeight: '700' },
  loadingPlaces: { position: 'absolute', top: 180, alignSelf: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, flexDirection: 'row', alignItems: 'center', zIndex: 60, elevation: 6 },
  locBtn: { position: 'absolute', bottom: 24, right: 18, backgroundColor: '#fff', padding: 12, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 6 },
});

export default TelaMapa;
