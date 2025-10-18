import SVGDiscord from "@/assets/svg/discord";
import SVGGoogle from "@/assets/svg/google";
import FancyButton from "@/components/common/button";
import LayoutContainer from "@/components/common/layout/container";
import MuftiWithText from "@/components/common/mufti";
import { useTheme } from "@/hooks/useTheme";
import { signInWithProvider } from "@/lib/oauth";
import React, { useState } from "react";
import { Text, View } from "react-native";

const Auth = () => {
  const { theme } = useTheme();
  const [provider, setProvider] = useState("");

  const continueWithOAuth = async (prov: "google" | "discord") => {
    try {
      setProvider(prov);
      await signInWithProvider(prov);
    } catch (e: any) {
      console.error("OAuth error:", e?.message || e);
    } finally {
      setProvider("");
    }
  };

  const artificialMufti = require("../../assets/images/aimufti3.png");

  return (
    <LayoutContainer>
      <View className="flex-1 justify-between items-center">
        <View className="flex-1 items-center justify-center w-full">
          <MuftiWithText text="Welcome Back!" imageSource={artificialMufti} />

          <View className="gap-y-4 w-full">
            <FancyButton
              onPress={() => continueWithOAuth("google")}
              text="Continue with Google"
              SvgIcon={<SVGGoogle width={22} height={22} />}
              loading={provider === "google"}
              buttonStyles={{ color: theme.text }}
            />
            <FancyButton
              onPress={() => continueWithOAuth("discord")}
              text="Continue with Discord"
              SvgIcon={<SVGDiscord width={22} height={22} />}
              loading={provider === "discord"}
              buttonStyles={{ color: theme.text }}
            />
          </View>
        </View>

        <Text className="text-xs text-black text-center font-space leading-5">
          By continuing you agree to our{" "}
          <Text className="text-black font-space-bolditalic underline">
            Terms
          </Text>{" "}
          &{" "}
          <Text className="text-black font-space-bolditalic underline">
            Privacy Policy
          </Text>
        </Text>
      </View>
    </LayoutContainer>
  );
};

export default Auth;
