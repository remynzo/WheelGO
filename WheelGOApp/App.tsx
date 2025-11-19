import React from "react";
import { StatusBar } from "expo-status-bar";
import "./global.css"; 
import AuthProvider from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext"; // <--- IMPORTAR
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider> 
        <AppNavigator />
        {/* StatusBar se adapta automaticamente */}
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}