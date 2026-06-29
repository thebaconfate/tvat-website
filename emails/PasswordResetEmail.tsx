import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Img,
  Heading,
} from "react-email";
type EmailProps = {
  resetURL: string;
};
export default function PasswordResetEmail({ resetURL }: EmailProps) {
  if (!resetURL) resetURL = "test";
  const main = {
    backgroundColor: "#f6f9fc",
    padding: "40px 0",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  } as const;
  const container = {
    backgroundColor: "#ffffff",
    border: "1px solid #f0f0f0",
    padding: "45px",
    maxWidth: "500px",
    margin: "0 auto",
    borderRadius: "8px",
  };

  const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#404040",
  };

  const mutedText = {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#8c8c8c",
    marginTop: "20px",
  };

  const button = {
    backgroundColor: "rgb(100, 53, 152)",
    color: "#ffffff",
    font: "inherit",
    fontWeight: 500,
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    textDecoration: "none",
    display: "block",
    textAlign: "center" as const,
    margin: "25px",
  };

  const link = {
    color: "#2563eb",
    textDecoration: "underline",
    wordBreak: "break-all" as const,
  };
  return (
    <Html lang="nl">
      <Head />
      <Preview>Wachtwoord resetten</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <Heading
                style={{ ...text, marginBottom: 0, fontSize: "1.25rem" }}
              >
                Beste gebruiker
              </Heading>
              <Img
                src="https://www.tvat.be/vatschild.png"
                alt="Vatlogo"
                width="70"
                height="auto"
              />
            </div>
            <Text style={text}>
              We hebben een verzoek ontvangen om het wachtwoord van je account
              te herstellen. Klik op de onderstaande knop om een nieuw
              wachtwoord in te stellen.
            </Text>

            <Button style={button} href={resetURL}>
              Wachtwoord Herstellen
            </Button>

            <Text style={text}>
              Deze link is <b>10 minuten</b> geldig. Als je deze verzoek niet
              hebt gedaan, dan kun je deze e-mail veilig negeren—er verandert
              niets aan je account.
            </Text>

            <Text style={mutedText}>
              Werkt de knop niet? Kopieer en plak dan deze URL in je browser:
              <br />
              <Link href={resetURL} style={link}>
                {resetURL}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
