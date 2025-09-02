import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

const Onboarding = () => {
  return (
    <LinearGradient
      colors={["#F9FAFB", "#E0F2FE", "#F9FAFB"]}
      style={styles.container}
    >
      {/* Logo */}
      <Image
        source={require("../../assets/images/react-logo.png")}
        style={styles.logo}
      />

      {/* Heading */}
      <Text style={styles.heading}>Welcome to Artificial Mufti</Text>

      {/* Tagline */}
      <Text style={styles.description}>
        Your AI-powered companion for insights, clarity, and smarter answers.
      </Text>

      {/* Primary CTA */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.push("/(protected)/(drawer)")}
      >
        <Text style={styles.primaryBtnText}>Get Started</Text>
      </TouchableOpacity>

      {/* Secondary CTA */}
      <TouchableOpacity style={styles.secondaryBtn}>
        {/* <Image
            source={require("../../assets/images/google.png")}
            style={styles.googleIcon}
          /> */}
        <Text style={styles.secondaryBtnText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footerText}>
        By continuing you agree to our <Text style={styles.link}>Terms</Text> &{" "}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>
    </LinearGradient>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    marginBottom: 16,
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    marginBottom: 28,
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
  },
  footerText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  link: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
