import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

type MuftiWithTextProps = {
  text?: string;
  imageSource: ImageSourcePropType;
  showShadow?: boolean;
};

const MuftiWithText = ({
  text,
  imageSource,
  showShadow = true,
}: MuftiWithTextProps) => {
  return (
    <View className="relative justify-center items-center">
      {text && (
        <View className="absolute -top-10 -z-10">
          <View className="relative">
            <Text className="text-6xl text-center text-black font-pixel">
              {text}
            </Text>
            <Text
              className="absolute text-6xl text-center text-white opacity-50 -top-[5px] font-pixel"
              style={{ zIndex: -1 }}
            >
              {text}
            </Text>
          </View>
        </View>
      )}

      <View className="mb-12 overflow-hidden w-56 h-56">
        <Image
          source={imageSource}
          className="w-full h-full"
          resizeMode="contain"
        />

        {showShadow && (
          <View
            style={{
              position: "absolute",
              bottom: 3,
              width: "100%",
              height: 10,
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: 10,
            }}
          />
        )}
      </View>
    </View>
  );
};

export default MuftiWithText;
