import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders correctly", () => {
    render(<LoadingSpinner />);

    // Check if the spinner with the correct role exists
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("applies the correct CSS classes", () => {
    const { container } = render(<LoadingSpinner />);

    const spinnerElement = container.querySelector(".border-primary");
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass("animate-spin");
    expect(spinnerElement).toHaveClass("border-t-transparent");
  });

  it("is centered within its container", () => {
    const { container } = render(<LoadingSpinner />);

    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveClass("flex");
    expect(wrapperDiv).toHaveClass("justify-center");
  });
});
