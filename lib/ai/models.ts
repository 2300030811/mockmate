import { z } from "zod";

export const GeneratedQuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.string(),
  explanation: z.string(),
});

export type GeneratedQuizQuestion = z.infer<typeof GeneratedQuizQuestionSchema>;

export const GeneratedQuizResponseSchema = z.array(GeneratedQuizQuestionSchema);

export type GeneratedQuizResponse = z.infer<typeof GeneratedQuizResponseSchema>;
