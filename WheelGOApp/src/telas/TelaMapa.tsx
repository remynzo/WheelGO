import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps'; // Usando o provedor padrão (Google)

const localizacaoFixa = {
  latitude: -23.3635,
  longitude: -46.7431,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={localizacaoFixa}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
