import AuthBootstrap from "@/providers/AuthBootstrap";
import { useAuthStore } from "@/store/auth.store";
import { router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

function Gate({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
  const pathname = usePathname();

  useEffect(() => {
    if (initializing) return;
    const isPublic = !pathname.startsWith("/(protected)");
    console.log("Pathname => ", pathname);
    console.log("isPublic => ", isPublic);
    if (!session && !isPublic) {
      router.replace("/(auth)");
    } else if (session && isPublic) {
      router.replace("/(protected)/(drawer)");
    }
  }, [session, initializing, pathname]);

  return <>{children}</>;
}

const RootScreen = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthBootstrap>
      <Gate>
        <View className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
          <ActivityIndicator size={"large"} color={"white"} />
        </View>
      </Gate>
    </AuthBootstrap>
  );
};

export default RootScreen;
