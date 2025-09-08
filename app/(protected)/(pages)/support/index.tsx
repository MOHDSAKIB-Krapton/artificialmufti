import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FAQ_DATA = [
  {
    question: "How are the prayer times calculated?",
    answer:
      "The prayer times are calculated locally on your device using the 'adhan' astronomical library. It's a precise, offline calculation based on your location and the selected method (e.g., Umm Al-Qura, ISNA).",
  },
  {
    question: "Why do I need to enable location services?",
    answer:
      "Your location is essential for accurate prayer time calculations. The app uses your latitude and longitude to determine the times for your specific area.",
  },
  {
    question: "Can I use the app without location access?",
    answer:
      "No. Accurate prayer times require your location. If you deny location permission, the app cannot calculate the times correctly. You must grant the permission to use the prayer times feature.",
  },
  {
    question: "What is the difference between the calculation methods?",
    answer:
      "Different Islamic organizations and regions use slightly different parameters for prayer time calculations. The app provides various methods (like ISNA, Egyptian, etc.) so you can choose the one that matches your local community or preference.",
  },
];

const SupportPage = () => {
  const { theme } = useTheme();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendEmail = () => {
    if (!subject || !message) {
      Alert.alert(
        "Missing Information",
        "Please enter a subject and a message to send."
      );
      return;
    }

    const recipient = "support@yourapp.com"; // Replace with your support email address
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(message)}`;

    Linking.openURL(mailtoUrl)
      .then(() => {
        // Clear the form after a successful attempt to open the email app
        setSubject("");
        setMessage("");
        Alert.alert(
          "Email App Opened",
          "Your email app has been opened. Please send your message from there."
        );
      })
      .catch((err) => {
        console.error("Failed to open email client:", err);
        Alert.alert(
          "Error",
          "Could not open your email client. Please email us directly at support@yourapp.com"
        );
      });
  };

  const handleOpenWebsite = () => {
    const url = "https://your-app-website.com/help"; // Replace with your support website/FAQ page
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView className="flex-1 px-6 pt-4">
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

        {/* FAQ Section */}
        <View className="mb-8">
          <Text
            className="text-base font-space-bold mb-3"
            style={{ color: theme.text }}
          >
            Frequently Asked Questions
          </Text>
          <View
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: theme.card }}
          >
            {FAQ_DATA.map((faq, index) => (
              <View
                key={index}
                className="p-4"
                style={{
                  backgroundColor: theme.card,
                  borderBottomWidth: index < FAQ_DATA.length - 1 ? 1 : 0,
                  borderBottomColor: theme.card,
                }}
              >
                <Text
                  className="font-space-bold text-base"
                  style={{ color: theme.text }}
                >
                  {faq.question}
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  {faq.answer}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Form Section */}
        <View className="mb-8">
          <Text
            className="text-base font-space-bold mb-3"
            style={{ color: theme.text }}
          >
            Can't Find Your Answer?
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
              onPress={handleSendEmail}
            >
              <Text
                className="text-base font-space-bold"
                style={{ color: theme.textLight }}
              >
                Send Message via Email
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportPage;
