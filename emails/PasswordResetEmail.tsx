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
    backgroundColor: "#2563eb", // Modern Royal Blue
    borderRadius: "6px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "100%",
    padding: "12px 0",
    margin: "25px 0",
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
          <Img
            src="https://tvat.be/logo.png"
            width="40"
            height="40"
            alt="Vatlogo"
          />
          <Section>
            <Text style={text}>Beste gebruiker</Text>
            <Text style={text}>
              We hebben een verzoek ontvangen om het wachtwoord van je account
              te herstellen. Klik op de onderstaande knop om een nieuw
              wachtwoord in te stellen.
            </Text>

            <Button style={button} href={resetURL}>
              Wachtwoord Herstellen
            </Button>

            <Text style={text}>
              Deze link is **10 minuten** geldig. Als je dit verzoek niet hebt
              gedaan, kun je deze e-mail veilig negeren—er verandert niets aan
              je account.
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
