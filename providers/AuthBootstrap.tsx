import { useAuthStore } from "@/store/auth.store";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializing = useAuthStore((s) => s.initializing);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }
  return <>{children}</>;
}
