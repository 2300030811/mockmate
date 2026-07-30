export const QuizStrategyKeys = ["simple-url", "azure", "pcap"] as const;
export type QuizStrategyKey = typeof QuizStrategyKeys[number];

export const CATEGORY_CONFIGS = [
  {
    id: "aws",
    name: "AWS Certified Cloud Practitioner",
    routeSlug: "aws-quiz",
    route: "/aws-quiz",
    language: "javascript",
    strategyKey: "simple-url" as const,
    aliases: ["aws", "amazon", "amazon web services", "cloud practitioner"],
    questionsUrl: process.env.AWS_QUESTIONS_URL,
    defaultQuestionCount: 65,
  },
  {
    id: "azure",
    name: "Microsoft Azure Fundamentals",
    routeSlug: "azure-quiz",
    route: "/azure-quiz",
    language: "javascript",
    strategyKey: "azure" as const,
    aliases: ["azure", "microsoft", "az-900", "azure fundamentals"],
    questionsUrl: process.env.AZURE_QUESTIONS_URL || process.env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL,
    defaultQuestionCount: 40,
  },
  {
    id: "salesforce",
    name: "Salesforce Agentforce Specialist",
    routeSlug: "salesforce-quiz",
    route: "/salesforce-quiz",
    language: "javascript",
    strategyKey: "simple-url" as const,
    aliases: ["salesforce", "agentforce", "salesforce agentforce"],
    questionsUrl: process.env.SALESFORCE_QUESTIONS_URL,
    defaultQuestionCount: 60,
  },
  {
    id: "mongodb",
    name: "MongoDB Associate Developer",
    routeSlug: "mongodb-quiz",
    route: "/mongodb-quiz",
    language: "javascript",
    strategyKey: "simple-url" as const,
    aliases: ["mongodb", "mongo", "nosql"],
    questionsUrl: process.env.MONGODB_QUESTIONS_URL,
    defaultQuestionCount: 60,
  },
  {
    id: "pcap",
    name: "PCAP Python Certification",
    routeSlug: "pcap-quiz",
    route: "/pcap-quiz",
    language: "python",
    strategyKey: "pcap" as const,
    aliases: ["pcap", "python", "pcap python"],
    questionsUrl: process.env.PCAP_QUESTIONS_URL,
    defaultQuestionCount: 40,
  },
  {
    id: "oracle",
    name: "Oracle Certified Associate (Java)",
    routeSlug: "oracle-quiz",
    route: "/oracle-quiz",
    language: "java",
    strategyKey: "simple-url" as const,
    aliases: ["oracle", "java", "jdbc", "sql", "oracle certified associate"],
    questionsUrl: process.env.ORACLE_QUESTIONS_URL,
    defaultQuestionCount: 50,
  },
] as const;

export type QuizCategoryId = typeof CATEGORY_CONFIGS[number]["id"];

export interface QuizCategoryConfig {
  readonly id: QuizCategoryId;
  readonly name: string;
  readonly routeSlug: string;
  readonly route: string;
  readonly language: string;
  readonly strategyKey: QuizStrategyKey;
  readonly aliases: readonly string[];
  readonly questionsUrl: string | undefined;
  readonly defaultQuestionCount: number;
}

export const CATEGORY_IDS = CATEGORY_CONFIGS.map(c => c.id) as QuizCategoryId[];

/**
 * Normalizes an arena-prefixed or status-prefixed string down to its base key.
 */
function cleanCategoryInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/^arena:[^:]+:/, "")
    .replace(/^arena_[^:]+:/, "")
    .replace(/^arena_/, "")
    .replace(/:$/, "")
    .trim();
}

/**
 * Resolves any category input string or alias to a validated QuizCategoryConfig.
 */
export function resolveCategory(input: string): QuizCategoryConfig | null {
  if (!input) return null;
  const cleaned = cleanCategoryInput(input);

  // 1. Direct match on ID
  const directMatch = CATEGORY_CONFIGS.find((c) => c.id === cleaned);
  if (directMatch) return directMatch as unknown as QuizCategoryConfig;

  // 2. Alias match
  const aliasMatch = CATEGORY_CONFIGS.find((c) => (c.aliases as readonly string[]).includes(cleaned));
  if (aliasMatch) return aliasMatch as unknown as QuizCategoryConfig;

  // 3. RouteSlug match (handles URL params like "salesforce-quiz" from /[quizSlug]/mode)
  const slugMatch = CATEGORY_CONFIGS.find((c) => c.routeSlug === cleaned || c.routeSlug === input.toLowerCase().trim());
  if (slugMatch) return slugMatch as unknown as QuizCategoryConfig;

  return null;
}

/**
 * Resolves a route path to its corresponding QuizCategoryConfig.
 */
export function getCategoryByRoute(route: string): QuizCategoryConfig | null {
  if (!route) return null;
  const normalizedRoute = route.toLowerCase().split('?')[0].split('#')[0].trim();

  const match = CATEGORY_CONFIGS.find((c) => {
    return normalizedRoute === c.route || normalizedRoute.startsWith(c.route + "/");
  });

  return match ? (match as unknown as QuizCategoryConfig) : null;
}

/**
 * Returns all configured category metadata records.
 */
export function getAllCategories(): QuizCategoryConfig[] {
  return CATEGORY_CONFIGS as unknown as QuizCategoryConfig[];
}

/**
 * Validates that the registry has no duplicates, strategy keys are valid, 
 * and required environment variables exist.
 */
export function validateQuizRegistry(): void {
  const ids = CATEGORY_CONFIGS.map(c => c.id);
  const routes = CATEGORY_CONFIGS.map(c => c.route);
  const slugs = CATEGORY_CONFIGS.map(c => c.routeSlug);

  // 1. Unique IDs check
  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate category IDs found in quiz registry.");
  }

  // 2. Unique Routes check
  if (new Set(routes).size !== routes.length) {
    throw new Error("Duplicate routes found in quiz registry.");
  }

  // 3. Unique Slugs check
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Duplicate routeSlugs found in quiz registry.");
  }

  // 4. Unique Aliases check
  const allAliases = CATEGORY_CONFIGS.flatMap(c => c.aliases);
  if (new Set(allAliases).size !== allAliases.length) {
    throw new Error("Duplicate aliases found across quiz categories.");
  }

  // 5. Required env vars, route consistency & strategy keys check
  for (const config of CATEGORY_CONFIGS) {
    if (config.route !== `/${config.routeSlug}`) {
      throw new Error(`Inconsistent route '${config.route}' and routeSlug '${config.routeSlug}' for category '${config.id}'.`);
    }

    if (!QuizStrategyKeys.includes(config.strategyKey)) {
      throw new Error(`Invalid strategy key '${config.strategyKey}' for category '${config.id}'.`);
    }

    // ponytail: question URLs are server-only and optional; missing URLs log warnings at fetch time, not module load.
    if (typeof window === "undefined" && process.env.NODE_ENV === "production" && !config.questionsUrl) {
      const envKey = `${config.id.toUpperCase()}_QUESTIONS_URL`;
      console.warn(`[quiz-registry] Warning: ${envKey} is not configured for category '${config.id}'. Remote fetch will fall back to DB/mock.`);
    }
  }
}

// Auto-run validation on module load
try {
  validateQuizRegistry();
} catch (error) {
  console.error("❌ Quiz Registry Validation Failure:", error);
  // Throw at startup so that next server or tests fail fast
  throw error;
}
