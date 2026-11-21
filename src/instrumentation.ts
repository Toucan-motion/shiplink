// Next calls register() once, when the server starts.
//
// next.config.ts already checks the env when you run `next dev` or `next build`.
// But a production server built with `output: "standalone"` doesn't load
// next.config.ts again, so without this a missing variable would only show
// up on the first request that needs it.
export async function register() {
  // Next also compiles this file for the Edge runtime, which has no
  // process.exit. Keeping the Node-only code in its own file avoids that.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkEnvOnBoot } = await import("./instrumentation-node");
    await checkEnvOnBoot();
  }
}
