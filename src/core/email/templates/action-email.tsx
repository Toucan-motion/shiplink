import { Button, Heading, Text } from "react-email";

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
      <Heading style={{ fontSize: "22px" }}>{heading}</Heading>
      <Text>{body}</Text>
      <Button
        href={url}
        style={{
          backgroundColor: "#171717",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "6px",
          fontWeight: 600,
        }}
      >
        {buttonLabel}
      </Button>
      <Text style={{ color: "#666666", fontSize: "13px" }}>{footnote}</Text>
    </EmailLayout>
  );
}
