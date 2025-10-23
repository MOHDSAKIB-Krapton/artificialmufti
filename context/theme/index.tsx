import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { themes } from "./theme";

type ThemeKey = keyof typeof themes;

type ThemeContextType = {
  theme: typeof themes.dark; // active theme object
  themeKey: ThemeKey; // active theme name
  setThemeKey: (key: ThemeKey) => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>("fancy");

  // Load saved theme
  useEffect(() => {
    AsyncStorage.getItem("themeKey").then((saved) => {
      if (saved && saved in themes) {
        setThemeKey(saved as ThemeKey);
      }
    });
  }, []);

  // Persist theme choice
  useEffect(() => {
    AsyncStorage.setItem("themeKey", themeKey);
  }, [themeKey]);

  // Resolve theme (system → light/dark)
  const resolvedTheme =
    themeKey === "system"
      ? Appearance.getColorScheme() === "dark"
        ? themes.dark
        : themes.light
      : themes[themeKey];

  return (
    <ThemeContext.Provider
      value={{ theme: resolvedTheme, themeKey, setThemeKey }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
