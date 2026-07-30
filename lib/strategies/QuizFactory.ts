import { BaseQuizSource } from "./BaseQuizSource";
import { SimpleUrlQuizSource } from "./SimpleUrlQuizSource";
import { AzureQuizSource } from "./AzureQuizSource";
import { PCAPQuizSource } from "./PCAPQuizSource";
import { resolveCategory } from "@/lib/quiz-registry";

const STRATEGY_RESOLVERS = {
  "simple-url": (name: string, url: string | undefined, count: number) => 
    new SimpleUrlQuizSource(name, url, count),
  "azure": (name: string, url: string | undefined, count: number) => 
    new AzureQuizSource(name, url, count),
  "pcap": (name: string, url: string | undefined, count: number) => 
    new PCAPQuizSource(url),
} as const;

export class QuizFactory {
  private static instances = new Map<string, BaseQuizSource>();

  static getSource(category: string): BaseQuizSource {
    const config = resolveCategory(category);
    if (!config) {
      throw new Error(`Unknown quiz category: ${category}`);
    }

    const key = config.id;
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    const resolver = STRATEGY_RESOLVERS[config.strategyKey];
    if (!resolver) {
      throw new Error(`Invalid strategy key '${config.strategyKey}' configured for category '${config.id}'.`);
    }

    // Dynamic strategy instantiation using registry properties
    const source = resolver(config.name, config.questionsUrl, config.defaultQuestionCount);
    this.instances.set(key, source);
    return source;
  }
}
