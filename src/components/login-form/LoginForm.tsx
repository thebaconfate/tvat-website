import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import "./styles.css";
import { navigate } from "astro/virtual-modules/transitions-router.js";
import { loginSchema, type LoginData } from "../../lib/auth/schemas";

export default function LoginForm({}) {
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: (data) => {
      const url = "/api/auth/login";
      fetch(url, {
        body: JSON.stringify(data.value),
        method: "POST",
      })
        .then((response) => {
          if (response.ok) navigate("/krambambouli/dashboard");
          else setServerErrors("Invalid credentials");
        })
        .catch((e: any) => {
          console.error(e);
          setServerErrors("Something unexpected happened");
        });
    },
  });

  const [serverErrors, setServerErrors] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        method="POST"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <>
                <div className="input-container">
                  <label htmlFor={field.name}> Email </label>
                  <input
                    type="email"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <div>
                    <p>{field.state.meta.errors[0]?.message}</p>
                  </div>
                )}
              </>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <>
                <div className="input-container">
                  <label htmlFor={field.name}>Wachtwoord</label>
                  <input
                    type="password"
                    id={field.name}
                    name={field.name}
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <div>
                    <p>{field.state.meta.errors[0]?.message}</p>
                  </div>
                )}
              </>
            )}
          </form.Field>
        </div>
        <div className="button-container">
          <button type="submit">Inloggen</button>
          {serverErrors && <span>{serverErrors}</span>}
        </div>
      </form>
    </>
  );
}
