import { mockChat } from "@/constants/mock";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const { theme } = useTheme();

  const [messages, setMessages] = useState(mockChat);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "user", message: input },
    ]);
    setInput("");
  };

  const renderItem = ({ item }: { item: (typeof mockChat)[0] }) => {
    if (item.sender === "user") {
      return (
        <View
          className="my-2 ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm"
          style={{
            backgroundColor: theme.accent || theme.card,
          }}
        >
          <Text
            className="text-base font-space"
            style={{
              color: theme.textLight || theme.text,
            }}
          >
            {item.message}
          </Text>
        </View>
      );
    } else {
      return (
        <View className="my-3">
          <Text
            className="text-base leading-relaxed font-space"
            style={{ color: theme.text }}
          >
            {item.message}
          </Text>
        </View>
      );
    }
  };
  return (
    <SafeAreaView
      className="flex-1"
      edges={["bottom"]}
      style={{ backgroundColor: theme.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // fix for Android
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 100} // adjust as needed
      >
        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-4 py-3"
          keyboardShouldPersistTaps="handled"
        />

        {/* Input Bar */}
        <View
          className="flex-row items-center p-3"
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.card,
            backgroundColor: theme.background,
          }}
        >
          <TextInput
            className="mr-3 flex-1 rounded-full p-4 text-base font-space"
            style={{ backgroundColor: theme.card, color: theme.text }}
            placeholder="Type your message..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            className="rounded-full py-4 px-6"
            style={{ backgroundColor: theme.accent || theme.card }}
            onPress={handleSend}
          >
            <Text
              className="text-base font-space-bold"
              style={{ color: theme.textLight || theme.text }}
            >
              Send
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
