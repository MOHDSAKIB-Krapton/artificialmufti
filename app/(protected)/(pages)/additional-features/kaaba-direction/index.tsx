import Container from "@/components/common/container";
import { useUserLocation } from "@/hooks/permissions/useLocation";
import { useHeading } from "@/hooks/prayers/useHeadings";
import { useTheme } from "@/hooks/useTheme";
import { Qibla } from "adhan";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function BasicCompass() {
  const { theme } = useTheme();
  const { location } = useUserLocation();
  const { subscribe } = useHeading({ hz: 30, deadbandDeg: 1 });
  const rotation = useSharedValue(0);
  const [heading, setHeading] = useState("0");

  const qiblaDirection = Qibla({
    latitude: location?.lat!,
    longitude: location?.lng!,
  });

  useEffect(() => {
    const unsub = subscribe((deg: number) => {
      // rotation.value = withSpring(-deg, {
      //   damping: 15,
      //   stiffness: 500,
      // });
      rotation.value = withTiming(-deg, {
        duration: 120,
        easing: Easing.out(Easing.quad), // smooth curve
      });
      const normalized = (deg + 360) % 360;
      setHeading(String(Math.round(normalized)));
    });
    return unsub;
  }, []);

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Container>
      <View className="flex-1 items-center justify-evenly gap-y-8">
        <View className="relative items-center">
          {/* Dial with animated rotation */}
          <Animated.View style={[dialStyle]}>
            <CompassDial kaabaBearing={qiblaDirection} />
          </Animated.View>

          {/* Static pointer indicator */}
          <View className="absolute top-[2%] items-center z-20">
            <View className="w-[2px] h-6 bg-[#D33C3C]" />
          </View>
        </View>

        {/* Heading readout */}
        <View>
          <Text
            className="text-5xl font-light text-center"
            style={{ color: theme.text }}
          >
            {heading}°
          </Text>
        </View>

        <View className="flex-row items-center justify-between w-full">
          <Text
            className="text-2xl font-light text-center"
            style={{ color: theme.text }}
          >
            {location?.lat} LAT
          </Text>
          <Text
            className="text-2xl font-light text-center"
            style={{ color: theme.text }}
          >
            {location?.lng} LNG
          </Text>
        </View>
      </View>
    </Container>
  );
}

import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

const size = 300;
const center = size / 2;
const radius = size * 0.45;

const majorTickInterval = 30;
const minorTickInterval = 2;

function CompassDial({ kaabaBearing }: { kaabaBearing: number }) {
  const { theme } = useTheme();

  const ticks = Array.from({ length: 360 / minorTickInterval }, (_, i) => ({
    deg: i * minorTickInterval,
  }));

  return (
    <View>
      <Svg width={size} height={size}>
        {/* Outer circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.text}
          strokeWidth={2}
          fill="none"
        />

        {kaabaBearing != null && <KaabaMarker bearing={kaabaBearing} />}

        {/* Tick marks */}
        {ticks.map(({ deg }, idx) => {
          const isMajor = deg % majorTickInterval === 0;
          const length = isMajor ? 14 : 6;
          const stroke = isMajor ? theme.text : theme.textSecondary;
          const angleRad = (deg * Math.PI) / 180;
          const x1 = center + Math.sin(angleRad) * (radius - length);
          const y1 = center - Math.cos(angleRad) * (radius - length);
          const x2 = center + Math.sin(angleRad) * radius;
          const y2 = center - Math.cos(angleRad) * radius;

          return (
            <Line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}

        {/* Cardinal Directions */}
        {["N", "E", "S", "W"].map((txt, i) => {
          const deg = i * 90;
          const angleRad = (deg * Math.PI) / 180;
          const x = center + Math.sin(angleRad) * (radius - 30);
          const y = center - Math.cos(angleRad) * (radius - 30);
          return (
            <SvgText
              key={i}
              x={x}
              y={y + 6}
              fontSize={22}
              fontWeight="bold"
              fill={txt === "N" ? "#D33C3C" : "#A9B4C9"}
              textAnchor="middle"
            >
              {txt}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

function KaabaMarker({ bearing }: { bearing: number }) {
  const angleRad = (bearing * Math.PI) / 180;
  const markerRadius = radius - 70; // Position inside the tick marks
  const x = center + Math.sin(angleRad) * markerRadius;
  const y = center - Math.cos(angleRad) * markerRadius;

  return (
    <SvgText
      x={x}
      y={y + 6}
      fontSize={18}
      fontWeight="bold"
      rotate={-90}
      fill="#FFD700" // gold color
      textAnchor="middle"
    >
      🕋
    </SvgText>
  );
}
