import ChatComposer from "@/components/chat/composer";
import { mockChat } from "@/constants/mock";
import { useTheme } from "@/hooks/useTheme";
import React, { useRef, useState } from "react";
import { FlatList, Platform, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState(mockChat);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "user", message: input },
    ]);
    setInput("");
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const renderItem = ({ item }: { item: (typeof mockChat)[0] }) => {
    if (item.sender === "user") {
      return (
        <View
          className="my-2 ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 shadow"
          style={{
            backgroundColor: theme.accent || theme.card,
          }}
        >
          <Text
            className="text-base"
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
        <View className="my-2">
          <Text
            className="text-base leading-relaxed"
            style={{ color: theme.text }}
          >
            {item.message}
          </Text>
        </View>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "translate-with-padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -20}
    >
      <SafeAreaView
        className="flex-1"
        edges={["bottom", "top"]}
        style={{ backgroundColor: theme.background }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          initialNumToRender={10} // how many to render initially
          maxToRenderPerBatch={10} // batch render size
          windowSize={5} // number of screens worth to render
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          className="flex-1 px-4 pt-3"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          inverted
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={() => <View className="h-6" />}
          // keyboardDismissMode="on-drag"
        />

        <ChatComposer
          enableAttachments={false}
          onSendText={handleSend}
          enableVoice={false}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Chat;
