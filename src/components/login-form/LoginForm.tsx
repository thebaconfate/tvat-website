import { useState } from "react";
import "./styles.css";
import { navigate } from "astro/virtual-modules/transitions-router.js";

interface FormErrors {
    email: string[],
    password: string[],
    login: string[]
}

export default function LoginForm({ }) {
    const [form, setForm] = useState({
        email: "",
        password: ""
    })
    const [formErrors, setFormErrors] = useState<FormErrors>({
        email: [],
        password: [],
        login: []
    })

    const changeTextInput = (input: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = input.target;
        setForm({ ...form, [name]: value })

    }

    function submitForm(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setFormErrors({
            email: [],
            password: [],
            login: []
        })
        const url = "/api/auth/login"
        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => formData.append(key, value))
        fetch(url, {
            body: formData,
            method: "POST",
        }).then(response => {
            if (response.ok) navigate("/krambambouli/dashboard")
            else setFormErrors({ ...formErrors, login: ["Invalid credentials"] })
        }).catch((e: any) => {
            console.error(e)
            setFormErrors({ ...formErrors, login: ["Something unexpected happened"] })
        })

    }
    return (
        <>
            <form onSubmit={submitForm}>
                <div>
                    <div className="input-container">
                        <label> Email </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            required
                            value={form.email}
                            onChange={changeTextInput}
                        />
                    </div>
                    {
                        formErrors.email.length != 0 && <div>
                            <p>
                                {
                                    formErrors.email[0]
                                }
                            </p>
                        </div>
                    }
                    <div className="input-container">
                        <label>Wachtwoord
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={form.password}
                            placeholder="Password"
                            onChange={changeTextInput}
                        />
                    </div>
                    {
                        formErrors.password.length != 0 && <div>
                            <p>
                                {
                                    formErrors.password[0]
                                }
                            </p>
                        </div>
                    }

                </div>
                <div className="button-container">
                    <button type="submit">
                        Inloggen
                    </button>
                    {
                        formErrors.login.length != 0 &&
                        <div>
                            {
                                formErrors.login[0]
                            }
                        </div>
                    }
                </div>
            </form>

        </>
    )
}
