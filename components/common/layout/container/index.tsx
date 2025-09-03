import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const LayoutContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <LinearGradient
      colors={["#1a1a1a", "#6B7A5A", "#C29B61"]}
      className="flex-1 "
    >
      <SafeAreaView className="flex-1 px-6">{children}</SafeAreaView>
    </LinearGradient>
  );
};

export default LayoutContainer;
