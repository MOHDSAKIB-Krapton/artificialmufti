// import Container from "@/components/common/container";
// import { useUserLocation } from "@/hooks/permissions/useLocation";
// import { useTheme } from "@/hooks/useTheme";
// import { Magnetometer } from "expo-sensors";
// import React, { useEffect, useRef, useState } from "react";
// import { Text, View } from "react-native";

// // Main Compass Component (Parent)
// export default function BasicCompass() {
//   const [rotation, setRotation] = useState(0);
//   const { location } = useUserLocation();
//   const lastAngle = useRef<number | null>(null);

//   useEffect(() => {
//     // @ts-ignore
//     let subscription;
//     (async () => {
//       try {
//         subscription = Magnetometer.addListener((data) => {
//           const { x, y } = data;

//           // Calculate angle (always 0-360)
//           let angle = Math.atan2(y, x) * (180 / Math.PI);
//           if (angle < 0) {
//             angle += 360;
//           }

//           // First reading - initialize
//           if (lastAngle.current === null) {
//             lastAngle.current = angle;
//             setRotation(angle);
//             return;
//           }

//           // Calculate shortest difference
//           let delta = angle - lastAngle.current;

//           // Handle wrap-around
//           if (delta > 180) {
//             delta -= 360;
//           } else if (delta < -180) {
//             delta += 360;
//           }

//           // Add delta to continuous rotation
//           setRotation((prev) => prev + delta);
//           lastAngle.current = angle;
//         });
//       } catch (err) {
//         console.log("error", err);
//       }
//     })();

//     // @ts-ignore
//     return () => subscription && subscription.remove();
//   }, []);

//   return (
//     <CompassUI
//       heading={rotation}
//       // latitude={location?.lat}
//       // longitude={location?.lng}
//     />
//   );
// }

// type CompassUIProps = {
//   heading: number;
// };

// const CompassUI = ({ heading }: CompassUIProps) => {
//   const { theme } = useTheme();

//   const normalizedHeading = ((heading % 360) + 360) % 360;
//   const ticks = Array.from({ length: 180 }, (_, i) => i * 2); // 0°, 2°, 4° ... 358°

//   const majorTicks = ticks.filter((deg) => deg % 30 === 0);
//   const cardinalMap: Record<number, string> = {
//     0: "N",
//     90: "E",
//     180: "S",
//     270: "W",
//   };

//   return (
//     <Container>
//       <View className="justify-center items-center flex-1">
//         {/* Compass Container */}
//         <View className="relative w-80 h-80 mb-8 ">
//           {/* Static Top Pointer */}
//           <View className="absolute top-0 left-1/2 -translate-x-1/2 z-20 items-center">
//             <View className="w-0.5 h-6 bg-[#D33C3C]" />
//             <View className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-[#D33C3C] -mt-1" />
//           </View>

//           {/* Rotating Dial */}
//           <View
//             className="absolute inset-0"
//             style={{ transform: [{ rotate: `${-normalizedHeading}deg` }] }}
//           >
//             {/* 180 Tick Marks */}
//             {ticks.map((deg, index) => (
//               <View
//                 key={index}
//                 className="absolute top-0 left-1/2 origin-bottom"
//                 style={{
//                   height: "100%",
//                   transform: [
//                     { rotate: `${deg}deg` },
//                     { translateX: -1 }, // center thin line
//                   ],
//                 }}
//               >
//                 <View
//                   className={`w-px ${deg % 30 === 0 ? "h-5" : "h-2"}`}
//                   style={{
//                     backgroundColor:
//                       deg % 30 === 0 ? theme.text : theme.text + "80",
//                   }}
//                 />
//               </View>
//             ))}

//             {/* Major Degree Numbers */}
//             {majorTicks.map((deg, index) => (
//               <View
//                 key={index}
//                 className="absolute top-[48%] left-0 origin-center items-center"
//                 style={{
//                   width: "100%",
//                   transform: [{ rotate: `${deg}deg` }, { translateY: -110 }],
//                 }}
//               >
//                 <Text
//                   className="text-xs font-light"
//                   style={{
//                     color: theme.text,
//                     transform: [
//                       {
//                         rotate: `${-deg}deg`, // keep upright
//                       },
//                     ],
//                   }}
//                 >
//                   {deg % 90 != 0 && deg}
//                 </Text>
//               </View>
//             ))}

//             {/* Cardinal Directions */}
//             {Object.entries(cardinalMap).map(([deg, label]) => (
//               <View
//                 key={deg}
//                 className="absolute top-[46%] left-0 origin-center items-center"
//                 style={{
//                   width: "100%",
//                   transform: [{ rotate: `${deg}deg` }, { translateY: -100 }],
//                 }}
//               >
//                 <Text
//                   className={`${
//                     label === "N" ? "text-[#D33C3C]" : "text-[#A9B4C9]"
//                   } text-xl font-medium`}
//                   style={{
//                     transform: [
//                       {
//                         rotate: `${-Number(deg)}deg`,
//                       },
//                     ],
//                   }}
//                 >
//                   {label}
//                 </Text>
//               </View>
//             ))}

//             {/* Center Disc */}
//             <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#20242E]" />
//           </View>
//         </View>

//         {/* Heading Readout */}
//         <View className="text-center mb-4">
//           <Text className="text-5xl font-light" style={{ color: theme.text }}>
//             {normalizedHeading}°
//           </Text>
//         </View>
//       </View>
//     </Container>
//   );
// };

// screens/BasicCompass.tsx
import Container from "@/components/common/container";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect } from "react";

import { useHeading } from "@/hooks/prayers/useHeadings";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function BasicCompass() {
  const { theme } = useTheme();
  const { subscribe } = useHeading({ hz: 30, deadbandDeg: 0.5 });

  const rotation = useSharedValue(0);

  useEffect(() => {
    const unsub = subscribe((deg: number) => {
      rotation.value = withTiming(-deg, { duration: 90 });
    });
    return unsub;
  }, []);

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Container>
      <View className="flex-1 items-center justify-center">
        {/* Dial with animated rotation */}
        <Animated.View style={[dialStyle]}>
          <CompassDial />
        </Animated.View>

        {/* Static pointer indicator */}
        <View className="absolute top-[18%] items-center z-20">
          <View className="w-0.5 h-6 bg-[#D33C3C]" />
          <View className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#D33C3C] -mt-1" />
        </View>

        {/* Heading readout */}
        <View className="mt-8">
          <Text
            className="text-5xl font-light text-center"
            style={{ color: theme.text }}
          >
            {((rotation.value * -1 + 360) % 360).toFixed(0)}°
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

function CompassDial() {
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
          stroke="#5F6677"
          strokeWidth={2}
          fill="none"
        />

        {/* Tick marks */}
        {ticks.map(({ deg }, idx) => {
          const isMajor = deg % majorTickInterval === 0;
          const length = isMajor ? 14 : 6;
          const stroke = isMajor ? "#fff" : "#888";
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
