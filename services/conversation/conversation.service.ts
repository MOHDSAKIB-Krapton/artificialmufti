import Http from "@/lib/http-client";
import { ApiResponse } from "@/lib/http-client/types";
import { SseChunk, SseConversation, SseError } from "@/types/sse";
import { getStoredToken } from "@/utils/token";
import EventSource from "react-native-sse";
import { ChatMessage, Conversation } from "./types";

export class ConversationServices {
  static async getAllConversations(): Promise<Conversation[]> {
    try {
      const response = await Http.get<ApiResponse<Conversation[]>>(
        "/chat/conversations"
      );

      if (!response.success) {
        throw new Error(response.error || "Somethinw went wrong");
      }

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data ?? [];
    } catch (err: any) {
      return [];
    }
  }
  static async getMessagesOfConversation(
    conversation_id: string
  ): Promise<ChatMessage[]> {
    try {
      const response = await Http.get(`/chat/${conversation_id}/messages`);

      if (!response.success) {
        throw new Error(response.error || "Somethinw went wrong");
      }

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data ?? [];
    } catch (err: any) {
      return [];
    }
  }

  static async streamChat(
    prompt: string,
    conversationId: string = "",
    onConversationCreated?: (conversation_id: string) => void,
    onChunk?: (chunk: SseChunk) => void,
    onEnd?: (fullText: string) => void,
    onError?: (errorMsg: string) => void
  ): Promise<EventSource> {
    // Extracting token manually for SSE, Since native EventSource does not provides us header token access
    const token = await getStoredToken();

    const url = new URL(
      `/api/v1/chat/stream?prompt=${encodeURIComponent(prompt)}`,
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL
    );

    // Setting conversation id into the chat if not new chat
    if (conversationId) {
      url.searchParams.set("conversation_id", conversationId);
    }

    // setting token in query params because native EventSource does not provides us header token access
    if (token) {
      url.searchParams.set("token", token);
    }

    const es = new EventSource(url.toString());

    (es as any).addEventListener("conversation_created", (e: MessageEvent) => {
      const parsed = JSON.parse((e as MessageEvent).data) as SseConversation;
      onConversationCreated?.(parsed.conversation_id);
    });

    (es as any).addEventListener("chunk", (e: MessageEvent) => {
      const parsed = JSON.parse((e as MessageEvent).data) as SseChunk;
      onChunk?.(parsed);
    });

    (es as any).addEventListener("end", (e: MessageEvent) => {
      const parsed = JSON.parse((e as MessageEvent).data) as SseChunk;
      onEnd?.(parsed.content);
      es.close();
    });

    (es as any).addEventListener("error", (e: MessageEvent) => {
      es.close();
      const parsed = JSON.parse((e as MessageEvent).data) as SseError;
      onError?.(parsed.message || "Something went wrong");
    });

    return es;
  }
}
