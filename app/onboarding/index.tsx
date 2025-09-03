import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";

const Onboarding = () => {
  return (
    <LinearGradient
      colors={["#000000", "#1A202C", "#000000"]}
      className="flex-1 justify-center items-center px-7"
    >
      {/* Logo */}
      <Image
        source={require("../../assets/images/react-logo.png")}
        className="w-24 h-24 mb-8"
        style={{ tintColor: "#4A90E2" }}
      />

      {/* Heading */}
      <Text className="text-2xl font-bold text-sky-100 text-center mb-3">
        Welcome to Artificial Mufti
      </Text>

      {/* Tagline */}
      <Text className="text-base text-slate-300 text-center leading-6 mb-10">
        Your AI-powered companion for a new era of intelligence.
      </Text>

      {/* Primary CTA */}
      <TouchableOpacity
        className="bg-sky-500 py-4 rounded-xl w-full mb-4 shadow-lg"
        style={{
          shadowColor: "#4A90E2",
          shadowOpacity: 0.5,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        }}
        onPress={() => router.push("/(protected)/(drawer)")}
      >
        <Text className="text-white text-base font-semibold text-center">
          Initiate Protocol
        </Text>
      </TouchableOpacity>

      {/* Secondary CTA */}
      <TouchableOpacity className="flex-row items-center border border-sky-500 py-3 rounded-xl w-full mb-7 justify-center">
        {/* <Image
          source={require("../../assets/images/google.png")}
          className="w-5 h-5 mr-2"
        /> */}
        <Text className="text-base font-medium text-sky-100">
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text className="text-xs text-slate-300 text-center">
        By continuing you agree to our{" "}
        <Text className="text-sky-500 font-semibold">Terms</Text> &{" "}
        <Text className="text-sky-500 font-semibold">Privacy Policy</Text>
      </Text>
    </LinearGradient>
  );
};

export default Onboarding;
