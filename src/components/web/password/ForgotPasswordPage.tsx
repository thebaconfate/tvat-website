import styles from "./ForgotPassword.module.css";

export default function ForgotPasswordPage({}) {
  return (
    <main>
      <form>
        <h1>Forgot password</h1>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
        <button type="submit">Send Reset Link</button>
      </form>
      <a href="/login">Back to login</a>
    </main>
  );
}
