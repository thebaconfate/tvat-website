import { Button } from "@/components/shared/Button";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import styles from "./ResetPasswordForm.module.css";
import z4 from "zod/v4";
import { Eye, EyeClosed } from "lucide-react";
import { API_ROUTES, ROUTES } from "@/lib/routes";
import { passwordSchema } from "@/lib/domain/users";
import { navigate } from "astro/virtual-modules/transitions-router.js";

type Props = {
  token?: string;
};
export default function ResetPasswordForm({ token = "" }: Props) {
  const [serverError, setServerError] = useState<string | undefined>();
  const [success, setSuccess] = useState<true | undefined>();
  const [visible, setVisible] = useState(false);
  const form = useForm({
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
    validators: {
      onSubmit: z4
        .object({
          // TODO: Refactor this to use a better password validator to force a good
          // password
          password: passwordSchema,
          passwordConfirm: z4.string(),
        })
        .refine((value) => value.password === value.passwordConfirm, {
          error: "Wachtwoorden komen niet overeen",
          path: ["passwordConfirm"],
        }),
    },
    onSubmit: async ({ value }) => {
      const endpoint = API_ROUTES.AUTH.RESET_PASSWORD.url;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: value.password, token: token }),
        });
        if (response.ok) {
          setSuccess(true);
          setTimeout(() => navigate(ROUTES.LOGIN.url), 1000 * 3);
        } else {
          const json = await response.json();
          setServerError(json.error ?? "An unknown error occurred");
        }
      } catch (e) {
        console.error(e);
        setServerError("An unknown error occurred");
      }
    },
  });
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <h1 className={styles.formTitle}> Reset password</h1>
      {success ? (
        <div className={styles.container}>
          <p>Wachtwoord successvol gereset</p>
        </div>
      ) : (
        <>
          <form.Field name="password">
            {(field) => (
              <div className={`${styles.inputContainer} ${styles.container}`}>
                <input
                  type={visible ? "text" : "password"}
                  value={field.state.value}
                  placeholder="Password"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <button
                  className={styles.inputIcon}
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                >
                  {visible ? <Eye /> : <EyeClosed />}
                </button>
              </div>
            )}
          </form.Field>
          <form.Field name="passwordConfirm">
            {(field) => (
              <div className={`${styles.inputContainer} ${styles.container}`}>
                <input
                  type="password"
                  value={field.state.value}
                  placeholder="Password bevestingen"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.fieldMeta}>
            {(fieldMeta) => {
              const allErrors: string[] = [];
              if (fieldMeta) {
                (
                  Object.keys(fieldMeta) as Array<keyof typeof fieldMeta>
                ).forEach((key) => {
                  const meta = fieldMeta[key];
                  meta?.errors?.forEach((err) => {
                    if (err) {
                      allErrors.push(
                        typeof err === "object" && "message" in err
                          ? String(err.message)
                          : String(err),
                      );
                    }
                  });
                });
              }
              if (allErrors.length === 0 && !serverError) return null;
              return (
                <div className={styles.messageBox}>
                  {allErrors.map((err, i) => (
                    <p
                      key={`val-${i}`}
                      className={styles.errorMessage}
                      role="alert"
                    >
                      {err}
                    </p>
                  ))}

                  {serverError && (
                    <p className={styles.errorMessage} role="alert">
                      {serverError}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Subscribe>
          <Button>Reset password</Button>
        </>
      )}
    </form>
  );
}
