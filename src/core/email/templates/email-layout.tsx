import { Body, Container, Head, Html, Preview, Text } from "react-email";

// Shared frame for every email we send, so they all look the same.
export function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f6f6f6", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "40px auto",
            padding: "32px",
            maxWidth: "480px",
          }}
        >
          {children}
          <Text style={{ color: "#888888", fontSize: "12px", marginTop: "32px" }}>
            ShipLink — short links with click stats
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
