import CustomModal from "@/components/common/customModal";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface FiqhCard {
  id: string;
  category: FiqhCategory;
  question: string;
  answer: string;
  ruling: FiqhRuling;
  madhab?: string;
  evidence?: string;
  tags: string[];
  bookmarked: boolean;
}

type FiqhCategory =
  | "prayer"
  | "fasting"
  | "zakaat"
  | "hajj"
  | "purification"
  | "marriage"
  | "business"
  | "diet"
  | "inheritance"
  | "general";

type FiqhRuling =
  | "fard"
  | "wajib"
  | "sunnah"
  | "mustahabb"
  | "mubah"
  | "makruh"
  | "haram";

interface CategoryInfo {
  label: string;
  icon: string;
  color: string;
  description: string;
}

interface RulingInfo {
  label: string;
  color: string;
  description: string;
}

const CATEGORIES: Record<FiqhCategory, CategoryInfo> = {
  prayer: {
    label: "Prayer (Salah)",
    icon: "moon-outline",
    color: "#8b5cf6",
    description: "Rulings about daily prayers",
  },
  fasting: {
    label: "Fasting (Sawm)",
    icon: "sunny-outline",
    color: "#f59e0b",
    description: "Ramadan and voluntary fasting",
  },
  zakaat: {
    label: "Zakaat & Charity",
    icon: "heart-outline",
    color: "#10b981",
    description: "Obligatory and voluntary charity",
  },
  hajj: {
    label: "Hajj & Umrah",
    icon: "navigate-circle-outline",
    color: "#06b6d4",
    description: "Pilgrimage rituals and rulings",
  },
  purification: {
    label: "Purification (Taharah)",
    icon: "water-outline",
    color: "#3b82f6",
    description: "Wudu, ghusl, and cleanliness",
  },
  marriage: {
    label: "Marriage & Family",
    icon: "people-outline",
    color: "#ec4899",
    description: "Marriage, divorce, and family law",
  },
  business: {
    label: "Business & Finance",
    icon: "briefcase-outline",
    color: "#14b8a6",
    description: "Trade, contracts, and transactions",
  },
  diet: {
    label: "Food & Dietary Laws",
    icon: "restaurant-outline",
    color: "#f97316",
    description: "Halal, haram foods and practices",
  },
  inheritance: {
    label: "Inheritance",
    icon: "git-branch-outline",
    color: "#6366f1",
    description: "Estate distribution and wills",
  },
  general: {
    label: "General Fiqh",
    icon: "book-outline",
    color: "#64748b",
    description: "Miscellaneous Islamic rulings",
  },
};

const RULINGS: Record<FiqhRuling, RulingInfo> = {
  fard: {
    label: "Fard (Obligatory)",
    color: "#dc2626",
    description: "Must be done; sin to abandon",
  },
  wajib: {
    label: "Wajib (Required)",
    color: "#ea580c",
    description: "Strongly required",
  },
  sunnah: {
    label: "Sunnah",
    color: "#16a34a",
    description: "Prophetic practice; rewarded",
  },
  mustahabb: {
    label: "Mustahabb (Recommended)",
    color: "#65a30d",
    description: "Recommended; rewarded",
  },
  mubah: {
    label: "Mubah (Permissible)",
    color: "#0891b2",
    description: "Neutral; no reward or sin",
  },
  makruh: {
    label: "Makruh (Disliked)",
    color: "#ca8a04",
    description: "Disliked but not sinful",
  },
  haram: {
    label: "Haram (Forbidden)",
    color: "#991b1b",
    description: "Prohibited; sinful to do",
  },
};

// Sample Data
const SAMPLE_CARDS: FiqhCard[] = [
  {
    id: "1",
    category: "prayer",
    question: "Can I pray while wearing shoes?",
    answer:
      "Yes, it is permissible to pray while wearing shoes, provided they are clean and free from impurities (najasah). The Prophet ﷺ prayed in his sandals and encouraged others to differ from the Jews who did not pray in their footwear.",
    ruling: "mubah",
    madhab: "All madhabs",
    evidence:
      "Abu Sa'id al-Khudri reported that the Prophet ﷺ led them in prayer while wearing his sandals.",
    tags: ["prayer", "clothing", "sunnah"],
    bookmarked: false,
  },
  {
    id: "2",
    category: "fasting",
    question: "Does using toothpaste break the fast?",
    answer:
      "Using toothpaste does not break the fast as long as nothing is swallowed. However, it is better to use a miswak or brush without paste to avoid the risk of swallowing. If toothpaste is accidentally swallowed, scholars differ on whether the fast is broken.",
    ruling: "makruh",
    madhab: "Majority opinion",
    tags: ["fasting", "ramadan", "hygiene"],
    bookmarked: true,
  },
  {
    id: "3",
    category: "zakaat",
    question: "Is zakaat due on personal residence?",
    answer:
      "No, zakaat is not due on your primary residence (the house you live in), regardless of its value. Zakaat is only due on wealth intended for growth and trade, not on personal use items.",
    ruling: "fard",
    madhab: "All madhabs",
    evidence:
      "Zakaat is due on gold, silver, trade goods, and livestock that reach nisab and are held for one year.",
    tags: ["zakaat", "property", "wealth"],
    bookmarked: false,
  },
  {
    id: "4",
    category: "purification",
    question: "Can I do wudu with socks on?",
    answer:
      "Yes, you can wipe over your socks (masah) instead of washing your feet, provided: 1) You put the socks on while in a state of wudu, 2) They are khuffain (leather socks) or thick socks that cover the ankles, 3) The time limit hasn't expired (1 day for residents, 3 days for travelers).",
    ruling: "sunnah",
    madhab: "All madhabs",
    evidence:
      "Al-Mughirah ibn Shu'bah reported that the Prophet ﷺ wiped over his leather socks.",
    tags: ["wudu", "purification", "travel"],
    bookmarked: false,
  },
  {
    id: "5",
    category: "diet",
    question: "Is it permissible to eat food cooked by non-Muslims?",
    answer:
      "Yes, it is generally permissible to eat food prepared by non-Muslims (People of the Book or others) as long as: 1) The food itself is halal, 2) It doesn't contain haram ingredients, 3) It wasn't cooked in vessels used for pork or alcohol. However, one should verify the ingredients when possible.",
    ruling: "mubah",
    madhab: "Majority opinion",
    tags: ["food", "halal", "social"],
    bookmarked: false,
  },
];

const FiqhLookupScreen: React.FC = () => {
  const { theme } = useTheme();

  // State
  const [cards, setCards] = useState<FiqhCard[]>(SAMPLE_CARDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    FiqhCategory | "all"
  >("all");
  const [selectedCard, setSelectedCard] = useState<FiqhCard | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedRuling, setSelectedRuling] = useState<FiqhRuling | "all">(
    "all"
  );

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filtered cards
  const filteredCards = useMemo(() => {
    let result = cards;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (card) =>
          card.question.toLowerCase().includes(query) ||
          card.answer.toLowerCase().includes(query) ||
          card.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((card) => card.category === selectedCategory);
    }

    // Ruling filter
    if (selectedRuling !== "all") {
      result = result.filter((card) => card.ruling === selectedRuling);
    }

    // Bookmarks filter
    if (showBookmarksOnly) {
      result = result.filter((card) => card.bookmarked);
    }

    return result;
  }, [cards, searchQuery, selectedCategory, selectedRuling, showBookmarksOnly]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: cards.length,
      bookmarked: cards.filter((c) => c.bookmarked).length,
      byCategory: Object.keys(CATEGORIES).reduce(
        (acc, cat) => {
          acc[cat as FiqhCategory] = cards.filter(
            (c) => c.category === cat
          ).length;
          return acc;
        },
        {} as Record<FiqhCategory, number>
      ),
    };
  }, [cards]);

  // Toggle bookmark
  const toggleBookmark = useCallback((id: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, bookmarked: !card.bookmarked } : card
      )
    );
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedRuling("all");
    setShowBookmarksOnly(false);
  }, []);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedRuling !== "all") count++;
    if (showBookmarksOnly) count++;
    return count;
  }, [selectedCategory, selectedRuling, showBookmarksOnly]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Islamic Jurisprudence
            </Text>
            <Text
              className="text-2xl font-bold mt-1"
              style={{ color: theme.text }}
            >
              Fiqh Lookup
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: showBookmarksOnly
                  ? theme.primary + "33"
                  : theme.card,
              }}
            >
              <Ionicons
                name={showBookmarksOnly ? "bookmark" : "bookmark-outline"}
                size={20}
                color={showBookmarksOnly ? theme.primary : theme.text}
              />
            </Pressable>
            <Pressable
              onPress={() => setShowFilters(true)}
              className="w-10 h-10 rounded-full items-center justify-center relative"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="filter-outline" size={20} color={theme.text} />
              {activeFiltersCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Text className="text-xs font-bold text-white">
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View
          className="flex-row items-center px-4 py-3 rounded-2xl"
          style={{ backgroundColor: theme.card }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.textSecondary}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search fiqh questions..."
            placeholderTextColor={theme.textSecondary}
            className="flex-1 ml-3"
            style={{ color: theme.text, fontSize: 15 }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {/* Quick Stats */}
        <Animated.View
          className="flex-row gap-3 mt-4"
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View
            className="flex-1 p-3 rounded-xl"
            style={{ backgroundColor: theme.card }}
          >
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Total Cards
            </Text>
            <Text
              className="text-2xl font-bold mt-1"
              style={{ color: theme.text }}
            >
              {stats.total}
            </Text>
          </View>
          <View
            className="flex-1 p-3 rounded-xl"
            style={{ backgroundColor: theme.card }}
          >
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Bookmarked
            </Text>
            <Text
              className="text-2xl font-bold mt-1"
              style={{ color: theme.primary }}
            >
              {stats.bookmarked}
            </Text>
          </View>
          <View
            className="flex-1 p-3 rounded-xl"
            style={{ backgroundColor: theme.card }}
          >
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Filtered
            </Text>
            <Text
              className="text-2xl font-bold mt-1"
              style={{ color: theme.text }}
            >
              {filteredCards.length}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Cards List */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedCard(item)} className="mb-3">
            <Animated.View
              className="rounded-2xl border p-4"
              style={{
                borderColor: theme.accentLight ?? "#ffffff22",
                backgroundColor: theme.card,
                opacity: fadeAnim,
              }}
            >
              {/* Header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="px-2 py-1 rounded-md mr-2"
                      style={{
                        backgroundColor: CATEGORIES[item.category].color + "22",
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: CATEGORIES[item.category].color }}
                      >
                        {CATEGORIES[item.category].label}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: RULINGS[item.ruling].color + "22",
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: RULINGS[item.ruling].color }}
                      >
                        {RULINGS[item.ruling].label.split(" ")[0]}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-base font-bold leading-6"
                    style={{ color: theme.text }}
                  >
                    {item.question}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggleBookmark(item.id)}
                  className="p-2"
                >
                  <Ionicons
                    name={item.bookmarked ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color={
                      item.bookmarked ? theme.primary : theme.textSecondary
                    }
                  />
                </Pressable>
              </View>

              {/* Answer Preview */}
              <Text
                className="leading-6 mb-3"
                numberOfLines={2}
                style={{ color: theme.textSecondary }}
              >
                {item.answer}
              </Text>

              {/* Footer */}
              <View
                className="flex-row items-center justify-between pt-3 border-t"
                style={{ borderTopColor: theme.background }}
              >
                <View className="flex-row flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <View
                      key={tag}
                      className="px-2 py-1 rounded-md"
                      style={{ backgroundColor: theme.background }}
                    >
                      <Text
                        className="text-xs"
                        style={{ color: theme.textSecondary }}
                      >
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.textSecondary}
                />
              </View>
            </Animated.View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-12">
            <Ionicons
              name="search-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text
              className="text-lg font-semibold mt-4"
              style={{ color: theme.text }}
            >
              No cards found
            </Text>
            <Text
              className="text-center mt-2 px-8"
              style={{ color: theme.textSecondary }}
            >
              Try adjusting your search or filters
            </Text>
            {activeFiltersCount > 0 && (
              <Pressable
                onPress={clearFilters}
                className="mt-4 px-6 py-3 rounded-xl"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="font-semibold" style={{ color: "#fff" }}>
                  Clear Filters
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {/* Card Detail Modal */}
      <CustomModal
        visible={selectedCard !== null}
        variant="bottom"
        onClose={() => setSelectedCard(null)}
      >
        <View className="rounded-t-3xl">
          {selectedCard && (
            <>
              {/* Modal Header */}
              <View className="flex-row items-center justify-between pb-4">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="px-3 py-1 rounded-lg mr-2"
                      style={{
                        backgroundColor:
                          CATEGORIES[selectedCard.category].color + "22",
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color: CATEGORIES[selectedCard.category].color,
                        }}
                      >
                        {CATEGORIES[selectedCard.category].label}
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-lg"
                      style={{
                        backgroundColor:
                          RULINGS[selectedCard.ruling].color + "22",
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: RULINGS[selectedCard.ruling].color }}
                      >
                        {RULINGS[selectedCard.ruling].label}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => toggleBookmark(selectedCard.id)}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Ionicons
                      name={
                        selectedCard.bookmarked
                          ? "bookmark"
                          : "bookmark-outline"
                      }
                      size={22}
                      color={
                        selectedCard.bookmarked ? theme.primary : theme.text
                      }
                    />
                  </Pressable>
                </View>
              </View>

              {/* Modal Content */}
              <ScrollView className="mb-2" showsVerticalScrollIndicator={false}>
                {/* Question */}
                <Text
                  className="text-2xl font-bold mb-4 leading-9"
                  style={{ color: theme.text }}
                >
                  {selectedCard.question}
                </Text>

                {/* Answer */}
                <View
                  className="p-4 rounded-xl mb-4"
                  style={{ backgroundColor: theme.background }}
                >
                  <Text
                    className="text-sm font-semibold mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Answer
                  </Text>
                  <Text
                    className="leading-7 text-base"
                    style={{ color: theme.text }}
                  >
                    {selectedCard.answer}
                  </Text>
                </View>

                {/* Ruling Info */}
                <View
                  className="p-4 rounded-xl mb-4"
                  style={{
                    backgroundColor: RULINGS[selectedCard.ruling].color + "11",
                  }}
                >
                  <Text
                    className="text-sm font-semibold mb-1"
                    style={{ color: RULINGS[selectedCard.ruling].color }}
                  >
                    {RULINGS[selectedCard.ruling].label}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {RULINGS[selectedCard.ruling].description}
                  </Text>
                </View>

                {/* Madhab */}
                {selectedCard.madhab && (
                  <View className="mb-4">
                    <Text
                      className="text-sm font-semibold mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Madhab
                    </Text>
                    <View
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: theme.background }}
                    >
                      <Text style={{ color: theme.text }}>
                        {selectedCard.madhab}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Evidence */}
                {selectedCard.evidence && (
                  <View className="mb-4">
                    <Text
                      className="text-sm font-semibold mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Evidence
                    </Text>
                    <View
                      className="p-4 rounded-xl border-l-4"
                      style={{
                        backgroundColor: theme.background,
                        borderLeftColor: theme.primary,
                      }}
                    >
                      <Text
                        className="leading-6 italic"
                        style={{ color: theme.text }}
                      >
                        {selectedCard.evidence}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Tags */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Related Topics
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedCard.tags.map((tag) => (
                      <View
                        key={tag}
                        className="px-3 py-2 rounded-lg"
                        style={{ backgroundColor: theme.background }}
                      >
                        <Text style={{ color: theme.text }}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Disclaimer */}
                <View
                  className="mt-6 p-4 rounded-xl"
                  style={{ backgroundColor: theme.primary + "11" }}
                >
                  <Text
                    className="text-xs font-semibold mb-2"
                    style={{ color: theme.primary }}
                  >
                    ⚠️ Important Note
                  </Text>
                  <Text
                    className="text-xs leading-5"
                    style={{ color: theme.textSecondary }}
                  >
                    This information is provided for educational purposes. For
                    specific situations, please consult a qualified Islamic
                    scholar or local imam.
                  </Text>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </CustomModal>

      {/* Filters Modal */}
      <CustomModal
        visible={showFilters}
        variant="bottom"
        onClose={() => setShowFilters(false)}
        heading="Filters"
      >
        <View className="rounded-t-3xl">
          <ScrollView showsVerticalScrollIndicator={false} className="mb-32">
            {/* Category Filter */}
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: theme.textSecondary }}
            >
              Category
            </Text>
            <Pressable
              onPress={() => setSelectedCategory("all")}
              className="flex-row items-center p-3 rounded-xl mb-2 border"
              style={{
                backgroundColor:
                  selectedCategory === "all"
                    ? theme.primary + "22"
                    : theme.background,
                borderColor:
                  selectedCategory === "all"
                    ? theme.primary
                    : (theme.accentLight ?? "#ffffff22"),
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor:
                    selectedCategory === "all" ? theme.primary : theme.card,
                }}
              >
                <Ionicons
                  name="apps-outline"
                  size={20}
                  color={selectedCategory === "all" ? "#fff" : theme.text}
                />
              </View>
              <Text
                className="flex-1 font-semibold"
                style={{ color: theme.text }}
              >
                All Categories
              </Text>
              {selectedCategory === "all" && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </Pressable>

            {(Object.keys(CATEGORIES) as FiqhCategory[]).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className="flex-row items-center p-3 rounded-xl mb-2 border"
                style={{
                  backgroundColor:
                    selectedCategory === cat
                      ? theme.primary + "22"
                      : theme.background,
                  borderColor:
                    selectedCategory === cat
                      ? theme.primary
                      : (theme.accentLight ?? "#ffffff22"),
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor:
                      selectedCategory === cat
                        ? CATEGORIES[cat].color
                        : theme.card,
                  }}
                >
                  <Ionicons
                    name={CATEGORIES[cat].icon as any}
                    size={20}
                    color={selectedCategory === cat ? "#fff" : theme.text}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: theme.text }}>
                    {CATEGORIES[cat].label}
                  </Text>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {stats.byCategory[cat]} cards
                  </Text>
                </View>
                {selectedCategory === cat && (
                  <Ionicons name="checkmark" size={24} color={theme.primary} />
                )}
              </Pressable>
            ))}

            {/* Ruling Filter */}
            <Text
              className="text-sm font-semibold mb-3 mt-6"
              style={{ color: theme.textSecondary }}
            >
              Ruling Type
            </Text>
            <Pressable
              onPress={() => setSelectedRuling("all")}
              className="flex-row items-center p-3 rounded-xl mb-2 border"
              style={{
                backgroundColor:
                  selectedRuling === "all"
                    ? theme.primary + "22"
                    : theme.background,
                borderColor:
                  selectedRuling === "all"
                    ? theme.primary
                    : (theme.accentLight ?? "#ffffff22"),
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor:
                    selectedRuling === "all" ? theme.primary : theme.card,
                }}
              >
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={selectedRuling === "all" ? "#fff" : theme.text}
                />
              </View>
              <Text
                className="flex-1 font-semibold"
                style={{ color: theme.text }}
              >
                All Rulings
              </Text>
              {selectedRuling === "all" && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </Pressable>

            {(Object.keys(RULINGS) as FiqhRuling[]).map((ruling) => (
              <Pressable
                key={ruling}
                onPress={() => setSelectedRuling(ruling)}
                className="flex-row items-center p-3 rounded-xl mb-2 border"
                style={{
                  backgroundColor:
                    selectedRuling === ruling
                      ? RULINGS[ruling].color + "22"
                      : theme.background,
                  borderColor:
                    selectedRuling === ruling
                      ? RULINGS[ruling].color
                      : (theme.accentLight ?? "#ffffff22"),
                }}
              >
                <View
                  className="w-2 h-10 rounded-full mr-3"
                  style={{ backgroundColor: RULINGS[ruling].color }}
                />
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: theme.text }}>
                    {RULINGS[ruling].label}
                  </Text>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {RULINGS[ruling].description}
                  </Text>
                </View>
                {selectedRuling === ruling && (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color={RULINGS[ruling].color}
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>

          {/* Apply Button */}
          <Pressable
            onPress={() => setShowFilters(false)}
            className="mt-4 py-4 rounded-xl items-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-base font-bold text-white">
              Apply Filters ({filteredCards.length} results)
            </Text>
          </Pressable>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default FiqhLookupScreen;
