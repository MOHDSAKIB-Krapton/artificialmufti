import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const RootScreen = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <ActivityIndicator size={"large"} color={"white"} />
    </View>
  );
};

export default RootScreen;
