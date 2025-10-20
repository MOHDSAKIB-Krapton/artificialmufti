import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializing = useAuthStore((s) => s.initializing);
  const session = useAuthStore((s) => s.session);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initializing) return;

    if (session) {
      router.replace("/(protected)/(drawer)");
    } else {
      router.replace("/onboarding");
    }
  }, [session, initializing]);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return <>{children}</>;
}
