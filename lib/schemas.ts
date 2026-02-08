import { z } from "zod";

export const QuizQuestionSchema = z.object({
  id: z.union([z.number(), z.string()]),
  type: z.enum(["mcq", "hotspot", "drag_drop", "MSQ"]).or(z.string()), // strict enum but allow string for flexibility
  question: z.string(),
  code: z.string().optional(),
  options: z.array(z.string()).optional(),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string(), z.any()), 
  ]).optional(),
  explanation: z.string().optional(),
  image: z.string().optional(),
  section: z.string().optional(),
  domain: z.string().optional(),
  difficulty: z.string().optional(),
  batchId: z.string().optional(),
}).passthrough();

export const QuizResponseSchema = z.union([
    z.array(QuizQuestionSchema),
    z.object({
        questions: z.array(QuizQuestionSchema)
    })
]);
