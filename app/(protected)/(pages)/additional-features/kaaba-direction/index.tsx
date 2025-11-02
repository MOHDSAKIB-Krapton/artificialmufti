import Container from "@/components/common/container";
import { useUserLocation } from "@/hooks/permissions/useLocation";
import { useTheme } from "@/hooks/useTheme";
import { Coordinates, Qibla } from "adhan";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const COMPASS_SIZE = Math.min(width * 0.8, 280);

export default function QiblaCompassCard() {
  const { theme } = useTheme();
  const { location } = useUserLocation();

  const [heading, setHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // get device heading
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      sub = await Location.watchHeadingAsync((data) => {
        setHeading(data.trueHeading || data.magHeading || 0);
      });
    })();

    return () => sub?.remove();
  }, []);

  // calculate Qibla bearing
  useEffect(() => {
    if (!location) return;
    const coords = new Coordinates(location.lat, location.lng);
    const bearing = Qibla(coords);
    setQiblaBearing(bearing);
  }, [location]);

  // animate compass rotation
  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: heading,
      useNativeDriver: true,
      friction: 7,
    }).start();
  }, [heading]);

  // relative angle from North to Kaaba
  const qiblaRelative = qiblaBearing ? (qiblaBearing - heading + 360) % 360 : 0;

  return (
    <Container>
      <View
        className="rounded-2xl border p-4 items-center"
        style={{
          borderColor: theme.accentLight,
          backgroundColor: theme.card,
        }}
      >
        <Text className="text-lg font-bold mb-4" style={{ color: theme.text }}>
          Qibla Compass
        </Text>

        <View
          style={{
            width: COMPASS_SIZE,
            height: COMPASS_SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Compass face image (rotate this) */}
          <Animated.Image
            source={require("@/assets/images/compass-niddle.png")} // use a circular compass image
            style={{
              width: COMPASS_SIZE,
              height: COMPASS_SIZE,
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
            resizeMode="contain"
          />

          {/* Fixed Qibla marker */}
          <View
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.primary,
              top: COMPASS_SIZE / 2 - 10,
              transform: [
                { rotate: `${qiblaRelative}deg` },
                { translateY: -COMPASS_SIZE / 2 + 15 },
              ],
            }}
          />
        </View>

        {location && qiblaBearing != null && (
          <Text
            className="text-xs mt-4 text-center"
            style={{ color: theme.textSecondary }}
          >
            Heading: {heading.toFixed(1)}° | Qibla: {qiblaBearing.toFixed(2)}°
          </Text>
        )}
      </View>
    </Container>
  );
}
