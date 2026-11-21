import { describe, expect, it } from "vitest";
import { bioSchema, passwordSchema, usernameSchema } from "@/lib/validation";

describe("Validierungsschemas (UC-01, UC-02)", () => {
  describe("usernameSchema", () => {
    it("akzeptiert gültige Benutzernamen und normalisiert Leerzeichen sowie Großbuchstaben", () => {
      expect(usernameSchema.parse("  Leser_42  ")).toBe("leser_42");
      expect(usernameSchema.parse("abc")).toBe("abc");
      expect(usernameSchema.parse("a".repeat(20))).toBe("a".repeat(20));
    });

    it("weist zu kurze, zu lange oder ungültige Zeichen ab", () => {
      expect(usernameSchema.safeParse("ab").success).toBe(false);
      expect(usernameSchema.safeParse("a".repeat(21)).success).toBe(false);
      expect(usernameSchema.safeParse("max-mustermann").success).toBe(false);
      expect(usernameSchema.safeParse("ümlaut").success).toBe(false);
      expect(usernameSchema.safeParse("mit leerzeichen").success).toBe(false);
    });
  });

  describe("passwordSchema (NFA-01)", () => {
    it("akzeptiert Passwörter zwischen 8 und 72 Zeichen", () => {
      expect(passwordSchema.safeParse("12345678").success).toBe(true);
      expect(passwordSchema.safeParse("a".repeat(72)).success).toBe(true);
    });

    it("weist zu kurze (<8) und zu lange (>72, bcrypt-Limit) Passwörter ab", () => {
      const tooShort = passwordSchema.safeParse("1234567");
      expect(tooShort.success).toBe(false);
      if (!tooShort.success) {
        expect(tooShort.error.issues[0].message).toContain("mindestens 8 Zeichen");
      }

      const tooLong = passwordSchema.safeParse("a".repeat(73));
      expect(tooLong.success).toBe(false);
      if (!tooLong.success) {
        expect(tooLong.error.issues[0].message).toContain("höchstens 72 Zeichen");
      }
    });
  });

  describe("bioSchema (UC-02)", () => {
    it("akzeptiert leere und bis zu 300 Zeichen lange Kurzbeschreibungen", () => {
      expect(bioSchema.parse("   ")).toBe("");
      expect(bioSchema.parse("  Ich lese gerne Klassiker.  ")).toBe("Ich lese gerne Klassiker.");
      expect(bioSchema.safeParse("x".repeat(300)).success).toBe(true);
    });

    it("weist Kurzbeschreibungen über 300 Zeichen ab", () => {
      expect(bioSchema.safeParse("x".repeat(301)).success).toBe(false);
    });
  });
});
