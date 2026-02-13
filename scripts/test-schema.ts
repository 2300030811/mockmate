import { z } from 'zod';

const AnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100).default(0),
  extractedSkills: z.array(z.object({
    name: z.string(),
    category: z.enum(["technical", "soft", "domain"]).catch("technical") // robust fallback
  })).default([]),
  missingSkills: z.array(z.object({
    skill: z.string(),
    category: z.enum(["technical", "soft", "domain"]).catch("technical"),
    importance: z.enum(["high", "medium", "low"]).catch("medium"),
    recommendedQuiz: z.enum(["aws", "azure", "mongodb", "salesforce", "pcap", "java"]).optional()
  })).default([]),
  roadmap: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    resources: z.array(z.object({
      name: z.string(),
      url: z.string(),
      type: z.enum(["course", "article", "project"]).catch("article")
    })).default([])
  })).default([])
});

// Test Case 1: Valid Data
const validData = {
  matchScore: 85,
  extractedSkills: [{ name: "Java", category: "technical" }],
  missingSkills: [{ skill: "AWS", category: "technical", importance: "high", recommendedQuiz: "aws" }],
  roadmap: []
};

// Test Case 2: Invalid Enum (Should trigger .catch())
const invalidEnumData = {
  matchScore: 85,
  extractedSkills: [{ name: "Comm", category: "INVALID_CATEGORY" }], // Should become "technical"
  missingSkills: [],
  roadmap: []
};

// Test Case 3: Missing Optional Field
const missingOptionalData = {
   matchScore: 50,
   missingSkills: [{ skill: "Python", category: "technical", importance: "medium" }] // recommendedQuiz missing
};

async function runTest() {
  console.log("Running validation tests...");
  try {
    console.log("Test 1 (Valid):", AnalysisSchema.parse(validData));
    console.log("Test 2 (Invalid Enum):", AnalysisSchema.parse(invalidEnumData));
    console.log("Test 3 (Missing Optional):", AnalysisSchema.parse(missingOptionalData));
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

runTest();
