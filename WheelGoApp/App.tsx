import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import AuthProvider from './src/context/AuthContext';

function App(): React.JSX.Element {

  return (
  <AuthProvider>
    <AppNavigator />
  </AuthProvider>
  );
}

export default App;
