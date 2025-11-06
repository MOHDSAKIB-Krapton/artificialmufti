import Container from "@/components/common/container";
import ProgressBar from "@/components/pagePartials/prayerTimes/progressBar";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Wudu Steps Data
const WUDU_STEPS = [
  {
    id: 1,
    title: "Intention (Niyyah)",
    arabic: "نِيَّة",
    description:
      "Make the intention in your heart to perform wudu for purification.",
    details:
      "The intention should be made silently in the heart. It is not necessary to say it out loud.",
    duration: 5,
    repetitions: 1,
  },
  {
    id: 2,
    title: "Say Bismillah",
    arabic: "بِسْمِ اللَّهِ",
    description: "Begin by saying 'Bismillah' (In the name of Allah).",
    details:
      "Starting with Allah's name is a blessed way to begin any righteous act.",
    duration: 3,
    repetitions: 1,
  },
  {
    id: 3,
    title: "Wash Hands",
    arabic: "غَسْلُ الْكَفَّيْنِ",
    description: "Wash both hands up to the wrists three times.",
    details:
      "Make sure water reaches between the fingers and covers the entire hand including the wrists.",
    duration: 15,
    repetitions: 3,
  },
  {
    id: 4,
    title: "Rinse Mouth",
    arabic: "الْمَضْمَضَة",
    description: "Rinse your mouth three times, using your right hand.",
    details:
      "Take water in your right hand and rinse thoroughly, moving the water around your mouth.",
    duration: 15,
    repetitions: 3,
  },
  {
    id: 5,
    title: "Rinse Nose",
    arabic: "الاِسْتِنْشَاق",
    description: "Sniff water into your nostrils three times and blow it out.",
    details:
      "Use your right hand to bring water to your nose, sniff gently, and use your left hand to clean.",
    duration: 15,
    repetitions: 3,
  },
  {
    id: 6,
    title: "Wash Face",
    arabic: "غَسْلُ الْوَجْه",
    description:
      "Wash your entire face three times from forehead to chin and ear to ear.",
    details:
      "Ensure water covers the entire face from the hairline to the chin and from ear to ear.",
    duration: 20,
    repetitions: 3,
  },
  {
    id: 7,
    title: "Wash Arms",
    arabic: "غَسْلُ الْيَدَيْنِ",
    description:
      "Wash your right arm from wrist to elbow three times, then the left arm.",
    details:
      "Start with the right arm, ensuring water covers every part from fingertips to above the elbow.",
    duration: 25,
    repetitions: 3,
  },
  {
    id: 8,
    title: "Wipe Head",
    arabic: "مَسْحُ الرَّأْس",
    description: "Wipe your head once with wet hands from front to back.",
    details:
      "Use wet hands to wipe from the forehead to the back of the head and back to the forefront.",
    duration: 10,
    repetitions: 1,
  },
  {
    id: 9,
    title: "Wipe Ears",
    arabic: "مَسْحُ الْأُذُنَيْنِ",
    description: "Wipe the inside and outside of both ears with wet fingers.",
    details:
      "Use your index fingers for the inside and thumbs for the outside of the ears.",
    duration: 10,
    repetitions: 1,
  },
  {
    id: 10,
    title: "Wash Feet",
    arabic: "غَسْلُ الرِّجْلَيْنِ",
    description:
      "Wash your right foot up to the ankle three times, then the left foot.",
    details:
      "Start with the right foot, ensuring water reaches between the toes and up to the ankles.",
    duration: 25,
    repetitions: 3,
  },
];

const COMPLETION_DUA = {
  arabic:
    "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
  transliteration:
    "Ash-hadu an la ilaha illallahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
  translation:
    "I bear witness that there is no deity but Allah alone, with no partner, and I bear witness that Muhammad is His servant and messenger.",
};

interface WuduStepCardProps {
  step: (typeof WUDU_STEPS)[0];
  isActive: boolean;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
  theme: any;
}

const WuduStepCard = ({
  step,
  isActive,
  isCompleted,
  isExpanded,
  onToggle,
  onComplete,
  theme,
}: WuduStepCardProps) => {
  const [timer, setTimer] = useState(step.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [heightAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isExpanded) {
      Animated.spring(heightAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isActive && !isCompleted) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  useEffect(() => {
    let interval: number;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return step.duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const toggleTimer = () => {
    if (!isRunning && timer === step.duration) {
      setIsRunning(true);
    } else if (isRunning) {
      setIsRunning(false);
    } else {
      setTimer(step.duration);
      setIsRunning(true);
    }
  };

  const progressPct = ((step.duration - timer) / step.duration) * 100;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: 12,
      }}
    >
      <Pressable
        onPress={onToggle}
        className="rounded-xl border overflow-hidden"
        style={{
          borderColor: isActive
            ? theme.primary
            : isCompleted
              ? theme.accent
              : (theme.accentLight ?? "#ffffff22"),
          backgroundColor: theme.card,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center flex-1">
            {/* Checkbox */}
            <TouchableOpacity
              onPress={onComplete}
              className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
              style={{
                borderColor: isCompleted ? theme.primary : theme.textSecondary,
                backgroundColor: isCompleted ? theme.primary : "transparent",
              }}
            >
              {isCompleted && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>

            {/* Step Number & Title */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-2"
                  style={{
                    backgroundColor: theme.primaryLight ?? theme.primary + "20",
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: theme.primary }}
                  >
                    {step.id}
                  </Text>
                </View>
                <Text
                  className="font-bold flex-1"
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    textDecorationLine: isCompleted ? "line-through" : "none",
                    opacity: isCompleted ? 0.6 : 1,
                  }}
                  numberOfLines={1}
                >
                  {step.title}
                </Text>
              </View>
              <Text
                className="text-right mt-1"
                style={{
                  color: theme.primary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {step.arabic}
              </Text>
            </View>

            {/* Expand Icon */}
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <Animated.View
            style={{
              opacity: heightAnim,
              paddingHorizontal: 16,
              paddingBottom: 16,
            }}
          >
            {/* Description */}
            <View
              className="p-3 rounded-lg mb-3"
              style={{ backgroundColor: theme.background }}
            >
              <Text className="text-sm leading-5" style={{ color: theme.text }}>
                {step.description}
              </Text>
            </View>

            {/* Detailed Instructions */}
            <View className="mb-3">
              <Text
                className="text-xs font-semibold mb-1"
                style={{ color: theme.textSecondary }}
              >
                DETAILED INSTRUCTIONS
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: theme.textSecondary }}
              >
                {step.details}
              </Text>
            </View>

            {/* Repetitions */}
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="repeat"
                size={16}
                color={theme.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Repeat {step.repetitions}x
              </Text>
            </View>

            {/* Timer Section */}
            <View
              className="p-3 rounded-lg"
              style={{ backgroundColor: theme.background }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons
                    name="timer-outline"
                    size={16}
                    color={theme.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.text }}
                  >
                    Recommended Duration: {step.duration}s
                  </Text>
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: isRunning ? theme.primary : theme.text }}
                >
                  {timer}s
                </Text>
              </View>

              <ProgressBar
                trackColor={theme.accentLight ?? "#ffffff16"}
                fillColor={theme.primary}
                pct={progressPct}
              />

              <TouchableOpacity
                onPress={toggleTimer}
                className="mt-3 py-2 rounded-lg items-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-white font-semibold">
                  {isRunning
                    ? "Pause"
                    : timer === step.duration
                      ? "Start Timer"
                      : "Resume"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const WuduGuide = () => {
  const { theme } = useTheme();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [showCompletion, setShowCompletion] = useState(false);

  const progressPct = useMemo(() => {
    return (completedSteps.length / WUDU_STEPS.length) * 100;
  }, [completedSteps]);

  const currentStep = useMemo(() => {
    const firstIncomplete = WUDU_STEPS.find(
      (step) => !completedSteps.includes(step.id)
    );
    return firstIncomplete?.id ?? null;
  }, [completedSteps]);

  const toggleStep = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleComplete = (stepId: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) {
        setShowCompletion(false);
        return prev.filter((id) => id !== stepId);
      } else {
        const newCompleted = [...prev, stepId];
        if (newCompleted.length === WUDU_STEPS.length) {
          setShowCompletion(true);
        }
        return newCompleted;
      }
    });
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    setExpandedStep(1);
    setShowCompletion(false);
  };

  const isAllCompleted = completedSteps.length === WUDU_STEPS.length;

  return (
    <Container>
      {/* Header */}
      <View
        className="rounded-2xl border p-4 mb-4"
        style={{
          borderColor: theme.accentLight ?? "#ffffff22",
          backgroundColor: theme.card,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Wudu Guide
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: theme.textSecondary }}
            >
              Step-by-step purification ritual
            </Text>
          </View>
          <View
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{
              backgroundColor: theme.primaryLight ?? theme.primary + "20",
            }}
          >
            <Text
              className="text-2xl font-bold"
              style={{ color: theme.primary }}
            >
              {completedSteps.length}
            </Text>
            <Text className="text-xs" style={{ color: theme.primary }}>
              of {WUDU_STEPS.length}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <ProgressBar
          trackColor={theme.background ?? "#ffffff16"}
          fillColor={theme.primary}
          pct={progressPct}
        />

        <View className="flex-row justify-between mt-2">
          <Text className="text-xs" style={{ color: theme.textSecondary }}>
            {Math.round(progressPct)}% Complete
          </Text>
          {!isAllCompleted && currentStep && (
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.primary }}
            >
              Current: Step {currentStep}
            </Text>
          )}
          {isAllCompleted && (
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.accent }}
            >
              ✓ Completed
            </Text>
          )}
        </View>

        {/* Reset Button */}
        {completedSteps.length > 0 && (
          <TouchableOpacity
            onPress={resetProgress}
            className="mt-3 py-2 rounded-lg items-center flex-row justify-center"
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
            }}
          >
            <Ionicons
              name="refresh"
              size={16}
              color={theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              className="font-semibold"
              style={{ color: theme.textSecondary }}
            >
              Reset Progress
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Steps List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {WUDU_STEPS.map((step) => (
          <WuduStepCard
            key={step.id}
            step={step}
            isActive={step.id === currentStep}
            isCompleted={completedSteps.includes(step.id)}
            isExpanded={expandedStep === step.id}
            onToggle={() => toggleStep(step.id)}
            onComplete={() => toggleComplete(step.id)}
            theme={theme}
          />
        ))}

        {/* Completion Dua */}
        {showCompletion && (
          <View
            className="rounded-2xl border p-4 mt-4"
            style={{
              borderColor: theme.accent,
              backgroundColor: theme.card,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.accent}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-lg font-bold"
                style={{ color: theme.accent }}
              >
                Wudu Completed!
              </Text>
            </View>

            <Text
              className="text-xs font-semibold mb-2"
              style={{ color: theme.textSecondary }}
            >
              RECITE AFTER WUDU
            </Text>

            <Text
              className="text-xl text-right leading-9 mb-3"
              style={{ color: theme.primary, fontWeight: "600" }}
            >
              {COMPLETION_DUA.arabic}
            </Text>

            <View
              className="p-3 rounded-lg mb-2"
              style={{ backgroundColor: theme.background }}
            >
              <Text
                className="text-sm italic leading-5"
                style={{ color: theme.textSecondary }}
              >
                {COMPLETION_DUA.transliteration}
              </Text>
            </View>

            <Text className="text-sm leading-5" style={{ color: theme.text }}>
              {COMPLETION_DUA.translation}
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

export default WuduGuide;
