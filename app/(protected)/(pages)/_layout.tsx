import { useTheme } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import React from "react";

const PagesLayout = () => {
  const { theme } = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="settings/index"
        options={{
          headerShown: true,
          headerTitle: "Settings",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerTitleStyle: { fontFamily: "SpaceMonoBold" },
        }}
      />
    </Stack>
  );
};

export default PagesLayout;
