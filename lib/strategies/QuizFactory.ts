
import { BaseQuizSource } from "./BaseQuizSource";
import { SimpleUrlQuizSource } from "./SimpleUrlQuizSource";
import { AzureQuizSource } from "./AzureQuizSource";
import { PCAPQuizSource } from "./PCAPQuizSource";
import { env } from "@/lib/env";

// Factory
export class QuizFactory {
  private static instances = new Map<string, BaseQuizSource>();

  static getSource(category: string): BaseQuizSource {
    const key = category.toLowerCase();
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    let source: BaseQuizSource;

    switch (key) {
      case "aws":
        source = new SimpleUrlQuizSource("AWS", env.AWS_QUESTIONS_URL, 65);
        break;
      case "azure":
        // Fallback or env URL
        const azUrl = env.AZURE_QUESTIONS_URL || env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL;
        source = new AzureQuizSource("Azure", azUrl, 50);
        break;
      case "salesforce":
        source = new SimpleUrlQuizSource("Salesforce", env.SALESFORCE_QUESTIONS_URL, 60);
        break;
      case "mongodb":
        source = new SimpleUrlQuizSource("MongoDB", env.MONGODB_QUESTIONS_URL, 60);
        break;
      case "pcap":
        source = new PCAPQuizSource(env.PCAP_QUESTIONS_URL);
        break;
      case "oracle":
        source = new SimpleUrlQuizSource("Oracle", env.ORACLE_QUESTIONS_URL, 50);
        break;
      default:
        throw new Error(`Unknown quiz category: ${category}`);
    }

    this.instances.set(key, source);
    return source;
  }
}
