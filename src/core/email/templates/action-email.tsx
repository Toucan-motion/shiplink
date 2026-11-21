import { Button, Heading, Link, Text } from "react-email";

import { EmailLayout } from "./email-layout";

type ActionEmailProps = {
  preview: string;
  heading: string;
  body: string;
  buttonLabel: string;
  url: string;
  footnote: string;
};

// Every auth email has the same shape: a sentence, one button, a footnote.
export function ActionEmail({ preview, heading, body, buttonLabel, url, footnote }: ActionEmailProps) {
  return (
    <EmailLayout preview={preview}>
      <Heading as="h1" style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 12px" }}>
        {heading}
      </Heading>
      <Text style={{ color: "#3f3f46", fontSize: "15px", lineHeight: "24px", margin: "0 0 24px" }}>
        {body}
      </Text>
      <Button
        href={url}
        style={{
          backgroundColor: "#18181b",
          borderRadius: "8px",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 600,
          padding: "12px 20px",
        }}
      >
        {buttonLabel}
      </Button>
      {/* Some email clients block buttons or mangle them. The raw link always works. */}
      <Text style={{ color: "#71717a", fontSize: "13px", lineHeight: "20px", margin: "24px 0 0" }}>
        Button not working? Paste this link into your browser:
        <br />
        <Link href={url} style={{ color: "#18181b", wordBreak: "break-all" }}>
          {url}
        </Link>
      </Text>
      <Text style={{ color: "#71717a", fontSize: "13px", lineHeight: "20px", margin: "16px 0 0" }}>
        {footnote}
      </Text>
    </EmailLayout>
  );
}
