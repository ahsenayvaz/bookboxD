// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setReadingStatusMock = vi.fn();
const setRatingMock = vi.fn();
const updateProgressMock = vi.fn();

vi.mock("@/actions/library", () => ({
  setReadingStatus: (...args: unknown[]) => setReadingStatusMock(...args),
  setRating: (...args: unknown[]) => setRatingMock(...args),
  updateProgress: (...args: unknown[]) => updateProgressMock(...args),
}));

import { ProgressBar } from "@/components/ProgressBar";
import { ProgressForm } from "@/components/ProgressForm";
import { StarRating } from "@/components/StarRating";
import { StatusButtons } from "@/components/StatusButtons";

afterEach(() => cleanup());

beforeEach(() => {
  setReadingStatusMock.mockReset().mockResolvedValue(undefined);
  setRatingMock.mockReset().mockResolvedValue({});
  updateProgressMock.mockReset().mockResolvedValue({ success: "Gespeichert" });
});

describe("Bibliothek-, Fortschritts- und Bewertungs-Komponenten (UC-04, UC-05, UC-06)", () => {
  it("rendert ProgressBar mit korrekten ARIA-Prozentwerten und optionaler Plan-Markierung", () => {
    render(<ProgressBar value={150} max={300} label="Lesefortschritt" marker={180} />);
    const bar = screen.getByRole("progressbar", { name: "Lesefortschritt" });
    expect(bar).toHaveAttribute("aria-valuenow", "150");
    expect(bar).toHaveAttribute("aria-valuemax", "300");
    expect(bar).toHaveAttribute("aria-valuetext", "50 %");
  });

  it("wechselt und entfernt Leselisten über StatusButtons (UC-04)", async () => {
    render(<StatusButtons olid="OL100W" status="READING" />);

    const readingBtn = screen.getByRole("button", { name: "Lese ich" });
    const readBtn = screen.getByRole("button", { name: "Gelesen" });
    expect(readingBtn).toHaveAttribute("aria-pressed", "true");
    expect(readBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(readBtn);
    await waitFor(() => expect(setReadingStatusMock).toHaveBeenCalledWith("OL100W", "READ"));

    // Erneuter Klick auf den aktiven Status entfernt das Buch
    fireEvent.click(readingBtn);
    await waitFor(() => expect(setReadingStatusMock).toHaveBeenCalledWith("OL100W", null));
  });

  it("vergibt und entfernt Sternebewertungen über StarRating (UC-06)", async () => {
    render(<StarRating olid="OL100W" rating={4} />);

    expect(screen.getByText("Sehr gut")).toBeInTheDocument();
    const star5 = screen.getByRole("radio", { name: "5 Sterne" });
    fireEvent.click(star5);
    await waitFor(() => expect(setRatingMock).toHaveBeenCalledWith("OL100W", 5));

    cleanup();
    render(<StarRating olid="OL100W" rating={4} />);
    const star4 = screen.getByRole("radio", { name: "4 Sterne" });
    fireEvent.click(star4);
    await waitFor(() => expect(setRatingMock).toHaveBeenCalledWith("OL100W", null));
  });

  it("zeigt Fortschrittsbalken und Seitenzahl im ProgressForm an (UC-05)", () => {
    render(<ProgressForm olid="OL100W" currentPage={75} pageCount={300} />);
    expect(screen.getByText("Seite 75 von 300")).toBeInTheDocument();
    expect(screen.getByText("25 %")).toBeInTheDocument();
    expect(screen.getByLabelText("Aktuelle Seite")).toHaveValue(75);
  });
});
