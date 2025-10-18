import { ActivityIndicator, View } from "react-native";

export default function AuthCallback() {
  return (
    <View className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <ActivityIndicator size={"large"} color={"white"} />
    </View>
  );
}
