import Container from "@/components/common/container";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ShahadaScreen: React.FC = () => {
  const { theme } = useTheme();

  const confirmAnim = useRef(new Animated.Value(0)).current;

  const handleShahadaComplete = () => {
    Vibration.vibrate([0, 80, 0]);
    Animated.sequence([
      Animated.timing(confirmAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(confirmAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    // Optional: Save to backend via ShahadaService here
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <Container>
        <View className="flex-1 items-center justify-center px-6">
          {/* Title */}
          <Text
            className="text-center text-3xl font-bold mb-8"
            style={{ color: theme.text }}
          >
            الشَّهَادَة
          </Text>

          {/* Arabic Main Text */}
          <Text
            className="text-center text-4xl font-semibold mb-4"
            style={{ color: theme.text }}
          >
            أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّٰهُ
          </Text>
          <Text
            className="text-center text-3xl font-semibold mb-6"
            style={{ color: theme.text }}
          >
            وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ ٱللَّٰهِ
          </Text>

          {/* Transliteration */}
          <Text
            className="text-center text-sm mb-2"
            style={{ color: theme.textSecondary }}
          >
            "Ashhadu an la ilaha illa Allah, wa ashhadu anna Muhammadur rasul
            Allah"
          </Text>

          {/* Translation */}
          <Text
            className="text-center text-xs mb-8 px-4"
            style={{ color: theme.textSecondary }}
          >
            I bear witness that there is no god but Allah, and Muhammad is His
            messenger.
          </Text>

          {/* Confirmation Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShahadaComplete}
            className="py-4 px-12 rounded-full"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white text-lg font-semibold">
              I Bear Witness
            </Text>
          </TouchableOpacity>

          {/* Animated Confirmation */}
          <Animated.View
            className="absolute inset-0 items-center justify-center"
            style={{ opacity: confirmAnim }}
            pointerEvents="none"
          >
            <Ionicons name="checkmark-circle" size={100} color="#4ade80" />
            <Text
              className="mt-4 text-lg font-semibold"
              style={{ color: theme.text }}
            >
              Welcome to Islam 💚
            </Text>
          </Animated.View>
        </View>
      </Container>
    </SafeAreaView>
  );
};

export default ShahadaScreen;
