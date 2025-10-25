export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  created_at: string;
}

export interface ConversationMeta {
  id: string;
  user_id?: string;
  title: string;
  pinned: boolean;
  updated_at: string;
  created_at: string;
}

export interface Conversation extends ConversationMeta {
  messages: ChatMessage[];
}
