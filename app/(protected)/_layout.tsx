import { useTheme } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

const ProtectedLayout = () => {
  const { theme, themeKey } = useTheme();

  return (
    <>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="(pages)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar
        style={themeKey === "light" || themeKey === "fancy" ? "dark" : "light"}
      />
    </>
  );
};

export default ProtectedLayout;
