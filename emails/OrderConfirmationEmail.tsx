import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Img,
  Text,
  Hr,
} from "react-email";

type Props = {
  order: OrderData;
  accountHolder: string;
  iban: string;
  bic: string;
};

export default function OrderConfirmationEmail({
  order,
  accountHolder,
  iban,
  bic,
}: Props) {
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
  };

  const paymentBox = {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "16px",
    marginTop: "10px",
  };

  const hrStyle = {
    borderColor: "#e6e6e6",
    margin: "20px 0",
  };

  const tableHeader = {
    fontSize: "14px",
    fontWeight: "bold" as const,
    color: "#404040",
    borderBottom: "1px solid #e6e6e6",
    paddingBottom: "8px",
    textAlign: "left" as const,
  };

  const tableCell = {
    fontSize: "14px",
    color: "#404040",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const isDelivery = order.deliveryOption === "delivery";

  return (
    <Html lang="nl">
      <Head />
      <Preview>Bestelbevestiging #{String(order.orderNumber)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            {/* Header */}
            <Row>
              <Column align="left" style={{ verticalAlign: "middle" }}>
                <Heading
                  style={{
                    ...text,
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: 0,
                  }}
                >
                  Bedankt voor je bestelling!
                </Heading>
              </Column>
              <Column align="right">
                <Img
                  src="https://www.tvat.be/vatschild.png"
                  alt="Vatlogo"
                  width="70"
                  height="auto"
                />
              </Column>
            </Row>

            <Text style={{ ...text, marginTop: "20px" }}>
              Beste {order.firstName} {order.lastName},
            </Text>
            <Text style={text}>
              We hebben je bestelling met ordernummer:{" "}
              <b>#{order.orderNumber}</b> in goede orde ontvangen. Hieronder
              vind je het overzicht van je bestelling.
            </Text>

            <Hr style={hrStyle} />

            {/* Order Details Table */}
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th style={tableHeader}>Product</th>
                  <th style={{ ...tableHeader, textAlign: "center" }}>
                    Aantal
                  </th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Prijs</th>
                </tr>
              </thead>
              <tbody>
                {order.orders.map((item) => (
                  <tr key={item.productId}>
                    <td style={tableCell}>{item.productName}</td>
                    <td style={{ ...tableCell, textAlign: "center" }}>
                      {item.amount}
                    </td>
                    <td style={{ ...tableCell, textAlign: "right" }}>
                      {formatCurrency((item.price * item.amount) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <Section style={{ marginTop: "15px" }}>
              {order.deliveryFee > 0 && (
                <Row style={{ marginBottom: "6px" }}>
                  <Column style={mutedText}>Leverkosten</Column>
                  <Column align="right" style={mutedText}>
                    {formatCurrency(order.deliveryFee / 100)}
                  </Column>
                </Row>
              )}
              <Row>
                <Column style={{ ...text, fontWeight: "bold" }}>Totaal</Column>
                <Column align="right" style={{ ...text, fontWeight: "bold" }}>
                  {formatCurrency(order.totalOwed / 100)}
                </Column>
              </Row>
            </Section>

            <Hr style={hrStyle} />

            {/* Delivery/Pickup Details */}
            <Text style={{ ...text, fontWeight: "bold", marginBottom: "8px" }}>
              {isDelivery ? "Bezorgadres" : "Ophaallocatie"}
            </Text>

            {isDelivery ? (
              <Text style={{ ...text, margin: 0 }}>
                {order.streetName} {order.houseNumber}
                {order.bus ? ` bus ${order.bus}` : ""}
                <br />
                {order.postalCode} {order.city}
              </Text>
            ) : (
              <Text style={{ ...text, margin: 0 }}>
                {order.pickupLocationName}
              </Text>
            )}

            <Hr style={hrStyle} />
            {/* Manual Payment Instructions */}
            <Text style={{ ...text, fontWeight: "bold", marginBottom: "8px" }}>
              Aanwijzing voor betaling
            </Text>
            <Text style={{ ...text, marginTop: 0 }}>
              Gelieve het totaalbedrag van{" "}
              <b>{formatCurrency(order.totalOwed / 100)}</b> over te maken naar
              de onderstaande rekening:
            </Text>

            <div style={paymentBox}>
              <Text style={{ ...text, margin: "0 0 6px 0", fontSize: "14px" }}>
                <b>Rekeninghouder:</b> {accountHolder}
              </Text>
              <Text style={{ ...text, margin: "0 0 6px 0", fontSize: "14px" }}>
                <b>IBAN:</b> {iban}
              </Text>
              <Text style={{ ...text, margin: "0 0 6px 0", fontSize: "14px" }}>
                <b>BIC:</b> {bic}
              </Text>
              <Text
                style={{
                  ...text,
                  margin: "0",
                  fontSize: "14px",
                  color: "#643598",
                }}
              >
                <b>Mededeling:</b>{" "}
                {`krambambouli bestelling ${order.orderNumber}`}
              </Text>
            </div>

            <Text style={{ ...mutedText, marginTop: "12px" }}>
              Vermeld altijd de exacte mededeling bij je overschrijving zodat
              wij de betaling snel kunnen verwerken.
            </Text>

            <Hr style={hrStyle} />

            <Text style={{ ...text }}>
              Afhalen en leveren kan pas nadat de krambamboulicantus heeft
              plaatsgevonden. Na de cantus zal er zo snel mogelijk contact
              opgenomen worden om een gunstig lever- of afhaalmoment in te
              plannen.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
