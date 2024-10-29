import { useState } from "react"
import "./styles.css"

interface FormDetails {
    name: string,
    email: string,
    minusBottles: number,
    classicBottles: number,
    totalPrice: number,
    delivery: boolean,
    deliveryAddress: string | false

}

export default function KrambambouliForm() {
    const [form, setForm] = useState<FormDetails>({
        name: "",
        email: "",
        minusBottles: 0,
        classicBottles: 0,
        totalPrice: 0,
        delivery: false,
        deliveryAddress: false
    })

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
    }
    return (
        <form>
            <h1>Krambambouli bestellen</h1>
            <div className="input-container">
                <label htmlFor="name">Naam + Voornaam</label>
                <input type="text" required value={form.name} onChange={handleNameChange} />
            </div>
            <div className="input-container">
                <label htmlFor="email">Email</label>
                <input name="email" id="email" type="email" value={form.email} placeholder="Email" />
            </div>
            <div className="input-container">
                <label htmlFor="delivery-option">Delivery</label>
                <input type="checkbox" name="delivery-option" id="delivery-option" checked={form.delivery} />
            </div>
            <div className="input-container">

            </div>
            <button type="submit"></button>
        </form>
    )
}
