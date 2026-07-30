import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  const processEnv = process.env as Record<string, string | undefined>;
  const originalNodeEnv = processEnv.NODE_ENV;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    processEnv.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it("suppresses all logs in test environment", () => {
    processEnv.NODE_ENV = "test";

    logger.info("info");
    logger.warn("warn");
    logger.error("error");
    logger.debug("debug");

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("logs info outside production and skips it in production", () => {
    processEnv.NODE_ENV = "development";
    logger.info("dev-info");
    expect(infoSpy).toHaveBeenCalledOnce();

    vi.clearAllMocks();
    processEnv.NODE_ENV = "production";
    logger.info("prod-info");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("logs warn and error outside test", () => {
    processEnv.NODE_ENV = "production";

    logger.warn("warn-msg");
    logger.error("error-msg");

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("logs debug only in development", () => {
    processEnv.NODE_ENV = "production";
    logger.debug("prod-debug");
    expect(debugSpy).not.toHaveBeenCalled();

    processEnv.NODE_ENV = "development";
    logger.debug("dev-debug");
    expect(debugSpy).toHaveBeenCalledOnce();
  });
});
