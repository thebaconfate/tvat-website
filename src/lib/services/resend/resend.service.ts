import { database } from "@/lib/database";
import type { ContactFormType } from "@/lib/domain/contact";

class ResendService {
  async enqueue(email: ContactFormType) {
    /*
     * TODO: Implement this for enqueueing emails and retry later due to
     * rate limits
     */
  }
}

export const resendService = new ResendService();
