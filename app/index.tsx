import React from "react";
import { ActivityIndicator, View } from "react-native";

const RootScreen = () => {
  return (
    <View className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <ActivityIndicator size={"large"} color={"white"} />
    </View>
  );
};

export default RootScreen;
