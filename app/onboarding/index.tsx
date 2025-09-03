import FancyButton from "@/components/common/button";
import LayoutContainer from "@/components/common/layout/container";
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
    title: "Your Intelligent Companion, Driven by Advanced AI Innovation",
    description:
      "Always ready to support you with daily hadith, providing smart and authentic solutions that simplify life and boost your Iman.",

    astronautImage: require("../../assets/images/aimufti.png"),
  };

  return (
    <LayoutContainer>
      <View className="flex-1 items-center">
        <View className="flex-1 justify-center items-center relative">
          <Text
            className="absolute text-6xl font-extrabold text-white opacity-10 top-[22%]"
            style={{ zIndex: -1 }}
          >
            Artificial Mufti
          </Text>

          <View className="mb-12 overflow-hidden w-56 h-56">
            <Image
              source={slide.astronautImage}
              className="w-full h-full object-contain"
            />
          </View>

          <Text className="text-black text-4xl font-extrabold text-center leading-tight">
            {slide.title}
          </Text>

          <Text className="text-black text-lg text-center leading-7">
            {slide.description}
          </Text>
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
