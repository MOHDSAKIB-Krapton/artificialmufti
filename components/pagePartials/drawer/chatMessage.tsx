import MarkdownMessage from "@/components/common/markdown/markdownMessage";
import { useTheme } from "@/hooks/useTheme";
import { Role } from "@/services/conversation/types";
import { formatTime } from "@/utils/time";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Clipboard, Pressable, Text, ToastAndroid, View } from "react-native";

export interface ChatMessageProps {
  message: {
    id: string;
    role: Role;
    content: string;
    created_at: string;
    token_usage?: number;
    metadata?: any;
  };
  activeId?: string;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(message.content);
    setCopied(true);
    ToastAndroid.show("Message copied!", ToastAndroid.SHORT);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "system") {
    return (
      <View
        className="my-4 px-4 py-2 rounded-lg"
        style={{
          backgroundColor: "#fde2e2", // light red
          alignSelf: "center",
          maxWidth: "90%",
        }}
      >
        <Text
          style={{
            color: "#b71c1c", // dark red
            fontSize: 14,
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {message.content}
        </Text>
      </View>
    );
  }

  const isUser = message.role === "user";
  return (
    <View
      className={`my-5 ${isUser ? "ml-auto max-w-[80%]" : "max-w-full"} `}
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      <View
        className={`px-4 py-3 rounded-2xl ${
          isUser ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
        style={{
          backgroundColor: isUser ? theme.accent : theme.card,
        }}
      >
        {isUser ? (
          <Text
            className="text-lg leading-relaxed"
            style={{ color: theme.textLight }}
          >
            {message.content || "…"}
          </Text>
        ) : (
          <MarkdownMessage content={message.content || "…"} />
        )}

        {/* Optional metadata info */}
        {message.token_usage !== undefined && message.token_usage > 0 && (
          <Text
            className="mt-1 text-xs italic"
            style={{ color: theme.textLight || theme.text }}
          >
            Tokens used: {message.token_usage}
          </Text>
        )}
      </View>

      <View
        className={` mt-2 gap-x-2 items-center ${isUser ? "flex-row" : "flex-row-reverse"} `}
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
        }}
      >
        {copied ? (
          <Text
            className={`text-xs opacity-50`}
            style={{
              color: theme.text,
            }}
          >
            Copied!
          </Text>
        ) : (
          <Pressable onPress={handleCopy}>
            <Ionicons
              name="copy"
              size={10}
              color={theme.text}
              className="opacity-50"
            />
          </Pressable>
        )}
        {/* Timestamp */}
        <Text
          className={`text-xs  ${isUser ? "mr-2" : "ml-2"} opacity-50`}
          style={{
            color: theme.text,
          }}
        >
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

export default ChatMessage;
