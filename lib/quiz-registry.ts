export type QuizStrategyKey = "simple-url" | "azure" | "pcap";

export interface QuizCategoryConfig {
  id: string; // 'aws' | 'azure' | 'salesforce' | 'mongodb' | 'pcap' | 'oracle'
  name: string; // Display friendly title
  route: string; // e.g. '/oracle-quiz'
  language: string; // e.g. 'java', 'python', 'javascript'
  strategyKey: QuizStrategyKey;
  aliases: string[]; // Aliases for resolving (e.g., ['java', 'oracle'])
}

const CATEGORY_CONFIGS: QuizCategoryConfig[] = [
  {
    id: "aws",
    name: "AWS Certified Cloud Practitioner",
    route: "/aws-quiz",
    language: "javascript",
    strategyKey: "simple-url",
    aliases: ["aws", "amazon", "amazon web services", "cloud practitioner"],
  },
  {
    id: "azure",
    name: "Microsoft Azure Fundamentals",
    route: "/azure-quiz",
    language: "javascript",
    strategyKey: "azure",
    aliases: ["azure", "microsoft", "az-900", "azure fundamentals"],
  },
  {
    id: "salesforce",
    name: "Salesforce Agentforce Specialist",
    route: "/salesforce-quiz",
    language: "javascript",
    strategyKey: "simple-url",
    aliases: ["salesforce", "agentforce", "salesforce agentforce"],
  },
  {
    id: "mongodb",
    name: "MongoDB Associate Developer",
    route: "/mongodb-quiz",
    language: "javascript",
    strategyKey: "simple-url",
    aliases: ["mongodb", "mongo", "nosql"],
  },
  {
    id: "pcap",
    name: "PCAP Python Certification",
    route: "/pcap-quiz",
    language: "python",
    strategyKey: "pcap",
    aliases: ["pcap", "python", "pcap python"],
  },
  {
    id: "oracle",
    name: "Oracle Certified Associate (Java)",
    route: "/oracle-quiz",
    language: "java",
    strategyKey: "simple-url",
    aliases: ["oracle", "java", "jdbc", "sql", "oracle certified associate"],
  },
];

/**
 * Normalizes an arena-prefixed or status-prefixed string down to its base key.
 * e.g., "arena:win:aws" -> "aws", "arena_aws" -> "aws", "Java" -> "java"
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
  if (directMatch) return directMatch;

  // 2. Alias match
  const aliasMatch = CATEGORY_CONFIGS.find((c) => c.aliases.includes(cleaned));
  if (aliasMatch) return aliasMatch;

  return null;
}

/**
 * Resolves a route path to its corresponding QuizCategoryConfig.
 * e.g. "/oracle-quiz/mode" -> Oracle config, "/aws-quiz" -> AWS config
 */
export function getCategoryByRoute(route: string): QuizCategoryConfig | null {
  if (!route) return null;
  const normalizedRoute = route.toLowerCase().split('?')[0].split('#')[0].trim();

  return CATEGORY_CONFIGS.find((c) => {
    // Exact match or matches route prefix/segment (e.g. "/aws-quiz" matches "/aws-quiz/mode")
    return normalizedRoute === c.route || normalizedRoute.startsWith(c.route + "/");
  }) || null;
}

/**
 * Returns all configured category metadata records.
 */
export function getAllCategories(): QuizCategoryConfig[] {
  return [...CATEGORY_CONFIGS];
}
