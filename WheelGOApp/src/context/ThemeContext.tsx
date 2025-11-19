import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

interface ThemeContextData {
  colorScheme: 'light' | 'dark';
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ao abrir o app, lê o tema salvo
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setColorScheme(savedTheme);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  if (!isReady) return null; // Evita piscar a tela na cor errada

  return (
    <ThemeContext.Provider 
      value={{ 
        colorScheme: colorScheme || 'light', 
        toggleTheme, 
        isDark: colorScheme === 'dark' 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}