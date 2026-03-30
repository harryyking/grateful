import React, { createContext, useContext, useState, useEffect } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { ATMOSPHERES, Atmosphere } from '@/app/themes';

export const storage = createMMKV();
const THEME_KEY = 'user-atmosphere-id';

interface ThemeContextType {
  atmosphere: Atmosphere;
  setAtmosphere: (atm: Atmosphere) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  atmosphere: ATMOSPHERES[0],
  setAtmosphere: () => {},
  isLoaded: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. Instant Synchronous Read from MMKV
  const savedId = storage.getString(THEME_KEY);
  const initialTheme = ATMOSPHERES.find(a => a.id === savedId) || ATMOSPHERES[0];

  const [atmosphere, _setAtmosphere] = useState<Atmosphere>(initialTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Component is mounted and theme is ready
    setIsLoaded(true);
  }, []);

  const setAtmosphere = (newAtm: Atmosphere) => {
    _setAtmosphere(newAtm);
    storage.set(THEME_KEY, newAtm.id); // Save to disk immediately
  };

  return (
    <ThemeContext.Provider value={{ atmosphere, setAtmosphere, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);