import { describe, it, expect } from "vitest";
import { safeJsonParse } from "./safeJson";
import { z } from "zod";

const TestSchema = z.object({
  foo: z.string(),
  bar: z.number(),
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    const input = '{"foo": "hello", "bar": 123}';
    const result = safeJsonParse(input, TestSchema);
    expect(result).toEqual({ foo: "hello", bar: 123 });
  });

  it("handles Markdown code blocks", () => {
    const input = '```json\n{"foo": "hello", "bar": 123}\n```';
    const result = safeJsonParse(input, TestSchema);
    expect(result).toEqual({ foo: "hello", bar: 123 });
  });

  it("handles extra text surrounding JSON", () => {
    const input = 'Here is the response: {"foo": "hello", "bar": 123} Hope this helps.';
    const result = safeJsonParse(input, TestSchema);
    expect(result).toEqual({ foo: "hello", bar: 123 });
  });

  it("validates schema correctly", () => {
    const input = '{"foo": "hello", "bar": 456}';
    const result = safeJsonParse(input, TestSchema);
    expect(result).toEqual({ foo: "hello", bar: 456 });
  });

  it("returns null for broken syntax", () => {
    const input = '{"foo": "hel';
    const result = safeJsonParse(input, TestSchema);
    expect(result).toBeNull();
  });
});
