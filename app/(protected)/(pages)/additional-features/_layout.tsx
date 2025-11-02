import { useTheme } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import React from "react";

const FeaturesLayout = () => {
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
        name="index"
        options={{
          headerTitle: "Explore",
        }}
      />
      <Stack.Screen
        name="kaaba-direction/index"
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
        name="tasbeeh-counter/index"
        options={{
          headerTitle: "Counter",
        }}
      />
    </Stack>
  );
};

export default FeaturesLayout;
