import Http from "@/lib/http-client";
import { ApiResponse } from "@/lib/http-client/types";
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
      //   toast(err.message || "Failed to fetch conversations");
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
}
