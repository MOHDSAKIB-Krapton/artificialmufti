import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const ProgressBar = ({
  trackColor,
  fillColor,
  pct,
}: {
  trackColor: string;
  fillColor: string;
  pct: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(100, pct)),
      duration: 500, // animation duration in ms
      useNativeDriver: false, // layout animation needs this disabled
    }).start();
  }, [pct, anim]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      className="h-[6px] rounded-full overflow-hidden"
      style={{ backgroundColor: trackColor }}
    >
      <Animated.View
        className="h-full"
        style={{
          width: widthInterpolated,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
};

export default ProgressBar;
