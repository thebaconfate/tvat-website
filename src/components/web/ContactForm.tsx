import { apiRoutes } from "@/lib/oldRoutes";
import styles from "./ContactForm.module.css";
import { useForm } from "@tanstack/react-form";
import { contactFormSchema } from "@/lib/domain/contact";

export default function ContactForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validators: {
      onSubmit: contactFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      fetch(apiRoutes.contact.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    },
  });
  return (
    <main className={styles.contentContainer}>
      <form
        className={styles.formContainer}
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <h1 className={styles.title}>Contact</h1>
        <form.Field name="name">
          {(field) => (
            <label htmlFor={field.name} className={styles.inputContainer}>
              Naam
              <input
                id={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                placeholder="Jane Doe"
              />
            </label>
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <label htmlFor={field.name} className={styles.inputContainer}>
              E-mail
              <input
                id={field.name}
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                placeholder="example@mail.com"
              />
            </label>
          )}
        </form.Field>
        <form.Field name="subject">
          {(field) => (
            <label htmlFor={field.name} className={styles.inputContainer}>
              Onderwerp
              <input
                id={field.name}
                type="text"
                maxLength={20}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                placeholder="Onderwerp"
              />
            </label>
          )}
        </form.Field>
        <form.Field name="message">
          {(field) => (
            <div className={styles.messageContainer}>
              <label htmlFor="message">Bericht</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              ></textarea>
            </div>
          )}
        </form.Field>
        <button className={styles.submitButton} type="submit">
          Opsturen
        </button>
      </form>
    </main>
  );
}
