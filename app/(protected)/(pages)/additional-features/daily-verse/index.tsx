// import CustomModal from "@/components/common/customModal";
// import { useTheme } from "@/hooks/useTheme";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Animated,
//   Pressable,
//   ScrollView,
//   Share,
//   Text,
//   TextInput,
//   Vibration,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // ---- Types ---- //
// interface DailyVerse {
//   id: string; // YYYY-MM-DD
//   arabic: string;
//   translation: string;
//   surah: string;
//   ayahNumber: number;
//   reflection?: string;
//   isFavorite: boolean;
// }

// interface VerseState {
//   verses: DailyVerse[];
//   updatedAt: number;
// }

// const STORAGE_KEY = "VERSE_OF_THE_DAY_V1";

// // ---- Static Verses (you can later fetch dynamically or expand) ---- //
// const VERSES: Omit<DailyVerse, "id" | "isFavorite" | "reflection">[] = [
//   {
//     arabic: "قُلْ لَن يُصِيبَنَا إِلَّا مَا كَتَبَ ٱللَّهُ لَنَا ۚ",
//     translation:
//       "Say: Never will anything happen to us except what Allah has decreed for us.",
//     surah: "At-Tawbah",
//     ayahNumber: 51,
//   },
//   {
//     arabic: "وَإِن تَعُدُّوا نِعْمَتَ ٱللَّهِ لَا تُحْصُوهَا",
//     translation:
//       "And if you should count the favors of Allah, you could not enumerate them.",
//     surah: "Ibrahim",
//     ayahNumber: 34,
//   },
//   {
//     arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
//     translation: "Allah is the Light of the heavens and the earth.",
//     surah: "An-Nur",
//     ayahNumber: 35,
//   },
//   // Add more verses here...
// ];

// // ---- Helpers ---- //
// const formatYMD = (d: Date) =>
//   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate()
//   ).padStart(2, "0")}`;

// const VerseOfTheDayScreen: React.FC = () => {
//   const { theme } = useTheme();

//   const [state, setState] = useState<VerseState | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeVerse, setActiveVerse] = useState<DailyVerse | null>(null);
//   const [showReflectionModal, setShowReflectionModal] = useState(false);
//   const [reflectionDraft, setReflectionDraft] = useState("");

//   // Animation for verse entry
//   const [fadeAnim] = useState(new Animated.Value(0));

//   const todayId = formatYMD(new Date());

//   const persist = useCallback(async (next: VerseState) => {
//     setState(next);
//     try {
//       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
//     } catch {}
//   }, []);

//   // Load initial or generate new
//   useEffect(() => {
//     (async () => {
//       try {
//         const raw = await AsyncStorage.getItem(STORAGE_KEY);
//         if (raw) {
//           const parsed: VerseState = JSON.parse(raw);
//           setState(parsed);

//           const verse = parsed.verses.find((v) => v.id === todayId);
//           if (verse) setActiveVerse(verse);
//           else {
//             const rand = VERSES[Math.floor(Math.random() * VERSES.length)];
//             const fresh: DailyVerse = {
//               id: todayId,
//               ...rand,
//               isFavorite: false,
//             };
//             const updated = { ...parsed, verses: [...parsed.verses, fresh] };
//             await persist(updated);
//             setActiveVerse(fresh);
//           }
//           setLoading(false);
//           return;
//         }
//       } catch {}

//       // Initialize fresh
//       const rand = VERSES[Math.floor(Math.random() * VERSES.length)];
//       const fresh: DailyVerse = {
//         id: todayId,
//         ...rand,
//         isFavorite: false,
//       };
//       const init: VerseState = { verses: [fresh], updatedAt: Date.now() };
//       await persist(init);
//       setActiveVerse(fresh);
//       setLoading(false);
//     })();
//   }, [persist, todayId]);

//   const favoriteToggle = useCallback(async () => {
//     if (!state || !activeVerse) return;
//     const updatedVerses = state.verses.map((v) =>
//       v.id === activeVerse.id ? { ...v, isFavorite: !v.isFavorite } : v
//     );
//     Vibration.vibrate(20);
//     await persist({ ...state, verses: updatedVerses });
//     setActiveVerse(updatedVerses.find((v) => v.id === activeVerse.id)!);
//   }, [state, activeVerse, persist]);

//   const handleShare = useCallback(() => {
//     if (!activeVerse) return;
//     const text = `📖 ${activeVerse.surah} ${activeVerse.ayahNumber}\n\n${activeVerse.arabic}\n\n"${activeVerse.translation}"`;
//     Share.share({ message: text });
//   }, [activeVerse]);

//   const openReflectionModal = useCallback(() => {
//     if (!activeVerse) return;
//     setReflectionDraft(activeVerse.reflection ?? "");
//     setShowReflectionModal(true);
//   }, [activeVerse]);

//   const saveReflection = useCallback(async () => {
//     if (!state || !activeVerse) return;
//     const updatedVerses = state.verses.map((v) =>
//       v.id === activeVerse.id ? { ...v, reflection: reflectionDraft } : v
//     );
//     await persist({ ...state, verses: updatedVerses });
//     setActiveVerse(updatedVerses.find((v) => v.id === activeVerse.id)!);
//     setShowReflectionModal(false);
//   }, [state, activeVerse, reflectionDraft, persist]);

//   // Animate entry on verse change
//   useEffect(() => {
//     if (activeVerse) {
//       fadeAnim.setValue(0);
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [activeVerse, fadeAnim]);

//   if (loading || !activeVerse) {
//     return (
//       <SafeAreaView
//         className="flex-1 items-center justify-center"
//         style={{ backgroundColor: theme.background }}
//       >
//         <ActivityIndicator size="large" color={theme.primary} />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       className="flex-1"
//       style={{ backgroundColor: theme.background }}
//     >
//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
//         {/* Header */}
//         <View className="flex-row items-center justify-between mb-4">
//           <View>
//             <Text className="text-xs" style={{ color: theme.textSecondary }}>
//               Verse of the Day
//             </Text>
//             <Text
//               className="text-2xl font-bold mt-1"
//               style={{ color: theme.text }}
//             >
//               {activeVerse.surah} – {activeVerse.ayahNumber}
//             </Text>
//           </View>
//           <Pressable
//             onPress={favoriteToggle}
//             className="w-10 h-10 rounded-full items-center justify-center"
//             style={{ backgroundColor: theme.card }}
//           >
//             <Ionicons
//               name={activeVerse.isFavorite ? "heart" : "heart-outline"}
//               size={22}
//               color={activeVerse.isFavorite ? "#ef4444" : theme.text}
//             />
//           </Pressable>
//         </View>

//         {/* Verse Content */}
//         <Animated.View style={{ opacity: fadeAnim }}>
//           <View
//             className="rounded-2xl p-6 mb-6 border"
//             style={{
//               borderColor: theme.accentLight ?? "#ffffff22",
//               backgroundColor: theme.card,
//             }}
//           >
//             <Text
//               className="text-2xl font-semibold"
//               style={{ color: theme.text, lineHeight: 36 }}
//             >
//               {activeVerse.arabic}
//             </Text>
//             <Text
//               className="mt-4 text-base"
//               style={{ color: theme.textSecondary }}
//             >
//               {activeVerse.translation}
//             </Text>
//             <Text
//               className="mt-4 text-xs"
//               style={{ color: theme.textSecondary }}
//             >
//               – {activeVerse.surah} {activeVerse.ayahNumber}
//             </Text>
//           </View>
//         </Animated.View>

//         {/* Actions */}
//         <View className="flex-row gap-3">
//           <Pressable
//             onPress={handleShare}
//             className="flex-1 py-4 rounded-2xl items-center border"
//             style={{
//               borderColor: theme.accentLight ?? "#ffffff22",
//               backgroundColor: theme.card,
//             }}
//           >
//             <Ionicons name="share-outline" size={18} color={theme.text} />
//             <Text
//               className="mt-1 text-xs font-semibold"
//               style={{ color: theme.text }}
//             >
//               Share
//             </Text>
//           </Pressable>

//           <Pressable
//             onPress={openReflectionModal}
//             className="flex-1 py-4 rounded-2xl items-center border"
//             style={{
//               borderColor: theme.accentLight ?? "#ffffff22",
//               backgroundColor: theme.card,
//             }}
//           >
//             <Ionicons name="create-outline" size={18} color={theme.text} />
//             <Text
//               className="mt-1 text-xs font-semibold"
//               style={{ color: theme.text }}
//             >
//               {activeVerse.reflection ? "Edit Reflection" : "Add Reflection"}
//             </Text>
//           </Pressable>
//         </View>
//       </ScrollView>

//       {/* Reflection Modal */}
//       <CustomModal
//         visible={showReflectionModal}
//         onClose={() => setShowReflectionModal(false)}
//         heading="Reflection"
//         description={`${activeVerse.surah} ${activeVerse.ayahNumber}`}
//         variant="bottom"
//       >
//         <View>
//           <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
//             What does this verse mean to you today?
//           </Text>
//           <TextInput
//             value={reflectionDraft}
//             onChangeText={setReflectionDraft}
//             placeholder="Type your reflection..."
//             placeholderTextColor={theme.textSecondary}
//             multiline
//             className="p-4 rounded-xl mb-3"
//             style={{
//               minHeight: 120,
//               backgroundColor: theme.background,
//               color: theme.text,
//               borderWidth: 1,
//               borderColor: theme.accentLight ?? "#ffffff22",
//               textAlignVertical: "top",
//             }}
//           />
//           <Pressable
//             onPress={saveReflection}
//             className="py-4 rounded-xl items-center"
//             style={{ backgroundColor: theme.primary }}
//           >
//             <Text className="font-semibold" style={{ color: "#fff" }}>
//               Save Reflection
//             </Text>
//           </Pressable>
//         </View>
//       </CustomModal>
//     </SafeAreaView>
//   );
// };

// export default VerseOfTheDayScreen;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";

// Mock theme hook
const useTheme = () => ({
  theme: {
    background: "#0a0a0a",
    card: "#1a1a1a",
    text: "#ffffff",
    textSecondary: "#a0a0a0",
    primary: "#10b981",
    accent: "#8b5cf6",
    accentLight: "#ffffff22",
    error: "#ef4444",
  },
});

// Types
interface Verse {
  id: string;
  surah: string;
  surahNumber: number;
  verseNumber: number;
  arabic: string;
  translation: string;
  transliteration: string;
  category: string;
  revelation: "Meccan" | "Medinan";
  theme: string[];
}

interface SavedVerse extends Verse {
  savedAt: number;
  notes: string;
  isFavorite: boolean;
}

interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  totalVersesRead: number;
}

// Mock verse data
const VERSES: Verse[] = [
  {
    id: "1",
    surah: "Al-Baqarah",
    surahNumber: 2,
    verseNumber: 186,
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    translation:
      "And when My servants ask you concerning Me, indeed I am near.",
    transliteration: "Wa itha sa-alaka 'ibadi 'anni fa-inni qarib",
    category: "Dua & Prayer",
    revelation: "Medinan",
    theme: ["Prayer", "Closeness to Allah", "Hope"],
  },
  {
    id: "2",
    surah: "Ar-Rahman",
    surahNumber: 55,
    verseNumber: 13,
    arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    translation: "So which of the favors of your Lord would you deny?",
    transliteration: "Fabi-ayyi ala-i rabbikuma tukaththiban",
    category: "Gratitude",
    revelation: "Medinan",
    theme: ["Gratitude", "Blessings", "Reflection"],
  },
  {
    id: "3",
    surah: "Al-Inshirah",
    surahNumber: 94,
    verseNumber: 6,
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    transliteration: "Inna ma'al 'usri yusra",
    category: "Hope & Patience",
    revelation: "Meccan",
    theme: ["Hope", "Patience", "Trials"],
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VerseOfDayScreen: React.FC = () => {
  const { theme } = useTheme();

  // State
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [readingStreak, setReadingStreak] = useState<ReadingStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: "",
    totalVersesRead: 0,
  });
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [heartAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  // Current verse
  const currentVerse = useMemo(
    () => VERSES[currentVerseIndex],
    [currentVerseIndex]
  );

  // Check if current verse is saved
  const isSaved = useMemo(
    () => savedVerses.some((v) => v.id === currentVerse.id),
    [savedVerses, currentVerse.id]
  );

  // Initialize reading streak
  useEffect(() => {
    const today = new Date().toDateString();
    const lastRead = readingStreak.lastReadDate;

    if (lastRead !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = lastRead === yesterday.toDateString();

      setReadingStreak((prev) => ({
        currentStreak: isConsecutive ? prev.currentStreak + 1 : 1,
        longestStreak: Math.max(
          prev.longestStreak,
          isConsecutive ? prev.currentStreak + 1 : 1
        ),
        lastReadDate: today,
        totalVersesRead: prev.totalVersesRead + 1,
      }));
    }
  }, []);

  // Glow animation loop
  useEffect(() => {
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
    ).start();
  }, []);

  // Slide animation for verse change
  const animateVerseChange = useCallback(
    (direction: "left" | "right") => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: direction === "left" ? -50 : 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentVerseIndex((prev) =>
          direction === "left"
            ? (prev + 1) % VERSES.length
            : (prev - 1 + VERSES.length) % VERSES.length
        );

        slideAnim.setValue(direction === "left" ? 50 : -50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim]
  );

  // Heart animation
  const animateHeart = useCallback(() => {
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heartAnim]);

  // Save/Unsave verse
  const handleSaveVerse = useCallback(() => {
    Vibration.vibrate(10);
    animateHeart();

    if (isSaved) {
      setSavedVerses((prev) => prev.filter((v) => v.id !== currentVerse.id));
    } else {
      const savedVerse: SavedVerse = {
        ...currentVerse,
        savedAt: Date.now(),
        notes: "",
        isFavorite: true,
      };
      setSavedVerses((prev) => [savedVerse, ...prev]);
    }
  }, [isSaved, currentVerse, animateHeart]);

  // Share verse
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${currentVerse.arabic}\n\n"${currentVerse.translation}"\n\n- Quran ${currentVerse.surahNumber}:${currentVerse.verseNumber} (${currentVerse.surah})`,
      });
    } catch (error) {
      console.error(error);
    }
  }, [currentVerse]);

  // Play audio (mock)
  const handlePlayAudio = useCallback(() => {
    setAudioPlaying((prev) => !prev);
    Vibration.vibrate(10);
  }, []);

  // Save note
  const handleSaveNote = useCallback(() => {
    setSavedVerses((prev) =>
      prev.map((v) =>
        v.id === currentVerse.id ? { ...v, notes: noteText } : v
      )
    );
    setShowNotes(false);
    setNoteText("");
    Vibration.vibrate(10);
  }, [currentVerse.id, noteText]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: 60,
        }}
      >
        {/* Header with Streak */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: theme.text,
                  marginTop: 4,
                }}
              >
                Verse of the Day
              </Text>
            </View>

            <Pressable
              onPress={() => setShowSaved(!showSaved)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.card,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>📖</Text>
              {savedVerses.length > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: theme.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 10, fontWeight: "bold", color: "#fff" }}
                  >
                    {savedVerses.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Streak Card */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.accentLight,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 32, marginRight: 8 }}>🔥</Text>
                <View>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: theme.primary,
                    }}
                  >
                    {readingStreak.currentStreak}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                    Day Streak
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.text,
                  }}
                >
                  {readingStreak.totalVersesRead}
                </Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                  Verses Read
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Verse Card */}
        {!showSaved ? (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 24,
                padding: 24,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: theme.accentLight,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow Effect */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: -100,
                  right: -100,
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  backgroundColor: theme.primary,
                  opacity: glowOpacity,
                }}
              />

              {/* Surah Info */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.text,
                    }}
                  >
                    {currentVerse.surah}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Verse {currentVerse.verseNumber} • {currentVerse.revelation}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: theme.primary + "22",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: theme.primary,
                    }}
                  >
                    {currentVerse.category}
                  </Text>
                </View>
              </View>

              {/* Arabic Text */}
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: theme.text,
                  textAlign: "right",
                  lineHeight: 56,
                  marginBottom: 24,
                }}
              >
                {currentVerse.arabic}
              </Text>

              {/* Transliteration */}
              <Text
                style={{
                  fontSize: 14,
                  fontStyle: "italic",
                  color: theme.textSecondary,
                  marginBottom: 16,
                  lineHeight: 22,
                }}
              >
                {currentVerse.transliteration}
              </Text>

              {/* Translation */}
              <Text
                style={{
                  fontSize: 18,
                  color: theme.text,
                  lineHeight: 28,
                  fontWeight: "500",
                }}
              >
                "{currentVerse.translation}"
              </Text>

              {/* Themes */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 20,
                  gap: 8,
                }}
              >
                {currentVerse.theme.map((t) => (
                  <View
                    key={t}
                    style={{
                      backgroundColor: theme.background,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                <Pressable
                  onPress={handleSaveVerse}
                  style={{
                    flex: 1,
                    backgroundColor: isSaved ? theme.primary : theme.card,
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: theme.accentLight,
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>
                    {isSaved ? "❤️" : "🤍"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isSaved ? "#fff" : theme.text,
                    }}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </Text>
                </Pressable>
              </Animated.View>

              <Pressable
                onPress={handlePlayAudio}
                style={{
                  flex: 1,
                  backgroundColor: theme.card,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.accentLight,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>
                  {audioPlaying ? "⏸️" : "▶️"}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: theme.text,
                  }}
                >
                  Listen
                </Text>
              </Pressable>

              <Pressable
                onPress={handleShare}
                style={{
                  flex: 1,
                  backgroundColor: theme.card,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.accentLight,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>📤</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: theme.text,
                  }}
                >
                  Share
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowNotes(true)}
                style={{
                  flex: 1,
                  backgroundColor: theme.card,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.accentLight,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>📝</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: theme.text,
                  }}
                >
                  Notes
                </Text>
              </Pressable>
            </View>

            {/* Navigation */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => animateVerseChange("right")}
                style={{
                  flex: 1,
                  backgroundColor: theme.card,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: theme.accentLight,
                }}
              >
                <Text style={{ fontSize: 20 }}>←</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.text,
                  }}
                >
                  Previous
                </Text>
              </Pressable>

              <Pressable
                onPress={() => animateVerseChange("left")}
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  Next
                </Text>
                <Text style={{ fontSize: 20 }}>→</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          /* Saved Verses List */
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: theme.text,
                }}
              >
                Saved Verses ({savedVerses.length})
              </Text>
              <Pressable
                onPress={() => setShowSaved(false)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: theme.card,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Back
                </Text>
              </Pressable>
            </View>

            {savedVerses.length === 0 ? (
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 16,
                  padding: 40,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📚</Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.textSecondary,
                    textAlign: "center",
                  }}
                >
                  No saved verses yet{"\n"}Start saving your favorites!
                </Text>
              </View>
            ) : (
              savedVerses.map((verse) => (
                <Pressable
                  key={verse.id}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: theme.accentLight,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.text,
                      }}
                    >
                      {verse.surah} {verse.verseNumber}
                    </Text>
                    <Text style={{ fontSize: 16 }}>❤️</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      color: theme.text,
                      textAlign: "right",
                      marginBottom: 8,
                    }}
                  >
                    {verse.arabic}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.textSecondary,
                      lineHeight: 20,
                    }}
                  >
                    "{verse.translation}"
                  </Text>
                  {verse.notes && (
                    <View
                      style={{
                        marginTop: 12,
                        backgroundColor: theme.background,
                        padding: 12,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.textSecondary,
                          fontStyle: "italic",
                        }}
                      >
                        📝 {verse.notes}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Notes Modal */}
      {showNotes && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 16,
              }}
            >
              Add Note
            </Text>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Write your thoughts..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                padding: 16,
                borderRadius: 12,
                fontSize: 14,
                minHeight: 120,
                textAlignVertical: "top",
                marginBottom: 16,
              }}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => {
                  setShowNotes(false);
                  setNoteText("");
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: theme.background,
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveNote}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: theme.primary,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Save Note
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default VerseOfDayScreen;
