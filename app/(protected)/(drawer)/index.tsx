import ChatEmpty from "@/components/chat/chatEmpty";
import ChatComposer from "@/components/chat/composer";
import ChatMessage from "@/components/pagePartials/drawer/chatMessage";
import ChatMessageSkeleton from "@/components/skeletonLoaders/chatMessage";
import { useTheme } from "@/hooks/useTheme";
import { ConversationServices } from "@/services/conversation/conversation.service";
import { useAuthStore } from "@/store/auth.store";
import { useConversationStore } from "@/store/conversation.store";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, View } from "react-native";
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

  // const handleSend = async (text: string) => {
  //   if (!text.trim()) {
  //     ToastAndroid.show("Comeon write something..", ToastAndroid.SHORT);
  //     return;
  //   }

  //   setSending(true);
  //   appendMessage("user", text.trim());

  //   const es = await ConversationServices.streamChat(
  //     text,
  //     active || undefined,
  //     (conversation_id: string) => {
  //       if (!active) {
  //         setActive(conversation_id);
  //         setSending(false);
  //         setIsTyping(true);
  //       }
  //     },
  //     (chunk) => {
  //       setSending(false);
  //       setIsTyping(true);
  //       streamAssistantMessage(chunk.content);
  //     },
  //     (fullText) => {
  //       setSending(false);
  //       setIsTyping(false);
  //       appendMessage("assistant", fullText);
  //     },
  //     (errorMsg) => {
  //       console.log("ON ERROR");
  //       setSending(false);
  //       setIsTyping(false);
  //       appendMessage("system", errorMsg);
  //     }
  //   );
  // };

  const handleSend = async (text: string) => {
    if (!text.trim()) {
      appendMessage("system", "Come on, write something!");
      return;
    }

    setSending(true);
    appendMessage("user", text.trim());

    // Simulate network delay before starting stream
    await new Promise((r) => setTimeout(r, 1000));

    // Fake conversation id creation
    const fakeConversationId = "conv-" + Math.floor(Math.random() * 1000);
    if (!active) {
      setActive(fakeConversationId);
      setSending(false);
      setIsTyping(true);
    }

    const chunks = [
      "# Welcome to Your AI Assistant\n\n", // heading

      "In this session, we'll explore **Markdown formatting** and see how it renders progressively.\n\n", // bold

      "> Knowledge is power – Francis Bacon\n\n", // quote

      "Let's start with an unordered list:\n- Item 1\n", // first part of list
      "- Item 2\n", // second list item
      "- Item 3\n\n", // third list item

      "Now an ordered list:\n1. First step\n", // first ordered item
      "2. Second step\n", // second ordered item
      "3. Third step\n\n", // third ordered item

      "Inline code is great for small examples: `const x = 42;`\n", // inline code

      "Now let's try a **JavaScript code block**:\n```js\nfunction greet(name) {\n", // code start
      "  return `Hello, ${name}!`;\n", // code mid
      "}\nconsole.log(greet('World'));\n```\n\n", // code end

      "Tables are very useful, let's break them down:\n| Name  | Age | Role       |\n", // table header
      "|-------|-----|------------|\n", // table separator
      "| Alice | 25  | Developer  |\n", // first row
      "| Bob   | 30  | Designer   |\n", // second row
      "| Carol | 28  | Tester     |\n\n", // third row

      "Links can be embedded like this: [OpenAI](https://openai.com) ", // link
      "or [React Native](https://reactnative.dev) for mobile development.\n\n", // another link

      "Emphasizing text is also important: *italics*, **bold**, or ***bold italics***.\n", // emphasis

      "Finally, a short summary of what we've done:\n- Markdown headings\n- Lists\n- Quotes\n- Code (inline & block)\n- Tables\n- Links\n- Text formatting\n\n", // summary

      "This concludes our mock streaming AI response. Each chunk simulates the AI typing in real-time! ✅", // closing
    ];

    for (let i = 0; i < chunks.length; i++) {
      await new Promise((r) => setTimeout(r, 1000)); // simulate 1s delay per chunk
      setSending(false);
      setIsTyping(true);
      streamAssistantMessage(chunks[i]); // stream chunk
    }

    setSending(false);
    setIsTyping(false);
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
