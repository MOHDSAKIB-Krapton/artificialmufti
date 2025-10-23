import ChatEmpty from "@/components/chat/chatEmpty";
import ChatComposer from "@/components/chat/composer";
import ChatMessage from "@/components/pagePartials/drawer/chatMessage";
import ChatMessageSkeleton from "@/components/skeletonLoaders/chatMessage";
import { useTheme } from "@/hooks/useTheme";
import { ConversationServices } from "@/services/conversation/conversation.service";
import {
  ChatMessage as ChatMessageType,
  Role,
} from "@/services/conversation/types";
import { useAuthStore } from "@/store/auth.store";
import { useConversationStore } from "@/store/conversation.store";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, ToastAndroid, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const user = useAuthStore((s) => s.user);
  const active = useConversationStore((s) => s.active);
  const messages = useConversationStore((s) => s.messages);
  const setMessages = useConversationStore((s) => s.setMessages);
  const appendMessage = useConversationStore((s) => s.appendMessage);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

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
      console.log(
        "Conversation messages => ",
        JSON.stringify(response, null, 2)
      );
      setMessages(conversation_id, response);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) {
      ToastAndroid.show("Comeon write something..", ToastAndroid.SHORT);
      return;
    }
    if (!active?.id) {
      ToastAndroid.show("No Active Convo Found", ToastAndroid.SHORT);
      return;
    }

    // Create the new message object
    const newMessage: ChatMessageType = {
      id: `${Date.now()}`,
      role: "user" as Role,
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setSending(true);
    // Append message via Zustand
    setTimeout(() => {
      setSending(false);
      appendMessage(active.id, newMessage);
      setInput("");
    }, 3000);
  };

  const skeletonItems = Array.from({ length: 1 });

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
          data={loading ? skeletonItems : convoMessages}
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.id.toString()
          }
          renderItem={({ item, index }) =>
            loading ? (
              <ChatMessageSkeleton key={index} />
            ) : (
              <ChatMessage message={item} />
            )
          }
          inverted
          initialNumToRender={10} // how many to render initially
          maxToRenderPerBatch={10} // batch render size
          windowSize={5} // number of screens worth to render
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          className="flex-1 px-4 pt-3"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={() => <View className="h-6" />}
          ListHeaderComponent={() => <View className="h-10" />}
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
          onChangeText={(text: string) => setInput(text)}
          text={input}
          textSending={sending}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Chat;
