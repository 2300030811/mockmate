import { z } from "zod";

export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.string(),
  explanation: z.string(),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizResponseSchema = z.array(QuizQuestionSchema);

export type QuizResponse = z.infer<typeof QuizResponseSchema>;
