import { credentialsSchema } from "@/lib/domain/auth";
import style from "./LoginForm.module.css";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Eye, EyeClosed, Mail } from "lucide-react";

export default function LoginForm() {
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
  const [visible, setVisible] = useState(false);

  return (
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
        <h2>Inloggen</h2>
        <form.Field name="email">
          {(field) => (
            <>
              <div className={style.inputContainer}>
                <input
                  type="email"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Email"
                  autoComplete="email"
                />
                <div className={style.inputIcon}>
                  <Mail></Mail>
                </div>
              </div>
              {!field.state.meta.isValid && (
                <>
                  {field.state.meta.errors.map((e) => (
                    <em role="alert">{e?.message}</em>
                  ))}
                </>
              )}
            </>
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <>
              <div className={style.inputContainer}>
                <input
                  type={visible ? "text" : "password"}
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="password"
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
              {!field.state.meta.isValid && (
                <>
                  {field.state.meta.errors.map((e) => (
                    <em role="alert">{e?.message}</em>
                  ))}
                </>
              )}
            </>
          )}
        </form.Field>
        <button type="submit">Inloggen</button>
      </form>
    </div>
  );
}
