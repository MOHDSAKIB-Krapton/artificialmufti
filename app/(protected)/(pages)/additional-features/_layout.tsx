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
    {
      name: "fasting-tracker/index",
      title: "Fasting Tracker",
    },
    {
      name: "daily-verse/index",
      title: "Daily Verse",
    },
    {
      name: "wudu-guide/index",
      title: "Wudu Guide",
    },
    {
      name: "halal-scanner/index",
      title: "Halal Scanner",
    },
    {
      name: "islamic-encyclopedia/index",
      title: "Islamic Encyclopedia",
    },
    {
      name: "islamic-names/index",
      title: "Islamic Names",
    },
    {
      name: "sadaqah-reminder/index",
      title: "Sadaqah Reminder",
    },
    {
      name: "shahada/index",
      title: "Shahada Screen",
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


        const isExplore = screen.name === "index";
        return (
          <Stack.Screen
            key={idx}
            name={screen.name}
            options={{
              headerTitle: screen.title,
              headerBackVisible: !isExplore, //
            }}
          />
        );
      })}
    </Stack>
  );
};

export default FeaturesLayout;
