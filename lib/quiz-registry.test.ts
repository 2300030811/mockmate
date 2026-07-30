import { describe, it, expect } from "vitest";
import { 
  getAllCategories, 
  validateQuizRegistry, 
  resolveCategory, 
  getCategoryByRoute 
} from "./quiz-registry";
import { QuizFactory } from "./strategies/QuizFactory";

describe("quiz-registry", () => {
  it("passes validation without throwing errors", () => {
    expect(() => validateQuizRegistry()).not.toThrow();
  });

  it("has unique IDs for all categories", () => {
    const categories = getAllCategories();
    const ids = categories.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("has unique routes for all categories", () => {
    const categories = getAllCategories();
    const routes = categories.map(c => c.route);
    const uniqueRoutes = new Set(routes);
    expect(uniqueRoutes.size).toBe(routes.length);
  });

  it("has unique routeSlugs for all categories", () => {
    const categories = getAllCategories();
    const slugs = categories.map(c => c.routeSlug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("resolves all category strategies via QuizFactory", () => {
    const categories = getAllCategories();
    for (const cat of categories) {
      const source = QuizFactory.getSource(cat.id);
      expect(source).toBeDefined();
    }
  });

  it("resolves categories by aliases and IDs", () => {
    // Direct ID match
    const aws = resolveCategory("aws");
    expect(aws).not.toBeNull();
    expect(aws?.id).toBe("aws");

    // Case-insensitivity
    const azure = resolveCategory("Azure");
    expect(azure).not.toBeNull();
    expect(azure?.id).toBe("azure");

    // Alias match
    const java = resolveCategory("java");
    expect(java).not.toBeNull();
    expect(java?.id).toBe("oracle");

    // Invalid input
    expect(resolveCategory("invalid-category")).toBeNull();
  });

  it("resolves categories by route path", () => {
    const aws = getCategoryByRoute("/aws-quiz");
    expect(aws).not.toBeNull();
    expect(aws?.id).toBe("aws");

    const awsMode = getCategoryByRoute("/aws-quiz/mode");
    expect(awsMode).not.toBeNull();
    expect(awsMode?.id).toBe("aws");

    expect(getCategoryByRoute("/invalid-path")).toBeNull();
  });
});
