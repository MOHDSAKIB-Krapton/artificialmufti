/* -------------------- Helpers -------------------- */
export type PrayerKey =
  | "none"
  | "Fajr"
  | "Sunrise"
  | "Dhuhr"
  | "Asr"
  | "Maghrib"
  | "Isha";

export const ORDER: PrayerKey[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

export const fmtTime = (d?: Date | null) => {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleTimeString().slice(0, 5);
  }
};

export const getHijriDate = (date = new Date()) => {
  try {
    // Latin digits, Islamic calendar
    const fmt = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return fmt.format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }
};

export const getNextPrev = (
  map: Record<PrayerKey, Date | null>
): {
  prev: PrayerKey | null;
  next: PrayerKey | null;
  nextTime: Date | null;
} => {
  const now = Date.now();
  let prev: PrayerKey | null = null;

  for (const k of ORDER) {
    const t = map[k]?.getTime?.();
    if (t && t > now) {
      return { prev, next: k, nextTime: map[k] };
    }
    prev = k;
  }

  // All prayers done for today → next is tomorrow's Fajr
  const fajr = map["Fajr"];
  if (fajr) {
    const tomorrowFajr = new Date(fajr);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    return { prev: "Isha", next: "Fajr", nextTime: tomorrowFajr };
  }

  // Fallback (e.g. no valid data)
  return { prev: "Isha", next: null, nextTime: null };
};

export const fmtCountdown = (ms: number) => {
  if (ms <= 0) return "00m 00s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s.toString().padStart(2, "0")}s`;
  return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
};
