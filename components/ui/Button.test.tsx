// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import "@testing-library/jest-dom";

describe("Button Component", () => {
    it("renders correctly with default props", () => {
        render(<Button>Click Me</Button>);
        const button = screen.getByRole("button", { name: "Click Me" });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("bg-white", "text-gray-900");
    });

    it("renders primary variant correctly", () => {
        render(<Button variant="primary">Submit</Button>);
        const button = screen.getByRole("button", { name: "Submit" });
        expect(button).toHaveClass("bg-gradient-to-r", "from-blue-600");
    });

    it("handles click events", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        const button = screen.getByRole("button", { name: "Click Me" });
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies disabled state", () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole("button", { name: "Disabled" });
        expect(button).toBeDisabled();
        expect(button).toHaveClass("disabled:opacity-50");
    });
});
