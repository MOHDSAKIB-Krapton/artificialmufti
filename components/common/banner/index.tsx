import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Text, View } from "react-native";

const Banner = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.accent,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: theme.textLight,
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 0.5,
        }}
      >
        🎉 This app is 100% free — Enjoy unlimited use!
      </Text>
    </View>
  );
};

export default Banner;
