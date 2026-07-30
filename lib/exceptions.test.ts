import { describe, expect, it } from "vitest";
import { AppError, handleError } from "./exceptions";

describe("handleError", () => {
  it("returns app error message and code", () => {
    const error = new AppError("Bad request", "BAD_REQUEST", 400);

    expect(handleError(error)).toEqual({
      error: "Bad request",
      code: "BAD_REQUEST",
    });
  });

  it("returns unknown code for standard errors", () => {
    expect(handleError(new Error("Oops"))).toEqual({
      error: "Oops",
      code: "UNKNOWN_ERROR",
    });
  });

  it("returns generic fallback for non-error values", () => {
    expect(handleError("nope")).toEqual({
      error: "An unexpected error occurred.",
      code: "UNKNOWN_ERROR",
    });
  });
});
