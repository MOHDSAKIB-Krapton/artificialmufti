import FancyButton from "@/components/common/button";
import LayoutContainer from "@/components/common/layout/container";
import MuftiWithText from "@/components/common/mufti";
import { APP_NAME } from "@/constants/index";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

const OnboardingScreen: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/(auth)");
    }, 1000);
  };

  const slide = {
    title: "Your Digital Scholar!!!",
    description:
      "جاهز دائمًا لمساندتك بحديث يومي، يقدم حلولًا ذكية وموثوقة تجعل حياتك أسهل وتقوي إيمانك.",

    artificialMufti: require("../../assets/images/aimufti.png"),
  };

  return (
    <LayoutContainer>
      <View className="flex-1 items-center">
        <View className="flex-1 justify-center gap-y-20">
          <MuftiWithText text={APP_NAME} imageSource={slide.artificialMufti} />

          <View className="gap-y-4">
            <Text
              className="text-black text-4xl text-center leading-tight"
              style={{ fontFamily: "PixelatedElegance" }}
            >
              {slide.title}
            </Text>

            <Text
              className="text-black text-lg text-center leading-7"
              style={{ fontFamily: "SpaceMono" }}
            >
              {slide.description}
            </Text>
          </View>
        </View>

        <FancyButton
          onPress={handleGetStarted}
          text="Get Started"
          iconName="arrow-forward"
          loading={loading}
          buttonStyles={{ color: theme.text }}
        />
      </View>
    </LayoutContainer>
  );
};

export default OnboardingScreen;
