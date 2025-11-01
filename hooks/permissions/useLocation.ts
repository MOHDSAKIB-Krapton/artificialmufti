import * as Location from "expo-location";
import { useEffect, useState } from "react";

export type LatLng = {
  lat: number;
  lng: number;
};

export type PermissionState = "loading" | "granted" | "denied";

export const useUserLocation = () => {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [permission, setPermission] = useState<PermissionState>("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setPermission("denied");
      setError("Location permissions are required to calculate prayer times.");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setPermission("granted");
    setError(null);
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, permission, error, refreshLocation: fetchLocation };
};
