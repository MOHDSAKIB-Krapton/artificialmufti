import { CalculationParameters, Coordinates, PrayerTimes } from "adhan";
import { useEffect, useRef, useState } from "react";
import { LatLng } from "./permissions/useLocation";

export const usePrayerTimes = (
  location: LatLng | null,
  params: CalculationParameters
) => {
  const [today, setToday] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);

  const refreshPrayerTimes = () => {
    if (!location) return;
    const coord = new Coordinates(location.lat, location.lng);
    setPrayerTimes(new PrayerTimes(coord, today, params));
  };

  useEffect(() => {
    refreshPrayerTimes();
  }, [location, params]);

  // 🔬 instrumentation
  const prevParamsRef = useRef<CalculationParameters | null>(null);
  const fireCount = useRef(0);

  useEffect(() => {
    fireCount.current += 1;
    const sameRef = prevParamsRef.current === params;
    console.log(
      `[usePrayerTimes] effect fired #${fireCount.current} | params sameRef?`,
      sameRef
    );
    prevParamsRef.current = params;

    refreshPrayerTimes();
  }, [location, params]); // <-- params changing each render causes infinite loop

  return { prayerTimes, today, refreshPrayerTimes, setToday };
};
