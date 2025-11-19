// WheelGOApp/src/hooks/useMapManager.ts
import { useState, useEffect, useRef } from 'react';
import { Alert, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';

export interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// Palavras-chave para garantir que apareçam
const IMPORTANT_KEYWORDS = ["Federzoni", "Supermercado", "Shopping", "McDonald's", "Bella Sushi"];

export const useMapManager = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('all');
  
  // Busca Autocomplete
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const mapViewRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, Marker | null>>({});

  // 1. Localização
  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização.');
        setLoading(false);
        return;
      }
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
         Alert.alert('Erro', 'Não foi possível obter sua localização.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Buscar locais
  useEffect(() => {
    if (location) {
      fetchNearbyPlaces(location.latitude, location.longitude, categoriaAtiva);
    }
  }, [location, categoriaAtiva]);

  const fetchNearbyPlaces = async (lat: number, lng: number, type: string) => {
    setLoadingPlaces(true);
    const radius = 3000; 
    
    try {
      const allResults: Record<string, Place> = {};
      const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;

      if (type === 'all') {
          // Lógica Híbrida (Geral + Específicos + Keywords)
          const promises = [
              fetch(`${baseUrl}&type=restaurant`).then(res => res.json()),
              fetch(`${baseUrl}&type=supermarket`).then(res => res.json()),
              fetch(`${baseUrl}&type=hospital`).then(res => res.json()),
              fetch(`${baseUrl}&type=store`).then(res => res.json())
          ];

          // Busca por Keyword (Federzoni)
          const keywordPromises = IMPORTANT_KEYWORDS.map(kw => 
              fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(kw)}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`)
              .then(res => res.json())
          );

          const allResponses = await Promise.all([...promises, ...keywordPromises]);

          allResponses.forEach(json => {
              if (json.status === 'OK' && json.results) {
                  json.results.forEach((res: any) => {
                      if (res.place_id) allResults[res.place_id] = mapGoogleResToPlace(res);
                  });
              }
          });
      } else {
          // Busca Simples
          const response = await fetch(`${baseUrl}&type=${type}`);
          const json = await response.json();
          if (json.status === 'OK' && json.results) {
            json.results.forEach((res: any) => {
                if(res.place_id) allResults[res.place_id] = mapGoogleResToPlace(res);
            });
          }
      }
      setPlaces(Object.values(allResults));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Autocomplete
  const onChangeQuery = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!location) return;

    debounceRef.current = setTimeout(async () => {
      if (text.length < 2) {
          setSuggestions([]); setShowSuggestions(false); return;
      }
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&location=${location.latitude},${location.longitude}&radius=5000&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
      try {
          const r = await fetch(url);
          const j = await r.json();
          if (j.status === 'OK') {
              setSuggestions(j.predictions); setShowSuggestions(true);
          }
      } catch(e) {}
    }, 300);
  };

  // Selecionar Sugestão
  const onSelectSuggestion = async (placeId: string) => {
      Keyboard.dismiss();
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,formatted_address,types,vicinity&key=${GOOGLE_MAPS_API_KEY}`;
      try {
          const r = await fetch(url);
          const j = await r.json();
          if (j.status === 'OK' && j.result) {
              const res = j.result;
              const newPlace = mapGoogleResToPlace({ ...res, place_id: placeId });
              
              setPlaces(prev => [...prev.filter(p => p.place_id !== placeId), newPlace]);
              setQuery(newPlace.name);
              setShowSuggestions(false);
              
              mapViewRef.current?.animateToRegion({
                  latitude: newPlace.geometry.location.lat,
                  longitude: newPlace.geometry.location.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
              }, 1000);
          }
      } catch (e) { Alert.alert("Erro", "Falha ao carregar local."); }
  };

  const mapGoogleResToPlace = (res: any): Place => ({
      place_id: res.place_id,
      name: res.name,
      vicinity: res.vicinity || res.formatted_address,
      geometry: {
          location: {
              lat: res.geometry.location.lat,
              lng: res.geometry.location.lng
          }
      }
  });

  const recenterMap = () => {
      if (location && mapViewRef.current) {
          mapViewRef.current.animateToRegion({
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
          });
          fetchNearbyPlaces(location.latitude, location.longitude, categoriaAtiva);
      }
  };

  return {
    location, places, loading, loadingPlaces,
    categoriaAtiva, setCategoriaAtiva,
    mapViewRef, recenterMap, markerRefs,
    query, onChangeQuery, suggestions, showSuggestions, onSelectSuggestion, setShowSuggestions
  };
};