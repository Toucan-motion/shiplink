import { ActionEmail } from "./action-email";

export function VerifyEmail({ url }: { url: string }) {
  return (
    <ActionEmail
      preview="Confirm your email to start using ShipLink"
      heading="Confirm your email"
      body="Click the button below to confirm your email address and log in."
      buttonLabel="Confirm email"
      url={url}
      footnote="If you didn't create a ShipLink account, you can ignore this email."
    />
  );
}

export function ResetPasswordEmail({ url }: { url: string }) {
  return (
    <ActionEmail
      preview="Reset your ShipLink password"
      heading="Reset your password"
      body="Someone asked to reset the password for your ShipLink account. The link is valid for one hour."
      buttonLabel="Choose a new password"
      url={url}
      footnote="If it wasn't you, ignore this email. Your password stays the same."
    />
  );
}

export function DeleteAccountEmail({ url }: { url: string }) {
  return (
    <ActionEmail
      preview="Confirm deleting your ShipLink account"
      heading="Delete your account?"
      body="Click the button below to permanently delete your ShipLink account, your links and their stats. A paid plan is canceled right away."
      buttonLabel="Delete my account"
      url={url}
      footnote="Changed your mind? Ignore this email and nothing will happen."
    />
  );
}
