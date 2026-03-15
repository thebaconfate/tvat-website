import { credentialsSchema } from "@/lib/services/auth/auth.schemas";
import style from "./LoginForm.module.css";
import { useForm } from "@tanstack/react-form";

export default function LoginForm() {
  const form = useForm({
    defaultValues: {
      password: "",
      email: "",
    },
    validators: { onSubmit: credentialsSchema },
  });
  return (
    <div className={style.formContainer}>
      <form method="POST" className={style.form}>
        <form.Field name="email">
          {(field) => (
            <div className={style.inputContainer}>
              <input
                type="email"
                value={field.state.value}
                onChange={(e) => field.setValue(e.target.value)}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <div className={style.inputContainer}>
              <input
                type="password"
                value={field.state.value}
                onChange={(e) => field.setValue(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </form>
    </div>
  );
}
