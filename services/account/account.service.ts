import Http from "@/lib/http-client";

export class AccountService {
  static async deleteAccount() {
    try {
      const response = await Http.delete("/account");
      if (!response.success) {
        throw new Error(response.error || "Somethinw went wrong");
      }

      return response.data;
    } catch (err: any) {
      throw err;
    }
  }
}