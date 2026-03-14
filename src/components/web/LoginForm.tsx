import { credentialsSchema } from "@/lib/services/auth/auth.schemas";
//import style from "./LoginForm.module.css";
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
    <div>
      <form method="POST">
        <form.Field name="email">
          {(field) => (
            <div>
              <label htmlFor={field.name}>{field.name}</label>
              <input type="email" value={field.state.value} />
            </div>
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <div>
              <label htmlFor={field.name}>{field.name}</label>
              <input type="password" value={field.state.value} />
            </div>
          )}
        </form.Field>
      </form>
    </div>
  );
}
