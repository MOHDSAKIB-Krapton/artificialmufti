// import Container from "@/components/common/container";
// import { useUserLocation } from "@/hooks/permissions/useLocation";
// import { useTheme } from "@/hooks/useTheme";
// import { Ionicons } from "@expo/vector-icons";
// import React, { useEffect, useState } from "react";
// import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import { SafeAreaView } from "react-native-safe-area-context";

// const MapScreen: React.FC = () => {
//   const { theme } = useTheme();
//   const { location, permission } = useUserLocation();

//   const [region, setRegion] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       if (permission === "granted") {
//         const initialRegion = {
//           latitude: location?.lat,
//           longitude: location?.lng,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         };
//         setRegion(initialRegion);
//         setLoading(false);
//       }
//       setLoading(false);
//       return;
//     })();
//   }, [permission]);

//   if (loading)
//     return (
//       <SafeAreaView
//         className="flex-1 items-center justify-center"
//         style={{ backgroundColor: theme.background }}
//       >
//         <ActivityIndicator color={theme.primary} size="large" />
//         <Text style={{ color: theme.textSecondary, marginTop: 10 }}>
//           Loading map...
//         </Text>
//       </SafeAreaView>
//     );

//   return (
//     <Container>
//       {/* Header */}
//       <View className="flex-row items-center justify-between mb-4">
//         <Text className="text-2xl font-bold" style={{ color: theme.text }}>
//           Nearby Map
//         </Text>
//         <TouchableOpacity
//           onPress={() => {
//             if (region) setRegion({ ...region });
//           }}
//           className="p-2 rounded-full"
//           style={{ backgroundColor: theme.card }}
//         >
//           <Ionicons name="refresh" size={22} color={theme.text} />
//         </TouchableOpacity>
//       </View>

//       {/* Map */}
//       {region ? (
//         <MapView
//           style={{ flex: 1, borderRadius: 20 }}
//           // provider={PROVIDER_GOOGLE}
//           initialRegion={region}
//           showsUserLocation
//           followsUserLocation
//           showsMyLocationButton={false}
//           customMapStyle={[
//             {
//               elementType: "geometry",
//               stylers: [{ color: theme.background }],
//             },
//             {
//               elementType: "labels.text.fill",
//               stylers: [{ color: theme.text }],
//             },
//             {
//               featureType: "water",
//               stylers: [{ color: theme.card }],
//             },
//           ]}
//         >
//           {location && (
//             <Marker
//               coordinate={{
//                 latitude: location.lat,
//                 longitude: location.lng,
//               }}
//               title="You are here"
//               pinColor={theme.primary}
//             />
//           )}
//         </MapView>
//       ) : (
//         <Text style={{ color: theme.textSecondary }}>
//           Location not available
//         </Text>
//       )}
//     </Container>
//   );
// };

// export default MapScreen;

import Container from "@/components/common/container";
import { useUserLocation } from "@/hooks/permissions/useLocation";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const MapScreen: React.FC = () => {
  const { theme } = useTheme();
  const { location, permission } = useUserLocation();
  const [region, setRegion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mosques, setMosques] = useState<any[]>([]);

  // Fetch nearby mosques using OpenStreetMap Nominatim API
  const fetchMosques = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=mosque&limit=30&lat=${lat}&lon=${lon}&radius=5000`
      );
      const data = await response.json();
      setMosques(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load nearby mosques");
    }
  };

  useEffect(() => {
    (async () => {
      if (permission === "granted" && location) {
        const initialRegion = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setRegion(initialRegion);
        await fetchMosques(location.lat, location.lng);
      }
      setLoading(false);
    })();
  }, [permission, location]);

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
          Nearby Mosques
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (region && location) fetchMosques(location.lat, location.lng);
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
          initialRegion={region}
          provider={"google"}
          showsUserLocation
          followsUserLocation
          showsMyLocationButton={false}
        >
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
          />

          {/* User marker */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.lat,
                longitude: location.lng,
              }}
              title="You are here"
              pinColor={theme.primary}
            />
          )}

          {/* Mosque markers */}
          {mosques.map((m, i) => (
            <Marker
              key={i}
              coordinate={{
                latitude: parseFloat(m.lat),
                longitude: parseFloat(m.lon),
              }}
              title={m.display_name.split(",")[0]}
              description={m.type}
              pinColor="#008000"
            />
          ))}
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
