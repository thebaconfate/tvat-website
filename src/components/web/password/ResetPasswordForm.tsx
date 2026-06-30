import { Button } from "@/components/shared/Button";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import styles from "./ResetPasswordForm.module.css";
import z4 from "zod/v4";
import { Eye, EyeClosed } from "lucide-react";

type Props = {
  token: string;
};
export default function ResetPasswordForm({ token }: Props) {
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
          password: z4.string(),
          passwordConfirm: z4.string(),
        })
        .refine(
          (value) => value.password === value.passwordConfirm,
          "Passwords should match",
        ),
    },
    onSubmit: async ({ value }) => {
      console.log("Reset submitted");
    },
  });
  return (
    <form>
      <h1> Reset password</h1>
      <form.Field name="password">
        {(field) => (
          <div>
            <input
              type="password"
              value={field.state.value}
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
      <Button>Reset password</Button>
    </form>
  );
}
