import { useState } from "react";
import { Button } from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import Field from "@/components/shared/Field";
import Input from "@/components/shared/Input";
import Radio from "@/components/shared/Radio";
import Select from "@/components/shared/Select";
import Textarea from "@/components/shared/Textarea";
import styles from "./ComponentsShowcase.module.css";

const options = [
  { label: "Afhalen", value: "pickup" },
  { label: "Levering aan huis", value: "delivery" },
];

/** Every shared form component in its normal, disabled and error state. Dev only. */
export default function ComponentsShowcase() {
  const [showPassword, setShowPassword] = useState(false);
  const [paid, setPaid] = useState(true);
  const [delivery, setDelivery] = useState("pickup");

  return (
    <main className={styles.page}>
      <h1>Componenten</h1>

      <section className={styles.section}>
        <h2>Tekstvelden</h2>
        <div className={styles.grid}>
          <Field label="Voornaam">
            <Input placeholder="Jan" />
          </Field>
          <Field label="E-mailadres" hint="We sturen je bevestiging hierheen.">
            <Input type="email" placeholder="jan@example.com" />
          </Field>
          <Field label="Aantal">
            <Input type="number" defaultValue={2} min={0} />
          </Field>
          <Field label="Uitgeschakeld">
            <Input disabled defaultValue="Kan niet aangepast worden" />
          </Field>
          <Field label="Met een fout" error="Vul een geldig e-mailadres in.">
            <Input type="email" defaultValue="jan@" />
          </Field>
          <Field label="Wachtwoord" hint="Minstens 8 tekens.">
            <Input
              type={showPassword ? "text" : "password"}
              defaultValue="geheim wachtwoord"
              trailing={
                <Button
                  type="button"
                  variant="tertiary"
                  className={styles.toggle}
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={
                    showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"
                  }
                >
                  {showPassword ? "Verberg" : "Toon"}
                </Button>
              }
            />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Keuzelijsten en tekstvakken</h2>
        <div className={styles.grid}>
          <Field label="Levering">
            <Select options={options} placeholder="Kies een optie" />
          </Field>
          <Field label="Uitgeschakeld">
            <Select options={options} disabled defaultValue="pickup" />
          </Field>
          <Field
            label="Met een fout"
            error="Kies hoe je je bestelling wil ontvangen."
          >
            <Select options={options} placeholder="Kies een optie" />
          </Field>
          <Field label="Bericht">
            <Textarea rows={4} placeholder="Je bericht" />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Vinkjes en keuzerondjes</h2>
        <div className={styles.row}>
          <Checkbox
            label="Betaald"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
          />
          <Checkbox label="Ontvangen" />
          <Checkbox label="Uitgeschakeld" disabled />
          <Checkbox
            label="Uitgeschakeld, aangevinkt"
            disabled
            checked
            readOnly
          />
        </div>
        <fieldset className={styles.group}>
          <legend>Hoe wil je je bestelling ontvangen?</legend>
          {options.map((option) => (
            <Radio
              key={option.value}
              name="delivery"
              value={option.value}
              label={option.label}
              checked={delivery === option.value}
              onChange={() => setDelivery(option.value)}
            />
          ))}
          <Radio
            name="delivery"
            value="post"
            label="Per post (uitgeschakeld)"
            disabled
          />
        </fieldset>
      </section>

      <section className={styles.section}>
        <h2>Knoppen</h2>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="stepper">+</Button>
          <Button variant="primary" disabled>
            Uitgeschakeld
          </Button>
        </div>
      </section>
    </main>
  );
}
