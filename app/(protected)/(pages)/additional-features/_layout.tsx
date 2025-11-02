import { useTheme } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import React from "react";

const FeaturesLayout = () => {
  const { theme } = useTheme();

  const FeaturesScreens = [
    {
      name: "index",
      title: "Explore",
    },
    {
      name: "kaaba-direction/index",
      title: "Kaaba Direction",
    },
    {
      name: "prayer-times/index",
      title: "Prayer Times",
    },
    {
      name: "tasbeeh-counter/index",
      title: "Counter",
    },
    {
      name: "zakaat-calculator/index",
      title: "Counter",
    },
    {
      name: "fiqh-cards/index",
      title: "Fiqh Cards",
    },
    {
      name: "hijri-gregorian/index",
      title: "Date Convertor",
    },
  ];
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
      {FeaturesScreens.map((screen, idx) => {
        return (
          <Stack.Screen
            key={idx}
            name={screen.name}
            options={{
              headerTitle: screen.title,
            }}
          />
        );
      })}
    </Stack>
  );
};

export default FeaturesLayout;
