import Container from "@/components/common/container";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const MapScreen: React.FC = () => {
  const { theme } = useTheme();
  const [region, setRegion] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(initialRegion);
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={{ color: theme.textSecondary, marginTop: 10 }}>
          Loading map...
        </Text>
      </SafeAreaView>
    );

  return (
    <Container>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold" style={{ color: theme.text }}>
          Nearby Map
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (region) setRegion({ ...region });
          }}
          className="p-2 rounded-full"
          style={{ backgroundColor: theme.card }}
        >
          <Ionicons name="refresh" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      {region ? (
        <MapView
          style={{ flex: 1, borderRadius: 20 }}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          showsUserLocation
          followsUserLocation
          showsMyLocationButton={false}
          customMapStyle={[
            {
              elementType: "geometry",
              stylers: [{ color: theme.background }],
            },
            {
              elementType: "labels.text.fill",
              stylers: [{ color: theme.text }],
            },
            {
              featureType: "water",
              stylers: [{ color: theme.card }],
            },
          ]}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              pinColor={theme.primary}
            />
          )}
        </MapView>
      ) : (
        <Text style={{ color: theme.textSecondary }}>
          Location not available
        </Text>
      )}
    </Container>
  );
};

export default MapScreen;
