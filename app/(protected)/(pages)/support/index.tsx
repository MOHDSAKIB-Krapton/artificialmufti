import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SupportPage = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendWhatsApp = async () => {
    if (!subject || !message) {
      Alert.alert(
        "Missing Information",
        "Please enter a subject and a message before sending."
      );
      return;
    }

    const phoneNumber = process.env.EXPO_PUBLIC_SUPPORT_NUMBER;

    // Build structured message
    const formattedMessage = `
Artificial Mufti — Support Request
----------------------------------------
Subject : ${subject}

Message :
${message}

----------------------------------------
Source : Artificial Mufti Mobile App
Date   : ${new Date().toLocaleString()}
----------------------------------------
`;

    const encodedMessage = encodeURIComponent(formattedMessage.trim());
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    setMessage("");
    setSubject("");
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("Error", "WhatsApp may not be installed.");
    }
  };

  const handleOpenWebsite = async () => {
    const url = process.env.EXPO_PUBLIC_SUPPORT_WEBSITE_URL!;
    try {
      await WebBrowser.openBrowserAsync(url, {
        enableBarCollapsing: true,
        showInRecents: true,
        readerMode: false,
      });
    } catch (err) {
      console.error("Failed to open in-app browser:", err);
    }
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
        paddingBottom: Math.max(insets.bottom - 6, 6),
      }}
    >
      <ScrollView className="flex-1 px-6 py-8">
        {/* Header Section */}
        <View className="items-center mb-8">
          <Ionicons name="help-circle" size={64} color={theme.primary} />
          <Text
            className="text-2xl font-space-bold mt-2"
            style={{ color: theme.text }}
          >
            Support Center
          </Text>
          <Text
            className="text-center text-sm mt-2"
            style={{ color: theme.textSecondary }}
          >
            Find answers to common questions or get in touch with our team.
          </Text>
        </View>

        {/* Contact Form Section */}
        <View className="mb-8">
          <Text
            className="text-base font-space-bold mb-3"
            style={{ color: theme.text }}
          >
            Have something in mind?
          </Text>
          <View className="gap-y-4">
            <TextInput
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
              className="p-3 rounded-xl border"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.card,
                color: theme.text,
              }}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Your Message"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              className="p-3 rounded-xl border"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.card,
                color: theme.text,
                minHeight: 120,
              }}
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity
              className="p-4 rounded-lg items-center"
              style={{ backgroundColor: theme.accent }}
              onPress={handleSendWhatsApp}
            >
              <Text
                className="text-base font-space-bold"
                style={{ color: theme.textLight }}
              >
                Send Message over whatsapp
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Other Resources */}
        <View className="mb-8">
          <Text
            className="text-base font-space-bold mb-3"
            style={{ color: theme.text }}
          >
            Other Resources
          </Text>
          <TouchableOpacity
            className="p-4 rounded-lg items-center"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.card,
              borderWidth: 1,
            }}
            onPress={handleOpenWebsite}
          >
            <Text
              className="text-base font-space-bold"
              style={{ color: theme.primary }}
            >
              Visit Our Help Website
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-12" />
      </ScrollView>
    </View>
  );
};

export default SupportPage;
