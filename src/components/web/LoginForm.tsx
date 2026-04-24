import { credentialsSchema } from "@/lib/domain/auth";
import style from "./LoginForm.module.css";
import { useForm } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { Eye, EyeClosed, Mail } from "lucide-react";

export default function LoginForm() {
  const [visible, setVisible] = useState(false);
  const form = useForm({
    defaultValues: {
      password: "",
      email: "",
    },
    validators: { onSubmit: credentialsSchema },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  try {
  } catch (e) {}

  return (
    <main>
      <div className={style.formContainer}>
        <form
          method="POST"
          className={style.form}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <h2 className={style.formTitle}>Inloggen</h2>
          <form.Field name="email">
            {(field) => (
              <div className={`${style.inputContainer} ${style.container}`}>
                <input
                  type="email"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Email"
                  autoComplete="email"
                  required
                />
                <div className={style.inputIcon}>
                  <Mail></Mail>
                </div>
              </div>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <div className={style.inputContainer}>
                <input
                  type={visible ? "text" : "password"}
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="password"
                  required
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  className={style.inputIcon}
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                >
                  {visible ? <Eye /> : <EyeClosed />}
                </button>
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.errors}>
            {(errors) =>
              errors.length > 0 && (
                <div className={style.errorContainer}>
                  <em className={style.errorMessage} role="alert">
                    Invalid credentials
                  </em>
                </div>
              )
            }
          </form.Subscribe>
          <button className={style.submitButton} type="submit">
            Inloggen
          </button>
        </form>
      </div>
    </main>
  );
}
