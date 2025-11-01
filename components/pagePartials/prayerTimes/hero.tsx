import { useTheme } from "@/hooks/useTheme";
import {
  fmtCountdown,
  fmtTime,
  getHijriDate,
  PrayerKey,
} from "@/utils/prayer/helpers";
import { useMemo } from "react";
import { Text, View } from "react-native";
import ProgressBar from "./progressBar";

const HeroCard = ({
  today,
  nextLabel,
  nextTime,
  prevLabel,
  countdownMs,
  progressPct,
  currentPrayerLabel,
}: {
  today: Date;
  nextLabel: string;
  nextTime: Date | null;
  prevLabel: string;
  countdownMs: number;
  progressPct: number;
  currentPrayerLabel: PrayerKey | null;
}) => {
  const { theme } = useTheme();

  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Local";
    } catch {
      return "Local";
    }
  }, []);

  return (
    <View
      className="rounded-2xl border p-4"
      style={{
        borderColor: theme.accentLight ?? "#ffffff22",
        backgroundColor: theme.card,
      }}
    >
      {/* Date */}
      <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
        {getHijriDate(today)}
      </Text>

      {/* Next / Active */}
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-sm" style={{ color: theme.textSecondary }}>
            {currentPrayerLabel ? "Now" : "Next Prayer"}
          </Text>
          <Text
            className="mt-1"
            style={{ color: theme.text, fontSize: 26, fontWeight: "800" }}
          >
            {currentPrayerLabel ? `It's ${currentPrayerLabel} time` : nextLabel}
          </Text>
        </View>

        <View className="items-end">
          {!currentPrayerLabel ? (
            <>
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                in
              </Text>
              <Text
                style={{ color: theme.text, fontSize: 22, fontWeight: "700" }}
              >
                {fmtCountdown(countdownMs)}
              </Text>
              <Text
                className="text-xs mt-1"
                style={{ color: theme.textSecondary }}
              >
                {nextTime ? fmtTime(nextTime) : "—"} • {tz}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Started • {tz}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Progress */}
      <View className="mt-3">
        <ProgressBar
          trackColor={theme.background ?? "#ffffff16"}
          fillColor={theme.primary}
          pct={progressPct}
        />
        <View className="flex-row justify-between mt-1">
          <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
            {prevLabel}
          </Text>
          <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
            {nextLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HeroCard;
