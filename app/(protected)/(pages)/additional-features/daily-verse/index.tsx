import Container from "@/components/common/container";
import CustomModal from "@/components/common/customModal";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Types
interface Verse {
  id: string;
  surah: string;
  surahNumber: number;
  surahNameArabic: string;
  verseNumber: number;
  arabic: string;
  translation: string;
  transliteration: string;
  category: string;
  revelation: "Meccan" | "Medinan";
  themes: string[];
  juz: number;
  ruku: number;
  sajdah: boolean;
  wordByWord?: WordByWord[];
  tafsir?: string;
  audioUrl?: string;
  context?: string;
  relatedVerses?: string[];
}

interface WordByWord {
  arabic: string;
  transliteration: string;
  translation: string;
  grammaticalRole?: string;
}

interface SavedVerse extends Verse {
  savedAt: number;
  notes: string;
  isFavorite: boolean;
  tags: string[];
  lastReadAt?: number;
  readCount: number;
  highlightedWords?: number[];
}

interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  totalVersesRead: number;
  totalMinutesRead: number;
  favoriteCategory: string;
  readingGoal: number;
  dailyProgress: number;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  verses: string[];
  icon: string;
  color: string;
  createdAt: number;
  isDefault?: boolean;
}

interface DailyProgress {
  date: string;
  versesRead: number;
  minutesRead: number;
  completed: boolean;
}

// Enhanced Verses Database
const VERSES_DATABASE: Verse[] = [
  {
    id: "2:186",
    surah: "Al-Baqarah",
    surahNumber: 2,
    surahNameArabic: "البقرة",
    verseNumber: 186,
    arabic:
      "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    translation:
      "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    transliteration:
      "Wa itha sa-alaka 'ibadi 'anni fa-inni qarib. Ujibu da'watad-da'i itha da'an",
    category: "Dua & Prayer",
    revelation: "Medinan",
    themes: ["Prayer", "Closeness to Allah", "Hope", "Response"],
    juz: 2,
    ruku: 23,
    sajdah: false,
    context:
      "This verse was revealed when companions asked about Allah's presence during prayer.",
    tafsir:
      "Ibn Kathir mentions that this verse emphasizes Allah's immediate presence and response to sincere supplication...",
    wordByWord: [
      {
        arabic: "وَإِذَا",
        transliteration: "wa-itha",
        translation: "And when",
      },
      {
        arabic: "سَأَلَكَ",
        transliteration: "sa-alaka",
        translation: "they ask you",
      },
      {
        arabic: "عِبَادِي",
        transliteration: "'ibadi",
        translation: "My servants",
      },
      { arabic: "عَنِّي", transliteration: "'anni", translation: "about Me" },
      {
        arabic: "فَإِنِّي",
        transliteration: "fa-inni",
        translation: "then indeed I",
      },
      { arabic: "قَرِيبٌ", transliteration: "qarib", translation: "am near" },
    ],
    relatedVerses: ["40:60", "2:152", "50:16"],
  },
  {
    id: "94:5-6",
    surah: "Al-Inshirah",
    surahNumber: 94,
    surahNameArabic: "الشرح",
    verseNumber: 5,
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation:
      "For indeed, with hardship comes ease. Indeed, with hardship comes ease.",
    transliteration: "Fa inna ma'al 'usri yusra. Inna ma'al 'usri yusra",
    category: "Hope & Patience",
    revelation: "Meccan",
    themes: ["Hope", "Patience", "Trials", "Relief"],
    juz: 30,
    ruku: 1,
    sajdah: false,
    context:
      "Revealed during a difficult period in Makkah to console the Prophet ﷺ",
    relatedVerses: ["2:214", "65:7", "94:1-8"],
  },
  {
    id: "55:13",
    surah: "Ar-Rahman",
    surahNumber: 55,
    surahNameArabic: "الرحمن",
    verseNumber: 13,
    arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    translation: "So which of the favors of your Lord would you deny?",
    transliteration: "Fabi-ayyi ala-i rabbikuma tukadhdhiban",
    category: "Gratitude",
    revelation: "Medinan",
    themes: ["Gratitude", "Blessings", "Reflection", "Recognition"],
    juz: 27,
    ruku: 1,
    sajdah: false,
    context:
      "This verse is repeated 31 times in Surah Ar-Rahman, emphasizing gratitude",
    relatedVerses: ["16:18", "14:34", "93:11"],
  },
];

const VerseOfTheDay = () => {
  const { theme } = useTheme();

  // Core State
  const [currentVerse, setCurrentVerse] = useState<Verse>(VERSES_DATABASE[0]);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [readingStreak, setReadingStreak] = useState<ReadingStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: "",
    totalVersesRead: 0,
    totalMinutesRead: 0,
    favoriteCategory: "Hope & Patience",
    readingGoal: 3,
    dailyProgress: 0,
  });
  const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<"verse" | "saved" | "insights">(
    "verse"
  );
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardFlipAnim = useRef(new Animated.Value(0)).current;

  // Swipe Gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          navigateVerse("previous");
        } else if (gestureState.dx < -50) {
          navigateVerse("next");
        }
      },
    })
  ).current;

  // Load initial data
  useEffect(() => {
    loadData();
    initializeDaily();
    startAnimations();
  }, []);

  // Start entrance animations
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const loadData = async () => {
    try {
      const [verses, cols, streak, progress] = await Promise.all([
        AsyncStorage.getItem("savedVerses"),
        AsyncStorage.getItem("collections"),
        AsyncStorage.getItem("readingStreak"),
        AsyncStorage.getItem("weekProgress"),
      ]);

      if (verses) setSavedVerses(JSON.parse(verses));
      if (cols) setCollections(JSON.parse(cols));
      if (streak) setReadingStreak(JSON.parse(streak));
      if (progress) setWeekProgress(JSON.parse(progress));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const initializeDaily = () => {
    const today = new Date().toDateString();
    const todayIndex = new Date().getDate() % VERSES_DATABASE.length;
    setCurrentVerse(VERSES_DATABASE[todayIndex]);

    // Update streak
    if (readingStreak.lastReadDate !== today) {
      updateStreak();
    }

    // Update daily progress
    updateDailyProgress();
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive =
      readingStreak.lastReadDate === yesterday.toDateString();

    const newStreak: ReadingStreak = {
      ...readingStreak,
      currentStreak: isConsecutive ? readingStreak.currentStreak + 1 : 1,
      longestStreak: Math.max(
        readingStreak.longestStreak,
        isConsecutive ? readingStreak.currentStreak + 1 : 1
      ),
      lastReadDate: today,
      totalVersesRead: readingStreak.totalVersesRead + 1,
      dailyProgress: 1,
    };

    setReadingStreak(newStreak);
    AsyncStorage.setItem("readingStreak", JSON.stringify(newStreak));

    // Animate progress
    Animated.timing(progressAnim, {
      toValue: newStreak.dailyProgress / newStreak.readingGoal,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const updateDailyProgress = () => {
    const today = new Date().toDateString();
    const todayProgress = weekProgress.find((p) => p.date === today);

    if (!todayProgress) {
      const newProgress = [
        ...weekProgress.slice(-6),
        {
          date: today,
          versesRead: 1,
          minutesRead: 0,
          completed: false,
        },
      ];
      setWeekProgress(newProgress);
      AsyncStorage.setItem("weekProgress", JSON.stringify(newProgress));
    }
  };

  const navigateVerse = (direction: "next" | "previous") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const currentIndex = VERSES_DATABASE.findIndex(
      (v) => v.id === currentVerse.id
    );
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % VERSES_DATABASE.length
        : (currentIndex - 1 + VERSES_DATABASE.length) % VERSES_DATABASE.length;

    // Animate transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === "next" ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentVerse(VERSES_DATABASE[newIndex]);
      slideAnim.setValue(direction === "next" ? 50 : -50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const toggleSaveVerse = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate heart
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(heartAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const existingIndex = savedVerses.findIndex(
      (v) => v.id === currentVerse.id
    );

    if (existingIndex >= 0) {
      // Remove from saved
      const updated = savedVerses.filter((v) => v.id !== currentVerse.id);
      setSavedVerses(updated);
      AsyncStorage.setItem("savedVerses", JSON.stringify(updated));
    } else {
      // Add to saved
      const newSaved: SavedVerse = {
        ...currentVerse,
        savedAt: Date.now(),
        notes: "",
        isFavorite: true,
        tags: [],
        readCount: 1,
        lastReadAt: Date.now(),
      };
      const updated = [newSaved, ...savedVerses];
      setSavedVerses(updated);
      AsyncStorage.setItem("savedVerses", JSON.stringify(updated));
    }
  };

  const shareVerse = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await Share.share({
        title: `${currentVerse.surah} - Verse ${currentVerse.verseNumber}`,
        message: `${currentVerse.arabic}\n\n"${currentVerse.translation}"\n\n— Quran ${currentVerse.surahNumber}:${currentVerse.verseNumber} (${currentVerse.surah})\n\nShared via Quran App`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const playAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying(!isPlaying);
    // Implement actual audio playback
  };

  const saveNote = () => {
    if (!noteText.trim()) return;

    const existingIndex = savedVerses.findIndex(
      (v) => v.id === currentVerse.id
    );

    if (existingIndex >= 0) {
      const updated = [...savedVerses];
      updated[existingIndex] = {
        ...updated[existingIndex],
        notes: noteText,
        tags: selectedTags,
      };
      setSavedVerses(updated);
      AsyncStorage.setItem("savedVerses", JSON.stringify(updated));
    } else {
      const newSaved: SavedVerse = {
        ...currentVerse,
        savedAt: Date.now(),
        notes: noteText,
        isFavorite: true,
        tags: selectedTags,
        readCount: 1,
        lastReadAt: Date.now(),
      };
      const updated = [newSaved, ...savedVerses];
      setSavedVerses(updated);
      AsyncStorage.setItem("savedVerses", JSON.stringify(updated));
    }

    setShowNoteModal(false);
    setNoteText("");
    setSelectedTags([]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const isSaved = useMemo(
    () => savedVerses.some((v) => v.id === currentVerse.id),
    [savedVerses, currentVerse]
  );

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.4],
  });

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium Header */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text
                className="text-3xl font-bold mt-1"
                style={{ color: theme.text }}
              >
                Daily Verse
              </Text>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setReadingMode(!readingMode)}
                className="w-10 h-10 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: theme.card }}
              >
                <Ionicons
                  name={readingMode ? "book" : "book-outline"}
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.card }}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Streak & Progress Card */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.accentLight,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: "#f59e0b" + "20" }}
                >
                  <Text className="text-2xl">🔥</Text>
                </View>
                <View>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    {readingStreak.currentStreak}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    Day Streak
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="mr-4">
                  <Text
                    className="text-lg font-bold text-right"
                    style={{ color: theme.primary }}
                  >
                    {readingStreak.dailyProgress}/{readingStreak.readingGoal}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    Daily Goal
                  </Text>
                </View>

                <View>
                  <Text
                    className="text-lg font-bold text-right"
                    style={{ color: theme.text }}
                  >
                    {readingStreak.totalVersesRead}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    Total Read
                  </Text>
                </View>
              </View>
            </View>

            {/* Week Progress */}
            <View className="flex-row justify-between mt-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
                const progress = weekProgress[index];
                const isToday = index === new Date().getDay() - 1;
                const isCompleted = progress?.completed;

                return (
                  <View key={index} className="items-center">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mb-1"
                      style={{
                        backgroundColor: isCompleted
                          ? theme.primary
                          : isToday
                            ? theme.primary + "40"
                            : theme.background,
                        borderWidth: isToday ? 2 : 0,
                        borderColor: theme.primary,
                      }}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      ) : (
                        <Text
                          className="text-xs font-semibold"
                          style={{
                            color: isToday
                              ? theme.primary
                              : theme.textSecondary,
                          }}
                        >
                          {progress?.versesRead || 0}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="text-[10px]"
                      style={{
                        color: isToday ? theme.primary : theme.textSecondary,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Navigation Tabs */}
        <View className="flex-row mb-4">
          {(["verse", "saved", "insights"] as const).map((tab) => (
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
                {tab === "verse" ? "Today's Verse" : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content based on active tab */}
        {activeTab === "verse" && (
          <VerseTab
            verse={currentVerse}
            theme={theme}
            isSaved={isSaved}
            onSave={toggleSaveVerse}
            onShare={shareVerse}
            onPlayAudio={playAudio}
            onShowNotes={() => setShowNoteModal(true)}
            onNavigate={navigateVerse}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            heartAnim={heartAnim}
            glowAnim={glowAnim}
            isPlaying={isPlaying}
            showWordByWord={showWordByWord}
            setShowWordByWord={setShowWordByWord}
            showTafsir={showTafsir}
            setShowTafsir={setShowTafsir}
            fontSize={fontSize}
            setFontSize={setFontSize}
            readingMode={readingMode}
            panResponder={panResponder}
          />
        )}

        {activeTab === "saved" && (
          <SavedTab
            savedVerses={savedVerses}
            collections={collections}
            theme={theme}
            onRemove={(id: any) => {
              const updated = savedVerses.filter((v) => v.id !== id);
              setSavedVerses(updated);
              AsyncStorage.setItem("savedVerses", JSON.stringify(updated));
            }}
          />
        )}

        {activeTab === "insights" && (
          <InsightsTab
            readingStreak={readingStreak}
            savedVerses={savedVerses}
            weekProgress={weekProgress}
            theme={theme}
          />
        )}
      </ScrollView>

      {/* Note Modal */}
      <CustomModal
        visible={showNoteModal}
        variant="bottom"
        onClose={() => setShowNoteModal(false)}
        heading="Add Note"
        description={`${currentVerse.surah} ${currentVerse.verseNumber}`}
      >
        <NoteModal
          theme={theme}
          verse={currentVerse}
          noteText={noteText}
          setNoteText={setNoteText}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          onSave={saveNote}
          onClose={() => {
            setShowNoteModal(false);
            setNoteText("");
            setSelectedTags([]);
          }}
        />
      </CustomModal>
    </Container>
  );
};

// Verse Tab Component
const VerseTab = ({
  verse,
  theme,
  isSaved,
  onSave,
  onShare,
  onPlayAudio,
  onShowNotes,
  onNavigate,
  fadeAnim,
  slideAnim,
  heartAnim,
  glowAnim,
  isPlaying,
  showWordByWord,
  setShowWordByWord,
  showTafsir,
  setShowTafsir,
  fontSize,
  setFontSize,
  readingMode,
  panResponder,
}: any) => {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
      {...panResponder.panHandlers}
    >
      {/* Main Verse Card */}
      <View
        className="rounded-3xl overflow-hidden mb-6"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        {/* Glow Effect */}
        <Animated.View
          className="absolute top-0 right-0"
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: theme.primary,
            opacity: 0.1,
            transform: [{ scale: 1.5 }],
          }}
        />

        {/* Surah Header */}
        <LinearGradient
          colors={[theme.primary + "20", "transparent"]}
          className="px-6 pt-6 pb-4"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center">
                <Text
                  className="text-xl font-bold"
                  style={{ color: theme.text }}
                >
                  {verse.surah}
                </Text>
                <Text
                  className="text-lg ml-2"
                  style={{ color: theme.textSecondary }}
                >
                  {verse.surahNameArabic}
                </Text>
              </View>
              <Text
                className="text-sm mt-1"
                style={{ color: theme.textSecondary }}
              >
                Verse {verse.verseNumber} • {verse.revelation} • Juz {verse.juz}
              </Text>
            </View>

            <View
              className="px-3 py-2 rounded-xl"
              style={{ backgroundColor: theme.primary + "20" }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: theme.primary }}
              >
                {verse.category}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Reading Controls */}
        {readingMode && (
          <View
            className="mx-6 p-3 rounded-xl flex-row items-center justify-between"
            style={{ backgroundColor: theme.background }}
          >
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Font Size
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setFontSize(Math.max(20, fontSize - 2))}
                className="w-8 h-8 rounded items-center justify-center"
                style={{ backgroundColor: theme.card }}
              >
                <Text style={{ color: theme.text }}>A-</Text>
              </TouchableOpacity>
              <Text className="mx-3" style={{ color: theme.text }}>
                {fontSize}
              </Text>
              <TouchableOpacity
                onPress={() => setFontSize(Math.min(40, fontSize + 2))}
                className="w-8 h-8 rounded items-center justify-center"
                style={{ backgroundColor: theme.card }}
              >
                <Text style={{ color: theme.text }}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Arabic Text */}
        <View className="px-6 py-6">
          {verse.sajdah && (
            <View
              className="self-end mb-4 px-3 py-1 rounded-full flex-row items-center"
              style={{ backgroundColor: "#fbbf24" + "20" }}
            >
              <Ionicons name="alert-circle" size={14} color="#fbbf24" />
              <Text className="text-xs ml-1" style={{ color: "#fbbf24" }}>
                Sajdah Verse
              </Text>
            </View>
          )}

          <Text
            className="font-arabic text-right leading-loose"
            style={{
              fontSize: fontSize,
              color: theme.text,
              lineHeight: fontSize * 1.8,
            }}
          >
            {verse.arabic}
          </Text>

          {/* Word by Word */}
          {showWordByWord && verse.wordByWord && (
            <View className="mt-6">
              <Text
                className="text-sm font-bold mb-3"
                style={{ color: theme.text }}
              >
                Word by Word
              </Text>
              <View className="flex-row flex-wrap">
                {verse.wordByWord.map((word: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    className="p-3 m-1 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Text
                      className="text-lg text-center mb-1"
                      style={{ color: theme.text }}
                    >
                      {word.arabic}
                    </Text>
                    <Text
                      className="text-xs text-center"
                      style={{ color: theme.primary }}
                    >
                      {word.transliteration}
                    </Text>
                    <Text
                      className="text-xs text-center"
                      style={{ color: theme.textSecondary }}
                    >
                      {word.translation}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Transliteration */}
          <Text
            className="text-base italic mt-4"
            style={{ color: theme.textSecondary, lineHeight: 24 }}
          >
            {verse.transliteration}
          </Text>

          {/* Translation */}
          <Text
            className="text-lg font-medium mt-4"
            style={{ color: theme.text, lineHeight: 28 }}
          >
            "{verse.translation}"
          </Text>

          {/* Themes */}
          <View className="flex-row flex-wrap mt-4">
            {verse.themes.map((theme: string, index: number) => (
              <View
                key={index}
                className="px-3 py-1 rounded-full mr-2 mb-2"
                // style={{ backgroundColor: theme. }}
              >
                <Text className="text-xs">#{theme}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Context & Tafsir Toggle */}
        <View className="px-6 pb-4">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setShowWordByWord(!showWordByWord)}
              className="flex-1 mr-2 py-2 rounded-lg items-center"
              style={{
                backgroundColor: showWordByWord
                  ? theme.primary
                  : theme.background,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: showWordByWord ? "#fff" : theme.text }}
              >
                Word by Word
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTafsir(!showTafsir)}
              className="flex-1 ml-2 py-2 rounded-lg items-center"
              style={{
                backgroundColor: showTafsir ? theme.primary : theme.background,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: showTafsir ? "#fff" : theme.text }}
              >
                Tafsir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tafsir Section */}
      {showTafsir && (
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="book" size={20} color={theme.primary} />
            <Text className="ml-2 font-bold" style={{ color: theme.text }}>
              Tafsir & Context
            </Text>
          </View>

          {verse.context && (
            <View className="mb-4">
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: theme.textSecondary }}
              >
                HISTORICAL CONTEXT
              </Text>
              <Text
                className="text-sm"
                style={{ color: theme.text, lineHeight: 20 }}
              >
                {verse.context}
              </Text>
            </View>
          )}

          {verse.tafsir && (
            <View>
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: theme.textSecondary }}
              >
                TAFSIR
              </Text>
              <Text
                className="text-sm"
                style={{ color: theme.text, lineHeight: 20 }}
              >
                {verse.tafsir}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Related Verses */}
      {verse.relatedVerses && verse.relatedVerses.length > 0 && (
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <Text className="font-bold mb-3" style={{ color: theme.text }}>
            Related Verses
          </Text>
          {verse.relatedVerses.map((ref: string, index: number) => (
            <TouchableOpacity
              key={index}
              className="py-2 px-3 rounded-lg mb-2 flex-row items-center justify-between"
              style={{ backgroundColor: theme.background }}
            >
              <Text className="text-sm" style={{ color: theme.text }}>
                Quran {ref}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row mb-4">
        <Animated.View
          className="flex-1 mr-2"
          style={{ transform: [{ scale: heartAnim }] }}
        >
          <TouchableOpacity
            onPress={onSave}
            className="py-4 rounded-xl items-center"
            style={{
              backgroundColor: isSaved ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: isSaved ? theme.primary : theme.accentLight,
            }}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? "#fff" : theme.primary}
            />
            <Text
              className="text-xs font-semibold mt-1"
              style={{ color: isSaved ? "#fff" : theme.text }}
            >
              {isSaved ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          onPress={onPlayAudio}
          className="flex-1 mx-2 py-4 rounded-xl items-center"
          style={{
            backgroundColor: isPlaying ? theme.primary : theme.card,
            borderWidth: 1,
            borderColor: isPlaying ? theme.primary : theme.accentLight,
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color={isPlaying ? "#fff" : theme.primary}
          />
          <Text
            className="text-xs font-semibold mt-1"
            style={{ color: isPlaying ? "#fff" : theme.text }}
          >
            {isPlaying ? "Pause" : "Listen"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShare}
          className="flex-1 mx-2 py-4 rounded-xl items-center"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <Ionicons name="share-social" size={24} color={theme.primary} />
          <Text
            className="text-xs font-semibold mt-1"
            style={{ color: theme.text }}
          >
            Share
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShowNotes}
          className="flex-1 ml-2 py-4 rounded-xl items-center"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <Ionicons name="create" size={24} color={theme.primary} />
          <Text
            className="text-xs font-semibold mt-1"
            style={{ color: theme.text }}
          >
            Note
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View className="flex-row mb-6">
        <TouchableOpacity
          onPress={() => onNavigate("previous")}
          className="flex-1 mr-2 py-4 rounded-xl flex-row items-center justify-center"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
          <Text className="ml-2 font-semibold" style={{ color: theme.text }}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate("next")}
          className="flex-1 ml-2 py-4 rounded-xl flex-row items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="mr-2 font-semibold text-white">Next</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Saved Tab Component
const SavedTab = ({ savedVerses, collections, theme, onRemove }: any) => {
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(savedVerses.map((v: SavedVerse) => v.category));
    return ["All", ...Array.from(cats)];
  }, [savedVerses]);

  const filteredVerses = useMemo(() => {
    if (filterCategory === "All") return savedVerses;
    return savedVerses.filter((v: SavedVerse) => v.category === filterCategory);
  }, [savedVerses, filterCategory]);

  return (
    <View>
      {savedVerses.length === 0 ? (
        <View className="items-center py-16">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons
              name="bookmark-outline"
              size={48}
              color={theme.textSecondary}
            />
          </View>
          <Text
            className="text-lg font-bold mb-2"
            style={{ color: theme.text }}
          >
            No Saved Verses
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: theme.textSecondary }}
          >
            Start saving verses to build{"\n"}your personal collection
          </Text>
        </View>
      ) : (
        <>
          {/* Filter Categories */}
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {categories.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setFilterCategory(cat)}
                className="mr-3 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: filterCategory === cat ? theme.primary : theme.card,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: filterCategory === cat ? "#fff" : theme.text }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView> */}

          {/* Collections */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: theme.primary + "10",
              borderWidth: 1,
              borderColor: theme.primary + "30",
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-bold" style={{ color: theme.text }}>
                Collections
              </Text>
              <TouchableOpacity
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-xs font-semibold text-white">
                  Create New
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {collections.length === 0 ? (
                <View
                  className="w-32 h-24 rounded-xl items-center justify-center mr-3"
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: theme.accentLight,
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={theme.textSecondary}
                  />
                  <Text
                    className="text-xs mt-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Add Collection
                  </Text>
                </View>
              ) : (
                collections.map((col: Collection) => (
                  <TouchableOpacity
                    key={col.id}
                    className="w-32 rounded-xl p-3 mr-3"
                    style={{ backgroundColor: theme.card }}
                  >
                    <Text className="text-2xl mb-1">{col.icon}</Text>
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: theme.text }}
                    >
                      {col.name}
                    </Text>
                    <Text
                      className="text-[10px]"
                      style={{ color: theme.textSecondary }}
                    >
                      {col.verses.length} verses
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          {/* Saved Verses List */}
          {filteredVerses.map((verse: SavedVerse, index: number) => (
            <TouchableOpacity
              key={verse.id}
              className="rounded-2xl p-4 mb-3"
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.accentLight,
              }}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text
                    className="font-bold text-base"
                    style={{ color: theme.text }}
                  >
                    {verse.surah} {verse.verseNumber}
                  </Text>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {verse.category} • Read {verse.readCount} times
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onRemove(verse.id)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.background }}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <Text
                className="text-lg text-right mb-3"
                style={{ color: theme.text, lineHeight: 32 }}
              >
                {verse.arabic}
              </Text>

              <Text
                className="text-sm mb-3"
                style={{ color: theme.textSecondary }}
              >
                "{verse.translation}"
              </Text>

              {verse.notes && (
                <View
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: theme.background }}
                >
                  <Text
                    className="text-xs italic"
                    style={{ color: theme.text }}
                  >
                    📝 {verse.notes}
                  </Text>
                </View>
              )}

              {verse.tags && verse.tags.length > 0 && (
                <View className="flex-row flex-wrap mt-3">
                  {verse.tags.map((tag, idx) => (
                    <View
                      key={idx}
                      className="px-2 py-1 rounded mr-2 mb-2"
                      style={{ backgroundColor: theme.primary + "20" }}
                    >
                      <Text
                        className="text-[10px]"
                        style={{ color: theme.primary }}
                      >
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
};

// Insights Tab Component
const InsightsTab = ({
  readingStreak,
  savedVerses,
  weekProgress,
  theme,
}: any) => {
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    savedVerses.forEach((v: SavedVerse) => {
      stats[v.category] = (stats[v.category] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [savedVerses]);

  const totalReadTime = readingStreak.totalMinutesRead;
  const avgPerDay = totalReadTime / Math.max(1, readingStreak.currentStreak);

  return (
    <View>
      {/* Achievement Cards */}
      <View className="flex-row mb-4">
        <View
          className="flex-1 mr-2 rounded-2xl p-4"
          style={{
            backgroundColor: theme.primary,
          }}
        >
          <Text className="text-3xl mb-2">🏆</Text>
          <Text className="text-2xl font-bold text-white mb-1">
            {readingStreak.longestStreak}
          </Text>
          <Text className="text-xs text-white/80">Longest Streak</Text>
        </View>

        <View
          className="flex-1 ml-2 rounded-2xl p-4"
          style={{
            backgroundColor: theme.accent,
          }}
        >
          <Text className="text-3xl mb-2">📖</Text>
          <Text className="text-2xl font-bold text-white mb-1">
            {readingStreak.totalVersesRead}
          </Text>
          <Text className="text-xs text-white/80">Verses Read</Text>
        </View>
      </View>

      {/* Reading Stats */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        <Text
          className="font-bold text-base mb-4"
          style={{ color: theme.text }}
        >
          Reading Statistics
        </Text>

        <View className="flex-row justify-between mb-3">
          <View>
            <Text
              className="text-xs mb-1"
              style={{ color: theme.textSecondary }}
            >
              Total Time
            </Text>
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              {Math.floor(totalReadTime / 60)}h {totalReadTime % 60}m
            </Text>
          </View>

          <View>
            <Text
              className="text-xs mb-1"
              style={{ color: theme.textSecondary }}
            >
              Avg per Day
            </Text>
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              {avgPerDay.toFixed(0)} min
            </Text>
          </View>

          <View>
            <Text
              className="text-xs mb-1"
              style={{ color: theme.textSecondary }}
            >
              Saved Verses
            </Text>
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              {savedVerses.length}
            </Text>
          </View>
        </View>

        {/* Category Distribution */}
        {categoryStats.length > 0 && (
          <View className="mt-4">
            <Text
              className="text-xs font-semibold mb-3"
              style={{ color: theme.textSecondary }}
            >
              FAVORITE CATEGORIES
            </Text>
            {categoryStats.slice(0, 3).map(([category, count]) => (
              <View key={category} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm" style={{ color: theme.text }}>
                    {category}
                  </Text>
                  <Text
                    className="text-sm font-bold"
                    style={{ color: theme.primary }}
                  >
                    {count} verses
                  </Text>
                </View>
                <View
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: theme.background }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: theme.primary,
                      width: `${(count / savedVerses.length) * 100}%`,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Milestones */}
      <View
        className="rounded-2xl p-4"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        <Text
          className="font-bold text-base mb-4"
          style={{ color: theme.text }}
        >
          Milestones
        </Text>

        <View className="flex-row flex-wrap">
          {[
            {
              icon: "🔥",
              title: "7 Day Streak",
              achieved: readingStreak.currentStreak >= 7,
            },
            {
              icon: "📚",
              title: "50 Verses",
              achieved: readingStreak.totalVersesRead >= 50,
            },
            {
              icon: "⭐",
              title: "30 Day Streak",
              achieved: readingStreak.currentStreak >= 30,
            },
            {
              icon: "💎",
              title: "100 Verses",
              achieved: readingStreak.totalVersesRead >= 100,
            },
          ].map((milestone, index) => (
            <View key={index} className="w-1/2 p-2">
              <View
                className="rounded-xl p-3 items-center"
                style={{
                  backgroundColor: milestone.achieved
                    ? theme.primary + "20"
                    : theme.background,
                  opacity: milestone.achieved ? 1 : 0.5,
                }}
              >
                <Text className="text-2xl mb-1">{milestone.icon}</Text>
                <Text
                  className="text-xs text-center"
                  style={{
                    color: milestone.achieved
                      ? theme.primary
                      : theme.textSecondary,
                  }}
                >
                  {milestone.title}
                </Text>
                {milestone.achieved && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.primary}
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Note Modal Component
const NoteModal = ({
  theme,
  verse,
  noteText,
  setNoteText,
  selectedTags,
  setSelectedTags,
  onSave,
  onClose,
}: any) => {
  const suggestedTags = [
    "Reflection",
    "Gratitude",
    "Guidance",
    "Prayer",
    "Wisdom",
    "Hope",
  ];

  return (
    <View
      className="rounded-3xl p-6"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* Note Input */}
      <TextInput
        value={noteText}
        onChangeText={setNoteText}
        placeholder="Write your thoughts, reflections, or insights..."
        placeholderTextColor={theme.textSecondary}
        multiline
        className="rounded-xl p-4 mb-4"
        style={{
          backgroundColor: theme.card,
          color: theme.text,
          minHeight: 120,
          textAlignVertical: "top",
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      />

      {/* Tags */}
      <Text
        className="text-sm font-semibold mb-3"
        style={{ color: theme.text }}
      >
        Add Tags
      </Text>
      <View className="flex-row flex-wrap mb-6">
        {suggestedTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => {
              if (selectedTags.includes(tag)) {
                setSelectedTags(selectedTags.filter((t: string) => t !== tag));
              } else {
                setSelectedTags([...selectedTags, tag]);
              }
            }}
            className="mr-2 mb-2 px-3 py-2 rounded-full"
            style={{
              backgroundColor: selectedTags.includes(tag)
                ? theme.primary
                : theme.card,
              borderWidth: 1,
              borderColor: selectedTags.includes(tag)
                ? theme.primary
                : theme.accentLight,
            }}
          >
            <Text
              className="text-sm"
              style={{
                color: selectedTags.includes(tag) ? "#fff" : theme.text,
              }}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <TouchableOpacity
        onPress={onSave}
        className="ml-2 py-4 rounded-xl items-center"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="font-semibold text-white">Save Note</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerseOfTheDay;
