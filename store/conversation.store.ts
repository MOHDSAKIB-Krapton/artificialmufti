import { ChatMessage, ConversationMeta } from "@/services/conversation/types";
import { create } from "zustand";

type State = {
  active: ConversationMeta | null;
  messages: Record<string, ChatMessage[]>;
  setActive: (c: ConversationMeta | null) => void;
  setMessages: (id: string, msgs: ChatMessage[]) => void;
  appendMessage: (id: string, msg: ChatMessage) => void;
  clearActive: () => void;
};

export const useConversationStore = create<State>((set) => ({
  active: null,
  messages: {},
  setActive: (c) => set({ active: c }),
  clearActive: () => set({ active: null }),
  setMessages: (id, msgs) =>
    set((s) => ({ messages: { ...s.messages, [id]: msgs } })),
  appendMessage: (id, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [id]: [msg, ...(s.messages[id] ?? [])],
      },
    })),
}));
