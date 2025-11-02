import { useLocationStore } from "@/store/location.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect } from "react";

const CACHE_KEY = "USER_LOCATION_CACHE";
const REFRESH_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

export type LatLng = {
  lat: number;
  lng: number;
  timestamp: number;
};

export const useUserLocation = () => {
  const { location, setLocation, permission, setPermission, error, setError } =
    useLocationStore();

  const fetchLocation = async (force = false) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermission("denied");
        setError(
          "Location permissions are required to calculate prayer times."
        );
        return;
      }

      setPermission("granted");
      setError(null);

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLoc = {
        lat: current.coords.latitude,
        lng: current.coords.longitude,
        timestamp: Date.now(),
      };

      setLocation(newLoc);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newLoc));
    } catch (err: any) {
      setError(err.message || "Failed to fetch location.");
    }
  };

  useEffect(() => {
    let refreshTimer: number;

    const init = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setLocation(parsed);

          const timeDiff = Date.now() - parsed.timestamp;
          if (timeDiff > REFRESH_INTERVAL) {
            await fetchLocation(true); // refresh if older than 2 hours
          }
        } else {
          await fetchLocation(true); // first time fetch
        }

        // schedule next refresh in 2 hours
        refreshTimer = setInterval(fetchLocation, REFRESH_INTERVAL);
      } catch (err) {
        console.error("Location init error:", err);
      }
    };

    init();

    return () => clearInterval(refreshTimer);
  }, []);

  return { location, permission, error, refreshLocation: fetchLocation };
};
