import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hijri calendar utilities
const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

const GREGORIAN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Simplified Hijri conversion (using approximate algorithm)
function gregorianToHijri(gDate: Date): {
  year: number;
  month: number;
  day: number;
} {
  const gYear = gDate.getFullYear();
  const gMonth = gDate.getMonth() + 1;
  const gDay = gDate.getDate();

  // Julian Day calculation
  let a = Math.floor((14 - gMonth) / 12);
  let y = gYear + 4800 - a;
  let m = gMonth + 12 * a - 3;

  let jd =
    gDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Convert Julian Day to Hijri
  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;

  let j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);

  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;

  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return { year: hYear, month: hMonth, day: hDay };
}

function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
  // Approximate conversion
  let jd =
    Math.floor((11 * hYear + 3) / 30) +
    354 * hYear +
    30 * hMonth -
    Math.floor((hMonth - 1) / 2) +
    hDay +
    1948440 -
    385;

  if (jd > 2299160) {
    let a = Math.floor((jd - 1867216.25) / 36524.25);
    jd = jd + 1 + a - Math.floor(a / 4);
  }

  let b = jd + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b - d) / 30.6001);

  let day = b - d - Math.floor(30.6001 * e);
  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;

  return new Date(year, month - 1, day);
}

type CalendarType = "gregorian" | "hijri";

const HijriGregorianConverter: React.FC = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeCalendar, setActiveCalendar] =
    useState<CalendarType>("gregorian");
  const [fadeAnim] = useState(new Animated.Value(1));

  // Calculate both calendar dates
  const gregorianDate =
    activeCalendar === "gregorian"
      ? selectedDate
      : hijriToGregorian(hijriData.year, hijriData.month, hijriData.day);

  const hijriData = useMemo(() => {
    return gregorianToHijri(gregorianDate);
  }, [gregorianDate]);

  // Calendar grid data
  const calendarGrid = useMemo(() => {
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: (number | null)[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push(i);
    }

    return grid;
  }, [gregorianDate]);

  const switchCalendar = (type: CalendarType) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveCalendar(type);
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(gregorianDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const adjustMonth = (months: number) => {
    const newDate = new Date(gregorianDate);
    newDate.setMonth(newDate.getMonth() + months);
    setSelectedDate(newDate);
  };

  const selectDay = (day: number) => {
    const newDate = new Date(gregorianDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          paddingTop: 8,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Date Converter
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: theme.textSecondary }}
            >
              Hijri ⇄ Gregorian Calendar
            </Text>
          </View>

          <Pressable
            onPress={goToToday}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: theme.primary + "20" }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: theme.primary }}
            >
              Today
            </Text>
          </Pressable>
        </View>

        {/* Calendar Type Switcher */}
        <View
          className="flex-row rounded-2xl p-1 mb-6"
          style={{ backgroundColor: theme.card }}
        >
          <Pressable
            onPress={() => switchCalendar("gregorian")}
            className="flex-1 py-3 rounded-xl"
            style={{
              backgroundColor:
                activeCalendar === "gregorian" ? theme.primary : "transparent",
            }}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color:
                  activeCalendar === "gregorian"
                    ? "#ffffff"
                    : theme.textSecondary,
              }}
            >
              Gregorian
            </Text>
          </Pressable>

          <Pressable
            onPress={() => switchCalendar("hijri")}
            className="flex-1 py-3 rounded-xl"
            style={{
              backgroundColor:
                activeCalendar === "hijri" ? theme.primary : "transparent",
            }}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color:
                  activeCalendar === "hijri" ? "#ffffff" : theme.textSecondary,
              }}
            >
              Hijri
            </Text>
          </Pressable>
        </View>

        {/* Main Date Display Card */}
        <Animated.View
          className="rounded-2xl border p-6 mb-6"
          style={{
            borderColor: theme.accentLight ?? "#ffffff22",
            backgroundColor: theme.card,
            opacity: fadeAnim,
          }}
        >
          {/* Gregorian Date */}
          <View className="mb-6">
            <Text
              className="text-xs mb-2"
              style={{ color: theme.textSecondary }}
            >
              GREGORIAN CALENDAR
            </Text>
            <View className="flex-row items-baseline">
              <Text
                className="text-4xl font-bold"
                style={{ color: theme.text }}
              >
                {gregorianDate.getDate()}
              </Text>
              <Text
                className="text-2xl font-semibold ml-3"
                style={{ color: theme.text }}
              >
                {GREGORIAN_MONTHS[gregorianDate.getMonth()]}
              </Text>
              <Text
                className="text-2xl font-semibold ml-2"
                style={{ color: theme.textSecondary }}
              >
                {gregorianDate.getFullYear()}
              </Text>
            </View>
            <Text
              className="text-sm mt-2"
              style={{ color: theme.textSecondary }}
            >
              {DAYS_OF_WEEK[gregorianDate.getDay()]},{" "}
              {gregorianDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Divider */}
          <View
            className="h-px mb-6"
            style={{ backgroundColor: theme.textSecondary + "30" }}
          />

          {/* Hijri Date */}
          <View>
            <Text
              className="text-xs mb-2"
              style={{ color: theme.textSecondary }}
            >
              HIJRI CALENDAR (ISLAMIC)
            </Text>
            <View className="flex-row items-baseline">
              <Text
                className="text-4xl font-bold"
                style={{ color: theme.primary }}
              >
                {hijriData.day}
              </Text>
              <Text
                className="text-2xl font-semibold ml-3"
                style={{ color: theme.primary }}
              >
                {HIJRI_MONTHS[hijriData.month - 1]}
              </Text>
              <Text
                className="text-2xl font-semibold ml-2"
                style={{ color: theme.textSecondary }}
              >
                {hijriData.year} AH
              </Text>
            </View>
            <Text
              className="text-xs mt-3 italic"
              style={{ color: theme.textSecondary }}
            >
              ✦ Approximate conversion using astronomical calculations
            </Text>
          </View>
        </Animated.View>

        {/* Month Navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => adjustMonth(-1)}
            className="p-3 rounded-xl"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>

          <Text className="text-lg font-bold" style={{ color: theme.text }}>
            {GREGORIAN_MONTHS[gregorianDate.getMonth()]}{" "}
            {gregorianDate.getFullYear()}
          </Text>

          <Pressable
            onPress={() => adjustMonth(1)}
            className="p-3 rounded-xl"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </Pressable>
        </View>

        {/* Calendar Grid */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: theme.card }}
        >
          {/* Day Headers */}
          <View className="flex-row mb-3">
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.textSecondary }}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View className="flex-row flex-wrap">
            {calendarGrid.map((day, index) => {
              const isSelected = day === gregorianDate.getDate();
              const isToday =
                day === new Date().getDate() &&
                gregorianDate.getMonth() === new Date().getMonth() &&
                gregorianDate.getFullYear() === new Date().getFullYear();

              return (
                <View
                  key={index}
                  style={{ width: `${100 / 7}%` }}
                  className="p-1"
                >
                  {day ? (
                    <Pressable
                      onPress={() => selectDay(day)}
                      className="aspect-square items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: isSelected
                          ? theme.primary
                          : isToday
                            ? theme.primary + "20"
                            : "transparent",
                      }}
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{
                          color: isSelected
                            ? "#ffffff"
                            : isToday
                              ? theme.primary
                              : theme.text,
                        }}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="aspect-square" />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Date Adjustment */}
        <View
          className="rounded-2xl p-4"
          style={{ backgroundColor: theme.card }}
        >
          <Text
            className="text-xs mb-3 font-semibold"
            style={{ color: theme.textSecondary }}
          >
            QUICK NAVIGATION
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {[-7, -1, 1, 7, 30].map((days) => (
              <Pressable
                key={days}
                onPress={() => adjustDate(days)}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: theme.background }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  {days > 0 ? "+" : ""}
                  {days}d
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Footer Info */}
        <Text
          className="text-center mt-6 text-xs leading-5"
          style={{ color: theme.textSecondary }}
        >
          Hijri calendar dates are approximations based on astronomical
          calculations.{"\n"}
          Actual Islamic dates may vary by region and moon sighting.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HijriGregorianConverter;
