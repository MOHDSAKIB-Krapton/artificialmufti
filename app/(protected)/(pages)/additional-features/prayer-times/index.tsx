import HeroCard from "@/components/pagePartials/prayerTimes/hero";
import PrayerList from "@/components/pagePartials/prayerTimes/prayerList";
import { useUserLocation } from "@/hooks/permissions/useLocation";
import { usePrayerTimes } from "@/hooks/prayers/usePrayerTimes";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { CalculationMethod, Madhab } from "adhan";
import * as Linking from "expo-linking";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PrayerTimesScreen: React.FC = () => {
  const { theme } = useTheme();

  // Default parameters (user settings can override later)
  const params = useMemo(() => {
    const p = CalculationMethod.UmmAlQura();
    p.madhab = Madhab.Shafi;
    return p;
  }, []);

  const { location, permission, error } = useUserLocation();
  const { prayerTimes, sunnahTimes, today } = usePrayerTimes(location, params);

  const loading = !location || !prayerTimes || permission === "loading";

  // adhan gives direct helpers:
  const currentPrayer = useMemo(
    () => prayerTimes?.currentPrayer() ?? null,
    [prayerTimes]
  );

  const nextPrayer = useMemo(() => {
    const np = prayerTimes?.nextPrayer();
    return np === "none" ? "fajr" : np;
  }, [prayerTimes]);

  const nextPrayerTime = useMemo(
    () => (nextPrayer ? prayerTimes?.timeForPrayer(nextPrayer) : null),
    [nextPrayer, prayerTimes]
  );

  const prevPrayerTime = useMemo(
    () => (currentPrayer ? prayerTimes?.timeForPrayer(currentPrayer) : null),
    [currentPrayer, prayerTimes]
  );

  const openSettings = () => {
    try {
      Linking.openSettings();
    } catch (err) {
      console.warn("Settings not supported", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator color={theme.accent} />
        <Text style={{ color: theme.textSecondary }}>
          Loading prayer times...
        </Text>
      </SafeAreaView>
    );
  }

  // Permission UI
  if (permission !== "granted") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text
          className="text-xl font-bold mt-4 text-center"
          style={{ color: theme.text }}
        >
          Permission Required
        </Text>
        <Text
          className="text-center mt-2 mb-6"
          style={{ color: theme.textSecondary }}
        >
          {error || "Please enable location permissions in Settings."}
        </Text>
        <Pressable
          onPress={openSettings}
          className="px-5 py-3 rounded-2xl"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="font-semibold" style={{ color: theme.card }}>
            Open Settings / Try Again
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
          paddingTop: 8,
        }}
      >
        <HeroCard
          today={today}
          nextLabel={nextPrayer ?? "Fajr"}
          nextTime={nextPrayerTime ?? null}
          prevLabel={currentPrayer ?? "—"}
          prevTime={prevPrayerTime ?? null}
          currentPrayerLabel={currentPrayer as any}
        />

        <PrayerList
          theme={theme}
          prayerTimes={prayerTimes}
          sunnahTimes={sunnahTimes}
          next={nextPrayer as any}
        />

        <Text
          className="text-center mt-4 text-xs"
          style={{ color: theme.textSecondary }}
        >
          Calculations run locally using{" "}
          <Text className="font-semibold">adhan</Text>. No internet required.
          Defaults: <Text className="font-semibold">UmmAlQura</Text> •{" "}
          <Text className="font-semibold">Shafi</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrayerTimesScreen;
