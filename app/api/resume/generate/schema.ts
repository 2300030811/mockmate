import { z } from "zod";

const experienceItemSchema = z.object({
  company: z.string().trim().max(120).optional().default(""),
  period: z.string().trim().max(80).optional().default(""),
  role: z.string().trim().max(120).optional().default(""),
  highlights: z.array(z.string().trim().max(300)).max(12).optional().default([]),
});

const projectItemSchema = z.object({
  title: z.string().trim().max(120).optional().default(""),
  period: z.string().trim().max(80).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  link: z.string().trim().max(300).optional().default(""),
  techStack: z.array(z.string().trim().max(80)).max(20).optional().default([]),
});

const educationItemSchema = z.object({
  program: z.string().trim().max(140).optional().default(""),
  institution: z.string().trim().max(140).optional().default(""),
  period: z.string().trim().max(80).optional().default(""),
  details: z.string().trim().max(300).optional().default(""),
});

const certificationItemSchema = z.object({
  name: z.string().trim().max(140).optional().default(""),
  issuer: z.string().trim().max(140).optional().default(""),
  year: z.string().trim().max(20).optional().default(""),
});

export const resumeGeneratePayloadSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().max(160).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  linkedin: z.string().trim().max(300).optional().default(""),
  portfolio: z.string().trim().max(300).optional().default(""),
  location: z.string().trim().max(120).optional().default(""),
  summary: z.string().trim().max(2500).optional().default(""),
  skills: z.array(z.string().trim().max(80)).max(60).optional().default([]),
  experience: z.array(experienceItemSchema).max(20).optional().default([]),
  projects: z.array(projectItemSchema).max(20).optional().default([]),
  education: z.array(educationItemSchema).max(10).optional().default([]),
  certifications: z.array(certificationItemSchema).max(20).optional().default([]),
});

export type ResumeGeneratePayload = z.infer<typeof resumeGeneratePayloadSchema>;
