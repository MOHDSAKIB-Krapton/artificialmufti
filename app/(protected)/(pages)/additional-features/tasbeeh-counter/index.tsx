import Container from "@/components/common/container";
import CustomModal from "@/components/common/customModal";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface TasbeehSession {
  id: string;
  name: string;
  count: number;
  target: number;
  createdAt: number;
  updatedAt: number;
  totalTaps: number;
  cycles: number;
}

interface TasbeehPreset {
  name: string;
  target: number;
  dhikr: string;
}

const PRESETS: TasbeehPreset[] = [
  { name: "SubhanAllah", target: 33, dhikr: "سُبْحَانَ ٱللَّٰهِ" },
  { name: "Alhamdulillah", target: 33, dhikr: "ٱلْحَمْدُ لِلَّٰهِ" },
  { name: "Allahu Akbar", target: 34, dhikr: "ٱللَّٰهُ أَكْبَرُ" },
];

const TasbeehScreen: React.FC = () => {
  const { theme } = useTheme();

  // State
  const [sessions, setSessions] = useState<TasbeehSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [customTarget, setCustomTarget] = useState("");
  const [customName, setCustomName] = useState("");

  // Animations
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [celebrateAnim] = useState(new Animated.Value(0));

  // Active session
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  // Progress percentage
  const progressPct = useMemo(() => {
    if (!activeSession) return 0;
    return Math.min(100, (activeSession.count / activeSession.target) * 100);
  }, [activeSession]);

  // Remaining count
  const remaining = useMemo(() => {
    if (!activeSession) return 0;
    return Math.max(0, activeSession.target - activeSession.count);
  }, [activeSession]);

  // Initialize with a default session
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSession: TasbeehSession = {
        id: Date.now().toString(),
        name: "SubhanAllah",
        count: 0,
        target: 33,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalTaps: 0,
        cycles: 0,
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
    }
  }, [sessions.length]);

  // Tap animation
  const animateTap = useCallback(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rippleAnim.setValue(0);
    });
  }, [scaleAnim, rippleAnim]);

  // Celebration animation
  const animateCelebration = useCallback(() => {
    Animated.sequence([
      Animated.timing(celebrateAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(celebrateAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [celebrateAnim]);

  // Increment counter
  const handleTap = useCallback(() => {
    if (!activeSession) return;

    animateTap();
    Vibration.vibrate(10);

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;

        const newCount = s.count + 1;
        const completedCycle = newCount >= s.target;

        if (completedCycle) {
          animateCelebration();
          Vibration.vibrate([0, 100, 50, 100]);
          return {
            ...s,
            count: 0,
            totalTaps: s.totalTaps + 1,
            cycles: s.cycles + 1,
            updatedAt: Date.now(),
          };
        }

        return {
          ...s,
          count: newCount,
          totalTaps: s.totalTaps + 1,
          updatedAt: Date.now(),
        };
      })
    );
  }, [activeSession, activeSessionId, animateTap, animateCelebration]);

  // Reset counter
  const handleReset = useCallback(() => {
    if (!activeSession) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, count: 0, updatedAt: Date.now() } : s
      )
    );
  }, [activeSession, activeSessionId]);

  // Create new session from preset
  const createSessionFromPreset = useCallback((preset: TasbeehPreset) => {
    const newSession: TasbeehSession = {
      id: Date.now().toString(),
      name: preset.name,
      count: 0,
      target: preset.target,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalTaps: 0,
      cycles: 0,
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setShowPresets(false);
  }, []);

  // Create custom session
  const createCustomSession = useCallback(() => {
    const target = parseInt(customTarget, 10);
    if (!customName || isNaN(target) || target <= 0) return;

    const newSession: TasbeehSession = {
      id: Date.now().toString(),
      name: customName,
      count: 0,
      target,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalTaps: 0,
      cycles: 0,
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setCustomName("");
    setCustomTarget("");
    setShowPresets(false);
  }, [customName, customTarget]);

  // Delete session
  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(sessions[0]?.id ?? null);
      }
    },
    [activeSessionId, sessions]
  );

  // Ripple animation styles
  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  // Celebration styles
  const celebrateScale = celebrateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const celebrateOpacity = celebrateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!activeSession) {
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
    <Container>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Tasbeeh Counter
            </Text>
            <Text
              className="text-2xl font-bold mt-1"
              style={{ color: theme.text }}
            >
              {activeSession.name}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setShowPresets(true);
              }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="add" size={24} color={theme.text} />
            </TouchableOpacity>
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
                Total Cycles
              </Text>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: theme.text }}
              >
                {activeSession.cycles}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Total Taps
              </Text>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: theme.text }}
              >
                {activeSession.totalTaps}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
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
              {activeSession.count} / {activeSession.target}
            </Text>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              {remaining} remaining
            </Text>
          </View>
        </View>

        {/* Main Counter Button */}
        <View className="items-center my-8">
          <View className="relative">
            {/* Ripple Effect */}
            <Animated.View
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: theme.primary,
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              }}
            />

            {/* Main Button */}
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Pressable
                onPress={handleTap}
                className="w-64 h-64 rounded-full items-center justify-center shadow-lg"
                style={{
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 72,
                    fontWeight: "900",
                  }}
                >
                  {activeSession.count}
                </Text>
                <Text
                  className="mt-2 text-sm font-semibold"
                  style={{ color: "#ffffff99" }}
                >
                  TAP TO COUNT
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
              <Ionicons name="checkmark-circle" size={80} color="#4ade80" />
            </Animated.View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 px-4">
          <Pressable
            onPress={handleReset}
            className="flex-1 py-4 rounded-2xl items-center border"
            style={{
              borderColor: theme.accentLight ?? "#ffffff22",
              backgroundColor: theme.card,
            }}
          >
            <Ionicons name="refresh" size={20} color={theme.text} />
            <Text
              className="mt-1 text-xs font-semibold"
              style={{ color: theme.text }}
            >
              Reset
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {}}
            className="flex-1 py-4 rounded-2xl items-center border"
            style={{
              borderColor: theme.accentLight ?? "#ffffff22",
              backgroundColor: theme.card,
            }}
          >
            <Ionicons name="remove" size={20} color={theme.text} />
            <Text
              className="mt-1 text-xs font-semibold"
              style={{ color: theme.text }}
            >
              Undo
            </Text>
          </Pressable>
        </View>

        {/* Sessions List */}
        {sessions.length > 1 && (
          <View className="mt-6">
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: theme.textSecondary }}
            >
              Your Sessions
            </Text>
            {sessions.map((session) => (
              <Pressable
                key={session.id}
                onPress={() => setActiveSessionId(session.id)}
                className="flex-row items-center justify-between p-3 rounded-xl mb-2"
                style={{
                  backgroundColor:
                    session.id === activeSessionId
                      ? theme.primary + "22"
                      : theme.card,
                }}
              >
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: theme.text }}>
                    {session.name}
                  </Text>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {session.count}/{session.target} • {session.cycles} cycles
                  </Text>
                </View>
                <Pressable
                  onPress={() => deleteSession(session.id)}
                  className="ml-2 p-2"
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Presets Modal */}
      <CustomModal
        visible={showPresets}
        onClose={() => setShowPresets(false)}
        heading="New Counter"
        description="Create a new Quick/custom Counter"
        variant="bottom"
      >
        <ScrollView>
          <Text
            className="text-sm font-semibold my-3"
            style={{ color: theme.textSecondary }}
          >
            Quick Presets
          </Text>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset.name}
              onPress={() => createSessionFromPreset(preset)}
              className="p-4 rounded-xl mb-2 border flex-row gap-x-2 justify-center items-start"
              style={{
                backgroundColor: theme.background,
                borderColor: theme.accentLight ?? "#ffffff22",
              }}
            >
              <View className="flex-1 gap-y-1">
                <Text className="font-semibold" style={{ color: theme.text }}>
                  {preset.name}
                </Text>
                <Text className="text-xl" style={{ color: theme.text }}>
                  {preset.dhikr}
                </Text>
              </View>
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Target: {preset.target}
              </Text>
            </Pressable>
          ))}

          {/* Custom */}
          <Text
            className="text-sm font-semibold mt-4 mb-3"
            style={{ color: theme.textSecondary }}
          >
            Custom Counter
          </Text>
          <TextInput
            value={customName}
            onChangeText={setCustomName}
            placeholder="Counter name"
            placeholderTextColor={theme.textSecondary}
            className="p-4 rounded-xl mb-3"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
            }}
          />
          <TextInput
            value={customTarget}
            onChangeText={setCustomTarget}
            placeholder="Target count"
            keyboardType="number-pad"
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
            onPress={createCustomSession}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-semibold" style={{ color: "#fff" }}>
              Create Counter
            </Text>
          </Pressable>
        </ScrollView>
      </CustomModal>
    </Container>
  );
};

export default TasbeehScreen;
