import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import  AuthProvider  from './src/context/AuthContext'; // Corrigido para import nomeado
import 'react-native-gesture-handler';            
import './global.css'; // <-- O INTERRUPTOR QUE FALTAVA

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;