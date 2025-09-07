import ChatComposer from "@/components/chat/composer";
import { mockChat } from "@/constants/mock";
import { useTheme } from "@/hooks/useTheme";
import React, { useRef, useState } from "react";
import { FlatList, Platform, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState(mockChat);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

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
        <View className="my-2">
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "translate-with-padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80}
    >
      <SafeAreaView
        className="flex-1"
        edges={["bottom"]}
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

        {/* Input Bar */}
        {/* <View
          className="flex-row items-center p-3"
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.card,
            backgroundColor: theme.background,
          }}
        >
          <TextInput
            className="mr-3 flex-1 rounded-full p-4 text-base font-space"
            style={{
              backgroundColor: theme.card,
              color: theme.text,
              borderRadius: 20, // rounded rectangle, not full pill
              paddingHorizontal: 12,
              paddingVertical: 8,
              minHeight: 40,
              maxHeight: 120,
              flexGrow: 1,
            }}
            placeholder="Type your message..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            submitBehavior={"newline"}
            onSubmitEditing={handleSend}
          />
          <Pressable
            className="rounded-full py-4 px-6"
            style={{ backgroundColor: theme.accent || theme.card }}
            onPress={handleSend}
            accessibilityLabel="Send message"
            disabled={!input.trim()}
          >
            <Text
              className="text-base font-space-bold"
              style={{ color: theme.textLight || theme.text }}
            >
              Send
            </Text>
          </Pressable>
        </View> */}
        <ChatComposer
          enableAttachments={false}
          onSendText={handleSend}
          onSendImages={(arr) => {
            // upload images
          }}
          onSendFiles={(arr) => {
            // upload docs
          }}
          onSendVoice={(audio) => {
            // upload voice file
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Chat;
