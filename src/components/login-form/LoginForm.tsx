import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./styles.css";
import { navigate } from "astro/virtual-modules/transitions-router.js";
import { loginSchema, type LoginData } from "../../lib/auth/schemas";

export default function LoginForm({}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const [serverErrors, setServerErrors] = useState<string | undefined>(
    undefined,
  );

  function onSubmit(data: LoginData) {
    const url = "/api/auth/login";
    fetch(url, {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
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
  }
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div>
          <div className="input-container">
            <label> Email </label>
            <input
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              required
            />
          </div>
          {errors.email && (
            <div>
              <p>{errors.email.message}</p>
            </div>
          )}
          <div className="input-container">
            <label>Wachtwoord</label>
            <input type="password" required {...register("password")} />
          </div>
          {errors.password && (
            <div>
              <p>{errors.password.message}</p>
            </div>
          )}
        </div>
        <div className="button-container">
          <button type="submit">Inloggen</button>
          {serverErrors && <span>{serverErrors}</span>}
        </div>
      </form>
    </>
  );
}
