import ChatEmpty from "@/components/chat/chatEmpty";
import ChatComposer from "@/components/chat/composer";
import ChatMessage from "@/components/pagePartials/drawer/chatMessage";
import ChatMessageSkeleton from "@/components/skeletonLoaders/chatMessage";
import { useTheme } from "@/hooks/useTheme";
import { ConversationServices } from "@/services/conversation/conversation.service";
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
  const setActive = useConversationStore((s) => s.setActive);
  const setMessages = useConversationStore((s) => s.setMessages);
  const appendMessage = useConversationStore((s) => s.appendMessage);
  const streamAssistantMessage = useConversationStore(
    (s) => s.streamAssistantMessage
  );

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const convoMessages = active ? (messages ?? []) : [];

  useEffect(() => {
    getMessagesOfConversation(active);
  }, [active]);

  const getMessagesOfConversation = async (conversation_id: string | null) => {
    if (!conversation_id) return;
    try {
      setLoading(true);
      const response =
        await ConversationServices.getMessagesOfConversation(conversation_id);
      setMessages(response);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) {
      ToastAndroid.show("Comeon write something..", ToastAndroid.SHORT);
      return;
    }

    setSending(true);
    appendMessage("user", text.trim());

    const es = await ConversationServices.streamChat(
      text,
      active || undefined,
      (conversation_id: string) => {
        if (!active) {
          setActive(conversation_id);
          setSending(false);
          setIsTyping(true);
        }
      },
      (chunk) => {
        setSending(false);
        setIsTyping(true);
        streamAssistantMessage(chunk.content);
      },
      (fullText) => {
        setSending(false);
        setIsTyping(false);
        // appendMessage("assistant", fullText);
      },
      (errorMsg) => {
        setSending(false);
        setIsTyping(false);
        appendMessage("system", errorMsg);
      }
    );
  };

  const skeletonItems = Array.from({ length: 1 });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "translate-with-padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -20}
    >
      <SafeAreaView
        className="flex-1 relative"
        edges={["bottom", "top"]}
        style={{ backgroundColor: theme.background }}
      >
        <FlatList
          ref={flatListRef}
          data={loading ? skeletonItems : convoMessages}
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.id.toString()
          }
          renderItem={({ item, index }) => {
            if (loading) return <ChatMessageSkeleton key={index} />;

            // Only last assistant message shows typing
            const isLastAssistantMessage =
              index === 0 && item.role === "assistant" && isTyping;

            return (
              <ChatMessage message={item} isTyping={isLastAssistantMessage} />
            );
          }}
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
          ListFooterComponent={() => <View className="h-20" />}
          ListHeaderComponent={() => <View className="h-28" />}
          ListEmptyComponent={() => (
            <ChatEmpty onSuggestionPress={handleSend} isOnline={false} />
          )}
          keyboardDismissMode="interactive"
        />

        <View
          className="absolute bottom-[20px] left-0 right-0"
          style={{
            // margin: 10,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: theme.background,
          }}
        >
          <ChatComposer
            enableAttachments={false}
            onSendText={handleSend}
            enableVoice={false}
            textSending={sending}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Chat;
