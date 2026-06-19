import { describe, it, expect } from "vitest";
import { resolveCategory, getCategoryByRoute, getAllCategories } from "./quiz-registry";

describe("QuizRegistry", () => {
  describe("resolveCategory", () => {
    it("resolves direct matching category IDs", () => {
      const aws = resolveCategory("aws");
      expect(aws).not.toBeNull();
      expect(aws?.id).toBe("aws");
      expect(aws?.strategyKey).toBe("simple-url");

      const pcap = resolveCategory("pcap");
      expect(pcap?.id).toBe("pcap");
      expect(pcap?.strategyKey).toBe("pcap");
    });

    it("resolves alias matching inputs", () => {
      const java = resolveCategory("java");
      expect(java?.id).toBe("oracle");
      expect(java?.language).toBe("java");

      const python = resolveCategory("python");
      expect(python?.id).toBe("pcap");
      expect(python?.language).toBe("python");
    });

    it("resolves arena-prefixed inputs", () => {
      const arenaAws = resolveCategory("arena:win:aws");
      expect(arenaAws?.id).toBe("aws");

      const arenaJava = resolveCategory("arena_java");
      expect(arenaJava?.id).toBe("oracle");
    });

    it("returns null for unknown inputs", () => {
      expect(resolveCategory("unknown")).toBeNull();
      expect(resolveCategory("")).toBeNull();
    });
  });

  describe("getCategoryByRoute", () => {
    it("resolves direct route matches", () => {
      const oracle = getCategoryByRoute("/oracle-quiz");
      expect(oracle?.id).toBe("oracle");
    });

    it("resolves subpath route matches", () => {
      const aws = getCategoryByRoute("/aws-quiz/mode");
      expect(aws?.id).toBe("aws");
    });

    it("handles query params and trailing spaces", () => {
      const mongodb = getCategoryByRoute("/mongodb-quiz?mode=practice ");
      expect(mongodb?.id).toBe("mongodb");
    });

    it("returns null for non-matching routes", () => {
      expect(getCategoryByRoute("/home")).toBeNull();
    });
  });

  describe("getAllCategories", () => {
    it("returns all 6 categories", () => {
      const list = getAllCategories();
      expect(list.length).toBe(6);
      expect(list.map((c) => c.id)).toContain("aws");
      expect(list.map((c) => c.id)).toContain("azure");
      expect(list.map((c) => c.id)).toContain("salesforce");
      expect(list.map((c) => c.id)).toContain("mongodb");
      expect(list.map((c) => c.id)).toContain("pcap");
      expect(list.map((c) => c.id)).toContain("oracle");
    });
  });
});
