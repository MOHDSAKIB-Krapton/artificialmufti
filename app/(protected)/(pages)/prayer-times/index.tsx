import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, AppState, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FancyButton from "@/components/common/button";
import { useTheme } from "@/hooks/useTheme";

// adhan (astronomical calc)
import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
} from "adhan";

// -------------------- Types & Helpers --------------------
type LatLng = { lat: number; lng: number };
type PermissionState = "loading" | "granted" | "denied";
type MadhabType = (typeof Madhab)[keyof typeof Madhab];

const METHOD_KEYS = [
  "MuslimWorldLeague",
  "UmmAlQura",
  "ISNA",
  "Egyptian",
  "Karachi",
  "Dubai",
  "MoonsightingCommittee",
] as const;
type MethodKey = (typeof METHOD_KEYS)[number];

const METHOD_MAP: Record<MethodKey, CalculationParameters> = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague(),
  UmmAlQura: CalculationMethod.UmmAlQura(),
  ISNA: CalculationMethod.NorthAmerica(),
  Egyptian: CalculationMethod.Egyptian(),
  Karachi: CalculationMethod.Karachi(),
  Dubai: CalculationMethod.Dubai(),
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee(),
};

// Format a Date into local time HH:MM (24h/12h based on device settings)
const fmtTime = (d?: Date | null) => {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    // Very old environments fallback
    return d.toLocaleTimeString().slice(0, 5);
  }
};

// Hijri date using Intl (requires Hermes RN 0.71+ typically)
const getHijriDate = (date = new Date()) => {
  try {
    // "en-TN-u-ca-islamic" gives Islamic calendar with latin digits
    const fmt = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return fmt.format(date);
  } catch {
    // Fallback: show Gregorian if Islamic calendar not supported.
    // You can replace this with a small Hijri lib if needed.
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }
};

// -------------------- Screen --------------------
const PrayerTimesScreen: React.FC = () => {
  const { theme } = useTheme();

  // Core state
  const [permission, setPermission] = useState<PermissionState>("loading");
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [methodKey, setMethodKey] = useState<MethodKey>("UmmAlQura");
  const [madhab, setMadhab] = useState<MadhabType>(Madhab.Shafi);
  const [today, setToday] = useState<Date>(new Date());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const appState = useRef(AppState.currentState);

  // Re-fetch on resume (optional)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (appState.current.match(/inactive|background/) && state === "active") {
        // When returning to app, tick the clock/day and recompute
        setToday(new Date());
      }
      appState.current = state;
    });
    return () => sub.remove();
  }, []);

  // Location permission + first fix
  const getLocation = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermission("denied");
        setErrorMsg(
          "Location permission is required to compute prayer times accurately."
        );
        setLoading(false);
        return;
      }
      setPermission("granted");

      // Try a reasonably fast + accurate fix
      const loc = await Location.getCurrentPositionAsync({
        accuracy:
          Platform.OS === "ios"
            ? Location.Accuracy.Low
            : Location.Accuracy.Balanced,
      });

      setCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to get location.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Cycle calculation method
  const cycleMethod = useCallback(() => {
    const idx = METHOD_KEYS.indexOf(methodKey);
    const next = METHOD_KEYS[(idx + 1) % METHOD_KEYS.length];
    setMethodKey(next);
    Haptics.selectionAsync();
  }, [methodKey]);

  // Toggle Asr Madhab
  const toggleMadhab = useCallback(() => {
    setMadhab((m: MadhabType) =>
      m === Madhab.Shafi ? Madhab.Hanafi : Madhab.Shafi
    );
    Haptics.selectionAsync();
  }, []);

  // Build adhan params
  const params = useMemo(() => {
    const p = METHOD_MAP[methodKey];
    p.madhab = madhab; // affect Asr calc
    return p;
  }, [methodKey, madhab]);

  // Compute PrayerTimes (offline, deterministic)
  const prayerTimes = useMemo(() => {
    if (!coords) return null;

    const c = new Coordinates(coords.lat, coords.lng);
    // Date must be a *pure* local date. adhan expects JS Date (local TZ okay).
    return new PrayerTimes(c, today, params);
  }, [coords, today, params]);

  // Qibla (just for extra info)
  const qibla = useMemo(() => {
    if (!coords) return null;
    const c = new Coordinates(coords.lat, coords.lng);
    return Qibla(c);
  }, [coords]);

  const items = useMemo(
    () => [
      { key: "Fajr", time: fmtTime(prayerTimes?.fajr), icon: "moon" as const },
      {
        key: "Sunrise",
        time: fmtTime(prayerTimes?.sunrise),
        icon: "sunny" as const,
      },
      {
        key: "Dhuhr",
        time: fmtTime(prayerTimes?.dhuhr),
        icon: "time" as const,
      },
      { key: "Asr", time: fmtTime(prayerTimes?.asr), icon: "alarm" as const },
      {
        key: "Maghrib",
        time: fmtTime(prayerTimes?.maghrib),
        icon: "partly-sunny" as const,
      },
      {
        key: "Isha",
        time: fmtTime(prayerTimes?.isha),
        icon: "moon-outline" as const,
      },
    ],
    [prayerTimes]
  );

  const tzName = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Local Time";
    } catch {
      return "Local Time";
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getLocation();
    setToday(new Date());
    setRefreshing(false);
  }, [getLocation]);

  // -------------------- Render --------------------
  if (permission === "denied") {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-xl font-bold mt-4 text-center">
            Permission Required
          </Text>
          <Text className="text-gray-500 text-center mt-2 mb-8">
            {errorMsg || "Please enable location permissions in Settings."}
          </Text>
          <FancyButton
            text="Try Again"
            iconName="refresh"
            onPress={() => {
              if (Platform.OS === "android") {
                Alert.alert(
                  "Location",
                  "Open app settings to grant location permission.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "OK" }, // Leave actual open-settings implementation to your util if you have one
                  ]
                );
              }
              getLocation();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="items-center mt-2 mb-4 px-6">
        <Text
          className="text-2xl font-space-bold"
          style={{ color: theme.text }}
        >
          Prayer Times
        </Text>
        <Text
          className="text-sm mt-1 font-space "
          style={{ color: theme.textSecondary }}
        >
          {getHijriDate(today)} • {tzName}
        </Text>

        {coords && (
          <Text
            className="text-xs mt-1 font-space"
            style={{ color: theme.textSecondary }}
          >
            {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}° • Qibla{" "}
            {qibla !== null ? `${qibla!.toFixed(1)}°` : "—"}
          </Text>
        )}

        {!!errorMsg && (
          <Text className="text-xs mt-2 text-red-500 text-center font-space">
            {errorMsg}
          </Text>
        )}
      </View>

      {/* Method + Madhab chips */}
      <View className="px-6 w-full">
        <View className="flex-row gap-x-2">
          <View className="flex-1">
            <FancyButton
              text={`Method: ${methodKey}`}
              iconName="settings"
              onPress={cycleMethod}
            />
          </View>
          <View className="flex-1">
            <FancyButton
              text={`Asr: ${madhab === Madhab.Shafi ? "Shafi" : "Hanafi"}`}
              iconName="repeat"
              onPress={toggleMadhab}
            />
          </View>
        </View>
      </View>

      {/* Times List */}
      <View className=" px-6 justify-between flex-1">
        <View className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {items.map((it, idx) => (
            <View
              key={it.key}
              className={`flex-row items-center justify-between px-4 py-3 ${
                idx !== items.length - 1
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
              }`}
              style={{ backgroundColor: theme.card }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={it.icon as any}
                  size={18}
                  color={theme.primary}
                />
                <Text
                  className="ml-2 text-base font-space"
                  style={{ color: theme.text }}
                >
                  {it.key}
                </Text>
              </View>
              <Text
                className="text-base font-space-bold"
                style={{ color: theme.text }}
              >
                {it.time}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="mt-4 gap-y-3">
          <FancyButton
            text={loading ? "Locating..." : "Use My Location"}
            iconName="locate"
            onPress={getLocation}
            loading={loading}
          />
          <FancyButton
            text="Refresh Today"
            iconName="refresh"
            onPress={() => {
              setToday(new Date());
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        </View>

        {/* Footnote */}
        <Text
          className="text-xs font-space text-center"
          style={{ color: theme.textSecondary }}
        >
          Calculations run locally using astronomical algorithms from{" "}
          <Text className="font-semibold">adhan</Text>. No internet or API
          required. Times can vary slightly between methods; choose your
          preferred method and Asr madhab above.
        </Text>
      </View>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export default PrayerTimesScreen;
