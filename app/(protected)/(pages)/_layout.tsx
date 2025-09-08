import { useTheme } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import React from "react";

const PagesLayout = () => {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        animation: "fade",
        animationDuration: 500,
        animationMatchesGesture: true,
        gestureEnabled: true,
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: { fontFamily: "SpaceMonoBold" },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen
        name="settings/index"
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="kaaba/index"
        options={{
          headerTitle: "Kaaba Direction",
        }}
      />
      <Stack.Screen
        name="prayer-times/index"
        options={{
          headerTitle: "Prayer Times",
        }}
      />
      <Stack.Screen
        name="donation/index"
        options={{
          headerTitle: "Support Us",
        }}
      />
      <Stack.Screen
        name="support/index"
        options={{
          headerTitle: "Customer Support",
        }}
      />
    </Stack>
  );
};

export default PagesLayout;
