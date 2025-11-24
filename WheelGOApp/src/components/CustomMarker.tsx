import React, { useState, useEffect } from 'react';
import { View, Dimensions, PixelRatio, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  place: any;
  icon: { name: string; color: string };
  iconName: string;
  onPress: (place: any) => void;
}

const calcMarkerProps = () => {
  const base = Math.max(30, Math.min(48, Math.round(SCREEN_WIDTH * 0.08)));
  const density = PixelRatio.get();
  const iconSize = Math.round(base * (Platform.OS === 'android' ? 1 : 1));
  const shadowPad = Math.max(2, Math.round(iconSize * 0.11));
  const totalHeight = iconSize + shadowPad * 2;
  const anchorY = Math.min(0.98, Math.max(0.5, 1 - (shadowPad / totalHeight)));
  const tracksTimeout = Math.min(1400, 300 + Math.round(density * 300));

  return { iconSize, shadowPad, anchorY, tracksTimeout };
};

const CustomMarker = ({ place, icon, iconName, onPress }: Props) => {
  const [tracks, setTracks] = useState(true);
  const { iconSize, shadowPad, anchorY, tracksTimeout } = calcMarkerProps();

  useEffect(() => {
    const t = setTimeout(() => setTracks(false), tracksTimeout);
    return () => clearTimeout(t);
  }, [place]);

  // Estilos dinâmicos (precisam ser inline pois dependem de cálculo matemático)
  const dynamicOuter = {
    padding: shadowPad,
    borderRadius: Math.ceil((iconSize + shadowPad * 2) / 2),
    overflow: 'visible' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const
  };

  const dynamicIcon = {
    width: iconSize,
    height: iconSize,
    borderRadius: iconSize / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: Math.max(0.8, Math.round(iconSize * 0.03)),
    borderColor: '#fff',
    backgroundColor: icon.color,
    // Sombras leves para o NativeWind não bugar o render nativo
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 0.6 },
    shadowRadius: Math.max(0.8, iconSize * 0.06),
    elevation: Math.min(5, Math.round(iconSize * 0.08))
  };

  return (
    <Marker
      coordinate={{
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      }}
      onPress={() => onPress(place)}
      anchor={{ x: 0.5, y: anchorY }} // A Mágica que impede o corte
      zIndex={1000}
      tracksViewChanges={tracks}
    >
      <View style={dynamicOuter}>
        <View style={dynamicIcon}>
          <FontAwesome5 name={iconName as any} size={Math.round(iconSize * 0.38)} color="#fff" />
        </View>
      </View>
    </Marker>
  );
};

export default CustomMarker;