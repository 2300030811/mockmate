import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/exceptions";

const getSourceMock = vi.hoisted(() => vi.fn());
const loggerErrorMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/strategies/QuizFactory", () => ({
  QuizFactory: {
    getSource: getSourceMock,
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerErrorMock,
  },
}));

import {
  fetchAWSQuestions,
  fetchQuizQuestions,
  getRawQuestions,
} from "./quiz";

describe("quiz actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRawQuestions", () => {
    it("returns raw questions from the selected source", async () => {
      const questions = [{ id: "q1" }] as any;
      getSourceMock.mockReturnValue({
        fetchRawQuestions: vi.fn().mockResolvedValue(questions),
      });

      const result = await getRawQuestions("aws");

      expect(getSourceMock).toHaveBeenCalledWith("aws");
      expect(result).toEqual(questions);
    });

    it("throws AppError with original message for Error instances", async () => {
      getSourceMock.mockReturnValue({
        fetchRawQuestions: vi.fn().mockRejectedValue(new Error("Gateway down")),
      });

      await expect(getRawQuestions("aws")).rejects.toMatchObject({
        name: "AppError",
        message: "Gateway down",
        code: "FETCH_ERROR",
        statusCode: 500,
      });
      expect(loggerErrorMock).toHaveBeenCalled();
    });

    it("uses fallback message for unknown thrown values", async () => {
      getSourceMock.mockReturnValue({
        fetchRawQuestions: vi.fn().mockRejectedValue("boom"),
      });

      await expect(getRawQuestions("aws")).rejects.toEqual(
        new AppError("Failed to fetch questions for aws", "FETCH_ERROR", 500),
      );
      expect(loggerErrorMock).toHaveBeenCalledWith(
        "Error fetching raw questions for aws: Failed to fetch questions for aws",
        "boom",
      );
    });
  });

  describe("fetchQuizQuestions", () => {
    it("throws BAD_REQUEST for invalid quiz params", async () => {
      await expect(
        fetchQuizQuestions("not-a-real-quiz", "practice", "10"),
      ).rejects.toMatchObject({
        name: "AppError",
        message: "Invalid quiz parameters",
        code: "BAD_REQUEST",
        statusCode: 400,
      });
      expect(loggerErrorMock).toHaveBeenCalledWith(
        "Invalid quiz parameters:",
        expect.anything(),
      );
    });

    it("delegates to strategy source for valid input", async () => {
      const questions = [{ id: "q2" }] as any;
      const getQuestionsMock = vi.fn().mockResolvedValue(questions);
      getSourceMock.mockReturnValue({
        getQuestions: getQuestionsMock,
      });

      const result = await fetchQuizQuestions("aws", "exam", "all");

      expect(getSourceMock).toHaveBeenCalledWith("aws");
      expect(getQuestionsMock).toHaveBeenCalledWith("exam", "all");
      expect(result).toEqual(questions);
    });
  });

  it("fetchAWSQuestions forwards mode and count to shared fetcher", async () => {
    const questions = [{ id: "q3" }] as any;
    const getQuestionsMock = vi.fn().mockResolvedValue(questions);
    getSourceMock.mockReturnValue({
      getQuestions: getQuestionsMock,
    });

    const result = await fetchAWSQuestions("practice", "5");

    expect(getSourceMock).toHaveBeenCalledWith("aws");
    expect(getQuestionsMock).toHaveBeenCalledWith("practice", "5");
    expect(result).toEqual(questions);
  });
});
