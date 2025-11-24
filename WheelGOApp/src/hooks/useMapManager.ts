import { useState, useEffect, useRef } from 'react';
import { Alert, Keyboard } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
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

const IMPORTANT_KEYWORDS = ["Federzoni", "McDonald's", "Bella Sushi", "Supermercado"];
const ZOOM_THRESHOLD = 0.05; // Se o zoom for maior que isso (longe), não busca

export const useMapManager = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('all');
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const regionDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const mapViewRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, Marker | null>>({});

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

  // Lógica de Viewport: Monitora o movimento do mapa
  const onRegionChangeComplete = (region: Region) => {
    if (regionDebounceRef.current) clearTimeout(regionDebounceRef.current);

    regionDebounceRef.current = setTimeout(() => {
      // Se estiver muito longe (Zoom Out), limpa e avisa
      if (region.latitudeDelta > ZOOM_THRESHOLD) {
        setIsZoomedOut(true);
        setPlaces([]); 
        return;
      }
      setIsZoomedOut(false);

      // Calcula o raio baseado na tela (metade da altura em metros)
      const radius = Math.ceil((region.latitudeDelta * 111320) / 2);
      
      fetchNearbyPlaces(region.latitude, region.longitude, radius, categoriaAtiva);
    }, 800);
  };

  const fetchNearbyPlaces = async (lat: number, lng: number, radius: number, type: string) => {
    setLoadingPlaces(true);
    try {
      const allResults: Record<string, Place> = {};
      const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;

      if (type === 'all') {
          const promises = [
              fetch(`${baseUrl}&type=restaurant`).then(res => res.json()),
              fetch(`${baseUrl}&type=supermarket`).then(res => res.json()),
              fetch(`${baseUrl}&type=hospital`).then(res => res.json()),
              fetch(`${baseUrl}&type=store`).then(res => res.json())
          ];
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

  const mapGoogleResToPlace = (res: any): Place => ({
      place_id: res.place_id,
      name: res.name,
      vicinity: res.vicinity || res.formatted_address,
      geometry: { location: { lat: res.geometry.location.lat, lng: res.geometry.location.lng } }
  });

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

  const fetchPlaceDetailsAndGo = async (placeId: string) => {
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

  const recenterMap = () => {
      if (location && mapViewRef.current) {
          const region = {
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
          };
          mapViewRef.current.animateToRegion(region);
          // Busca manual imediata
          fetchNearbyPlaces(region.latitude, region.longitude, 1000, categoriaAtiva);
      }
  };

  return {
    location, places, loading, loadingPlaces, isZoomedOut,
    categoriaAtiva, setCategoriaAtiva,
    mapViewRef, recenterMap, markerRefs,
    query, onChangeQuery, suggestions, showSuggestions, setShowSuggestions,
    onSelectSuggestion: fetchPlaceDetailsAndGo,
    onRegionChangeComplete 
  };
};