import { vi } from "vitest";

// Next.js "server-only" Marker im Testlauf entschärfen
vi.mock("server-only", () => ({}));
