// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { DangerTab } from "./DangerTab";

// Mock providers and hooks
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    isAudioEnabled: true,
    toggleAudio: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Settings Components", () => {
  it("renders GeneralTab with avatar selection, display name, and live preview", () => {
    const handleSetIcon = vi.fn();
    const mockProfile = {
      id: "user-123",
      nickname: "AlexCadet",
      avatar_icon: "Ghost",
      role: "Engineer",
    };
    const mockUser = {
      id: "user-123",
      email: "alex@mockmate.io",
      user_metadata: { nickname: "AlexCadet" },
    };

    render(
      <GeneralTab
        profile={mockProfile}
        user={mockUser}
        selectedIcon="Ghost"
        setSelectedIcon={handleSetIcon}
        submitButton={<button type="submit">Save</button>}
      />
    );

    // Checks live preview and nickname input
    expect(screen.getByText("AlexCadet")).toBeInTheDocument();
    expect(screen.getByDisplayValue("AlexCadet")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alex@mockmate.io")).toBeInTheDocument();

    // Select another avatar
    const rocketAvatarBtn = screen.getByRole("button", { name: /select avatar rocket/i });
    expect(rocketAvatarBtn).toBeInTheDocument();
    fireEvent.click(rocketAvatarBtn);
    expect(handleSetIcon).toHaveBeenCalledWith("Rocket");
  });

  it("renders AppearanceTab with theme options and font scale buttons", () => {
    const mockSetTheme = vi.fn();

    render(<AppearanceTab theme="dark" setTheme={mockSetTheme} />);

    expect(screen.getByText("Obsidian Dark")).toBeInTheDocument();
    expect(screen.getByText("Crisp Light")).toBeInTheDocument();
    expect(screen.getByText("System Auto")).toBeInTheDocument();

    // Change theme to light
    const lightBtn = screen.getByText("Crisp Light").closest("button");
    if (lightBtn) {
      fireEvent.click(lightBtn);
      expect(mockSetTheme).toHaveBeenCalledWith("light");
    }

    // Check font scale buttons
    expect(screen.getByText("Compact (14px)")).toBeInTheDocument();
    expect(screen.getByText("Default (16px)")).toBeInTheDocument();
  });

  it("renders DangerTab and enforces confirmation text before account deletion", () => {
    render(<DangerTab />);

    expect(screen.getByText("Danger Zone & Data Governance")).toBeInTheDocument();
    expect(screen.getByText("GDPR Data Portability & Archive")).toBeInTheDocument();

    // Click initiate deletion
    const initiateBtn = screen.getByRole("button", { name: /initiate deletion/i });
    fireEvent.click(initiateBtn);

    // Confirm input should appear
    const confirmInput = screen.getByPlaceholderText('Type "DELETE" to confirm');
    expect(confirmInput).toBeInTheDocument();

    // Delete button should be disabled initially
    const deleteBtn = screen.getByRole("button", { name: /permanently delete account/i });
    expect(deleteBtn).toBeDisabled();

    // Type DELETE to enable
    fireEvent.change(confirmInput, { target: { value: "DELETE" } });
    expect(deleteBtn).not.toBeDisabled();
  });
});
