import React from "react";
import { StatusBar } from "expo-status-bar";
import "./global.css"; // <--- ESTA LINHA É OBRIGATÓRIA PARA O NATIVEWIND
import AuthProvider from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}