

import FancyButton from "@/components/common/button";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RAZORPAY_LINK = "https://rzp.io/rzp/YYVGtmZ5";
const TERMS_URL = "https://artificial-mufti.vercel.app/terms";

export default function DonationPage() {
  const { theme } = useTheme();

  const openInApp = async (url: string) => {
    try {
      const res = await WebBrowser.openBrowserAsync(url, {
        toolbarColor: theme.primary, // Android toolbar
        controlsColor: theme.primary, // iOS controls
        enableBarCollapsing: true,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        showTitle: true,
      });

      // Optional: if user dismisses payment, you could nudge them here.
      // if (res.type === "dismiss") { /* show toast / subtle encouragement */ }
    } catch {
      // Fallback to external browser if custom tab fails
      await Linking.openURL(url);
    }
  };

  const handleDonate = () => openInApp(RAZORPAY_LINK);
  const handleOpenTerms = () => openInApp(TERMS_URL);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="items-center">
          <Ionicons name="heart-circle" size={72} color={theme.primary} />
          <Text
            className="text-3xl font-semibold mt-3"
            style={{ color: theme.text }}
          >
            Support Artificial Mufti
          </Text>
          <Text
            className="text-center text-base mt-2"
            style={{ color: theme.textSecondary }}
          >
            Help us keep faith-focused tools free, fast, and ad-free for
            everyone.
          </Text>
        </View>

        {/* Trust / Social Proof */}
        <View className="mt-8 rounded-2xl p-4 bg-black/5 dark:bg-white/5">
          <Text
            className="text-base font-semibold mb-2"
            style={{ color: theme.text }}
          >
            Your impact at a glance
          </Text>
          <View className="flex-row items-center gap-3 mt-1">
            <Ionicons name="flash" size={18} color={theme.accent} />
            <Text className="flex-1" style={{ color: theme.textSecondary }}>
              Keep the app{" "}
              <Text className="font-semibold" style={{ color: theme.text }}>
                ad-free
              </Text>{" "}
              and fast.
            </Text>
          </View>
          <View className="flex-row items-center gap-3 mt-2">
            <Ionicons name="compass-outline" size={18} color={theme.accent} />
            <Text className="flex-1" style={{ color: theme.textSecondary }}>
              Fund improvements like{" "}
              <Text className="font-semibold">Qibla AR</Text>, smarter prayer
              times, and more.
            </Text>
          </View>
          <View className="flex-row items-center gap-3 mt-2">
            <Ionicons name="people" size={18} color={theme.accent} />
            <Text className="flex-1" style={{ color: theme.textSecondary }}>
              Sponsor access for users who can’t afford premium tools.
            </Text>
          </View>
        </View>

        {/* Emotional Copy (short, high-intent) */}
        <View className="mt-8 rounded-2xl p-4 bg-black/5 dark:bg-white/5">
          <Text
            className="text-base font-semibold mb-2"
            style={{ color: theme.text }}
          >
            A small gift, a big sadaqah jāriyah
          </Text>
          <Text style={{ color: theme.textSecondary }}>
            Every contribution helps us build useful, beautiful Islamic tools
            for millions—free from ads and distractions.
            <Text className="font-semibold" style={{ color: theme.text }}>
              {" "}
              JazakAllahu khairan.
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 py-5">
        <FancyButton
          onPress={handleDonate}
          text="Donate Now"
          type="secondary"
        />

        <TouchableOpacity className="mt-4" onPress={handleOpenTerms}>
          <Text
            className="text-center underline text-xs"
            style={{ color: theme.textSecondary }}
          >
            Terms & Privacy
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
