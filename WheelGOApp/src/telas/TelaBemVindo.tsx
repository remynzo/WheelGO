import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'TelaBemVindo'>;

const TelaBemVindo = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WheelGO</Text>
      <Text style={styles.subtitle}>Acessibilidade para todos.</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('TelaLogin')}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonOutline]}
        onPress={() => navigation.navigate('TelaCadastro')}
      >
        <Text style={[styles.buttonText, styles.textOutline]}>Criar Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3b82f6', padding: 20 },
  title: { fontSize: 40, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#dbeafe', marginBottom: 40 },
  button: { backgroundColor: 'white', width: '100%', padding: 15, borderRadius: 30, marginBottom: 15, alignItems: 'center' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: 'white' },
  buttonText: { color: '#2563eb', fontWeight: 'bold', fontSize: 18 },
  textOutline: { color: 'white' }
});

export default TelaBemVindo;