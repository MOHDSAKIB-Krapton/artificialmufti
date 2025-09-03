import SVGDiscord from "@/assets/svg/discord";
import SVGGoogle from "@/assets/svg/google";
import FancyButton from "@/components/common/button";
import LayoutContainer from "@/components/common/layout/container";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

const Auth = () => {
  const [provider, setProvider] = useState("");

  const continueWithOAuth = (provider: string) => {
    setProvider(provider);

    setTimeout(() => {
      setProvider("");
      router.push("/(protected)/(drawer)");
    }, 1000);
  };

  return (
    <LayoutContainer>
      <View className="flex-1 justify-between items-center">
        <View className="flex-1 items-center justify-center w-full">
          <View className="mb-10 items-center">
            <Image
              source={require("../../assets/images/react-logo.png")}
              className="w-24 h-24 mb-6"
              style={{ tintColor: "#ffffff" }}
            />
            <Text className="text-4xl font-extrabold text-black tracking-wide">
              Artificial Mufti
            </Text>
          </View>

          {/* Tagline */}
          <Text className="text-base text-black text-center leading-6 mb-12 px-6">
            Unlock knowledge and guidance through intelligent, authentic, and
            reliable insights.
          </Text>

          <View className="gap-y-4 w-full">
            <FancyButton
              onPress={() => continueWithOAuth("google")}
              text="Continue with Google"
              SvgIcon={<SVGGoogle width={22} height={22} />}
              loading={provider === "google"}
            />
            <FancyButton
              onPress={() => continueWithOAuth("discord")}
              text="Continue with Discord"
              SvgIcon={<SVGDiscord width={22} height={22} />}
              loading={provider === "discord"}
            />
          </View>
        </View>

        <Text className="text-xs text-black text-center leading-5">
          By continuing you agree to our{" "}
          <Text className="text-black font-semibold underline">Terms</Text> &{" "}
          <Text className="text-black font-semibold underline">
            Privacy Policy
          </Text>
        </Text>
      </View>
    </LayoutContainer>
  );
};

export default Auth;
