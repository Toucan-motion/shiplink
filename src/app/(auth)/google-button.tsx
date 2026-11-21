import { Button } from "@/components/ui/button";
import { logInWithGoogle } from "@/core/auth/actions";
import { env } from "@/core/env";

// Rendered on the server, so the env check never reaches the browser.
export function GoogleButton() {
  // No Google keys in .env: Google sign-in is off, so don't offer it.
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;

  return (
    <form action={logInWithGoogle}>
      <Button type="submit" variant="outline" className="w-full">
        Continue with Google
      </Button>
    </form>
  );
}
