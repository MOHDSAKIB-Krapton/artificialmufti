import {
  CalculationParameters,
  Coordinates,
  PrayerTimes,
  SunnahTimes,
} from "adhan";
import { useEffect, useState } from "react";
import { LatLng } from "../permissions/useLocation";

export const usePrayerTimes = (
  location: LatLng | null,
  params: CalculationParameters
) => {
  const [today, setToday] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [sunnahTimes, setSunnahTimes] = useState<SunnahTimes | null>(null);

  const refreshPrayerTimes = () => {
    if (!location) return;

    const coord = new Coordinates(location.lat, location.lng);
    const tempPrayerTimes = new PrayerTimes(coord, today, params);
    const tempSunnahTimes = new SunnahTimes(tempPrayerTimes);

    setPrayerTimes(tempPrayerTimes);
    setSunnahTimes(tempSunnahTimes);
  };

  useEffect(() => {
    const id = setInterval(() => setToday(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    refreshPrayerTimes();
  }, [location, params]);

  return { prayerTimes, sunnahTimes, today, refreshPrayerTimes, setToday };
};
