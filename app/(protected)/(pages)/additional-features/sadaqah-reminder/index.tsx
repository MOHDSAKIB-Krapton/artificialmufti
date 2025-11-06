import Container from "@/components/common/container";
import CustomModal from "@/components/common/customModal";
import ProgressBar from "@/components/pagePartials/prayerTimes/progressBar";
import { useTheme } from "@/hooks/useTheme";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Types
interface SadaqahType {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  iconType: "ionicon" | "material" | "font5";
  color: string;
  description: string;
  examples: string[];
  reward: string;
  hadith?: string;
  isMonetary: boolean;
}

interface SadaqahEntry {
  id: string;
  type: SadaqahType;
  amount?: number;
  description: string;
  date: Date;
  isRecurring: boolean;
  frequency?: "daily" | "weekly" | "monthly";
  targetBeneficiaries?: number;
  location?: string;
  isAnonymous: boolean;
  mood?: "happy" | "grateful" | "blessed";
  notes?: string;
}

interface Goal {
  id: string;
  title: string;
  targetAmount?: number;
  targetActions?: number;
  currentAmount: number;
  currentActions: number;
  deadline: Date;
  type: "monetary" | "actions" | "mixed";
  category: string;
  isActive: boolean;
  createdAt: Date;
}

interface Reminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  type: string;
  isActive: boolean;
  lastNotified?: Date;
}

// Sadaqah Types Database
const SADAQAH_TYPES: SadaqahType[] = [
  {
    id: "money",
    name: "Monetary",
    arabicName: "مال",
    icon: "cash",
    iconType: "ionicon",
    color: "#10b981",
    description: "Financial charity and donations",
    examples: ["Zakat", "Donations", "Sponsorship", "Helping the needy"],
    reward: "Multiplied 700 times or more",
    hadith:
      "The believer's shade on the Day of Resurrection will be their charity.",
    isMonetary: true,
  },
  {
    id: "food",
    name: "Food & Water",
    arabicName: "طعام وماء",
    icon: "food-apple",
    iconType: "material",
    color: "#f59e0b",
    description: "Feeding the hungry and providing water",
    examples: ["Feeding fasting person", "Water wells", "Food distribution"],
    reward: "Continuous reward (Sadaqah Jariyah)",
    hadith: "The best charity is giving water to drink.",
    isMonetary: false,
  },
  {
    id: "knowledge",
    name: "Knowledge",
    arabicName: "علم",
    icon: "book",
    iconType: "ionicon",
    color: "#3b82f6",
    description: "Teaching and spreading beneficial knowledge",
    examples: ["Teaching Quran", "Islamic education", "Beneficial advice"],
    reward: "Continuous reward as long as it benefits",
    hadith:
      "When a person dies, their deeds end except three: continuing charity, beneficial knowledge, or a righteous child who prays for them.",
    isMonetary: false,
  },
  {
    id: "smile",
    name: "Smile & Kindness",
    arabicName: "ابتسامة",
    icon: "emoticon-happy",
    iconType: "material",
    color: "#ec4899",
    description: "Acts of kindness and good behavior",
    examples: ["Smiling", "Kind words", "Helping others", "Removing harm"],
    reward: "Every act of kindness is charity",
    hadith: "Your smile for your brother is charity.",
    isMonetary: false,
  },
  {
    id: "time",
    name: "Time & Effort",
    arabicName: "وقت",
    icon: "hands-helping",
    iconType: "font5",
    color: "#8b5cf6",
    description: "Volunteering and helping others",
    examples: ["Volunteering", "Visiting sick", "Helping elderly"],
    reward: "Great reward for serving others",
    isMonetary: false,
  },
  {
    id: "forgiveness",
    name: "Forgiveness",
    arabicName: "مغفرة",
    icon: "heart",
    iconType: "ionicon",
    color: "#ef4444",
    description: "Forgiving others and reconciliation",
    examples: ["Forgiving debts", "Pardoning mistakes", "Reconciliation"],
    reward: "Allah forgives those who forgive",
    hadith:
      "All the sons of Adam are sinners, and the best of sinners are those who repent.",
    isMonetary: false,
  },
];

// Motivational Quotes
const QUOTES = [
  {
    text: "The believer's shade on the Day of Resurrection will be their charity.",
    arabic: "ظل المؤمن يوم القيامة صدقته",
    source: "Hadith - Tirmidhi",
  },
  {
    text: "Charity does not decrease wealth.",
    arabic: "ما نقصت صدقة من مال",
    source: "Hadith - Muslim",
  },
  {
    text: "Those who spend their wealth by night and day, secretly and openly, will have their reward with their Lord.",
    arabic:
      "الَّذِينَ يُنفِقُونَ أَمْوَالَهُم بِاللَّيْلِ وَالنَّهَارِ سِرًّا وَعَلَانِيَةً",
    source: "Quran 2:274",
  },
  {
    text: "Protect yourself from hellfire even if by giving half a date in charity.",
    arabic: "اتقوا النار ولو بشق تمرة",
    source: "Hadith - Bukhari",
  },
];

const SadaqahReminder = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"tracker" | "goals" | "insights">(
    "tracker"
  );
  const [entries, setEntries] = useState<SadaqahEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedType, setSelectedType] = useState<SadaqahType>(
    SADAQAH_TYPES[0]
  );
  const [todayQuote, setTodayQuote] = useState(QUOTES[0]);
  const [streak, setStreak] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalActions, setTotalActions] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Load data
    (async () => {
      console.log("load data called => ");
      await loadData();
    })();

    // Set daily quote
    const today = new Date().getDay();
    setTodayQuote(QUOTES[today % QUOTES.length]);

    // Setup notifications
    setupNotifications();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadData = async () => {
    try {
      const [entriesData, goalsData, remindersData] = await Promise.all([
        AsyncStorage.getItem("sadaqahEntries"),
        AsyncStorage.getItem("sadaqahGoals"),
        AsyncStorage.getItem("sadaqahReminders"),
      ]);

      if (entriesData) setEntries(JSON.parse(entriesData));
      if (goalsData) setGoals(JSON.parse(goalsData));
      if (remindersData) setReminders(JSON.parse(remindersData));

      console.log("All data loaded", reminders);
      calculateStats(entriesData ? JSON.parse(entriesData) : []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const calculateStats = (entries: SadaqahEntry[]) => {
    // Calculate streak
    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dayEntries = entries.filter((e) => {
        const entryDate = new Date(e.date);
        return entryDate.toDateString() === checkDate.toDateString();
      });

      if (
        dayEntries.length === 0 &&
        checkDate.toDateString() !== today.toDateString()
      ) {
        break;
      }

      if (dayEntries.length > 0) {
        currentStreak++;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    setStreak(currentStreak);

    // Calculate totals
    const monetary = entries
      .filter((e) => e.type.isMonetary && e.amount)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const actions = entries.filter((e) => !e.type.isMonetary).length;

    setTotalDonations(monetary);
    setTotalActions(actions);
  };

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      // Schedule reminders
      console.log(reminders);
      reminders.forEach((reminder) => {
        if (reminder.isActive) {
          scheduleReminder(reminder);
        }
      });
    }
  };

  const scheduleReminder = async (reminder: Reminder) => {
    const [hours, minutes] = reminder.time.split(":").map(Number);
    console.log("inside ScheduleReminder => ", reminder);

    // await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: "Sadaqah Reminder 🌙",
    //     body: reminder.title,
    //     sound: true,

    //   },
    //   // trigger: {
    //   //   type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    //   //   hour: hours,
    //   //   minute: minutes,
    //   //   repeats: true,
    //   // },
    //   trigger: null,
    // });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌙 Sadaqah Reminder — Time for Charity!",
        body: `${reminder.title}\nTap to view your progress.`,
        subtitle: "Give with intention",
        sound: "default",
        badge: 1,
        color: "#4ADE80",
        data: {
          type: "reminder",
          reminderId: reminder.id,
          deepLink: "/(protected)/(pages)/sadaqah-tracker",
          extra: { time: reminder.time, days: reminder.days },
        },
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        sticky: false,
        autoDismiss: true,
        categoryIdentifier: "sadaqah-actions",

        // ✅ Android-only image support
        ...({
          android: {
            channelId: "sadaqah-reminders",
            smallIcon: "ic_notification",
            pressAction: { id: "default", launchActivity: "default" },
            imageUrl:
              "https://cdn.pixabay.com/photo/2023/05/04/15/22/multi-verse-7970350_1280.jpg",
          },
        } as any),
      },
      trigger: null,
    });
  };

  const addEntry = async (entry: Omit<SadaqahEntry, "id">) => {
    const newEntry: SadaqahEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    await AsyncStorage.setItem(
      "sadaqahEntries",
      JSON.stringify(updatedEntries)
    );
    calculateStats(updatedEntries);

    // Show success animation
    Alert.alert(
      "Sadaqah Recorded! 🎉",
      "May Allah accept your good deed and multiply your rewards.",
      [{ text: "Alhamdulillah", style: "default" }]
    );
  };

  return (
    <Container>
      <Animated.View
        className="flex-1"
        style={{
          backgroundColor: theme.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View
            className="rounded-2xl border p-5 mb-4"
            style={{
              borderColor: theme.accentLight ?? "#ffffff22",
              backgroundColor: theme.card,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text
                  className="text-2xl font-bold"
                  style={{ color: theme.text }}
                >
                  Sadaqah Tracker
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: theme.textSecondary }}
                >
                  Every good deed counts
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReminderModal(true)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: theme.primaryLight ?? theme.primary + "20",
                }}
              >
                <Ionicons
                  name="notifications"
                  size={20}
                  color={theme.primary}
                />
                {reminders.some((r) => r.isActive) && (
                  <View
                    className="absolute top-0 right-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Today's Motivation */}
            <View
              className="rounded-xl p-4 mb-4"
              style={{
                backgroundColor: theme.primary + "10",
                borderWidth: 1,
                borderColor: theme.primary + "30",
              }}
            >
              <View className="flex-row items-start mb-2">
                <Ionicons
                  name="sunny"
                  size={20}
                  color={theme.primary}
                  style={{ marginRight: 8 }}
                />
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold mb-2"
                    style={{ color: theme.primary }}
                  >
                    Today's Inspiration
                  </Text>
                  <Text
                    className="text-sm italic mb-2"
                    style={{ color: theme.text }}
                  >
                    "{todayQuote.text}"
                  </Text>
                  <Text
                    className="text-xs mb-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {todayQuote.arabic}
                  </Text>
                  <Text className="text-xs" style={{ color: theme.primary }}>
                    — {todayQuote.source}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Overview */}
            <View className="flex-row justify-between mb-4">
              <StatCard
                icon="flame"
                iconType="ionicon"
                value={streak.toString()}
                label="Day Streak"
                color="#f59e0b"
                theme={theme}
              />
              <StatCard
                icon="cash-multiple"
                iconType="material"
                value={`$${totalDonations}`}
                label="Total Given"
                color="#10b981"
                theme={theme}
              />
              <StatCard
                icon="hand-heart"
                iconType="material"
                value={totalActions.toString()}
                label="Good Deeds"
                color="#3b82f6"
                theme={theme}
              />
            </View>

            {/* Quick Add CTA */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="py-3 rounded-xl flex-row items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-bold text-base">
                  Record Sadaqah
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Navigation Tabs */}
          <View className="flex-row mb-4">
            {(["tracker", "goals", "insights"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="flex-1 py-3 items-center"
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor:
                    activeTab === tab ? theme.primary : "transparent",
                }}
              >
                <Text
                  className="font-semibold capitalize"
                  style={{
                    color:
                      activeTab === tab ? theme.primary : theme.textSecondary,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === "tracker" && (
            <TrackerTab
              entries={entries}
              theme={theme}
              onAddEntry={() => setShowAddModal(true)}
            />
          )}

          {activeTab === "goals" && (
            <GoalsTab
              goals={goals}
              theme={theme}
              onAddGoal={() => setShowGoalModal(true)}
              totalDonations={totalDonations}
              totalActions={totalActions}
            />
          )}

          {activeTab === "insights" && (
            <InsightsTab
              entries={entries}
              theme={theme}
              streak={streak}
              totalDonations={totalDonations}
              totalActions={totalActions}
            />
          )}

          <View className="h-14" />
        </ScrollView>

        {/* Add Entry Modal */}
        <CustomModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          variant="bottom"
          heading="Record Sadaqah"
        >
          <AddEntryModal
            theme={theme}
            onClose={() => setShowAddModal(false)}
            onAdd={addEntry}
            sadaqahTypes={SADAQAH_TYPES}
          />
        </CustomModal>

        {/* Add Goal Modal */}
        <CustomModal
          visible={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          heading="Set New Goal"
          variant="bottom"
        >
          <AddGoalModal
            theme={theme}
            onClose={() => setShowGoalModal(false)}
            onAdd={(goal) => {
              const newGoal = {
                ...goal,
                id: Date.now().toString(),
                createdAt: new Date(),
              };
              setGoals([...goals, newGoal]);
              AsyncStorage.setItem(
                "sadaqahGoals",
                JSON.stringify([...goals, newGoal])
              );
            }}
          />
        </CustomModal>

        {/* Reminders Modal */}
        <CustomModal
          visible={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          variant="bottom"
          heading="Sadaqah Reminders"
        >
          <RemindersModal
            theme={theme}
            onClose={() => setShowReminderModal(false)}
            reminders={reminders}
            onUpdateReminders={(updated) => {
              setReminders(updated);
              AsyncStorage.setItem("sadaqahReminders", JSON.stringify(updated));
            }}
          />
        </CustomModal>
      </Animated.View>
    </Container>
  );
};

// Stat Card Component
const StatCard = ({
  icon,
  iconType,
  value,
  label,
  color,
  theme,
}: {
  icon: string;
  iconType: "ionicon" | "material";
  value: string;
  label: string;
  color: string;
  theme: any;
}) => (
  <View className="flex-1 mx-1">
    <View
      className="rounded-xl p-3 items-center"
      style={{ backgroundColor: theme.background }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: color + "20" }}
      >
        {iconType === "material" ? (
          <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        ) : (
          <Ionicons name={icon as any} size={20} color={color} />
        )}
      </View>
      <Text className="text-lg font-bold" style={{ color: theme.text }}>
        {value}
      </Text>
      <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
        {label}
      </Text>
    </View>
  </View>
);

// Tracker Tab
const TrackerTab = ({
  entries,
  theme,
  onAddEntry,
}: {
  entries: SadaqahEntry[];
  theme: any;
  onAddEntry: () => void;
}) => {
  const today = new Date().toDateString();
  const todayEntries = entries.filter(
    (e) => new Date(e.date).toDateString() === today
  );
  const weekEntries = entries.filter((e) => {
    const entryDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  return (
    <View>
      {/* Today's Progress */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bold" style={{ color: theme.text }}>
            Today's Sadaqah
          </Text>
          <Text className="text-xs" style={{ color: theme.textSecondary }}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>

        {todayEntries.length === 0 ? (
          <View className="py-8 items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: theme.background }}
            >
              <Ionicons
                name="heart-outline"
                size={32}
                color={theme.textSecondary}
              />
            </View>
            <Text
              className="text-sm mb-3"
              style={{ color: theme.textSecondary }}
            >
              No sadaqah recorded today
            </Text>
            <TouchableOpacity
              onPress={onAddEntry}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-white text-sm font-semibold">
                Add First Entry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {todayEntries.map((entry, idx) => (
              <SadaqahEntryCard key={idx} entry={entry} theme={theme} />
            ))}
          </View>
        )}
      </View>

      {/* Sadaqah Types Grid */}
      <Text className="font-bold mb-3" style={{ color: theme.text }}>
        Types of Sadaqah
      </Text>
      <View className="flex-row flex-wrap mb-4">
        {SADAQAH_TYPES.map((type) => (
          <SadaqahTypeCard
            key={type.id}
            type={type}
            theme={theme}
            onPress={onAddEntry}
          />
        ))}
      </View>

      {/* This Week's Activity */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        <Text className="font-bold mb-3" style={{ color: theme.text }}>
          This Week's Activity
        </Text>
        <WeekActivityChart entries={weekEntries} theme={theme} />
      </View>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <View className="mb-4">
          <Text className="font-bold mb-3" style={{ color: theme.text }}>
            Recent Entries
          </Text>
          {entries.slice(0, 5).map((entry) => (
            <SadaqahEntryCard key={entry.id} entry={entry} theme={theme} />
          ))}
        </View>
      )}
    </View>
  );
};

// Goals Tab
const GoalsTab = ({
  goals,
  theme,
  onAddGoal,
  totalDonations,
  totalActions,
}: {
  goals: Goal[];
  theme: any;
  onAddGoal: () => void;
  totalDonations: number;
  totalActions: number;
}) => {
  const activeGoals = goals.filter((g) => g.isActive);
  const completedGoals = goals.filter((g) => !g.isActive);

  return (
    <View>
      {/* Add Goal CTA */}
      <TouchableOpacity
        onPress={onAddGoal}
        className="rounded-xl p-4 mb-4 flex-row items-center justify-center"
        style={{
          backgroundColor: theme.card,
          borderWidth: 2,
          borderColor: theme.primary,
          borderStyle: "dashed",
        }}
      >
        <Ionicons
          name="add-circle-outline"
          size={24}
          color={theme.primary}
          style={{ marginRight: 8 }}
        />
        <Text className="font-semibold" style={{ color: theme.primary }}>
          Set New Goal
        </Text>
      </TouchableOpacity>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <View className="mb-6">
          <Text className="font-bold mb-3" style={{ color: theme.text }}>
            Active Goals ({activeGoals.length})
          </Text>
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              theme={theme}
              currentAmount={
                goal.type === "monetary" ? totalDonations : totalActions
              }
            />
          ))}
        </View>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <View className="mb-4">
          <Text className="font-bold mb-3" style={{ color: theme.text }}>
            Completed Goals 🎉
          </Text>
          {completedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              theme={theme}
              currentAmount={
                goal.type === "monetary"
                  ? goal.targetAmount!
                  : goal.targetActions!
              }
              isCompleted
            />
          ))}
        </View>
      )}

      {goals.length === 0 && (
        <View className="py-12 items-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons
              name="flag-outline"
              size={40}
              color={theme.textSecondary}
            />
          </View>
          <Text
            className="text-lg font-bold mb-2"
            style={{ color: theme.text }}
          >
            No Goals Yet
          </Text>
          <Text
            className="text-sm text-center mb-4"
            style={{ color: theme.textSecondary }}
          >
            Set goals to track your sadaqah progress
          </Text>
          <TouchableOpacity
            onPress={onAddGoal}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-semibold">Create First Goal</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Insights Tab
const InsightsTab = ({
  entries,
  theme,
  streak,
  totalDonations,
  totalActions,
}: {
  entries: SadaqahEntry[];
  theme: any;
  streak: number;
  totalDonations: number;
  totalActions: number;
}) => {
  // Calculate insights
  const monthlyData = useMemo(() => {
    const data: Record<string, { donations: number; actions: number }> = {};

    entries.forEach((entry) => {
      const month = new Date(entry.date).toLocaleDateString("en", {
        month: "short",
      });
      if (!data[month]) {
        data[month] = { donations: 0, actions: 0 };
      }

      if (entry.type.isMonetary) {
        data[month].donations += entry.amount || 0;
      } else {
        data[month].actions += 1;
      }
    });

    return data;
  }, [entries]);

  const favoriteType = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      typeCounts[entry.type.id] = (typeCounts[entry.type.id] || 0) + 1;
    });

    const maxType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    return maxType ? SADAQAH_TYPES.find((t) => t.id === maxType[0]) : null;
  }, [entries]);

  const averagePerDay = totalDonations / Math.max(1, entries.length);
  const totalBeneficiaries = entries.reduce(
    (sum, e) => sum + (e.targetBeneficiaries || 0),
    0
  );

  return (
    <View>
      {/* Overall Statistics */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: theme.primary,
        }}
      >
        <Text className="text-white text-lg font-bold mb-4">Your Impact</Text>

        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-white/80 text-xs mb-1">Total Given</Text>
            <Text className="text-white text-2xl font-bold">
              ${totalDonations}
            </Text>
          </View>
          <View>
            <Text className="text-white/80 text-xs mb-1">Good Deeds</Text>
            <Text className="text-white text-2xl font-bold">
              {totalActions}
            </Text>
          </View>
          <View>
            <Text className="text-white/80 text-xs mb-1">Streak</Text>
            <Text className="text-white text-2xl font-bold">{streak} days</Text>
          </View>
        </View>

        <View
          className="rounded-lg p-3"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <Text className="text-white/80 text-xs mb-2">
            Estimated Beneficiaries
          </Text>
          <Text className="text-white text-xl font-bold">
            {totalBeneficiaries}+ people
          </Text>
        </View>
      </View>

      {/* Monthly Breakdown */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        <Text className="font-bold mb-3" style={{ color: theme.text }}>
          Monthly Activity
        </Text>
        {Object.entries(monthlyData).map(([month, data]) => (
          <View key={month} className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm" style={{ color: theme.text }}>
                {month}
              </Text>
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                ${data.donations} • {data.actions} deeds
              </Text>
            </View>
            <View className="flex-row">
              <View className="flex-1 mr-1">
                <ProgressBar
                  trackColor={theme.accentLight}
                  fillColor="#10b981"
                  pct={(data.donations / Math.max(1, totalDonations)) * 100}
                />
              </View>
              <View className="flex-1 ml-1">
                <ProgressBar
                  trackColor={theme.accentLight}
                  fillColor="#3b82f6"
                  pct={(data.actions / Math.max(1, totalActions)) * 100}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Favorite Type */}
      {favoriteType && (
        <View
          className="rounded-2xl p-4 mb-4"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <Text className="font-bold mb-3" style={{ color: theme.text }}>
            Most Frequent Sadaqah
          </Text>
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: favoriteType.color + "20" }}
            >
              {favoriteType.iconType === "material" ? (
                <MaterialCommunityIcons
                  name={favoriteType.icon as any}
                  size={24}
                  color={favoriteType.color}
                />
              ) : favoriteType.iconType === "font5" ? (
                <FontAwesome5
                  name={favoriteType.icon as any}
                  size={20}
                  color={favoriteType.color}
                />
              ) : (
                <Ionicons
                  name={favoriteType.icon as any}
                  size={24}
                  color={favoriteType.color}
                />
              )}
            </View>
            <View>
              <Text className="font-semibold" style={{ color: theme.text }}>
                {favoriteType.name}
              </Text>
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                {favoriteType.arabicName}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Achievements */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        <Text className="font-bold mb-3" style={{ color: theme.text }}>
          Achievements
        </Text>
        <View className="flex-row flex-wrap">
          <AchievementBadge
            icon="flame"
            title="7 Day Streak"
            unlocked={streak >= 7}
            color="#f59e0b"
            theme={theme}
          />
          <AchievementBadge
            icon="cash"
            title="$100 Milestone"
            unlocked={totalDonations >= 100}
            color="#10b981"
            theme={theme}
          />
          <AchievementBadge
            icon="heart"
            title="50 Good Deeds"
            unlocked={totalActions >= 50}
            color="#ec4899"
            theme={theme}
          />
          <AchievementBadge
            icon="star"
            title="30 Day Streak"
            unlocked={streak >= 30}
            color="#8b5cf6"
            theme={theme}
          />
        </View>
      </View>

      {/* Share Progress */}
      <TouchableOpacity
        className="rounded-xl p-4 flex-row items-center justify-center"
        style={{
          backgroundColor: theme.primary,
        }}
      >
        <Ionicons
          name="share-social"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text className="text-white font-semibold">Share Your Impact</Text>
      </TouchableOpacity>
    </View>
  );
};

// Sadaqah Type Card
const SadaqahTypeCard = ({
  type,
  theme,
  onPress,
}: {
  type: SadaqahType;
  theme: any;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} className="w-1/3 p-2">
    <View
      className="rounded-xl p-3 items-center"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.accentLight,
      }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: type.color + "20" }}
      >
        {type.iconType === "material" ? (
          <MaterialCommunityIcons
            name={type.icon as any}
            size={24}
            color={type.color}
          />
        ) : type.iconType === "font5" ? (
          <FontAwesome5 name={type.icon as any} size={20} color={type.color} />
        ) : (
          <Ionicons name={type.icon as any} size={24} color={type.color} />
        )}
      </View>
      <Text
        className="text-xs font-semibold text-center"
        style={{ color: theme.text }}
      >
        {type.name}
      </Text>
      <Text
        className="text-[10px] text-center mt-1"
        style={{ color: theme.textSecondary }}
      >
        {type.arabicName}
      </Text>
    </View>
  </Pressable>
);

// Sadaqah Entry Card
const SadaqahEntryCard = ({
  entry,
  theme,
}: {
  entry: SadaqahEntry;
  theme: any;
}) => (
  <View
    className="rounded-xl p-3 mb-2 flex-row items-center"
    style={{
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.accentLight,
    }}
  >
    <View
      className="w-10 h-10 rounded-full items-center justify-center mr-3"
      style={{ backgroundColor: entry.type.color + "20" }}
    >
      {entry.type.iconType === "material" ? (
        <MaterialCommunityIcons
          name={entry.type.icon as any}
          size={20}
          color={entry.type.color}
        />
      ) : entry.type.iconType === "font5" ? (
        <FontAwesome5
          name={entry.type.icon as any}
          size={16}
          color={entry.type.color}
        />
      ) : (
        <Ionicons
          name={entry.type.icon as any}
          size={20}
          color={entry.type.color}
        />
      )}
    </View>
    <View className="flex-1">
      <Text className="font-semibold" style={{ color: theme.text }}>
        {entry.type.name}
        {entry.amount && ` - $${entry.amount}`}
      </Text>
      <Text className="text-xs" style={{ color: theme.textSecondary }}>
        {entry.description}
      </Text>
      <View className="flex-row items-center mt-1">
        <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
          {new Date(entry.date).toLocaleString()}
        </Text>
        {entry.isRecurring && (
          <View
            className="ml-2 px-2 py-0.5 rounded"
            style={{ backgroundColor: theme.primary + "20" }}
          >
            <Text className="text-[10px]" style={{ color: theme.primary }}>
              {entry.frequency}
            </Text>
          </View>
        )}
      </View>
    </View>
    {entry.mood && (
      <Text className="text-lg ml-2">
        {entry.mood === "happy"
          ? "😊"
          : entry.mood === "grateful"
            ? "🙏"
            : "✨"}
      </Text>
    )}
  </View>
);

// Goal Card
const GoalCard = ({
  goal,
  theme,
  currentAmount,
  isCompleted = false,
}: {
  goal: Goal;
  theme: any;
  currentAmount: number;
  isCompleted?: boolean;
}) => {
  const progress =
    goal.type === "monetary"
      ? (currentAmount / (goal.targetAmount || 1)) * 100
      : (currentAmount / (goal.targetActions || 1)) * 100;

  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: isCompleted ? "#10b981" : theme.accentLight,
      }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="font-bold text-base" style={{ color: theme.text }}>
            {goal.title}
          </Text>
          <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>
            {goal.category} • {goal.type}
          </Text>
        </View>
        {isCompleted ? (
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: "#10b981" }}
          >
            <Text className="text-xs font-bold text-white">Completed!</Text>
          </View>
        ) : (
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: theme.background }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.primary }}
            >
              {daysLeft} days left
            </Text>
          </View>
        )}
      </View>

      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs" style={{ color: theme.textSecondary }}>
            Progress
          </Text>
          <Text className="text-xs font-bold" style={{ color: theme.primary }}>
            {goal.type === "monetary"
              ? `$${currentAmount} / $${goal.targetAmount}`
              : `${currentAmount} / ${goal.targetActions} deeds`}
          </Text>
        </View>
        <ProgressBar
          trackColor={theme.accentLight}
          fillColor={isCompleted ? "#10b981" : theme.primary}
          pct={Math.min(100, progress)}
        />
      </View>

      {!isCompleted && progress >= 100 && (
        <TouchableOpacity
          className="py-2 rounded-lg items-center"
          style={{ backgroundColor: "#10b981" }}
        >
          <Text className="text-white text-sm font-semibold">
            Mark as Complete 🎉
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Week Activity Chart
const WeekActivityChart = ({
  entries,
  theme,
}: {
  entries: SadaqahEntry[];
  theme: any;
}) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();

  const weekData = days.map((day, index) => {
    const dayEntries = entries.filter((e) => {
      const entryDay = new Date(e.date).getDay();
      return entryDay === index;
    });

    return {
      day,
      count: dayEntries.length,
      isToday: index === today,
    };
  });

  const maxCount = Math.max(...weekData.map((d) => d.count), 1);

  return (
    <View className="flex-row justify-between items-end h-24">
      {weekData.map((data, index) => (
        <View key={index} className="flex-1 items-center">
          <View
            className="w-8 rounded-t"
            style={{
              height: `${(data.count / maxCount) * 100}%`,
              backgroundColor: data.isToday
                ? theme.primary
                : theme.primary + "50",
              minHeight: data.count > 0 ? 4 : 0,
            }}
          />
          <Text
            className="text-[10px] mt-1"
            style={{
              color: data.isToday ? theme.primary : theme.textSecondary,
            }}
          >
            {data.day}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Achievement Badge
const AchievementBadge = ({
  icon,
  title,
  unlocked,
  color,
  theme,
}: {
  icon: string;
  title: string;
  unlocked: boolean;
  color: string;
  theme: any;
}) => (
  <View className="w-1/2 p-2">
    <View
      className="rounded-lg p-3 items-center"
      style={{
        backgroundColor: unlocked ? color + "20" : theme.background,
        borderWidth: 1,
        borderColor: unlocked ? color : theme.accentLight,
        opacity: unlocked ? 1 : 0.5,
      }}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={unlocked ? color : theme.textSecondary}
      />
      <Text
        className="text-[10px] text-center mt-2"
        style={{ color: unlocked ? theme.text : theme.textSecondary }}
      >
        {title}
      </Text>
      {unlocked && (
        <Ionicons
          name="checkmark-circle"
          size={16}
          color={color}
          style={{ marginTop: 4 }}
        />
      )}
    </View>
  </View>
);

// Add Entry Modal
const AddEntryModal = ({
  theme,
  onClose,
  onAdd,
  sadaqahTypes,
}: {
  theme: any;
  onClose: () => void;
  onAdd: (entry: Omit<SadaqahEntry, "id">) => void;
  sadaqahTypes: SadaqahType[];
}) => {
  const [selectedType, setSelectedType] = useState(sadaqahTypes[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );
  const [mood, setMood] = useState<"happy" | "grateful" | "blessed">(
    "grateful"
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onAdd({
      type: selectedType,
      amount: selectedType.isMonetary ? parseFloat(amount) || 0 : undefined,
      description: description || selectedType.name,
      date: new Date(),
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
      isAnonymous: true,
      mood,
      notes,
    });
    onClose();
  };

  return (
    <View className="rounded-t-3xl">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Type Selection */}
        <Text className="font-semibold mb-3" style={{ color: theme.text }}>
          Select Type
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {sadaqahTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setSelectedType(type)}
              className="mr-3"
            >
              <View
                className="rounded-xl p-3 items-center"
                style={{
                  backgroundColor:
                    selectedType.id === type.id
                      ? type.color + "20"
                      : theme.background,
                  borderWidth: 2,
                  borderColor:
                    selectedType.id === type.id ? type.color : "transparent",
                  minWidth: 80,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: type.color + "30" }}
                >
                  {type.iconType === "material" ? (
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={20}
                      color={type.color}
                    />
                  ) : type.iconType === "font5" ? (
                    <FontAwesome5
                      name={type.icon as any}
                      size={16}
                      color={type.color}
                    />
                  ) : (
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={type.color}
                    />
                  )}
                </View>
                <Text
                  className="text-xs font-semibold text-center"
                  style={{ color: theme.text }}
                >
                  {type.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Amount Input (for monetary) */}
        {selectedType.isMonetary && (
          <View className="mb-4">
            <Text className="font-semibold mb-2" style={{ color: theme.text }}>
              Amount ($)
            </Text>
            <TextInput
              className="rounded-lg p-3"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.accentLight,
              }}
              placeholder="Enter amount..."
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Description */}
        <View className="mb-4">
          <Text className="font-semibold mb-2" style={{ color: theme.text }}>
            Description
          </Text>
          <TextInput
            className="rounded-lg p-3"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight,
            }}
            placeholder={`e.g., ${selectedType.examples[0]}`}
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Mood Selection */}
        <Text className="font-semibold mb-2" style={{ color: theme.text }}>
          How do you feel?
        </Text>
        <View className="flex-row mb-4">
          {[
            { value: "happy" as const, emoji: "😊", label: "Happy" },
            { value: "grateful" as const, emoji: "🙏", label: "Grateful" },
            { value: "blessed" as const, emoji: "✨", label: "Blessed" },
          ].map((m) => (
            <TouchableOpacity
              key={m.value}
              onPress={() => setMood(m.value)}
              className="flex-1 mr-2"
            >
              <View
                className="rounded-lg p-3 items-center"
                style={{
                  backgroundColor:
                    mood === m.value ? theme.primary + "20" : theme.background,
                  borderWidth: 1,
                  borderColor:
                    mood === m.value ? theme.primary : theme.accentLight,
                }}
              >
                <Text className="text-2xl mb-1">{m.emoji}</Text>
                <Text className="text-xs" style={{ color: theme.text }}>
                  {m.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recurring Option */}
        <View
          className="rounded-lg p-3 mb-4"
          style={{
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-semibold" style={{ color: theme.text }}>
              Make it recurring
            </Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: theme.accentLight, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
          {isRecurring && (
            <View className="flex-row">
              {(["daily", "weekly", "monthly"] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  className="flex-1 mr-2"
                >
                  <View
                    className="py-2 rounded items-center"
                    style={{
                      backgroundColor:
                        frequency === f ? theme.primary : theme.background,
                    }}
                  >
                    <Text
                      className="text-xs capitalize"
                      style={{ color: frequency === f ? "#fff" : theme.text }}
                    >
                      {f}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="font-semibold mb-2" style={{ color: theme.text }}>
            Notes (optional)
          </Text>
          <TextInput
            className="rounded-lg p-3"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight,
              minHeight: 60,
            }}
            placeholder="Add any notes..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-white font-bold text-base">Record Sadaqah</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Add Goal Modal (similar structure)
const AddGoalModal = ({
  theme,
  onClose,
  onAdd,
}: {
  theme: any;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, "id" | "createdAt">) => void;
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"monetary" | "actions">("monetary");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetActions, setTargetActions] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [category, setCategory] = useState("General");

  const handleSubmit = () => {
    onAdd({
      title,
      type,
      targetAmount: type === "monetary" ? parseFloat(targetAmount) : undefined,
      targetActions: type === "actions" ? parseInt(targetActions) : undefined,
      currentAmount: 0,
      currentActions: 0,
      deadline,
      category,
      isActive: true,
    });
    onClose();
  };

  return (
    <View>
      {/* Goal form fields */}
      <TextInput
        className="rounded-lg p-3 mb-4"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
        placeholder="Goal title..."
        placeholderTextColor={theme.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => setType("monetary")}
          className="flex-1 mr-2 py-3 rounded-lg items-center"
          style={{
            backgroundColor:
              type === "monetary" ? theme.primary : theme.background,
          }}
        >
          <Text style={{ color: type === "monetary" ? "#fff" : theme.text }}>
            Monetary Goal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setType("actions")}
          className="flex-1 ml-2 py-3 rounded-lg items-center"
          style={{
            backgroundColor:
              type === "actions" ? theme.primary : theme.background,
          }}
        >
          <Text style={{ color: type === "actions" ? "#fff" : theme.text }}>
            Actions Goal
          </Text>
        </TouchableOpacity>
      </View>

      {type === "monetary" ? (
        <TextInput
          className="rounded-lg p-3 mb-4"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
          placeholder="Target amount ($)..."
          placeholderTextColor={theme.textSecondary}
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="numeric"
        />
      ) : (
        <TextInput
          className="rounded-lg p-3 mb-4"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
          placeholder="Number of good deeds..."
          placeholderTextColor={theme.textSecondary}
          value={targetActions}
          onChangeText={setTargetActions}
          keyboardType="numeric"
        />
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        className="py-4 rounded-xl items-center"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="text-white font-bold text-base">Create Goal</Text>
      </TouchableOpacity>
    </View>
  );
};

// Reminders Modal
const RemindersModal = ({
  theme,
  onClose,
  reminders,
  onUpdateReminders,
}: {
  theme: any;
  onClose: () => void;
  reminders: Reminder[];
  onUpdateReminders: (reminders: Reminder[]) => void;
}) => {
  const defaultReminders: Reminder[] = [
    {
      id: "1",
      title: "Morning Sadaqah",
      time: "08:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      type: "daily",
      isActive: false,
    },
    {
      id: "2",
      title: "Friday Charity",
      time: "12:00",
      days: ["Fri"],
      type: "weekly",
      isActive: false,
    },
    {
      id: "3",
      title: "Evening Kindness",
      time: "18:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      type: "daily",
      isActive: false,
    },
  ];

  const [localReminders, setLocalReminders] = useState(
    reminders.length > 0 ? reminders : defaultReminders
  );

  const toggleReminder = (id: string) => {
    const updated = localReminders.map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    setLocalReminders(updated);
  };

  const saveReminders = () => {
    onUpdateReminders(localReminders);
    onClose();
  };

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {localReminders.map((reminder) => (
          <View
            key={reminder.id}
            className="rounded-xl p-4 mb-3"
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: reminder.isActive
                ? theme.primary
                : theme.accentLight,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text
                  className="font-semibold text-base"
                  style={{ color: theme.text }}
                >
                  {reminder.title}
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: theme.textSecondary }}
                >
                  {reminder.time} • {reminder.type}
                </Text>
              </View>
              <Switch
                value={reminder.isActive}
                onValueChange={() => toggleReminder(reminder.id)}
                trackColor={{ false: theme.accentLight, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
            <View className="flex-row flex-wrap">
              {reminder.days.map((day, idx) => (
                <View
                  key={idx}
                  className="mr-2 mb-2 px-2 py-1 rounded"
                  style={{
                    backgroundColor: reminder.isActive
                      ? theme.primary + "20"
                      : theme.background,
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{
                      color: reminder.isActive
                        ? theme.primary
                        : theme.textSecondary,
                    }}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={saveReminders}
        className="mt-4 py-4 rounded-xl items-center"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="text-white font-bold text-base">Save Reminders</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SadaqahReminder;
