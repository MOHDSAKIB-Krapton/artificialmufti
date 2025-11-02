import React from "react";
import { ActivityIndicator, View } from "react-native";

const RootScreen = () => {
  return (
    <View className="flex flex-col items-center justify-center min-h-screen text-white">
      <ActivityIndicator size={"large"} />
    </View>
  );
};

export default RootScreen;
