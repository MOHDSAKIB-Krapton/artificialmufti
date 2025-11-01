import { fmtTime, ORDER, PrayerKey } from "@/utils/prayer/helpers";
import { Ionicons } from "@expo/vector-icons";
import { PrayerTimes } from "adhan";
import { useMemo } from "react";
import { Text, View } from "react-native";

const PrayerList = ({
  theme,
  prayerTimes,
  next,
}: {
  theme: any;
  prayerTimes: PrayerTimes | null;
  next: PrayerKey | null;
}) => {
  const rows = useMemo(
    () =>
      ORDER.map((k) => {
        const t = prayerTimes
          ? ((prayerTimes as any)[k.toLowerCase()] as Date)
          : null;
        const isPast = t ? t.getTime() < Date.now() : false;
        const isNext = next === k;
        const icon: keyof typeof Ionicons.glyphMap =
          k === "Fajr"
            ? "moon"
            : k === "Sunrise"
              ? "sunny"
              : k === "Dhuhr"
                ? "time"
                : k === "Asr"
                  ? "alarm"
                  : k === "Maghrib"
                    ? "partly-sunny"
                    : "moon-outline";

        return { k, t, isPast, isNext, icon };
      }),
    [prayerTimes, next]
  );

  return (
    <View
      className="mt-3 rounded-2xl overflow-hidden border"
      style={{ borderColor: theme.accentLight ?? "#ffffff16" }}
    >
      {rows.map(({ k, t, isPast, isNext, icon }, idx) => (
        <View
          key={k}
          className="flex-row items-center justify-between px-4 py-3"
          style={{
            backgroundColor: isNext
              ? (theme.accentLight ?? "#ffffff10")
              : theme.card,
            borderBottomWidth: idx !== rows.length - 1 ? 1 : 0,
            borderColor: theme.accentLight ?? "#ffffff12",
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.accentLight ?? "#ffffff10" }}
            >
              <Ionicons name={icon} size={16} color={theme.primary} />
            </View>
            <Text
              className="ml-2 font-semibold"
              style={{
                color: isPast && !isNext ? theme.textSecondary : theme.text,
              }}
            >
              {k} {isNext ? "• Next" : ""}
            </Text>
          </View>

          <Text
            className="font-bold"
            style={{
              color: isPast && !isNext ? theme.textSecondary : theme.text,
            }}
          >
            {fmtTime(t)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default PrayerList;
