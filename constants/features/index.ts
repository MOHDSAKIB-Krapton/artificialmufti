import { BadgeType, FeatureItem } from "./types";

export const RAW_FEATURES: FeatureItem[] = [
  {
    id: "qibla",
    label: "Qibla Direction",
    subtitle: "Precise Kaaba direction using device sensors",
    route: "/(protected)/(pages)/additional-features/kaaba-direction",
    icon: { name: "compass-outline", set: "ion" },
    badge: "NEW",
    tint: "#00B894", // emerald green
    highlight: true,
    locked: true,
    tags: [
      "qibla",
      "kaaba",
      "direction",
      "compass",
      "islam",
      "navigation",
      "location",
      "faith",
      "mecca",
      "muslim utility",
    ],
  },
  {
    id: "prayer-times",
    label: "Prayer Times",
    subtitle: "Daily salah schedule with offline and online modes",
    route: "/(protected)/(pages)/additional-features/prayer-times",
    icon: { name: "time-outline", set: "ion" },
    badge: "BETA",
    tint: "#6C5CE7", // vibrant purple
    highlight: true,
    locked: true,
    tags: [
      "prayer",
      "namaz",
      "times",
      "adhan",
      "fajr",
      "islamic date",
      "muslim",
      "offline",
      "madhab",
      "timings",
    ],
  },
  {
    id: "tasbeeh",
    label: "Tasbeeh Counter",
    subtitle: "Smart dhikr counter with haptics & custom phrases",
    icon: { name: "infinite-outline", set: "ion" },
    badge: "SOON",
    tint: "#FF7675", // pastel red
    locked: true,
    tags: [
      "tasbeeh",
      "dhikr",
      "counter",
      "zikr",
      "subhanallah",
      "allahuakbar",
      "islamic",
      "praise",
      "spirituality",
      "remembrance",
    ],
  },
  {
    id: "hadith",
    label: "Hadith Bookmarks",
    subtitle: "Bookmark, tag, and revisit authentic Hadith",
    icon: { name: "book-outline", set: "ion" },
    badge: "SOON",
    tint: "#0984E3", // electric blue
    locked: true,
    tags: [
      "hadith",
      "sunnah",
      "bookmark",
      "bukhari",
      "muslim",
      "islamic text",
      "reference",
      "learning",
      "tagging",
      "knowledge",
    ],
  },
  {
    id: "nearby-mosques",
    label: "Nearby Mosques",
    subtitle: "Find masjids near you, with map and distance",
    icon: { name: "mosque", set: "mci" },
    tint: "#55EFC4", // mint green
    badge: "SOON",
    locked: true,
    tags: [
      "mosque",
      "masjid",
      "nearby",
      "location",
      "gps",
      "islam",
      "prayer place",
      "map",
      "distance",
      "community",
    ],
  },
];

export const BADGE_STYLES: Record<
  NonNullable<BadgeType>,
  { bg: string; text: string }
> = {
  NEW: { bg: "#E3FCEF", text: "#0F9154" },
  BETA: { bg: "#E8EAF6", text: "#3F51B5" },
  SOON: { bg: "#FFF3E0", text: "#EF6C00" },
};
