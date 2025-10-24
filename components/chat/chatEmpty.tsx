import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  onSuggestionPress: (text: string) => void;
  onRetryConnection?: () => void;
  onImportHistory?: () => void;
  isOnline?: boolean;
  suggestions?: string[];
};

const ChatEmpty: React.FC<Props> = ({
  onSuggestionPress,
  onRetryConnection,
  onImportHistory,
  isOnline = true,
  suggestions = [
    "नमाज़ में हाथ कहां रखें?", // Hindi: Where should hands be during Salah?
    "رمضان میں روزہ کب شروع ہوتا ہے؟", // Urdu: When does fasting start in Ramadan?
    "قرض کو کیسے ادا کیا جائے؟", // Arabic: How to pay off a debt correctly?
    "Is it halal to eat frozen seafood?", // English: Practical halal question
  ],
}) => {
  const { theme } = useTheme();

  return (
    <View
      className="px-6 py-8  justify-center flex-1"
      style={{
        backgroundColor: theme.background,
        transform: [{ rotate: "180deg" }],
      }}
    >
      {/* Top icon + header */}
      <View className="items-center ">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
          <Ionicons name="chatbubbles-outline" size={28} color={theme.text} />
        </View>

        <Text
          className="mt-4 text-xl font-semibold"
          style={{ color: theme.text }}
        >
          Start a conversation
        </Text>
        <Text
          className="mt-1 text-center text-base leading-relaxed opacity-70"
          style={{ color: theme.text }}
        >
          No messages yet. Send your first message or try a quick prompt below.
        </Text>
      </View>

      {/* Quick suggestions */}
      <View className="mt-6 flex-row flex-wrap gap-2 justify-between w-full">
        {suggestions.map((s) => (
          <TouchableOpacity
            key={s}
            activeOpacity={0.6}
            onPress={() => onSuggestionPress(s)}
            className="rounded-full border px-3 py-4 w-full"
            style={{
              borderColor: theme.background,
              backgroundColor: theme.card,
            }}
          >
            <Text className="text-center" style={{ color: theme.text }}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Connection helper */}
      {/* {!isOnline && (
        <View
          className="mt-6 flex-row items-center justify-between rounded-2xl border px-4 py-3"
          style={{
            borderColor: theme.background,
            backgroundColor: theme.card,
          }}
        >
          <View className="flex-1 pr-3">
            <Text className="font-medium" style={{ color: theme.text }}>
              You're offline
            </Text>
            <Text
              className="mt-1 text-sm opacity-70"
              style={{ color: theme.text }}
            >
              Check your internet or try reconnecting.
            </Text>
          </View>
          {onRetryConnection && (
            <Pressable
              onPress={onRetryConnection}
              className="rounded-xl px-3 py-2"
              style={{ backgroundColor: theme.accent || theme.card }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: theme.textLight || theme.text }}
              >
                Retry
              </Text>
            </Pressable>
          )}
        </View>
      )} */}

      {/* Tips */}
      <View
        className="mt-8 rounded-2xl border p-4"
        style={{ borderColor: theme.background }}
      >
        <Text className="mb-2 font-semibold" style={{ color: theme.text }}>
          Tips
        </Text>
        <View className="gap-2">
          <Text className="text-sm opacity-80" style={{ color: theme.text }}>
            • Slide to open sidebar.
          </Text>
          <Text className="text-sm opacity-80" style={{ color: theme.text }}>
            • Tap to dismiss the keyboard.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ChatEmpty;
