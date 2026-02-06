import { z } from "zod";

export const QuizQuestionSchema = z.object({
  id: z.union([z.number(), z.string()]),
  type: z.string().default("mcq"), // Default to mcq if missing, though type definition says union string
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string(), z.any()), // specific strict object validation can be added if structure is known
  ]).optional(),
  explanation: z.string().optional(),
  image: z.string().optional(),
  section: z.string().optional(),
});

export const QuizResponseSchema = z.union([
    z.array(QuizQuestionSchema),
    z.object({
        questions: z.array(QuizQuestionSchema)
    })
]);
