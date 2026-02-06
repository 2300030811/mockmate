// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

describe("Sanity Check", () => {
    it("has document", () => {
        expect(document).toBeDefined();
        const div = document.createElement("div");
        expect(div).toBeTruthy();
    });
});
