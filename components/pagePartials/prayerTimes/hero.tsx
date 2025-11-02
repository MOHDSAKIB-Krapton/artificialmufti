// import { useTheme } from "@/hooks/useTheme";
// import {
//   fmtCountdown,
//   fmtTime,
//   getHijriDate,
//   PrayerKey,
// } from "@/utils/prayer/helpers";
// import { useEffect, useMemo, useState } from "react";
// import { Text, View } from "react-native";
// import ProgressBar from "./progressBar";

// const ACTIVE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// const HeroCard = ({
//   today,
//   nextLabel,
//   nextTime,
//   prevLabel,
//   prevTime,
//   currentPrayerLabel,
// }: {
//   today: Date;
//   nextLabel: string;
//   nextTime: Date | null;
//   prevLabel: string;
//   prevTime: Date | null;
//   currentPrayerLabel: PrayerKey | null;
// }) => {
//   const { theme } = useTheme();
//   const [now, setNow] = useState(Date.now());

//   // local timer (only Hero re-renders)
//   useEffect(() => {
//     const id = setInterval(() => setNow(Date.now()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   const isActivePrayer = useMemo(() => {
//     if (!prevTime || !nextTime) return false;
//     const start = prevTime.getTime();
//     const end = nextTime.getTime();
//     return now >= start && now < start + ACTIVE_WINDOW_MS;
//   }, [prevTime, nextTime, now]);

//   console.log("isActivePrayer => ", isActivePrayer);

//   const tz = useMemo(() => {
//     try {
//       return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Local";
//     } catch {
//       return "Local";
//     }
//   }, []);

//   const countdownMs = useMemo(
//     () => (nextTime ? nextTime.getTime() - now : 0),
//     [nextTime, now]
//   );

//   const progressPct = useMemo(() => {
//     if (!prevTime || !nextTime) return 0;
//     const total = nextTime.getTime() - prevTime.getTime();
//     const elapsed = now - prevTime.getTime();
//     return Math.max(0, Math.min(100, (elapsed / total) * 100));
//   }, [prevTime, nextTime, now]);

//   return (
//     <View
//       className="rounded-2xl border p-4"
//       style={{
//         borderColor: theme.accentLight ?? "#ffffff22",
//         backgroundColor: theme.card,
//       }}
//     >
//       {/* Date */}
//       <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
//         {getHijriDate(today)}
//       </Text>

//       {/* Next / Active */}
//       <View className="flex-row items-end justify-between ">
//         <View className="">
//           <Text className="text-sm" style={{ color: theme.textSecondary }}>
//             {isActivePrayer ? "Now" : "Next Prayer"}
//           </Text>
//           <Text
//             className="mt-1 mb-4"
//             style={{ color: theme.text, fontSize: 26, fontWeight: "800" }}
//           >
//             {isActivePrayer ? `It's ${currentPrayerLabel} time` : nextLabel}
//           </Text>
//         </View>

//         <View className="items-end ">
//           {!isActivePrayer ? (
//             <>
//               <Text className="text-xs" style={{ color: theme.textSecondary }}>
//                 in
//               </Text>
//               <Text
//                 style={{ color: theme.text, fontSize: 22, fontWeight: "700" }}
//               >
//                 {fmtCountdown(countdownMs)}
//               </Text>
//               <Text
//                 className="text-xs mt-1"
//                 style={{ color: theme.textSecondary }}
//               >
//                 {nextTime ? fmtTime(nextTime) : "—"} • {tz}
//               </Text>
//             </>
//           ) : (
//             <>
//               <Text className="text-xs" style={{ color: theme.textSecondary }}>
//                 Started • {tz}
//               </Text>
//             </>
//           )}
//         </View>
//       </View>

//       {/* Progress */}
//       <View className="mt-3">
//         <ProgressBar
//           trackColor={theme.background ?? "#ffffff16"}
//           fillColor={theme.primary}
//           pct={progressPct}
//         />
//         <View className="flex-row justify-between mt-1">
//           <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
//             {prevLabel}
//           </Text>
//           <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
//             {nextLabel}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default HeroCard;

import { useTheme } from "@/hooks/useTheme";
import {
  fmtCountdown,
  fmtTime,
  getHijriDate,
  PrayerKey,
} from "@/utils/prayer/helpers";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import ProgressBar from "./progressBar";

const ACTIVE_WINDOW_MS = 1 * 60 * 1000; // 10 minutes

const HeroCard = ({
  today,
  nextLabel,
  nextTime,
  prevLabel,
  prevTime,
  currentPrayerLabel,
}: {
  today: Date;
  nextLabel: string;
  nextTime: Date | null;
  prevLabel: string;
  prevTime: Date | null;
  currentPrayerLabel: PrayerKey | null;
}) => {
  const { theme } = useTheme();
  const [now, setNow] = useState(Date.now());

  // Local 1-second clock for live update
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ------------------------
  // Time Calculations
  // ------------------------
  const nextAt = nextTime?.getTime() ?? 0;
  const prevAt = prevTime?.getTime() ?? 0;

  const countdownMs = nextAt - now; // time until next prayer

  const isActivePrayer = countdownMs <= 0 && countdownMs > -ACTIVE_WINDOW_MS;
  const isUpcoming = countdownMs > 0;

  // Progress between previous and next prayer
  const progressPct = useMemo(() => {
    if (!prevTime || !nextTime) return 0;
    const total = nextAt - prevAt;
    const elapsed = now - prevAt;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [prevTime, nextTime, now]);

  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Local";
    } catch {
      return "Local";
    }
  }, []);

  // ------------------------
  // Display Strings
  // ------------------------
  const titleText = isActivePrayer ? "Now" : "Next Prayer";

  const mainText = isActivePrayer
    ? `It's ${currentPrayerLabel ?? "Prayer"} time`
    : nextLabel;

  const timeHintText = isActivePrayer
    ? `Started • ${tz}`
    : `in ${fmtCountdown(countdownMs)}`;

  const dateText = getHijriDate(today);

  return (
    <View
      className="rounded-2xl border p-4"
      style={{
        borderColor: theme.accentLight ?? "#ffffff22",
        backgroundColor: theme.card,
      }}
    >
      {/* Date (Hijri) */}
      <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
        {dateText}
      </Text>

      {/* Top Row */}
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-sm" style={{ color: theme.textSecondary }}>
            {titleText}
          </Text>
          <Text
            className="mt-1 mb-4"
            style={{ color: theme.text, fontSize: 26, fontWeight: "800" }}
          >
            {mainText}
          </Text>
        </View>

        <View className="items-end">
          {/* Upcoming prayer countdown */}
          {!isActivePrayer && (
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
          )}

          {/* Active prayer */}
          {isActivePrayer && (
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              {timeHintText}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
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
