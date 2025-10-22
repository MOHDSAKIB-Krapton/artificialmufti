import ChatEmpty from "@/components/chat/chatEmpty";
import ChatComposer from "@/components/chat/composer";
import { useTheme } from "@/hooks/useTheme";
import { ConversationServices } from "@/services/conversation/conversation.service";
import { ChatMessage } from "@/services/conversation/types";
import { useConversationStore } from "@/store/conversation.store";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const active = useConversationStore((s) => s.active);
  const messages = useConversationStore((s) => s.messages);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const convoMessages = active?.id ? (messages[active.id] ?? []) : [];

  useEffect(() => {
    getMessagesOfConversation(active?.id);
  }, [active?.id]);

  const getMessagesOfConversation = async (
    conversation_id: string | undefined
  ) => {
    if (!conversation_id) return;
    try {
      setLoading(true);
      const response =
        await ConversationServices.getMessagesOfConversation(conversation_id);
      console.log("Conversation messages => ", response);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    // setMessages((prev) => [
    //   // ...prev,

    //   // { id: prev.length + 1, sender: "user", message: input },

    // ]);
    setInput("");
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.role === "user") {
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
            {item.content}
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
            {item.content}
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
          data={convoMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          initialNumToRender={10} // how many to render initially
          maxToRenderPerBatch={10} // batch render size
          windowSize={5} // number of screens worth to render
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          className="flex-1 px-4 pt-3"
          keyboardShouldPersistTaps="handled"
          // onContentSizeChange={() =>
          //   flatListRef.current?.scrollToEnd({ animated: true })
          // }
          // inverted
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={() => <View className="h-6" />}
          ListEmptyComponent={() => (
            <ChatEmpty
              onNewMessage={() => {}}
              onSuggestionPress={() => {}}
              isOnline={false}
            />
          )}
          keyboardDismissMode="interactive"
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
