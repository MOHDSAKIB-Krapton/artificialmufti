import { BADGE_STYLES, RAW_FEATURES } from "@/constants/features";
import { BadgeType, FeatureItem } from "@/constants/features/types";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const FeaturesScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState("");

  const features = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RAW_FEATURES.sort((a, b) => (a.locked ? 1 : -1));

    return RAW_FEATURES.filter((f) => {
      const hay =
        `${f.label} ${f.subtitle ?? ""} ${(f.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const renderBadge = (badge: BadgeType) => {
    if (!badge) return null;
    const s = BADGE_STYLES[badge];
    return (
      <View
        className="px-2 py-[2px] rounded-full"
        style={{ backgroundColor: s.bg, alignSelf: "flex-start" }}
      >
        <Text className="text-[10px] font-semibold" style={{ color: s.text }}>
          {badge}
        </Text>
      </View>
    );
  };

  const renderIcon = (item: FeatureItem) => {
    if (item.icon) {
      const color = item.tint ?? theme.text;
      if (item.icon.set === "mci") {
        return (
          <MaterialCommunityIcons
            name={item.icon.name as any}
            size={48}
            color={color}
          />
        );
      }
      return <Ionicons name={item.icon.name as any} size={48} color={color} />;
    }
    return null;
  };

  const FeatureCard = ({ item }: { item: FeatureItem }) => {
    const disabled = item.locked || !item.route;

    return (
      <Pressable
        onPress={() => !disabled && router.push(item.route as any)}
        className="flex-1 mx-2 my-2"
      >
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: item.highlight
              ? (item.tint ?? "#ffffff") + "44"
              : theme.card,
            opacity: disabled ? 0.65 : 1,
          }}
          className=" overflow-hidden"
        >
          <LinearGradient
            colors={
              item.highlight
                ? [
                    (item.tint ?? theme.card) + "22",
                    (item.tint ?? theme.card) + "55",
                  ]
                : [theme.card, theme.card]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 14,
              flex: 1,
            }}
          >
            {/* Top row: badge + (optional) lock */}
            <View className="flex-row justify-between items-center mb-2">
              {renderBadge(item.badge ?? null)}
              {disabled ? (
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={theme.text}
                  className="ml-auto"
                />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={theme.text} className="ml-auto" />
              )}
            </View>

            {/* Media */}
            {renderIcon(item)}

            {/* Texts */}
            <Text
              className="text-base font-semibold mb-1"
              style={{ color: theme.text }}
            >
              {item.label}
            </Text>
            {!!item.subtitle && (
              <Text
                className="text-xs opacity-70"
                style={{ color: theme.text }}
              >
                {item.subtitle}
              </Text>
            )}
          </LinearGradient>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Hero header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Additional Features
        </Text>
        <Text style={[styles.subtitleHeader, { color: theme.text }]}>
          Thoughtfully designed tools to enhance your daily practice.
        </Text>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.card, borderColor: "transparent" },
        ]}
      >
        <TextInput
          placeholder="Search features (e.g., prayer, qibla)"
          placeholderTextColor="#9aa0a6"
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      <FlatList
        data={features}
        // renderItem={renderItem}

        renderItem={({ item }) => <FeatureCard item={item} />}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrap}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT + 20,
          offset: (CARD_HEIGHT + 20) * index,
          index,
        })}
      />
    </View>
  );
};

const CARD_HEIGHT = 210;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitleHeader: {
    marginTop: 6,
    fontSize: 13.5,
    opacity: 0.7,
    lineHeight: 18,
  },
  searchBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchInput: {
    fontSize: 14.5,
    paddingVertical: 4,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 28,
  },
  columnWrap: {
    gap: 8,
    paddingHorizontal: 4,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    height: CARD_HEIGHT,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 110,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12.5,
    opacity: 0.75,
    lineHeight: 16,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagText: {
    fontSize: 12,
    opacity: 0.7,
  },
  chevron: {
    fontSize: 22,
    opacity: 0.6,
  },
});

export default FeaturesScreen;
