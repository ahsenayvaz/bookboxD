// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PrivacyPage from "@/app/datenschutz/page";
import KvkkPage from "@/app/kvkk/page";

afterEach(() => cleanup());

describe("Datenschutz- und KVKK-Seiten (UC-03, NFA-02)", () => {
  it("rendert die deutsche Datenschutzerklärung mit allen Pflichtabschnitten und KVKK-Link", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Datenschutzerklärung" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Verantwortlicher/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Cookies/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Öffentlich sichtbare Daten/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Deine Rechte/ })).toBeInTheDocument();
    expect(screen.getByText(/bbd_session/)).toBeInTheDocument();
    expect(screen.getByText(/bcrypt-Hash/)).toBeInTheDocument();

    const kvkkLinks = screen.getAllByRole("link", { name: "KVKK-Aydınlatma Metni" });
    expect(kvkkLinks.length).toBeGreaterThanOrEqual(1);
    expect(kvkkLinks[0]).toHaveAttribute("href", "/kvkk");
  });

  it("rendert das türkische KVKK-Aydınlatma Metni mit Art.-11-Rechten und Link zur deutschen Fassung", () => {
    render(<KvkkPage />);

    expect(screen.getByRole("heading", { level: 1, name: "KVKK Aydınlatma Metni" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Veri Sorumlusu/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /İlgili Kişinin Hakları \(KVKK md\. 11\)/ })).toBeInTheDocument();
    expect(screen.getByText(/6698 sayılı/)).toBeInTheDocument();

    const deLink = screen.getByRole("link", { name: "Datenschutzerklärung" });
    expect(deLink).toHaveAttribute("href", "/datenschutz");
  });
});
