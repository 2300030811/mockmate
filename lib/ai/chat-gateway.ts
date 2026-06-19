import { streamChat, ChatMessage } from "./gateway";

export type { ChatMessage };

export class AIGateway {
  static streamChat(messages: ChatMessage[], systemPrompt: string): Promise<ReadableStream> {
    return streamChat(messages, systemPrompt);
  }
}
