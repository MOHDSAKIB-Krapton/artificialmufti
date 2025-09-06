import FancyButton from "@/components/common/button";
import LayoutContainer from "@/components/common/layout/container";
import { APP_NAME } from "@/constants/index";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

const OnboardingScreen: React.FC = () => {
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
          <View className="relative justify-center items-center">
            {/* SHADOW EFFECT */}
            <View className="absolute -top-10 -z-10">
              <View className="relative">
                <Text className="text-6xl text-center text-black font-pixel">
                  {APP_NAME}
                </Text>
                <Text
                  className="absolute text-6xl text-center text-white opacity-50 -top-[5px] font-pixel"
                  style={{ zIndex: -1 }}
                >
                  {APP_NAME}
                </Text>
              </View>
            </View>

            <View className="mb-12 overflow-hidden w-56 h-56">
              <Image
                source={slide.artificialMufti}
                className="w-full h-full"
                resizeMode="contain"
              />

              {/* Shadow Stand for ROBOT  */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: 10,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  borderRadius: 10,
                }}
              />
            </View>
          </View>
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
        />
      </View>
    </LayoutContainer>
  );
};

export default OnboardingScreen;
