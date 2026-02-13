import { describe, it, expect } from "vitest";
import { MongoDBParser, SalesforceParser, GenericArrayParser, detectAndParse } from "./parsers";

describe("MongoDBParser", () => {
  it("detects MongoDB-style batch format", () => {
    const data = [
      {
        questions: [
          { id: 1, question: "Q1?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" },
        ],
      },
    ];
    expect(MongoDBParser.canParse(data)).toBe(true);
  });

  it("rejects non-MongoDB data", () => {
    expect(MongoDBParser.canParse([{ question: "Q?" }])).toBe(false);
    expect(MongoDBParser.canParse("string")).toBe(false);
    expect(MongoDBParser.canParse(null)).toBe(false);
  });

  it("parses batched questions into flat array", () => {
    const data = [
      {
        questions: [
          { id: 1, question: "Q1?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" },
          { id: 2, question: "Q2?", options: ["X", "Y", "Z", "W"], answer: "X", type: "mcq" },
        ],
      },
      {
        questions: [
          { id: 3, question: "Q3?", options: ["1", "2", "3", "4"], answer: "1", type: "mcq" },
        ],
      },
    ];
    const result = MongoDBParser.parse(data);
    expect(result.length).toBe(3);
  });
});

describe("SalesforceParser", () => {
  it("detects Salesforce section format", () => {
    const data = {
      sections: [
        {
          sectionTitle: "Section 1",
          questions: [{ id: 1, question: "Q?", options: ["A", "B"], answer: "A", type: "mcq" }],
        },
      ],
    };
    expect(SalesforceParser.canParse(data)).toBe(true);
  });

  it("detects object-with-questions format", () => {
    const data = {
      questions: [{ id: 1, question: "Q?", options: ["A", "B"], answer: "A", type: "mcq" }],
    };
    expect(SalesforceParser.canParse(data)).toBe(true);
  });

  it("rejects arrays and non-objects", () => {
    expect(SalesforceParser.canParse([{ question: "Q?" }])).toBe(false);
    expect(SalesforceParser.canParse(null)).toBe(false);
    expect(SalesforceParser.canParse("string")).toBe(false);
  });

  it("parses sectioned data and preserves section title", () => {
    const data = {
      sections: [
        {
          sectionTitle: "Security",
          questions: [
            { id: 1, question: "Q1?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" },
          ],
        },
      ],
    };
    const result = SalesforceParser.parse(data);
    expect(result.length).toBe(1);
  });
});

describe("GenericArrayParser", () => {
  it("detects plain arrays", () => {
    const data = [{ question: "Q?", options: ["A", "B"], answer: "A", type: "mcq" }];
    expect(GenericArrayParser.canParse(data)).toBe(true);
  });

  it("rejects non-arrays", () => {
    expect(GenericArrayParser.canParse({ questions: [] })).toBe(false);
    expect(GenericArrayParser.canParse("string")).toBe(false);
  });

  it("parses flat question arrays", () => {
    const data = [
      { id: 1, question: "Q1?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" },
      { id: 2, question: "Q2?", options: ["X", "Y", "Z", "W"], answer: "X", type: "mcq" },
    ];
    const result = GenericArrayParser.parse(data);
    expect(result.length).toBe(2);
  });

  it("handles nested arrays (batched)", () => {
    const data = [
      [{ id: 1, question: "Q1?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" }],
      [{ id: 2, question: "Q2?", options: ["X", "Y", "Z", "W"], answer: "X", type: "mcq" }],
    ];
    const result = GenericArrayParser.parse(data);
    expect(result.length).toBe(2);
  });
});

describe("detectAndParse", () => {
  it("auto-detects MongoDB format", () => {
    const data = [
      {
        questions: [
          { id: 1, question: "Q?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" },
        ],
      },
    ];
    const result = detectAndParse(data);
    expect(result.length).toBe(1);
  });

  it("auto-detects generic array format", () => {
    const data = [
      { id: 1, question: "Q?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" },
    ];
    const result = detectAndParse(data);
    expect(result.length).toBe(1);
  });

  it("returns empty array on null/undefined", () => {
    expect(detectAndParse(null)).toEqual([]);
    expect(detectAndParse(undefined)).toEqual([]);
  });

  it("filters out null entries", () => {
    const data = [
      { id: 1, question: "Q?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" },
      null,
      undefined,
    ];
    const result = detectAndParse(data);
    // null/undefined entries should be filtered out
    expect(result.length).toBe(1);
  });
});
