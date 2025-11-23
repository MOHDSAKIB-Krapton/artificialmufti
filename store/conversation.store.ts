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
  setActive: (c) => {
    const current = get().active;
    if (current === c) return;
    set({ active: c, messages: [] });
  },
  clearActive: () => set({ active: null, messages: [] }),
  setMessages: (msgs) => set({ messages: msgs }),
  appendMessage: (role, content) => {
    const { active, messages } = get();
    if (!active) {


      const tempId = `temp-${Date.now()}`;
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

      set({ active: tempId, messages: [...messages, newMessage] });

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
    const lastMessage = messages[0];

    let updatedMessages = [...messages];

    if (lastMessage?.role === "assistant") {
      updatedMessages[0] = {
        ...lastMessage,
        content: lastMessage.content + chunk,
      };
    } else {
      const newMsg: ChatMessage = {
        id: `${Date.now()}`,
        role: "assistant",
        content: chunk,
        created_at: new Date().toISOString(),
      };
      updatedMessages = [newMsg, ...updatedMessages];
    }

    set({ messages: updatedMessages });
  },
}));
