import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  AppState,
  Dimensions,
  Easing,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FancyButton from "@/components/common/button";
import LayoutContainer from "@/components/common/layout/container";
import { useTheme } from "@/hooks/useTheme";

// --- Constants
const KAABA = { lat: 21.4225, lng: 39.8262 };
const ALIGN_THRESHOLD_DEG = 8; // Increased for better UX
const HEADING_UPDATE_MS = 100; // More responsive
const POSITION_UPDATE_MS = 5_000; // More frequent updates
const POSITION_MIN_DIST_M = 3; // More sensitive to movement
const HAPTIC_COOLDOWN_MS = 1000; // Reduced for better feedback
const SENSOR_TIMEOUT_MS = 10_000; // Watchdog for stuck sensors
const MAX_RETRIES = 3;

// Screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.8, 300);
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 350);

type LatLng = { lat: number; lng: number };
type PermissionState = "loading" | "granted" | "denied" | "retry";
type CompassQuality = "excellent" | "good" | "fair" | "poor" | "interference";
type AppPhase =
  | "initializing"
  | "requesting_location"
  | "starting_sensors"
  | "active"
  | "error";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const normalize360 = (deg: number) => ((deg % 360) + 360) % 360;
const shortestDelta = (from: number, to: number) => {
  const a = normalize360(from);
  const b = normalize360(to);
  const diff = b - a;
  return ((diff + 540) % 360) - 180;
};

const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Handle edge cases
  if (Math.abs(lat1) > 89.9 || Math.abs(lat2) > 89.9) {
    return 0; // Default for polar regions
  }

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return normalize360(toDeg(Math.atan2(y, x)));
};

const magnitude = (x: number, y: number, z: number): number =>
  Math.sqrt(x * x + y * y + z * z);

const assessCompassQuality = (fieldStrength: number): CompassQuality => {
  if (fieldStrength < 15 || fieldStrength > 100) return "interference";
  if (fieldStrength < 20 || fieldStrength > 80) return "poor";
  if (fieldStrength < 25 || fieldStrength > 65) return "fair";
  if (fieldStrength < 30 || fieldStrength > 60) return "good";
  return "excellent";
};

const QiblaScreen: React.FC = () => {
  const { theme } = useTheme();

  // Core state
  const [appPhase, setAppPhase] = useState<AppPhase>("initializing");
  const [permissionState, setPermissionState] =
    useState<PermissionState>("loading");
  const [position, setPosition] = useState<LatLng | null>(null);
  const [bearing, setBearing] = useState(0);
  const [heading, setHeading] = useState(0);
  const [compassQuality, setCompassQuality] = useState<CompassQuality>("poor");
  const [statusMsg, setStatusMsg] = useState("Initializing...");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [sensorLastUpdate, setSensorLastUpdate] = useState(Date.now());

  // Animation refs
  const rotAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lastHapticRef = useRef<number>(0);
  const lastHeadingValue = useRef<number>(0);

  // Cleanup refs
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const headingSubRef = useRef<(() => void) | null>(null);
  const magnetometerSubRef = useRef<{ remove: () => void } | null>(null);
  const sensorWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Computed values
  const offBy = useMemo(
    () => Math.abs(shortestDelta(heading, bearing)),
    [heading, bearing]
  );

  const isAligned = useMemo(() => offBy <= ALIGN_THRESHOLD_DEG, [offBy]);

  const guidance = useMemo(() => {
    const delta = shortestDelta(heading, bearing);
    const dir = delta > 0 ? "right" : "left";
    const deg = Math.round(Math.abs(delta));
    const intensity = deg > 45 ? "a lot" : deg > 15 ? "slightly" : "gently";
    return { dir, deg, intensity };
  }, [heading, bearing]);

  // Cleanup function
  const cleanup = useCallback(() => {
    locationSubRef.current?.remove();
    headingSubRef.current?.();
    magnetometerSubRef.current?.remove();
    if (sensorWatchdogRef.current) {
      clearTimeout(sensorWatchdogRef.current);
    }
    locationSubRef.current = null;
    headingSubRef.current = null;
    magnetometerSubRef.current = null;
    sensorWatchdogRef.current = null;
  }, []);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // App state handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background") {
        cleanup();
      } else if (nextAppState === "active" && appPhase === "active") {
        // Reinitialize sensors when app becomes active
        initializeSensors();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [appPhase]);

  // Sensor watchdog
  useEffect(() => {
    if (appPhase !== "active") return;

    sensorWatchdogRef.current = setTimeout(() => {
      if (Date.now() - sensorLastUpdate > SENSOR_TIMEOUT_MS) {
        setStatusMsg("Sensors not responding. Tap Re-center to retry.");
        triggerShakeAnimation();
      }
    }, SENSOR_TIMEOUT_MS);

    return () => {
      if (sensorWatchdogRef.current) {
        clearTimeout(sensorWatchdogRef.current);
      }
    };
  }, [sensorLastUpdate, appPhase]);

  // Initialize location services
  const initializeLocation = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setAppPhase("requesting_location");
      setStatusMsg("Requesting location permission...");

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!isMountedRef.current) return;

      if (status !== "granted") {
        setPermissionState("denied");
        setAppPhase("error");
        setStatusMsg(
          "Location permission required for accurate Qibla direction"
        );
        return;
      }

      setPermissionState("granted");
      setStatusMsg("Getting your location...");

      // Get initial position with timeout
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        // maximumAge: 60000,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Location timeout")), 10000)
      );

      const location = (await Promise.race([
        locationPromise,
        timeoutPromise,
      ])) as Location.LocationObject;

      if (!isMountedRef.current) return;

      const newPosition = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setPosition(newPosition);

      // Start location watching
      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: POSITION_UPDATE_MS,
          distanceInterval: POSITION_MIN_DIST_M,
        },
        (loc) => {
          if (!isMountedRef.current) return;
          setPosition({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
        }
      );

      await initializeSensors();
    } catch (error) {
      if (!isMountedRef.current) return;

      setAppPhase("error");
      setPermissionState("retry");

      if (retryCount < MAX_RETRIES) {
        setStatusMsg(
          `Location error. Retrying... (${retryCount + 1}/${MAX_RETRIES})`
        );
        setRetryCount((prev) => prev + 1);
        setTimeout(() => initializeLocation(), 2000);
      } else {
        setStatusMsg("Unable to get location. Check GPS and permissions.");
      }
    }
  }, [retryCount]);

  // Initialize compass sensors
  const initializeSensors = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setAppPhase("starting_sensors");
      setStatusMsg("Starting compass sensors...");

      let sensorStarted = false;

      // Try Location heading first (more accurate on iOS)
      try {
        const headingSub = await Location.watchHeadingAsync((hdg) => {
          if (!isMountedRef.current) return;

          const hTrue =
            Platform.OS === "ios" && hdg.trueHeading >= 0
              ? hdg.trueHeading
              : hdg.magHeading;

          const normalizedHeading = normalize360(hTrue);
          setHeading(normalizedHeading);
          lastHeadingValue.current = normalizedHeading;
          setSensorLastUpdate(Date.now());

          // Assess accuracy based on heading source
          if (Platform.OS === "ios" && hdg.trueHeading >= 0) {
            setCompassQuality("excellent");
          } else {
            setCompassQuality("good");
          }
        });

        headingSubRef.current = () => headingSub.remove();
        sensorStarted = true;
      } catch (headingError) {
        // Fallback to Magnetometer
        console.log("Heading API failed, using magnetometer:", headingError);

        magnetometerSubRef.current = Magnetometer.addListener((data) => {
          if (!isMountedRef.current) return;

          const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          const normalizedHeading = normalize360(angle);
          setHeading(normalizedHeading);
          lastHeadingValue.current = normalizedHeading;
          setSensorLastUpdate(Date.now());

          const fieldStrength = magnitude(data.x, data.y, data.z);
          setCompassQuality(assessCompassQuality(fieldStrength));
        });

        Magnetometer.setUpdateInterval(HEADING_UPDATE_MS);
        sensorStarted = true;
      }

      if (sensorStarted && isMountedRef.current) {
        setAppPhase("active");
        setStatusMsg("Compass active");
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      setAppPhase("error");
      setStatusMsg("Compass sensors unavailable on this device");
    }
  }, []);

  // Initial setup
  useEffect(() => {
    initializeLocation();
  }, []);

  // Calculate bearing when position changes
  useEffect(() => {
    if (!position) return;
    const newBearing = calculateBearing(
      position.lat,
      position.lng,
      KAABA.lat,
      KAABA.lng
    );
    setBearing(newBearing);
  }, [position]);

  // Smooth arrow rotation animation
  useEffect(() => {
    const target = normalize360(bearing - heading);

    // Get current rotation value safely
    const getCurrentRotation = (): number => {
      try {
        return (rotAnim as any)._value || lastHeadingValue.current;
      } catch {
        return lastHeadingValue.current;
      }
    };

    const current = getCurrentRotation();
    const delta = shortestDelta(current, target);
    const next = normalize360(current + delta);

    Animated.timing(rotAnim, {
      toValue: next,
      duration: Math.min(600, 200 + Math.abs(delta) * 3),
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: true,
    }).start();
  }, [bearing, heading, rotAnim]);

  // Alignment feedback
  useEffect(() => {
    const now = Date.now();
    if (
      isAligned &&
      appPhase === "active" &&
      now - lastHapticRef.current > HAPTIC_COOLDOWN_MS
    ) {
      lastHapticRef.current = now;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAligned, pulseAnim, appPhase]);

  // Shake animation for errors
  const triggerShakeAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  // Calibration helper
  const handleCalibrate = useCallback(() => {
    setIsCalibrating(true);
    setStatusMsg("Hold your phone flat and move it in a figure-8 pattern");

    setTimeout(() => {
      setIsCalibrating(false);
      setStatusMsg("Calibration complete");
    }, 3000);
  }, []);

  // Retry functionality
  const handleRetry = useCallback(() => {
    cleanup();
    setRetryCount(0);
    setAppPhase("initializing");
    setPermissionState("loading");
    setPosition(null);
    initializeLocation();
  }, [cleanup, initializeLocation]);

  // Re-center functionality
  const handleRecenter = useCallback(() => {
    const target = normalize360(bearing - heading);
    rotAnim.stopAnimation(() => {
      rotAnim.setValue(target);
    });

    // Also restart sensors if they seem stuck
    if (Date.now() - sensorLastUpdate > 5000) {
      initializeSensors();
    }
  }, [bearing, heading, rotAnim, sensorLastUpdate, initializeSensors]);

  // Status and accuracy text
  const getStatusText = (): string => {
    if (appPhase === "error") return statusMsg;
    if (permissionState === "denied") return "Location permission denied";
    if (!position) return "Getting location...";
    if (isCalibrating) return "Calibrating compass...";
    if (isAligned) return "✓ Aligned with Qibla";

    switch (compassQuality) {
      case "interference":
        return "Compass interference - move away from metal";
      case "poor":
        return "Poor compass accuracy - calibrate recommended";
      case "fair":
        return "Fair compass accuracy";
      case "good":
        return "Good compass accuracy";
      case "excellent":
        return "Excellent compass accuracy";
      default:
        return statusMsg;
    }
  };

  const getGuidanceText = (): string => {
    if (isAligned) return "Perfect! Face this direction for prayer";
    if (offBy > 90)
      return `Turn ${guidance.dir} ${guidance.intensity} (${guidance.deg}°)`;
    if (offBy > 45)
      return `Turn ${guidance.dir} ${guidance.intensity} (${guidance.deg}°)`;
    return `Turn ${guidance.dir} ${guidance.intensity} (${guidance.deg}°)`;
  };

  // Colors based on accuracy and alignment
  const getArrowColor = (): string => {
    if (isAligned) return "#10b981"; // green-500
    if (compassQuality === "interference") return "#ef4444"; // red-500
    if (compassQuality === "poor") return "#f59e0b"; // amber-500
    return "#374151"; // gray-700
  };

  const getPulseColor = (): string => {
    if (isAligned) return "#10b981";
    if (compassQuality === "interference") return "#ef4444";
    return "#94a3b8";
  };

  // Render error state
  if (appPhase === "error") {
    return (
      <LayoutContainer>
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text className="text-xl font-bold mt-4 text-center">
              {permissionState === "denied"
                ? "Permission Required"
                : "Sensor Error"}
            </Text>
            <Text className="text-gray-500 text-center mt-2 mb-8">
              {getStatusText()}
            </Text>

            {permissionState === "denied" && (
              <FancyButton
                text="Open Settings"
                iconName="settings"
                onPress={() => {
                  Alert.alert(
                    "Location Permission",
                    "Please enable location permissions in your device settings to use the Qibla finder.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Settings",
                        onPress: () => {
                          /* Open settings logic */
                        },
                      },
                    ]
                  );
                }}
              />
            )}

            <FancyButton
              text="Try Again"
              iconName="refresh"
              onPress={handleRetry}
            />
          </View>
        </SafeAreaView>
      </LayoutContainer>
    );
  }

  // Render main UI
  return (
    <SafeAreaView
      className="flex-1 "
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-1 items-center justify-between py-4">
        {/* Header */}
        <View className="items-center px-6">
          <Text className="text-2xl md:text-3xl font- text-gray-900 font-space-bold dark:text-white">
            Qibla Finder
          </Text>
          <Text
            className={`text-sm mt-1 text-center font-space ${
              isAligned
                ? "text-green-600 dark:text-green-400"
                : compassQuality === "interference"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
            }`}
            accessibilityLiveRegion="polite"
          >
            {getStatusText()}
          </Text>
        </View>

        {/* Compass Card */}
        <Animated.View
          style={{
            width: CARD_WIDTH,
          }}
          className=" items-center justify-center gap-y-8 relative"
        >
          {/* Pulse animation background */}
          <Animated.View
            style={{
              position: "absolute",
              top: -COMPASS_SIZE * 0.1, // I DID THIS
              width: COMPASS_SIZE + 60,
              height: COMPASS_SIZE + 60,
              borderRadius: (COMPASS_SIZE + 60) / 2,
              backgroundColor: getPulseColor(),
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.05, 0.2],
              }),
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            }}
          />

          {/* Compass container */}
          <View
            style={{
              width: COMPASS_SIZE,
              height: COMPASS_SIZE,
            }}
            className="relative items-center justify-center"
          >
            {/* Outer ring */}
            <View
              style={{
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
              }}
              className="rounded-full border-4 border-gray-200 dark:border-gray-700 absolute"
            />

            {/* Inner ring */}
            <View
              style={{
                width: COMPASS_SIZE * 0.7,
                height: COMPASS_SIZE * 0.7,
              }}
              className="rounded-full border border-gray-300 dark:border-gray-600 absolute opacity-50"
            />

            {/* Cardinal directions */}
            <View className="absolute inset-0">
              {/* North */}
              <View
                style={{ top: 8 }}
                className="absolute left-1/2 transform -translate-x-1/2"
              >
                <Text className="text-gray-600 dark:text-gray-400 font-space-bold">
                  N
                </Text>
              </View>
              {/* South */}
              <View
                style={{ bottom: 8 }}
                className="absolute left-1/2 transform -translate-x-1/2"
              >
                <Text className="text-gray-600 dark:text-gray-400 font-space-bold">
                  S
                </Text>
              </View>
              {/* West */}
              <View
                style={{ left: 8 }}
                className="absolute top-1/2 transform -translate-y-1/2"
              >
                <Text className="text-gray-600 dark:text-gray-400 font-space-bold">
                  W
                </Text>
              </View>
              {/* East */}
              <View
                style={{ right: 8 }}
                className="absolute top-1/2 transform -translate-y-1/2"
              >
                <Text className="text-gray-600 dark:text-gray-400 font-space-bold">
                  E
                </Text>
              </View>
            </View>

            {/* Rotating Qibla arrow */}
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotAnim.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              }}
              accessibilityRole="image"
              accessibilityLabel={`Qibla direction arrow pointing ${Math.round(bearing)} degrees`}
            >
              <Ionicons
                name="navigate"
                size={COMPASS_SIZE * 0.5}
                color={getArrowColor()}
              />
            </Animated.View>

            {/* Center dot */}
            <View className="absolute w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
          </View>

          {/* Guidance display */}
          <View className="mt-6 items-center">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
              {!isAligned && (
                <Ionicons
                  name={
                    guidance.dir === "right"
                      ? "chevron-forward"
                      : "chevron-back"
                  }
                  size={14}
                  color={isAligned ? "#10b981" : "#6b7280"}
                />
              )}
              <Text
                className={`ml-2 font-medium font-space ${
                  isAligned
                    ? "text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                accessibilityRole="text"
                accessibilityLabel={getGuidanceText()}
              >
                {isAligned ? "Aligned!" : `${guidance.deg}° ${guidance.dir}`}
              </Text>
            </View>

            {/* Additional info */}
            {position && (
              <View className="mt-3 items-center">
                <Text className="text-xs text-gray-500 dark:text-gray-400 font-space">
                  {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
                </Text>
                {!isAligned && (
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center max-w-xs font-space">
                    {getGuidanceText()}
                  </Text>
                )}
              </View>
            )}
          </View>
        </Animated.View>

        {/* Action buttons */}
        <View className="w-full px-6 gap-y-3">
          <View className="flex-row gap-x-2">
            <View className="flex-1">
              <FancyButton
                text="Re Center"
                iconName="compass-outline"
                onPress={handleRecenter}
                accessibilityLabel="Re-center compass needle"
              />
            </View>
            <View className="flex-1">
              <FancyButton
                text="Calibrate"
                iconName="sync-outline"
                onPress={handleCalibrate}
                loading={isCalibrating}
                accessibilityLabel="Calibrate compass for better accuracy"
              />
            </View>
          </View>

          {/* {(compassQuality === "poor" || compassQuality === "interference") && ( */}
          <View className="w-full">
            <FancyButton
              text="Improve Accuracy"
              iconName="build-outline"
              onPress={handleCalibrate}
              accessibilityLabel="Get help improving compass accuracy"
            />
          </View>
          {/* )} */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default QiblaScreen;
