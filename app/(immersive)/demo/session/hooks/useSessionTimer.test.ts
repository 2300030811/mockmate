import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionTimer } from "./useSessionTimer";

describe("useSessionTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start at 0 seconds", () => {
    const { result } = renderHook(() => useSessionTimer());
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.isPaused).toBe(false);
  });

  it("should increment elapsed time every second", () => {
    const { result } = renderHook(() => useSessionTimer());

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsedSeconds).toBe(3);
  });

  it("should pause and resume the timer", () => {
    const { result } = renderHook(() => useSessionTimer());

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.elapsedSeconds).toBe(2);

    // Pause
    act(() => {
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Should still be 2 after pausing
    expect(result.current.elapsedSeconds).toBe(2);

    // Resume
    act(() => {
      result.current.resume();
    });
    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.elapsedSeconds).toBe(5);
  });

  it("should call onWarning at the warning threshold", () => {
    const onWarning = vi.fn();
    const { result } = renderHook(() =>
      useSessionTimer({ warnAtSeconds: 5, maxSeconds: 10, onWarning })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onWarning).toHaveBeenCalledTimes(1);
    expect(result.current.elapsedSeconds).toBe(5);
  });

  it("should not call onWarning more than once", () => {
    const onWarning = vi.fn();
    renderHook(() =>
      useSessionTimer({ warnAtSeconds: 3, maxSeconds: 10, onWarning })
    );

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(onWarning).toHaveBeenCalledTimes(1);
  });

  it("should call onTimeUp when max time is reached", () => {
    const onTimeUp = vi.fn();
    renderHook(() =>
      useSessionTimer({ maxSeconds: 5, warnAtSeconds: 3, onTimeUp })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it("should stop the timer permanently", () => {
    const { result } = renderHook(() => useSessionTimer());

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.elapsedSeconds).toBe(3);

    act(() => {
      result.current.stop();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.elapsedSeconds).toBe(3);
    expect(result.current.isPaused).toBe(true);
  });
});
