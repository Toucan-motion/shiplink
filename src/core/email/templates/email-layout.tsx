import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";

// Shared frame for every email we send, so they all look the same.
// Plain inline styles on purpose: email clients ignore most modern CSS, and
// inline styles are the one thing all of them (Outlook included) respect.

const font =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      {/* The grey line inbox apps show next to the subject. */}
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: font, margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto" }}>
          <Text
            style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px" }}
          >
            ShipLink
          </Text>
          <Section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: "#e4e4e7", margin: "24px 0 12px" }} />
          <Text style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
            ShipLink — short links with click stats. You got this email because someone used
            this address on ShipLink.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
