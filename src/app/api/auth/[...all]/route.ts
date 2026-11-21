import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/core/auth/auth";

// Every Better Auth endpoint (OAuth callbacks, email links, ...) lives under /api/auth/*.
export const { GET, POST } = toNextJsHandler(auth);
