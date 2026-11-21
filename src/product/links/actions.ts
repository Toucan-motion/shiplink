"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/core/auth/session";
import { assertWithinLimit, canUse, LimitReachedError } from "@/core/billing/plans";
import { db } from "@/core/db";
import { link } from "@/core/db/schema";
import { env } from "@/core/env";

import { isSlugTaken } from "./queries";
import { customSlugSchema, generateSlug } from "./slug";

export type CreateLinkState = { error?: string; shortUrl?: string } | undefined;

// DECISION: "example.com" is accepted and turned into "https://example.com".
// People paste URLs without the protocol all the time.
const destinationSchema = z
  .string()
  .trim()
  .min(1, "Paste the URL you want to shorten.")
  .transform((value) => (value.includes("://") ? value : `https://${value}`))
  .pipe(z.url({ protocol: /^https?$/, error: "That doesn't look like a valid web address." }));

const createLinkSchema = z.object({
  destination: destinationSchema,
  // An empty field means "generate one for me".
  slug: z.preprocess((value) => (value === "" ? undefined : value), customSlugSchema.optional()),
});

export async function createLink(_prev: CreateLinkState, formData: FormData): Promise<CreateLinkState> {
  // 1. Validate input.
  const parsed = createLinkSchema.safeParse({
    destination: formData.get("destination"),
    slug: formData.get("slug") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // 2. Who is asking.
  const user = await requireUser();

  // 3. Plan limits and features.
  if (parsed.data.slug && !(await canUse(user, "customSlug"))) {
    return { error: "Custom slugs are a Pro feature. Leave the field empty to get a random one." };
  }

  try {
    await assertWithinLimit(user, "links");
  } catch (error) {
    if (error instanceof LimitReachedError) return { error: error.message };
    throw error;
  }

  // 4. Do the work.
  const slug = parsed.data.slug ?? (await pickFreeRandomSlug());

  if (parsed.data.slug && (await isSlugTaken(slug))) {
    return { error: "That slug is already taken. Try another one." };
  }

  await db.insert(link).values({ userId: user.id, slug, destination: parsed.data.destination });

  revalidatePath("/dashboard");
  return { shortUrl: `${env.NEXT_PUBLIC_APP_URL}/${slug}` };
}

async function pickFreeRandomSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    if (!(await isSlugTaken(slug))) return slug;
  }
  throw new Error("Could not find a free random slug after 5 attempts");
}

const deleteLinkSchema = z.object({ id: z.string().min(1) });

export async function deleteLink(formData: FormData) {
  const parsed = deleteLinkSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  const user = await requireUser();

  // [ebook ch3] Ownership check.
  // The insecure version looks perfectly fine:
  //
  //   db.update(link).set({ deletedAt: new Date() }).where(eq(link.id, id))
  //
  // But the id comes from the browser, and anyone can change it. Without the
  // userId condition, any logged-in user could delete anyone else's link just
  // by sending a different id. Every query that takes an id is also scoped to
  // the current user.
  await db
    .update(link)
    .set({ deletedAt: new Date() })
    .where(and(eq(link.id, parsed.data.id), eq(link.userId, user.id), isNull(link.deletedAt)));

  revalidatePath("/dashboard");
}
