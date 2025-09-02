import { Stack } from "expo-router";
import React from "react";

const ProtectedLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="(pages)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default ProtectedLayout;
