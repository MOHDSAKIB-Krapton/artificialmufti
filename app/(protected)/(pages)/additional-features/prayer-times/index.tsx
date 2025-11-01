import { Ionicons } from "@expo/vector-icons";
import { CalculationMethod, Madhab } from "adhan";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeroCard from "@/components/pagePartials/prayerTimes/hero";
import PrayerList from "@/components/pagePartials/prayerTimes/prayerList";
import RefreshFab from "@/components/pagePartials/prayerTimes/refreshFab";
import { useUserLocation } from "@/hooks/permissions/useLocation";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useTheme } from "@/hooks/useTheme";
import { getNextPrev, PrayerKey } from "@/utils/prayer/helpers";

const PrayerTimesScreen: React.FC = () => {
  const { theme } = useTheme();

  // Defaults: keep on this screen; Settings will override in future
  const params = useMemo(() => {
    const p = CalculationMethod.UmmAlQura();
    p.madhab = Madhab.Shafi;
    return p;
  }, []);

  /* ----- Hooks ----- */
  const { location, permission, error, refreshLocation } = useUserLocation();
  const { prayerTimes, today, refreshPrayerTimes, setToday } = usePrayerTimes(
    location,
    params
  );

  // Build map for simple access
  const timesMap = useMemo(() => {
    if (!prayerTimes) return null;

    return {
      Fajr: prayerTimes.fajr,
      Sunrise: prayerTimes.sunrise,
      Dhuhr: prayerTimes.dhuhr,
      Asr: prayerTimes.asr,
      Maghrib: prayerTimes.maghrib,
      Isha: prayerTimes.isha,
    } as Record<PrayerKey, Date | null>;
  }, [prayerTimes]);

  const { prev, next, nextTime } = useMemo(() => {
    if (!timesMap) return { prev: null, next: null, nextTime: null };
    return getNextPrev(timesMap); // nextTime already handled
  }, [timesMap]);

  const prevTime = useMemo(() => {
    if (!prev || !timesMap) return null;
    return prev === "Isha" && next === "Fajr" && nextTime // passed Isha?
      ? timesMap["Isha"] // yesterday's Isha (today)
      : timesMap[prev];
  }, [prev, next, timesMap, nextTime]);

  // Countdown & “active prayer” window (10 minutes after start)
  const [now, setNow] = useState(Date.now());
  const ACTIVE_WINDOW_MS = 10 * 60 * 1000;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdownMs = useMemo(
    () => (nextTime ? nextTime.getTime() - now : 0),
    [nextTime, now]
  );

  const currentPrayerLabel = useMemo(() => {
    // If a prayer just started within the active window, show "It's <prayer> time"
    if (!next && prev && prevTime) {
      const sincePrev = now - prevTime.getTime();
      if (sincePrev >= 0 && sincePrev < ACTIVE_WINDOW_MS) return prev;
      return null;
    }
    if (prev && prevTime) {
      const sincePrev = now - prevTime.getTime();
      if (sincePrev >= 0 && sincePrev < ACTIVE_WINDOW_MS) return prev;
    }
    return null;
  }, [prev, prevTime, next, now]);

  // Progress from prev → next (for hero progress bar)
  const progressPct = useMemo(() => {
    if (!prevTime || !nextTime) return 0;
    const total = nextTime.getTime() - prevTime.getTime();
    const elapsed = now - prevTime.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [prevTime, nextTime, now]);

  // Refresh behavior:
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshTimes = useCallback(async () => {
    try {
      setRefreshing(true);
      Haptics.selectionAsync();
      setToday(new Date()); // ensure “today” tick
      refreshPrayerTimes();
    } finally {
      setTimeout(() => setRefreshing(false), 400); // small UX delay
    }
  }, [refreshPrayerTimes, setToday]);

  const handleLongRefresh = useCallback(async () => {
    // Reacquire location (expensive), then recompute times
    try {
      setRefreshing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await refreshLocation();
      setToday(new Date());
      refreshPrayerTimes();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [refreshLocation, refreshPrayerTimes, setToday]);

  /* ----- Permission denied UI ----- */
  if (permission === "denied") {
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
          onPress={handleLongRefresh}
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

  /* ----- Loading state while we don’t have location/prayerTimes ----- */
  const loading = !location || !prayerTimes;

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
          nextLabel={next ?? "—"}
          nextTime={nextTime}
          prevLabel={prev ?? "—"}
          countdownMs={countdownMs}
          progressPct={progressPct}
          currentPrayerLabel={currentPrayerLabel}
        />

        {/* Prayer list */}
        <PrayerList theme={theme} prayerTimes={prayerTimes} next={next} />

        {/* Footnote */}
        <Text
          className="text-center mt-4 text-xs"
          style={{ color: theme.textSecondary }}
        >
          Calculations run locally using{" "}
          <Text className="font-semibold">adhan</Text>. No internet required.
          Defaults: <Text className="font-semibold">UmmAlQura</Text> (method) •{" "}
          <Text className="font-semibold">Shafi</Text> (Asr).
        </Text>

        {/* Loading indicator if needed */}
        {loading && (
          <View className="mt-6 items-center">
            <ActivityIndicator />
            <Text
              className="mt-2 text-sm"
              style={{ color: theme.textSecondary }}
            >
              Preparing your prayer times…
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Refresh FAB */}
      <RefreshFab
        theme={theme}
        onPress={handleRefreshTimes}
        onLongPress={handleLongRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
};

export default PrayerTimesScreen;
