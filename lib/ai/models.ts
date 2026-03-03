import { z } from "zod";

export const GeneratedQuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(1),
  answer: z.string(),
  explanation: z.string(),
  type: z.string().default("mcq"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  code: z.string().optional(),
});

export type GeneratedQuizQuestion = z.infer<typeof GeneratedQuizQuestionSchema>;

export const GeneratedQuizResponseSchema = z.array(GeneratedQuizQuestionSchema);

export type GeneratedQuizResponse = z.infer<typeof GeneratedQuizResponseSchema>;
