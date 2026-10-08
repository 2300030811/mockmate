import { describe, it, expect } from "vitest";
import {
  tierOf,
  drivePackage,
  tierLabel,
  tierShortLabel,
  tierBadgeClasses,
} from "./placement-tier";

describe("placement-tier utilities", () => {
  describe("tierOf", () => {
    it("categorizes >= 20 LPA as super_dream", () => {
      expect(tierOf(20)).toBe("super_dream");
      expect(tierOf(33.5)).toBe("super_dream");
      expect(tierOf(50)).toBe("super_dream");
    });

    it("categorizes >= 10 and < 20 LPA as dream", () => {
      expect(tierOf(10)).toBe("dream");
      expect(tierOf(14.5)).toBe("dream");
      expect(tierOf(19.99)).toBe("dream");
    });

    it("categorizes >= 5 and < 10 LPA as core", () => {
      expect(tierOf(5)).toBe("core");
      expect(tierOf(7.6)).toBe("core");
      expect(tierOf(9.9)).toBe("core");
    });

    it("categorizes > 0 and < 5 LPA as mass", () => {
      expect(tierOf(3.6)).toBe("mass");
      expect(tierOf(4.5)).toBe("mass");
      expect(tierOf(0.1)).toBe("mass");
    });

    it("categorizes 0 or negative or null/undefined as unlisted", () => {
      expect(tierOf(0)).toBe("unlisted");
      expect(tierOf(-5)).toBe("unlisted");
      expect(tierOf(null)).toBe("unlisted");
      expect(tierOf(undefined)).toBe("unlisted");
      expect(tierOf(NaN)).toBe("unlisted");
    });
  });

  describe("drivePackage", () => {
    it("extracts package_max_lpa over package_min_lpa", () => {
      expect(drivePackage({ package_min_lpa: 6, package_max_lpa: 12 })).toBe(12);
      expect(drivePackage({ packageMinLpa: 5, packageMaxLpa: 15 })).toBe(15);
    });

    it("falls back to min if max is absent or 0", () => {
      expect(drivePackage({ package_min_lpa: 8, package_max_lpa: null })).toBe(8);
      expect(drivePackage({ packageMinLpa: 7, packageMaxLpa: 0 })).toBe(7);
    });

    it("extracts highest value from package_values if max/min absent", () => {
      expect(drivePackage({ package_values: [4.5, 9.0, 14.0] })).toBe(14.0);
    });

    it("returns null if no package is provided", () => {
      expect(drivePackage(null)).toBeNull();
      expect(drivePackage(undefined)).toBeNull();
      expect(drivePackage({})).toBeNull();
    });
  });

  describe("tierLabel & tierBadgeClasses", () => {
    it("returns readable labels and badge classes for each tier", () => {
      expect(tierShortLabel("super_dream")).toBe("Super Dream");
      expect(tierLabel("super_dream")).toContain("20+ LPA");
      const classes = tierBadgeClasses("super_dream");
      expect(classes.text).toContain("amber");
    });
  });
});
