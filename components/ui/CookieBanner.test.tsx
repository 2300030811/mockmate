import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { CookieBanner } from "./CookieBanner";

describe("CookieBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render when consent is already set in localStorage", () => {
    localStorage.setItem("mockmate_cookie_consent", "accepted");
    const { container } = render(<CookieBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("stores 'accepted' in localStorage when clicking Accept All", () => {
    render(<CookieBanner />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const acceptBtn = screen.getByRole("button", { name: /accept all cookies/i });
    expect(acceptBtn).toBeDefined();

    act(() => {
      fireEvent.click(acceptBtn);
    });

    expect(localStorage.getItem("mockmate_cookie_consent")).toBe("accepted");
  });

  it("stores 'essential' in localStorage when clicking Essential Only", () => {
    render(<CookieBanner />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const essentialBtn = screen.getByRole("button", { name: /essential only/i });
    expect(essentialBtn).toBeDefined();

    act(() => {
      fireEvent.click(essentialBtn);
    });

    expect(localStorage.getItem("mockmate_cookie_consent")).toBe("essential");
  });
});
