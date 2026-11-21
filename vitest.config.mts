import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reportOnFailure: true,
      reporter: ["text", "html", "json-summary"],
      include: [
        "src/lib/**/*.ts",
        "src/actions/**/*.ts",
        "src/proxy.ts",
        "src/app/api/**/*.ts",
        "src/app/datenschutz/page.tsx",
        "src/app/kvkk/page.tsx",
        "src/app/(auth)/login/LoginForm.tsx",
        "src/app/(auth)/register/RegisterForm.tsx",
        "src/app/settings/forms.tsx",
        "src/components/FormMessages.tsx",
        "src/components/LibraryControls.tsx",
        "src/components/ProgressBar.tsx",
        "src/components/ProgressForm.tsx",
        "src/components/StarRating.tsx",
        "src/components/StatusButtons.tsx",
        "src/components/SubmitButton.tsx",
      ],
      exclude: ["src/lib/db.ts", "src/generated/**"],
    },
  },
});
