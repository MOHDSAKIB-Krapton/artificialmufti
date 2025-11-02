// hooks/useHeading.ts
import { Accelerometer, DeviceMotion, Magnetometer } from "expo-sensors";
import { useEffect, useRef } from "react";

// Quaternion → yaw (0..2π)
function yawFromQuaternion({ x, y, z, w }: any) {
  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  let yaw = Math.atan2(siny_cosp, cosy_cosp); // −π..π
  if (yaw < 0) yaw += 2 * Math.PI;
  return yaw;
}

// Exponential moving average for degrees on shortest arc
function smoothAngle(prev: number, next: number, alpha = 0.2) {
  let delta = next - prev;
  if (delta > 180) delta -= 360;
  else if (delta < -180) delta += 360;
  return prev + alpha * delta;
}

export function useHeading(options?: { hz?: number; deadbandDeg?: number }) {
  const hz = options?.hz ?? 30;
  const deadband = options?.deadbandDeg ?? 0.5;
  const subscribers = useRef(new Set<(deg: number) => void>());
  const headingRef = useRef(0);
  let lastAcc: any, lastMag: any;

  const notify = (deg: number) => {
    subscribers.current.forEach((cb) => cb(deg));
  };

  const updateFromQuaternion = (rotation: any) => {
    const yawRad = yawFromQuaternion(rotation);
    const deg = (yawRad * 180) / Math.PI;
    const next = smoothAngle(headingRef.current, deg, 0.25);

    if (Math.abs(next - headingRef.current) > deadband) {
      headingRef.current = (next + 360) % 360;
      notify(headingRef.current);
    }
  };

  // Tilt-compensated magnetic heading fallback
  const updateFromAccelAndMag = () => {
    if (!lastAcc || !lastMag) return;
    const { x: ax, y: ay, z: az } = lastAcc;
    const { x: mx, y: my, z: mz } = lastMag;

    const normA = Math.sqrt(ax * ax + ay * ay + az * az);
    const normM = Math.sqrt(mx * mx + my * my + mz * mz);
    if (normA === 0 || normM === 0) return;

    const axn = ax / normA,
      ayn = ay / normA,
      azn = az / normA;
    const mxn = mx / normM,
      myn = my / normM,
      mzn = mz / normM;

    const hx = myn * azn - mzn * ayn;
    const hy = mzn * axn - mxn * azn;

    const deg = (Math.atan2(hy, hx) * 180) / Math.PI;
    const corrected = (deg + 360) % 360;
    const next = smoothAngle(headingRef.current, corrected);

    if (Math.abs(next - headingRef.current) > deadband) {
      headingRef.current = next;
      notify(headingRef.current);
    }
  };

  useEffect(() => {
    DeviceMotion.setUpdateInterval(1000 / hz);
    const dmSub = DeviceMotion.addListener((data) => {
      if (data?.rotation) {
        updateFromQuaternion(data.rotation);
      }
    });

    // fallback: accel + mag
    Accelerometer.setUpdateInterval(1000 / hz);
    Magnetometer.setUpdateInterval(1000 / hz);
    const accSub = Accelerometer.addListener((acc) => {
      lastAcc = acc;
      updateFromAccelAndMag();
    });
    const magSub = Magnetometer.addListener((mag) => {
      lastMag = mag;
      updateFromAccelAndMag();
    });

    return () => {
      dmSub?.remove();
      accSub?.remove();
      magSub?.remove();
    };
  }, []);

  return {
    subscribe: (cb: (deg: number) => void) => {
      subscribers.current.add(cb);

      // Immediately send initial heading
      cb(headingRef.current);

      // ✅ Correct cleanup function — returns void, not boolean
      return () => {
        subscribers.current.delete(cb);
      };
    },
    get value() {
      return headingRef.current;
    },
  };
}
