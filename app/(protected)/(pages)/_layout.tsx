import { Stack } from "expo-router";
import React from "react";

const PagesLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="settings/index"
        options={{ headerShown: true, headerTitle: "Settings" }}
      />
    </Stack>
  );
};

export default PagesLayout;
