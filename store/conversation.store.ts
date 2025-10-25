import {
  ChatMessage,
  ConversationMeta,
  Role,
} from "@/services/conversation/types";
import { create } from "zustand";

type State = {
  active: string | null;
  messages: ChatMessage[];
  setActive: (c: string | null) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  appendMessage: (role: Role, msg: string) => void;
  streamAssistantMessage: (chunk: string) => void;
  clearActive: () => void;
};

export const useConversationStore = create<State>((set, get) => ({
  active: null,
  messages: [],
  setActive: (c) => set({ active: c, messages: [] }),
  clearActive: () => set({ active: null }),
  setMessages: (msgs) => set({ messages: msgs }),
  appendMessage: (role, content) => {
    const { active, messages } = get();
    if (!active) {
      const newConversation: ConversationMeta = {
        id: `temp-${Date.now()}`,
        title: "New Chat",
        created_at: new Date().toISOString(),
        pinned: false,
        updated_at: new Date().toISOString(),
      };

      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        role,
        content,
        created_at: new Date().toISOString(),
      };

      set({ messages: [...messages, newMessage] });

      return;
    }

    // Existing conversation case
    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      role,
      content,
      created_at: new Date().toISOString(),
    };
    set({ messages: [newMessage, ...messages] });
  },

  streamAssistantMessage: (chunk) => {
    const { messages } = get();
    let updatedMessages = [...messages];

    // Find the last assistant message
    const lastMsgIndex = updatedMessages
      .map((m) => m.role)
      .indexOf("assistant");

    if (lastMsgIndex === -1) {
      // No assistant message yet, create a new one
      const newMsg: ChatMessage = {
        id: `${Date.now()}`,
        role: "assistant",
        content: chunk,
        created_at: new Date().toISOString(),
      };
      updatedMessages = [newMsg, ...updatedMessages];
    } else {
      const target = updatedMessages[lastMsgIndex];
      updatedMessages[lastMsgIndex] = {
        ...target,
        content: target.content + chunk,
      };
    }

    set({ messages: updatedMessages });
  },
}));
