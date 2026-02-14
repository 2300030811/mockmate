
import { BaseQuizSource } from "./BaseQuizSource";
import { SimpleUrlQuizSource } from "./SimpleUrlQuizSource";
import { AzureQuizSource } from "./AzureQuizSource";
import { PCAPQuizSource } from "./PCAPQuizSource"; // We need to fix inheritance there
import { env } from "@/lib/env";

// Factory
export class QuizFactory {
  static getSource(category: string): BaseQuizSource {
    switch (category.toLowerCase()) {
      case "aws":
        return new SimpleUrlQuizSource("AWS", env.AWS_QUESTIONS_URL, 65);
      case "azure":
        // Fallback or env URL
        const azUrl = env.AZURE_QUESTIONS_URL || env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL;
        return new AzureQuizSource("Azure", azUrl, 50);
      case "salesforce":
        return new SimpleUrlQuizSource("Salesforce", env.SALESFORCE_QUESTIONS_URL, 60);
      case "mongodb":
        return new SimpleUrlQuizSource("MongoDB", env.MONGODB_QUESTIONS_URL, 60);
      case "pcap":
        return new PCAPQuizSource(env.PCAP_QUESTIONS_URL);
      case "oracle":
        return new SimpleUrlQuizSource("Oracle", env.ORACLE_QUESTIONS_URL || "https://mockmatequiz.blob.core.windows.net/quizzes/oracle.json", 50);
      default:
        throw new Error(`Unknown quiz category: ${category}`);
    }
  }
}
