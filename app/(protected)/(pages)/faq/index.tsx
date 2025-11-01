import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAQ_DATA = [
  {
    question: "What is Artificial Mufti?",
    answer:
      "Artificial Mufti is an AI-powered Islamic guidance assistant designed to help users get answers to religious questions instantly, based on authentic Islamic sources and scholarly opinions.",
  },
  {
    question: "Is the app a replacement for a real Mufti or scholar?",
    answer:
      "No. Artificial Mufti provides educational and reference-based answers using verified Islamic knowledge, but it is not a substitute for consulting qualified scholars in complex or personal matters.",
  },
  {
    question: "How are the prayer times calculated?",
    answer:
      "Prayer times are calculated locally using your device’s location and the ‘adhan’ astronomical library. The app supports multiple calculation methods like Umm al-Qura, ISNA, and Egyptian to match your region.",
  },
  {
    question: "Why does the app need my location?",
    answer:
      "Your location ensures accurate prayer times, Qibla direction, and Islamic date (Hijri). It helps the app align timings based on sunrise, sunset, and your local timezone.",
  },
  {
    question: "Can I use Artificial Mufti offline?",
    answer:
      "You can view previously loaded data such as prayer times or basic references offline. However, asking new AI-based questions or getting dynamic guidance requires an active internet connection.",
  },
  {
    question: "How accurate are the AI-generated answers?",
    answer:
      "Artificial Mufti uses advanced Islamic datasets and verified scholarly opinions. However, AI may occasionally misinterpret a question, so users are encouraged to verify critical matters with a human scholar.",
  },
  {
    question: "Does the app follow a specific madhhab (school of thought)?",
    answer:
      "No. Artificial Mufti provides balanced answers referencing all major Sunni schools of thought (Hanafi, Shafi'i, Maliki, Hanbali). Users can optionally select a preferred madhhab in settings for customized responses.",
  },
  {
    question: "Can I ask questions in my native language?",
    answer:
      "Yes. The app supports multiple languages. You can ask questions in English, Arabic, Urdu, or Hindi, and the AI will respond in the same or preferred language.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Yes. Your chats and questions are encrypted and stored securely. We never share your personal data or religious queries with third parties.",
  },
  {
    question: "Can I save or share fatwas (answers)?",
    answer:
      "Yes. You can bookmark any answer or share it with friends through social media or messaging apps directly from the app.",
  },
  {
    question: "What if I find a mistake in an answer?",
    answer:
      "You can report any issue directly using the 'Report Answer' option. Our review team and scholars will verify and correct it as necessary.",
  },
  {
    question: "Does the app include daily reminders or Islamic content?",
    answer:
      "Yes. Artificial Mufti includes daily duas, hadiths, prayer time notifications, and reminders for special Islamic dates and events.",
  },
  {
    question: "How often is the Islamic knowledge base updated?",
    answer:
      "Our content library is regularly updated with new verified fatwas, scholarly insights, and authentic hadith references to maintain accuracy and relevance.",
  },
  {
    question: "Can Artificial Mufti give personal rulings (fatwas)?",
    answer:
      "No. The AI offers general guidance based on Islamic principles. For personal rulings involving unique circumstances, please consult a qualified local scholar.",
  },
  {
    question: "How can I contact support or suggest improvements?",
    answer:
      "You can contact us directly from the app’s Support section or email us at support@artificialmufti.com. We welcome feedback to improve your experience.",
  },
];

const FAQPage = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
        paddingBottom: Math.max(insets.bottom - 6, 6),
      }}
    >
      <ScrollView className="flex-1 px-6 py-8">
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

        <View className="h-12" />
      </ScrollView>
    </View>
  );
};

export default FAQPage;
