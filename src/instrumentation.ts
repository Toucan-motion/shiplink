// Next calls register() once, when the server starts.
//
// A missing environment variable doesn't stop the server: every page shows a
// setup screen instead (see src/proxy.ts). This puts the same list in the
// server log, where you look first when a deploy misbehaves.
export async function register() {
  const { envProblems } = await import("./core/env");

  if (envProblems.length > 0) {
    console.error(
      [
        "Invalid environment variables:",
        ...envProblems.map((problem) => `  - ${problem}`),
        "",
        "Every page shows a setup screen until they're fixed.",
      ].join("\n"),
    );
  }
}
