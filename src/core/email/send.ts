import { render } from "@react-email/render";
import { Resend } from "resend";

import { env } from "@/core/env";

type Email = {
  to: string;
  subject: string;
  react: React.ReactElement;
};

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, react }: Email) {
  // No API key: print the email instead of sending it. Links in the plain-text
  // version are clickable in most terminals, so you can verify an account
  // locally without signing up for anything.
  if (!resend) {
    const text = await render(react, { plainText: true });
    console.log(
      [
        "",
        "----- Email (not sent, RESEND_API_KEY is empty) -----",
        `To: ${to}`,
        `Subject: ${subject}`,
        "",
        text,
        "------------------------------------------------------",
        "",
      ].join("\n"),
    );
    return;
  }

  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, react });

  if (error) {
    throw new Error(`Could not send "${subject}" to ${to}: ${error.message}`);
  }
}
