// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { RegisterForm } from "@/app/(auth)/register/RegisterForm";

afterEach(() => cleanup());

describe("Authentifizierungsformulare (UC-01)", () => {
  it("rendert das Anmeldeformular mit Identifier-, Passwortfeld und Submit-Button", () => {
    render(<LoginForm />);

    const identifier = screen.getByLabelText("E-Mail oder Benutzername");
    const password = screen.getByLabelText("Passwort");
    const submit = screen.getByRole("button", { name: "Anmelden" });

    expect(identifier).toBeRequired();
    expect(password).toBeRequired();
    expect(password).toHaveAttribute("type", "password");
    expect(submit).toBeEnabled();
  });

  it("rendert das Registrierungsformular inklusive Pflicht-Checkbox für Datenschutz & KVKK", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("E-Mail-Adresse")).toHaveAttribute("type", "email");
    const username = screen.getByLabelText("Benutzername");
    expect(username).toHaveAttribute("minlength", "3");
    expect(username).toHaveAttribute("maxlength", "20");

    const password = screen.getByLabelText(/Passwort/);
    expect(password).toHaveAttribute("minlength", "8");
    expect(password).toHaveAttribute("maxlength", "72");

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeRequired();
    expect(screen.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute("href", "/datenschutz");
    expect(screen.getByRole("link", { name: "KVKK-Aydınlatma Metni" })).toHaveAttribute("href", "/kvkk");
    expect(screen.getByRole("button", { name: "Registrieren" })).toBeEnabled();
  });
});
