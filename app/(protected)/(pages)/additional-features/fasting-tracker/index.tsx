import CustomModal from "@/components/common/customModal";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * FASTING TRACKER (Ramadan Special)
 * - Local persistence via AsyncStorage
 * - 30-day Ramadan window, user sets/edits start date
 * - Mark fast done / add note / set mood for the day
 * - Stats: total completed, remaining, best streak, current streak
 * - Animated "celebration" when user completes a day
 * - Compact, drop-in single-file screen (aligns with your existing style)
 */

type Mood = "low" | "medium" | "high";

interface FastingDay {
  id: string; // YYYY-MM-DD
  date: number; // timestamp at 00:00:00 local
  isCompleted: boolean;
  mood?: Mood;
  notes?: string;
}

interface FastingState {
  startDate: string; // YYYY-MM-DD
  days: FastingDay[]; // 30 days
  updatedAt: number;
}

const STORAGE_KEY = "FASTING_TRACKER_V1";

const formatYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const atMidnightTs = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

const generate30Days = (start: Date): FastingDay[] => {
  const arr: FastingDay[] = [];
  for (let i = 0; i < 30; i++) {
    const dt = addDays(start, i);
    const ymd = formatYMD(dt);
    arr.push({
      id: ymd,
      date: atMidnightTs(dt),
      isCompleted: false,
    });
  }
  return arr;
};

const calcStreaks = (days: FastingDay[]) => {
  // Sort by date just in case
  const sorted = [...days].sort((a, b) => a.date - b.date);

  let best = 0;
  let curr = 0;

  for (const d of sorted) {
    if (d.isCompleted) {
      curr += 1;
      best = Math.max(best, curr);
    } else {
      curr = 0;
    }
  }

  // Current streak is computed up to most recent consecutive completed day at the end
  // If last day not completed, we walk backwards from the end:
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].isCompleted) currentStreak++;
    else break;
  }

  return { bestStreak: best, currentStreak };
};

const FastingTrackerScreen: React.FC = () => {
  const { theme } = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<FastingState | null>(null);

  // UI state
  const [showStartModal, setShowStartModal] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  // Animations (celebration + ripple like your Tasbeeh)
  const [celebrateAnim] = useState(new Animated.Value(0));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  const activeDay = useMemo(() => {
    if (!state || !activeDayId) return null;
    return state.days.find((d) => d.id === activeDayId) ?? null;
  }, [state, activeDayId]);

  // Derived stats
  const totalCompleted = useMemo(
    () => (state ? state.days.filter((d) => d.isCompleted).length : 0),
    [state]
  );
  const totalDays = useMemo(() => state?.days.length ?? 0, [state]);
  const remaining = useMemo(
    () => Math.max(0, totalDays - totalCompleted),
    [totalDays, totalCompleted]
  );

  const { bestStreak, currentStreak } = useMemo(() => {
    if (!state) return { bestStreak: 0, currentStreak: 0 };
    return calcStreaks(state.days);
  }, [state]);

  const progressPct = useMemo(() => {
    if (!state || totalDays === 0) return 0;
    return Math.min(100, (totalCompleted / totalDays) * 100);
  }, [state, totalCompleted, totalDays]);

  // Ripple styles
  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.25, 0],
  });

  // Celebrate styles
  const celebrateScale = celebrateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });
  const celebrateOpacity = celebrateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: FastingState = JSON.parse(raw);
          setState(parsed);
          if (parsed.days.length) setActiveDayId(parsed.days[0].id);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
      // If nothing in storage, open start-date modal
      setLoading(false);
      setShowStartModal(true);
    })();
  }, []);

  const persist = useCallback(async (next: FastingState) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore write errors silently
    }
  }, []);

  // Celebrate animation
  const animateCelebrate = useCallback(() => {
    Animated.sequence([
      Animated.timing(celebrateAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(celebrateAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [celebrateAnim]);

  // Ripple + scale (tap)
  const animateTap = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.94,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => rippleAnim.setValue(0));
  }, [rippleAnim, scaleAnim]);

  // Create / reset Ramadan from start date
  const initFromStartDate = useCallback(
    async (ymd: string) => {
      // validate YYYY-MM-DD quickly
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return;
      const [Y, M, D] = ymd.split("-").map((n) => parseInt(n, 10));
      const start = new Date(Y, M - 1, D, 0, 0, 0, 0);
      const days = generate30Days(start);
      const next: FastingState = {
        startDate: ymd,
        days,
        updatedAt: Date.now(),
      };
      await persist(next);
      setActiveDayId(days[0]?.id ?? null);
    },
    [persist]
  );

  const handleSetRamadanStart = useCallback(async () => {
    if (!draftStartDate) return;
    await initFromStartDate(draftStartDate);
    setShowStartModal(false);
    setDraftStartDate("");
  }, [draftStartDate, initFromStartDate]);

  const handleEditStartDate = useCallback(() => {
    setDraftStartDate(state?.startDate ?? "");
    setShowStartModal(true);
  }, [state?.startDate]);

  // Toggle completion
  const toggleDay = useCallback(
    async (dayId: string) => {
      if (!state) return;
      animateTap();
      const nextDays = state.days.map((d) =>
        d.id === dayId ? { ...d, isCompleted: !d.isCompleted } : d
      );
      const next: FastingState = {
        ...state,
        days: nextDays,
        updatedAt: Date.now(),
      };
      await persist(next);
      // Haptics + celebrate on set to completed
      const justCompleted = nextDays.find((d) => d.id === dayId)?.isCompleted;
      if (justCompleted) {
        Vibration.vibrate([0, 80, 40, 80]);
        animateCelebrate();
      } else {
        Vibration.vibrate(20);
      }
    },
    [state, persist, animateTap, animateCelebrate]
  );

  const setMood = useCallback(
    async (dayId: string, mood: Mood) => {
      if (!state) return;
      const nextDays = state.days.map((d) =>
        d.id === dayId ? { ...d, mood } : d
      );
      await persist({ ...state, days: nextDays, updatedAt: Date.now() });
    },
    [state, persist]
  );

  const openNote = useCallback(
    (dayId: string) => {
      if (!state) return;
      const d = state.days.find((x) => x.id === dayId);
      setActiveDayId(dayId);
      setNoteDraft(d?.notes ?? "");
      setShowNoteModal(true);
    },
    [state]
  );

  const saveNote = useCallback(async () => {
    if (!state || !activeDayId) return;
    const nextDays = state.days.map((d) =>
      d.id === activeDayId ? { ...d, notes: noteDraft } : d
    );
    await persist({ ...state, days: nextDays, updatedAt: Date.now() });
    setShowNoteModal(false);
  }, [state, activeDayId, noteDraft, persist]);

  // UI helpers
  const DayBadge: React.FC<{ d: FastingDay }> = ({ d }) => {
    const active = d.id === activeDayId;
    return (
      <Pressable
        onPress={() => setActiveDayId(d.id)}
        className="px-3 py-2 rounded-xl mr-2 mb-2 border"
        style={{
          backgroundColor: active ? theme.primary + "22" : theme.card,
          borderColor: theme.accentLight ?? "#ffffff22",
        }}
      >
        <Text className="text-xs font-semibold" style={{ color: theme.text }}>
          {d.id.split("-").slice(1).join("-")}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons
            name={d.isCompleted ? "checkmark-circle" : "ellipse-outline"}
            size={14}
            color={d.isCompleted ? "#22c55e" : theme.textSecondary}
          />
          {d.mood && (
            <View
              className="ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: theme.background }}
            >
              <Text
                className="text-[10px]"
                style={{ color: theme.textSecondary }}
              >
                {d.mood}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
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
          paddingBottom: 40,
          paddingTop: 8,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Ramadan Fasting Tracker
            </Text>
            <Text
              className="text-2xl font-bold mt-1"
              style={{ color: theme.text }}
            >
              {state ? `Start: ${state.startDate}` : "Set Ramadan Start"}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              onPress={handleEditStartDate}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.text} />
            </Pressable>
          </View>
        </View>

        {/* Stats Card */}
        <View
          className="rounded-2xl border p-4 mb-4"
          style={{
            borderColor: theme.accentLight ?? "#ffffff22",
            backgroundColor: theme.card,
          }}
        >
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Completed
              </Text>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: theme.text }}
              >
                {totalCompleted}/{totalDays}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Remaining
              </Text>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: theme.text }}
              >
                {remaining}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.background }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                backgroundColor: theme.primary,
              }}
            />
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Best streak: {bestStreak}
            </Text>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Current streak: {currentStreak}
            </Text>
          </View>
        </View>

        {/* Active Day Card */}
        {state && activeDay && (
          <View
            className="rounded-2xl border p-4 mb-4"
            style={{
              borderColor: theme.accentLight ?? "#ffffff22",
              backgroundColor: theme.card,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  Selected Day
                </Text>
                <Text
                  className="text-lg font-bold mt-1"
                  style={{ color: theme.text }}
                >
                  {activeDay.id}
                </Text>
              </View>

              {/* Toggle Completion (with ripple + celebrate) */}
              <View className="relative">
                <Animated.View
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: theme.primary,
                    opacity: rippleOpacity,
                    transform: [{ scale: rippleScale }],
                  }}
                />
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Pressable
                    onPress={() => toggleDay(activeDay.id)}
                    className="px-4 py-2 rounded-full flex-row items-center"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Ionicons
                      name={
                        activeDay.isCompleted
                          ? "checkmark-done"
                          : "checkbox-outline"
                      }
                      size={18}
                      color="#fff"
                    />
                    <Text
                      className="ml-2 font-semibold"
                      style={{ color: "#fff" }}
                    >
                      {activeDay.isCompleted
                        ? "Completed"
                        : "Mark as Completed"}
                    </Text>
                  </Pressable>
                </Animated.View>

                {/* Celebration Overlay */}
                <Animated.View
                  className="absolute inset-0 items-center justify-center"
                  style={{
                    opacity: celebrateOpacity,
                    transform: [{ scale: celebrateScale }],
                  }}
                  pointerEvents="none"
                >
                  <Ionicons name="sparkles" size={42} color="#22c55e" />
                </Animated.View>
              </View>
            </View>

            {/* Mood Selector */}
            <View className="mt-4">
              <Text
                className="text-xs mb-2"
                style={{ color: theme.textSecondary }}
              >
                Energy/Mood
              </Text>
              <View className="flex-row gap-2">
                {(["low", "medium", "high"] as Mood[]).map((m) => {
                  const sel = activeDay.mood === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMood(activeDay.id, m)}
                      className="px-3 py-2 rounded-xl border"
                      style={{
                        backgroundColor: sel
                          ? theme.primary + "22"
                          : theme.background,
                        borderColor: theme.accentLight ?? "#ffffff22",
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: theme.text }}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Notes */}
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => openNote(activeDay.id)}
                className="flex-1 py-3 rounded-xl items-center border"
                style={{
                  borderColor: theme.accentLight ?? "#ffffff22",
                  backgroundColor: theme.background,
                }}
              >
                <Ionicons name="create-outline" size={18} color={theme.text} />
                <Text
                  className="mt-1 text-xs font-semibold"
                  style={{ color: theme.text }}
                >
                  {activeDay.notes ? "Edit Reflection" : "Add Reflection"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Ramadan Timeline */}
        {state && (
          <View>
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: theme.textSecondary }}
            >
              Ramadan Days (30)
            </Text>
            <View className="flex-row flex-wrap">
              {state.days.map((d) => (
                <DayBadge key={d.id} d={d} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Start Date Modal */}
      <CustomModal
        visible={showStartModal}
        onClose={() => setShowStartModal(false)}
        heading="Set Ramadan Start"
        description="Enter the first day of Ramadan (YYYY-MM-DD)."
        variant="bottom"
      >
        <View>
          <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
            Example: 2025-03-01
          </Text>
          <TextInput
            value={draftStartDate}
            onChangeText={setDraftStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            className="p-4 rounded-xl mb-3"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
            }}
          />
          <Pressable
            onPress={handleSetRamadanStart}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-semibold" style={{ color: "#fff" }}>
              Save & Generate 30 Days
            </Text>
          </Pressable>
        </View>
      </CustomModal>

      {/* Notes Modal */}
      <CustomModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        heading="Reflection / Note"
        description={activeDay ? activeDay.id : ""}
        variant="bottom"
      >
        <View>
          <TextInput
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="How did your fast go today?"
            placeholderTextColor={theme.textSecondary}
            multiline
            className="p-4 rounded-xl mb-3"
            style={{
              minHeight: 120,
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
              textAlignVertical: "top",
            }}
          />
          <Pressable
            onPress={saveNote}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-semibold" style={{ color: "#fff" }}>
              Save
            </Text>
          </Pressable>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default FastingTrackerScreen;
