// Stops the server at boot when an environment variable is missing.
// Called from instrumentation.ts.
export async function checkEnvOnBoot() {
  try {
    await import("./core/env");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    // Next would log the error and keep running a server that fails every
    // request. Exiting makes the host (Railway, Docker) see a failed start.
    process.exit(1);
  }
}
