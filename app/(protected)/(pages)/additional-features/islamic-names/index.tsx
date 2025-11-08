import Container from "@/components/common/container";
import CustomModal from "@/components/common/customModal";
import { useTheme } from "@/hooks/useTheme";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  SectionList,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Types
interface IslamicName {
  id: string;
  name: string;
  nameArabic: string;
  meaning: string;
  origin: string;
  gender: "boy" | "girl" | "unisex";
  pronunciation: string;
  transliteration: string;
  category: NameCategory;
  attributes: string[];
  quranicReference?: string;
  propheticReference?: string;
  historicalFigures?: string[];
  popularity: number; // 1-5
  numerology?: {
    number: number;
    traits: string[];
  };
  variations?: string[];
  nicknames?: string[];
  combinableWith?: string[];
  meaningDetails?: string;
  isQuranic: boolean;
  isProphetic: boolean;
  isSahabi: boolean;
  culturalOrigin: string[];
}

interface NameCategory {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  color: string;
  description: string;
}

interface FavoriteName extends IslamicName {
  savedAt: number;
  notes?: string;
  tags?: string[];
  rating?: number;
}

interface NameCollection {
  id: string;
  name: string;
  description: string;
  names: string[];
  icon: string;
  color: string;
  createdAt: number;
  isPublic?: boolean;
}

interface SearchFilters {
  gender: "all" | "boy" | "girl" | "unisex";
  origin: string;
  category: string;
  isQuranic: boolean | null;
  isProphetic: boolean | null;
  startsWith: string;
  length: "short" | "medium" | "long" | "all";
  sortBy: "alphabetical" | "popularity" | "trending";
}

// Categories
const NAME_CATEGORIES: NameCategory[] = [
  {
    id: "quranic",
    name: "Quranic",
    arabicName: "قرآني",
    icon: "book",
    color: "#10b981",
    description: "Names mentioned in the Holy Quran",
  },
  {
    id: "prophetic",
    name: "Prophetic",
    arabicName: "نبوي",
    icon: "star-and-crescent",
    color: "#3b82f6",
    description: "Names of Prophets and their companions",
  },
  {
    id: "sahaba",
    name: "Sahaba",
    arabicName: "صحابة",
    icon: "users",
    color: "#8b5cf6",
    description: "Names of the Prophet's companions",
  },
  {
    id: "attributes",
    name: "Divine Attributes",
    arabicName: "صفات",
    icon: "sparkles",
    color: "#f59e0b",
    description: "Names derived from Allah's attributes",
  },
  {
    id: "nature",
    name: "Nature",
    arabicName: "طبيعة",
    icon: "leaf",
    color: "#14b8a6",
    description: "Names inspired by nature",
  },
  {
    id: "virtues",
    name: "Virtues",
    arabicName: "فضائل",
    icon: "heart",
    color: "#ec4899",
    description: "Names representing good qualities",
  },
];

// Sample Names Database
const NAMES_DATABASE: IslamicName[] = [
  {
    id: "1",
    name: "Ibrahim",
    nameArabic: "إبراهيم",
    meaning: "Father of nations",
    origin: "Arabic/Hebrew",
    gender: "boy",
    pronunciation: "ib-ra-HEEM",
    transliteration: "Ibrāhīm",
    category: NAME_CATEGORIES[0],
    attributes: ["Leadership", "Faith", "Wisdom", "Patience"],
    quranicReference: "Mentioned 69 times in the Quran",
    propheticReference: "Prophet Ibrahim (AS)",
    historicalFigures: ["Ibrahim ibn Muhammad", "Ibrahim Pasha"],
    popularity: 5,
    numerology: {
      number: 7,
      traits: ["Spiritual", "Analytical", "Wise"],
    },
    variations: ["Abraham", "Brahim", "Ebrahim"],
    nicknames: ["Ibby", "Brahim"],
    combinableWith: ["Muhammad", "Ahmad", "Ali"],
    meaningDetails:
      "Ibrahim is derived from the Semitic root meaning 'father of multitudes'. Prophet Ibrahim (AS) is known as Khalilullah (Friend of Allah) and is one of the most important prophets in Islam.",
    isQuranic: true,
    isProphetic: true,
    isSahabi: false,
    culturalOrigin: ["Arabic", "Turkish", "Persian", "Urdu"],
  },
  {
    id: "2",
    name: "Aisha",
    nameArabic: "عائشة",
    meaning: "Living, prosperous",
    origin: "Arabic",
    gender: "girl",
    pronunciation: "AH-ee-shah",
    transliteration: "ʿĀʾishah",
    category: NAME_CATEGORIES[2],
    attributes: ["Knowledge", "Vitality", "Intelligence", "Piety"],
    quranicReference: "Root word mentioned in Quran",
    propheticReference: "Wife of Prophet Muhammad (PBUH)",
    historicalFigures: ["Aisha bint Abu Bakr", "Aisha al-Mannubiyya"],
    popularity: 5,
    numerology: {
      number: 3,
      traits: ["Creative", "Expressive", "Social"],
    },
    variations: ["Ayesha", "Aishah", "Aysha"],
    nicknames: ["Aishy", "Aish"],
    combinableWith: ["Fatima", "Maryam", "Khadijah"],
    meaningDetails:
      "Aisha means 'alive and living' or 'she who lives'. The name is most famously associated with Aisha bint Abu Bakr, the beloved wife of Prophet Muhammad (PBUH) and a renowned scholar of Islam.",
    isQuranic: false,
    isProphetic: true,
    isSahabi: true,
    culturalOrigin: ["Arabic", "African", "South Asian"],
  },
  {
    id: "3",
    name: "Yusuf",
    nameArabic: "يوسف",
    meaning: "God will increase",
    origin: "Arabic/Hebrew",
    gender: "boy",
    pronunciation: "YOO-suf",
    transliteration: "Yūsuf",
    category: NAME_CATEGORIES[0],
    attributes: ["Beauty", "Patience", "Forgiveness", "Leadership"],
    quranicReference: "Surah Yusuf (Chapter 12)",
    propheticReference: "Prophet Yusuf (AS)",
    historicalFigures: ["Yusuf ibn Tashfin", "Yusuf al-Qaradawi"],
    popularity: 5,
    numerology: {
      number: 5,
      traits: ["Adventurous", "Dynamic", "Freedom-loving"],
    },
    variations: ["Joseph", "Yousef", "Yousuf"],
    nicknames: ["Yusu", "Suf"],
    combinableWith: ["Ahmad", "Ali", "Omar"],
    meaningDetails:
      "Yusuf is the Arabic form of Joseph, meaning 'God will add/increase'. Prophet Yusuf (AS) is known for his exceptional beauty, patience during trials, and eventual rise to power in Egypt.",
    isQuranic: true,
    isProphetic: true,
    isSahabi: false,
    culturalOrigin: ["Arabic", "Turkish", "Persian", "African"],
  },
  {
    id: "4",
    name: "Maryam",
    nameArabic: "مريم",
    meaning: "Beloved, bitter sea",
    origin: "Arabic/Hebrew",
    gender: "girl",
    pronunciation: "MAR-yam",
    transliteration: "Maryam",
    category: NAME_CATEGORIES[0],
    attributes: ["Purity", "Devotion", "Faith", "Motherhood"],
    quranicReference: "Surah Maryam (Chapter 19)",
    propheticReference: "Mother of Prophet Isa (AS)",
    historicalFigures: ["Maryam al-Asturlabi", "Maryam Mirzakhani"],
    popularity: 5,
    numerology: {
      number: 8,
      traits: ["Ambitious", "Material", "Authoritative"],
    },
    variations: ["Mariam", "Miriam", "Maria"],
    nicknames: ["Mary", "Mimi"],
    combinableWith: ["Fatima", "Aisha", "Khadijah"],
    meaningDetails:
      "Maryam is the Arabic form of Mary, the mother of Prophet Isa (AS). She is the only woman mentioned by name in the Quran and is highly revered for her piety and devotion.",
    isQuranic: true,
    isProphetic: false,
    isSahabi: false,
    culturalOrigin: ["Arabic", "Christian Arab", "Persian"],
  },
  {
    id: "5",
    name: "Zaid",
    nameArabic: "زيد",
    meaning: "Growth, increase",
    origin: "Arabic",
    gender: "boy",
    pronunciation: "ZAYD",
    transliteration: "Zayd",
    category: NAME_CATEGORIES[2],
    attributes: ["Growth", "Progress", "Loyalty", "Courage"],
    quranicReference: "Mentioned by name in Quran 33:37",
    propheticReference: "Adopted son of Prophet Muhammad (PBUH)",
    historicalFigures: ["Zaid ibn Harithah", "Zaid ibn Thabit"],
    popularity: 4,
    numerology: {
      number: 4,
      traits: ["Practical", "Reliable", "Hardworking"],
    },
    variations: ["Zayd", "Zayed", "Zeid"],
    nicknames: ["Zee", "Zaidy"],
    combinableWith: ["Muhammad", "Ahmad", "Abdullah"],
    meaningDetails:
      "Zaid means 'to increase' or 'growth'. Zaid ibn Harithah was the adopted son of Prophet Muhammad (PBUH) and is the only companion mentioned by name in the Quran.",
    isQuranic: true,
    isProphetic: true,
    isSahabi: true,
    culturalOrigin: ["Arabic", "Gulf", "North African"],
  },
];

const IslamicNamesScreen = () => {
  const { theme } = useTheme();

  // State
  const [names, setNames] = useState<IslamicName[]>(NAMES_DATABASE);
  const [favorites, setFavorites] = useState<FavoriteName[]>([]);
  const [collections, setCollections] = useState<NameCollection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<IslamicName | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    gender: "all",
    origin: "all",
    category: "all",
    isQuranic: null,
    isProphetic: null,
    startsWith: "",
    length: "all",
    sortBy: "alphabetical",
  });
  const [activeTab, setActiveTab] = useState<
    "explore" | "favorites" | "collections"
  >("explore");
  const [showFilters, setShowFilters] = useState(false);
  const [showNameDetail, setShowNameDetail] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alphabet, setAlphabet] = useState<string[]>([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(200)).current;

  // Load data on mount
  useEffect(() => {
    loadData();
    startAnimations();
    generateAlphabet();
  }, []);

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
    ]).start();

    // Continuous rotation for loading
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [favs, cols] = await Promise.all([
        AsyncStorage.getItem("favoriteNames"),
        AsyncStorage.getItem("nameCollections"),
      ]);

      if (favs) setFavorites(JSON.parse(favs));
      if (cols) setCollections(JSON.parse(cols));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const generateAlphabet = () => {
    const letters = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    );
    setAlphabet(letters);
  };

  // Filter names based on search and filters
  const filteredNames = useMemo(() => {
    let filtered = [...names];

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(
        (name) =>
          name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          name.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
          name.nameArabic.includes(searchQuery) ||
          name.attributes.some((attr) =>
            attr.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Gender filter
    if (filters.gender !== "all") {
      filtered = filtered.filter((name) => name.gender === filters.gender);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (name) => name.category.id === filters.category
      );
    }

    // Quranic filter
    if (filters.isQuranic !== null) {
      filtered = filtered.filter(
        (name) => name.isQuranic === filters.isQuranic
      );
    }

    // Prophetic filter
    if (filters.isProphetic !== null) {
      filtered = filtered.filter(
        (name) => name.isProphetic === filters.isProphetic
      );
    }

    // Starting letter filter
    if (filters.startsWith) {
      filtered = filtered.filter((name) =>
        name.name.toLowerCase().startsWith(filters.startsWith.toLowerCase())
      );
    }

    // Length filter
    if (filters.length !== "all") {
      const lengthMap = {
        short: (n: string) => n.length <= 4,
        medium: (n: string) => n.length > 4 && n.length <= 7,
        long: (n: string) => n.length > 7,
      };
      //   filtered = filtered.filter(name => lengthMap[filters.length](name.name));
    }

    // Sorting
    switch (filters.sortBy) {
      case "popularity":
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case "alphabetical":
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [names, searchQuery, filters]);

  // Group names by first letter for section list
  const groupedNames = useMemo(() => {
    const grouped: { [key: string]: IslamicName[] } = {};

    filteredNames.forEach((name) => {
      const firstLetter = name.name[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(name);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  }, [filteredNames]);

  const toggleFavorite = async (name: IslamicName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const existingIndex = favorites.findIndex((f) => f.id === name.id);

    if (existingIndex >= 0) {
      const updated = favorites.filter((f) => f.id !== name.id);
      setFavorites(updated);
      await AsyncStorage.setItem("favoriteNames", JSON.stringify(updated));
    } else {
      const favorite: FavoriteName = {
        ...name,
        savedAt: Date.now(),
      };
      const updated = [favorite, ...favorites];
      setFavorites(updated);
      await AsyncStorage.setItem("favoriteNames", JSON.stringify(updated));
    }
  };

  const shareName = async (name: IslamicName) => {
    try {
      await Share.share({
        message: `${name.name} (${name.nameArabic})\n\nMeaning: ${name.meaning}\nOrigin: ${name.origin}\n\n${name.meaningDetails || ""}\n\nShared via Islamic Names App`,
        title: `Islamic Name: ${name.name}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const isFavorite = useCallback(
    (nameId: string) => favorites.some((f) => f.id === nameId),
    [favorites]
  );

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Container>
      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold" style={{ color: theme.text }}>
              Islamic Names
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: theme.textSecondary }}
            >
              Beautiful names with meanings
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className="w-10 h-10 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="filter" size={20} color={theme.primary} />
              {Object.values(filters).some(
                (f) => f !== "all" && f !== null
              ) && (
                <View
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="analytics" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          className="flex-row items-center px-4 py-3 rounded-2xl"
          style={{ backgroundColor: theme.card }}
        >
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            className="flex-1 ml-3"
            placeholder="Search names, meanings..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ color: theme.text, fontSize: 15 }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-around mt-4">
          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: theme.primary }}
            >
              {names.length}
            </Text>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Total Names
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold" style={{ color: "#ec4899" }}>
              {favorites.length}
            </Text>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Favorites
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold" style={{ color: "#8b5cf6" }}>
              {collections.length}
            </Text>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Collections
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Navigation Tabs */}
      <View className="flex-row mb-3">
        {(["explore", "favorites", "collections"] as const).map((tab) => (
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
                color: activeTab === tab ? theme.primary : theme.textSecondary,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === "explore" && (
        <ExploreTab
          filteredNames={filteredNames}
          groupedNames={groupedNames}
          categories={NAME_CATEGORIES}
          theme={theme}
          onNamePress={setSelectedName}
          onFavoritePress={toggleFavorite}
          isFavorite={isFavorite}
          filters={filters}
          setFilters={setFilters}
          alphabet={alphabet}
          loading={loading}
          showNameDetail={() => setShowNameDetail(true)}
        />
      )}

      {activeTab === "favorites" && (
        <FavoritesTab
          favorites={favorites}
          theme={theme}
          onNamePress={setSelectedName}
          onRemove={(id: string) => {
            const updated = favorites.filter((f) => f.id !== id);
            setFavorites(updated);
            AsyncStorage.setItem("favoriteNames", JSON.stringify(updated));
          }}
          showNameDetail={() => setShowNameDetail(true)}
        />
      )}

      {activeTab === "collections" && (
        <CollectionsTab
          collections={collections}
          theme={theme}
          onAddCollection={() => setShowAddCollection(true)}
          onCollectionPress={() => {
            // Handle collection press
          }}
        />
      )}

      {/* Name Detail Modal */}
      <CustomModal
        visible={showNameDetail && selectedName !== null}
        variant="bottom"
        onClose={() => setShowNameDetail(false)}
      >
        {selectedName && (
          <NameDetailModal
            name={selectedName}
            theme={theme}
            isFavorite={isFavorite(selectedName.id)}
            onToggleFavorite={() => toggleFavorite(selectedName)}
            onShare={() => shareName(selectedName)}
            onClose={() => {
              setShowNameDetail(false);
              setSelectedName(null);
            }}
          />
        )}
      </CustomModal>

      {/* Filters Modal */}
      <CustomModal
        visible={showFilters}
        variant="bottom"
        onClose={() => setShowFilters(false)}
        heading="Filters"
      >
        <FiltersModal
          filters={filters}
          setFilters={setFilters}
          theme={theme}
          onClose={() => setShowFilters(false)}
          categories={NAME_CATEGORIES}
        />
      </CustomModal>
    </Container>
  );
};

// Explore Tab Component
const ExploreTab = ({
  filteredNames,
  groupedNames,
  categories,
  theme,
  onNamePress,
  onFavoritePress,
  isFavorite,
  filters,
  setFilters,
  alphabet,
  loading,
  showNameDetail,
}: any) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <View className="gap-y-4 flex-1">
      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => setFilters({ ...filters, category: "all" })}
          className="mr-3"
        >
          <View
            className="px-4 py-3 rounded-2xl items-center justify-center min-w-[80px]"
            style={{
              backgroundColor:
                filters.category === "all" ? theme.primary : theme.card,
            }}
          >
            <Ionicons
              name="apps"
              size={24}
              color={filters.category === "all" ? "#fff" : theme.text}
            />
            <Text
              className="text-xs mt-1"
              style={{
                color: filters.category === "all" ? "#fff" : theme.text,
              }}
            >
              All
            </Text>
          </View>
        </TouchableOpacity>

        {categories.map((cat: NameCategory) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setFilters({ ...filters, category: cat.id })}
            className="mr-3"
          >
            <View
              className="px-4 py-3 rounded-2xl items-center justify-center min-w-[80px]"
              style={{
                backgroundColor:
                  filters.category === cat.id ? cat.color : theme.card,
              }}
            >
              <FontAwesome5
                name={cat.icon}
                size={20}
                color={filters.category === cat.id ? "#fff" : cat.color}
              />
              <Text
                className="text-xs mt-1"
                style={{
                  color: filters.category === cat.id ? "#fff" : theme.text,
                }}
              >
                {cat.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gender Filter Pills */}
      <View className="flex-row mb-4">
        {["all", "boy", "girl", "unisex"].map((gender) => (
          <TouchableOpacity
            key={gender}
            onPress={() => setFilters({ ...filters, gender })}
            className="mr-2"
          >
            <View
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  filters.gender === gender ? theme.primary : theme.card,
              }}
            >
              <Text
                className="text-sm font-semibold capitalize"
                style={{
                  color: filters.gender === gender ? "#fff" : theme.text,
                }}
              >
                {gender === "all"
                  ? "All"
                  : gender === "boy"
                    ? "Boys"
                    : gender === "girl"
                      ? "Girls"
                      : "Unisex"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* View Mode Toggle */}
      <View className="flex-row justify-between items-center mb-3">
        <Text
          className="text-sm font-semibold"
          style={{ color: theme.textSecondary }}
        >
          {filteredNames.length} names found
        </Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => setViewMode("grid")} className="p-2">
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === "grid" ? theme.primary : theme.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode("list")} className="p-2">
            <Ionicons
              name="list"
              size={20}
              color={viewMode === "list" ? theme.primary : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Names List/Grid */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : viewMode === "grid" ? (
        <FlatList
          data={filteredNames}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <NameGridCard
              name={item}
              theme={theme}
              isFavorite={isFavorite(item.id)}
              onPress={() => {
                onNamePress(item);
                showNameDetail();
              }}
              onFavoritePress={() => onFavoritePress(item)}
            />
          )}
        />
      ) : (
        <SectionList
          sections={groupedNames}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderSectionHeader={({ section: { title } }) => (
            <View
              className="py-2 px-3 rounded-lg mb-2"
              style={{ backgroundColor: theme.card }}
            >
              <Text className="font-bold" style={{ color: theme.primary }}>
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <NameListCard
              name={item}
              theme={theme}
              isFavorite={isFavorite(item.id)}
              onPress={() => {
                onNamePress(item);
                showNameDetail();
              }}
              onFavoritePress={() => onFavoritePress(item)}
            />
          )}
        />
      )}

      {/* Alphabet Index */}
      {/* <View
        className="absolute right-0 top-1/4"
        style={{ backgroundColor: theme.card + "90", borderRadius: 20 }}
      >
        {alphabet.map((letter: any) => (
          <TouchableOpacity
            key={letter}
            onPress={() => setFilters({ ...filters, startsWith: letter })}
            className="px-2 py-1"
          >
            <Text
              className="text-[10px] font-bold"
              style={{
                color:
                  filters.startsWith === letter
                    ? theme.primary
                    : theme.textSecondary,
              }}
            >
              {letter}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}
    </View>
  );
};

// Name Grid Card
const NameGridCard = ({
  name,
  theme,
  isFavorite,
  onPress,
  onFavoritePress,
}: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const genderColor =
    name.gender === "boy"
      ? "#3b82f6"
      : name.gender === "girl"
        ? "#ec4899"
        : "#8b5cf6";

  return (
    <Animated.View
      className="w-1/2 p-2"
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <Pressable
        onPress={handlePress}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.accentLight,
        }}
      >
        {/* Gender Badge */}
        <View
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: genderColor + "20" }}
        >
          <Ionicons
            name={
              name.gender === "boy"
                ? "male"
                : name.gender === "girl"
                  ? "female"
                  : "male-female"
            }
            size={12}
            color={genderColor}
          />
        </View>

        <View className="p-4">
          {/* Arabic Name */}
          <Text
            className="text-2xl text-center mb-1"
            style={{ color: theme.text, fontFamily: "Arabic" }}
          >
            {name.nameArabic}
          </Text>

          {/* English Name */}
          <Text
            className="text-base font-bold text-center mb-2"
            style={{ color: theme.text }}
          >
            {name.name}
          </Text>

          {/* Meaning */}
          <Text
            className="text-xs text-center mb-3"
            numberOfLines={2}
            style={{ color: theme.textSecondary }}
          >
            {name.meaning}
          </Text>

          {/* Badges */}
          <View className="flex-row justify-center mb-3">
            {name.isQuranic && (
              <View
                className="px-2 py-1 rounded mr-1"
                style={{ backgroundColor: "#10b981" + "20" }}
              >
                <Text className="text-[10px]" style={{ color: "#10b981" }}>
                  Quranic
                </Text>
              </View>
            )}
            {name.isProphetic && (
              <View
                className="px-2 py-1 rounded"
                style={{ backgroundColor: "#3b82f6" + "20" }}
              >
                <Text className="text-[10px]" style={{ color: "#3b82f6" }}>
                  Prophetic
                </Text>
              </View>
            )}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
            className="py-2 rounded-xl items-center"
            style={{ backgroundColor: theme.background }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#ef4444" : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Name List Card
const NameListCard = ({
  name,
  theme,
  isFavorite,
  onPress,
  onFavoritePress,
}: any) => {
  const genderColor =
    name.gender === "boy"
      ? "#3b82f6"
      : name.gender === "girl"
        ? "#ec4899"
        : "#8b5cf6";

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl p-4 mb-3 flex-row items-center"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.accentLight,
      }}
    >
      {/* Arabic Name Circle */}
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: name.category.color + "20" }}
      >
        <Text className="text-xl" style={{ color: theme.text }}>
          {name.nameArabic}
        </Text>
      </View>

      {/* Details */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-bold" style={{ color: theme.text }}>
            {name.name}
          </Text>
          <View
            className="ml-2 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: genderColor + "20" }}
          >
            <Ionicons
              name={
                name.gender === "boy"
                  ? "male"
                  : name.gender === "girl"
                    ? "female"
                    : "male-female"
              }
              size={10}
              color={genderColor}
            />
          </View>
        </View>

        <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
          {name.pronunciation} • {name.origin}
        </Text>

        <Text
          className="text-sm mb-2"
          numberOfLines={1}
          style={{ color: theme.text }}
        >
          {name.meaning}
        </Text>

        {/* Tags */}
        <View className="flex-row">
          {name.isQuranic && (
            <View
              className="px-2 py-0.5 rounded mr-1"
              style={{ backgroundColor: "#10b981" + "20" }}
            >
              <Text className="text-[10px]" style={{ color: "#10b981" }}>
                Quranic
              </Text>
            </View>
          )}
          {name.isProphetic && (
            <View
              className="px-2 py-0.5 rounded mr-1"
              style={{ backgroundColor: "#3b82f6" + "20" }}
            >
              <Text className="text-[10px]" style={{ color: "#3b82f6" }}>
                Prophetic
              </Text>
            </View>
          )}
          {name.isSahabi && (
            <View
              className="px-2 py-0.5 rounded"
              style={{ backgroundColor: "#8b5cf6" + "20" }}
            >
              <Text className="text-[10px]" style={{ color: "#8b5cf6" }}>
                Sahabi
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onFavoritePress();
        }}
        className="p-2"
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? "#ef4444" : theme.textSecondary}
        />
      </TouchableOpacity>
    </Pressable>
  );
};

// Name Detail Modal
const NameDetailModal = ({
  name,
  theme,
  isFavorite,
  onToggleFavorite,
  onShare,
  onClose,
}: any) => {
  const [activeSection, setActiveSection] = useState("overview");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const genderColor =
    name.gender === "boy"
      ? "#3b82f6"
      : name.gender === "girl"
        ? "#ec4899"
        : "#8b5cf6";

  return (
    <View
      style={{ backgroundColor: theme.background }}
      className="rounded-t-xl overflow-hidden"
    >
      {/* Header */}
      <LinearGradient
        colors={[name.category.color + "30", "transparent"]}
        className="py-6 "
      >
        <View className="flex-row items-center mb-4 mr-4 ml-auto">
          <TouchableOpacity onPress={onToggleFavorite} className="mr-3">
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ef4444" : theme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare}>
            <Ionicons name="share-social" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Name Display */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text
            className="text-5xl text-center mb-3"
            style={{ color: theme.text, fontFamily: "Arabic" }}
          >
            {name.nameArabic}
          </Text>

          <Text
            className="text-3xl font-bold text-center mb-2"
            style={{ color: theme.text }}
          >
            {name.name}
          </Text>

          <View className="flex-row justify-center items-center mb-4">
            <View
              className="px-3 py-1 rounded-full flex-row items-center mr-2"
              style={{ backgroundColor: genderColor + "20" }}
            >
              <Ionicons
                name={
                  name.gender === "boy"
                    ? "male"
                    : name.gender === "girl"
                      ? "female"
                      : "male-female"
                }
                size={14}
                color={genderColor}
              />
              <Text
                className="ml-1 text-sm capitalize"
                style={{ color: genderColor }}
              >
                {name.gender}
              </Text>
            </View>

            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: name.category.color + "20" }}
            >
              <Text className="text-sm" style={{ color: name.category.color }}>
                {name.category.name}
              </Text>
            </View>
          </View>

          {/* Pronunciation */}
          <View
            className="rounded-xl p-3"
            style={{ backgroundColor: theme.card }}
          >
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text
                  className="text-xs mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Pronunciation
                </Text>
                <Text className="font-semibold" style={{ color: theme.text }}>
                  {name.pronunciation}
                </Text>
              </View>
              <View className="items-center">
                <Text
                  className="text-xs mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Origin
                </Text>
                <Text className="font-semibold" style={{ color: theme.text }}>
                  {name.origin}
                </Text>
              </View>
              <View className="items-center">
                <Text
                  className="text-xs mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Popularity
                </Text>
                <View className="flex-row">
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={
                        i < name.popularity ? "#f59e0b" : theme.textSecondary
                      }
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Section Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
      >
        {["overview", "details", "references", "combinations"].map(
          (section) => (
            <TouchableOpacity
              key={section}
              onPress={() => setActiveSection(section)}
              className="mr-3"
            >
              <View
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor:
                    activeSection === section ? theme.primary : theme.card,
                }}
              >
                <Text
                  className="capitalize font-semibold"
                  style={{
                    color: activeSection === section ? "#fff" : theme.text,
                  }}
                >
                  {section}
                </Text>
              </View>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Content */}
      <ScrollView className=" px-4" showsVerticalScrollIndicator={false}>
        {activeSection === "overview" && (
          <View className="">
            {/* Meaning */}
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: theme.card }}
            >
              <Text
                className="text-sm font-bold mb-3"
                style={{ color: theme.text }}
              >
                Meaning
              </Text>
              <Text className="text-base mb-3" style={{ color: theme.text }}>
                {name.meaning}
              </Text>
              {name.meaningDetails && (
                <Text
                  className="text-sm leading-5"
                  style={{ color: theme.textSecondary }}
                >
                  {name.meaningDetails}
                </Text>
              )}
            </View>

            {/* Attributes */}
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: theme.card }}
            >
              <Text
                className="text-sm font-bold mb-3"
                style={{ color: theme.text }}
              >
                Character Attributes
              </Text>
              <View className="flex-row flex-wrap">
                {name.attributes.map((attr: string, index: number) => (
                  <View
                    key={index}
                    className="px-3 py-2 rounded-lg mr-2 mb-2"
                    style={{ backgroundColor: theme.primary + "20" }}
                  >
                    <Text className="text-sm" style={{ color: theme.primary }}>
                      {attr}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Numerology */}
            {name.numerology && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <Text
                  className="text-sm font-bold mb-3"
                  style={{ color: theme.text }}
                >
                  Numerology
                </Text>
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: "#8b5cf6" + "20" }}
                  >
                    <Text
                      className="text-xl font-bold"
                      style={{ color: "#8b5cf6" }}
                    >
                      {name.numerology.number}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      Life Path Number
                    </Text>
                  </View>
                </View>
                <View className="flex-row flex-wrap">
                  {name.numerology.traits.map(
                    (trait: string, index: number) => (
                      <Text
                        key={index}
                        className="text-sm mr-2"
                        style={{ color: theme.text }}
                      >
                        • {trait}
                      </Text>
                    )
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {activeSection === "details" && (
          <View>
            {/* Variations */}
            {name.variations && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <Text
                  className="text-sm font-bold mb-3"
                  style={{ color: theme.text }}
                >
                  Name Variations
                </Text>
                <View className="flex-row flex-wrap">
                  {name.variations.map((variation: string, index: number) => (
                    <View
                      key={index}
                      className="px-3 py-2 rounded-lg mr-2 mb-2"
                      style={{ backgroundColor: theme.background }}
                    >
                      <Text style={{ color: theme.text }}>{variation}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Nicknames */}
            {name.nicknames && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <Text
                  className="text-sm font-bold mb-3"
                  style={{ color: theme.text }}
                >
                  Common Nicknames
                </Text>
                <View className="flex-row flex-wrap">
                  {name.nicknames.map((nickname: string, index: number) => (
                    <View
                      key={index}
                      className="px-3 py-2 rounded-lg mr-2 mb-2"
                      style={{ backgroundColor: theme.background }}
                    >
                      <Text style={{ color: theme.text }}>{nickname}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Cultural Origins */}
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: theme.card }}
            >
              <Text
                className="text-sm font-bold mb-3"
                style={{ color: theme.text }}
              >
                Cultural Presence
              </Text>
              <View className="flex-row flex-wrap">
                {name.culturalOrigin.map((culture: string, index: number) => (
                  <View
                    key={index}
                    className="px-3 py-2 rounded-lg mr-2 mb-2 flex-row items-center"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Ionicons
                      name="globe"
                      size={14}
                      color={theme.textSecondary}
                    />
                    <Text className="ml-2" style={{ color: theme.text }}>
                      {culture}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeSection === "references" && (
          <View>
            {/* Quranic Reference */}
            {name.quranicReference && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons name="book" size={20} color="#10b981" />
                  <Text
                    className="ml-2 font-bold"
                    style={{ color: theme.text }}
                  >
                    Quranic Reference
                  </Text>
                </View>
                <Text style={{ color: theme.text }}>
                  {name.quranicReference}
                </Text>
              </View>
            )}

            {/* Prophetic Reference */}
            {name.propheticReference && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <View className="flex-row items-center mb-3">
                  <FontAwesome5 name="mosque" size={16} color="#3b82f6" />
                  <Text
                    className="ml-2 font-bold"
                    style={{ color: theme.text }}
                  >
                    Prophetic Reference
                  </Text>
                </View>
                <Text style={{ color: theme.text }}>
                  {name.propheticReference}
                </Text>
              </View>
            )}

            {/* Historical Figures */}
            {name.historicalFigures && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <Text
                  className="text-sm font-bold mb-3"
                  style={{ color: theme.text }}
                >
                  Notable Historical Figures
                </Text>
                {name.historicalFigures.map((figure: string, index: number) => (
                  <View
                    key={index}
                    className="flex-row items-center py-2"
                    style={{
                      borderBottomWidth:
                        index < name.historicalFigures.length - 1 ? 1 : 0,
                      borderBottomColor: theme.accentLight,
                    }}
                  >
                    <Ionicons
                      name="person"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text className="ml-2" style={{ color: theme.text }}>
                      {figure}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeSection === "combinations" && (
          <View>
            {/* Combinable Names */}
            {name.combinableWith && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <Text
                  className="text-sm font-bold mb-3"
                  style={{ color: theme.text }}
                >
                  Combines Well With
                </Text>
                {name.combinableWith.map((combo: string, index: number) => (
                  <View
                    key={index}
                    className="py-3 px-4 rounded-lg mb-2"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ color: theme.text }}
                    >
                      {name.name} {combo}
                    </Text>
                    <Text
                      className="text-sm mt-1"
                      style={{ color: theme.textSecondary }}
                    >
                      {name.nameArabic} {/* Add Arabic combination */}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Suggested Middle Names */}
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: theme.card }}
            >
              <Text
                className="text-sm font-bold mb-3"
                style={{ color: theme.text }}
              >
                Popular Combinations
              </Text>
              <View className="flex-row flex-wrap">
                {["Muhammad", "Abdul", "Ahmad", "Ali", "Hassan"].map(
                  (middle) => (
                    <TouchableOpacity key={middle} className="mr-2 mb-2">
                      <View
                        className="px-3 py-2 rounded-lg"
                        style={{ backgroundColor: theme.primary + "20" }}
                      >
                        <Text style={{ color: theme.primary }}>
                          {name.gender === "boy" ? middle : "Bint"} {name.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Favorites Tab
const FavoritesTab = ({
  favorites,
  theme,
  onNamePress,
  onRemove,
  showNameDetail,
}: any) => {
  if (favorites.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: theme.card }}
        >
          <Ionicons
            name="heart-outline"
            size={48}
            color={theme.textSecondary}
          />
        </View>
        <Text className="text-lg font-bold mb-2" style={{ color: theme.text }}>
          No Favorites Yet
        </Text>
        <Text
          className="text-sm text-center"
          style={{ color: theme.textSecondary }}
        >
          Start adding names to your favorites{"\n"}to quickly access them later
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      renderItem={({ item }) => (
        <NameListCard
          name={item}
          theme={theme}
          isFavorite={true}
          onPress={() => {
            onNamePress(item);
            showNameDetail();
          }}
          onFavoritePress={() => onRemove(item.id)}
        />
      )}
    />
  );
};

// Collections Tab
const CollectionsTab = ({
  collections,
  theme,
  onAddCollection,
  onCollectionPress,
}: any) => {
  return (
    <View className="flex-1 px-4">
      {/* Add Collection Button */}
      <TouchableOpacity
        onPress={onAddCollection}
        className="rounded-2xl p-4 mb-4 flex-row items-center justify-center"
        style={{
          backgroundColor: theme.card,
          borderWidth: 2,
          borderColor: theme.primary,
          borderStyle: "dashed",
        }}
      >
        <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
        <Text className="ml-2 font-semibold" style={{ color: theme.primary }}>
          Create New Collection
        </Text>
      </TouchableOpacity>

      {/* Suggested Collections */}
      <Text className="text-sm font-bold mb-3" style={{ color: theme.text }}>
        Suggested Collections
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {[
          { name: "Quranic Names", icon: "📖", color: "#10b981", count: 45 },
          { name: "Prophet Names", icon: "🌙", color: "#3b82f6", count: 25 },
          { name: "Sahaba Names", icon: "⭐", color: "#8b5cf6", count: 89 },
          {
            name: "Modern Favorites",
            icon: "💝",
            color: "#ec4899",
            count: 156,
          },
        ].map((collection, index) => (
          <TouchableOpacity
            key={index}
            className="rounded-2xl p-4 mb-3 flex-row items-center"
            style={{ backgroundColor: theme.card }}
          >
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: collection.color + "20" }}
            >
              <Text className="text-2xl">{collection.icon}</Text>
            </View>

            <View className="flex-1">
              <Text
                className="font-bold text-base"
                style={{ color: theme.text }}
              >
                {collection.name}
              </Text>
              <Text
                className="text-sm mt-1"
                style={{ color: theme.textSecondary }}
              >
                {collection.count} names
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Filters Modal
const FiltersModal = ({
  filters,
  setFilters,
  theme,
  onClose,
  categories,
}: any) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const applyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      gender: "all",
      origin: "all",
      category: "all",
      isQuranic: null,
      isProphetic: null,
      startsWith: "",
      length: "all",
      sortBy: "alphabetical",
    };
    setTempFilters(defaultFilters);
  };

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sort By */}
        <View className="mb-4">
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: theme.text }}
          >
            Sort By
          </Text>
          <View className="flex-row flex-wrap">
            {["alphabetical", "popularity", "trending"].map((sort) => (
              <TouchableOpacity
                key={sort}
                onPress={() =>
                  setTempFilters({ ...tempFilters, sortBy: sort as any })
                }
                className="mr-2 mb-2"
              >
                <View
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor:
                      tempFilters.sortBy === sort ? theme.primary : theme.card,
                  }}
                >
                  <Text
                    className="capitalize"
                    style={{
                      color: tempFilters.sortBy === sort ? "#fff" : theme.text,
                    }}
                  >
                    {sort}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Name Length */}
        <View className="mb-4">
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: theme.text }}
          >
            Name Length
          </Text>
          <View className="flex-row flex-wrap">
            {["all", "short", "medium", "long"].map((length) => (
              <TouchableOpacity
                key={length}
                onPress={() =>
                  setTempFilters({ ...tempFilters, length: length as any })
                }
                className="mr-2 mb-2"
              >
                <View
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor:
                      tempFilters.length === length
                        ? theme.primary
                        : theme.card,
                  }}
                >
                  <Text
                    className="capitalize"
                    style={{
                      color:
                        tempFilters.length === length ? "#fff" : theme.text,
                    }}
                  >
                    {length}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Filters */}
        <View className="mb-4">
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: theme.text }}
          >
            Special Categories
          </Text>

          <TouchableOpacity
            onPress={() =>
              setTempFilters({
                ...tempFilters,
                isQuranic: tempFilters.isQuranic === true ? null : true,
              })
            }
            className="flex-row items-center justify-between py-3"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: theme.accentLight,
            }}
          >
            <Text style={{ color: theme.text }}>Quranic Names Only</Text>
            <View
              className="w-6 h-6 rounded items-center justify-center"
              style={{
                backgroundColor: tempFilters.isQuranic
                  ? theme.primary
                  : theme.card,
                borderWidth: 1,
                borderColor: tempFilters.isQuranic
                  ? theme.primary
                  : theme.accentLight,
              }}
            >
              {tempFilters.isQuranic && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setTempFilters({
                ...tempFilters,
                isProphetic: tempFilters.isProphetic === true ? null : true,
              })
            }
            className="flex-row items-center justify-between py-3"
          >
            <Text style={{ color: theme.text }}>Prophetic Names Only</Text>
            <View
              className="w-6 h-6 rounded items-center justify-center"
              style={{
                backgroundColor: tempFilters.isProphetic
                  ? theme.primary
                  : theme.card,
                borderWidth: 1,
                borderColor: tempFilters.isProphetic
                  ? theme.primary
                  : theme.accentLight,
              }}
            >
              {tempFilters.isProphetic && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="flex-row mt-4">
        <TouchableOpacity
          onPress={resetFilters}
          className="flex-1 mr-2 py-3 rounded-xl items-center"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <Text style={{ color: theme.text }}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={applyFilters}
          className="flex-1 ml-2 py-3 rounded-xl items-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-white font-semibold">Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IslamicNamesScreen;
