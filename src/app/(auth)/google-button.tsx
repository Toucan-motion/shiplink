import { Button } from "@/components/ui/button";
import { logInWithGoogle } from "@/core/auth/actions";

export function GoogleButton() {
  return (
    <form action={logInWithGoogle}>
      <Button type="submit" variant="outline" className="w-full">
        Continue with Google
      </Button>
    </form>
  );
}
