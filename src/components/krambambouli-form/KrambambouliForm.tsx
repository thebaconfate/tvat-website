import React, { useState } from "react"
import "./styles.css"

interface FormDetails {
    firstName: string,
    lastName: string,
    email: string,
    minusBottles: number,
    classicBottles: number,
    totalPrice: number,
    delivery: boolean,
    deliveryAddress: string | false
    pickupAddress: number | false

}

interface Bottle {
    volume: number,
    price: {
        euros: number,
        cents?: number
    }
}

interface Props {
    classic: Bottle,
    minus: Bottle
}

export default function KrambambouliForm({ classic, minus }: Props) {
    const [form, setForm] = useState<FormDetails>({
        firstName: "",
        lastName: "",
        email: "",
        minusBottles: 0,
        classicBottles: 0,
        totalPrice: 0,
        delivery: false,
        deliveryAddress: false,
        pickupAddress: false,
    })

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
    }

    function makeHandleBottleChangeFunction(func: (number: number) => number) {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            const { name } = e.target as HTMLButtonElement;
            const value = form[name as keyof typeof form];
            setForm({ ...form, [name]: func(value as number) })
        }
    }

    function increase(number: number) { return number + 1 };
    function decrease(number: number) { return number <= 0 ? 0 : number - 1 };

    const handleBottleInc = makeHandleBottleChangeFunction(increase);
    const handleBottleDec = makeHandleBottleChangeFunction(decrease);

    function handleToggleDelivery(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, checked } = e.target;
        setForm({ ...form, [name]: checked })
    }

    return (
        <form>
            <h1>Krambambouli bestellen</h1>
            <div className="krambambouli-field-row">
                <div className="krambambouli-option">
                    <picture className="picture-container">
                        <img src="./krambambouliclassic.png" alt="Classic fles" />
                    </picture>
                    <div className="krambambouli-description">
                        <div>
                            <h3>Krambambouli Classic</h3>
                            <h4>
                                {
                                    `${classic.volume} cl`
                                }
                            </h4>
                            <h4>
                                {
                                    !classic.price.cents || classic.price?.cents === 0 ? `€${classic.price.euros},-` : `€${classic.price.euros},${classic.price.cents}`
                                } per stuk
                            </h4>
                        </div>
                    </div>
                    <span className="amount-container">
                        <button type="button" name="classicBottles" onClick={handleBottleDec}>-</button>
                        <input type="number" name="classicBottles" value={form.classicBottles} />
                        <button type="button" name="classicBottles" onClick={handleBottleInc}>+</button>
                    </span>
                </div>
                <div className="krambambouli-option">
                    <picture className="picture-container">
                        <img src="./krambambouliminus.png" alt="Minus fles" />
                    </picture>
                    <div className="krambambouli-description">
                        <div>
                            <h3>Krambambouli Minus</h3>
                            <h4>
                                {
                                    `${minus.volume} cl`
                                }
                            </h4>
                            <h4>
                                {
                                    !minus.price.cents || minus.price?.cents === 0 ? `€${minus.price.euros},-` : `€${minus.price.euros},${minus.price.cents}`
                                } per stuk
                            </h4>
                        </div>
                    </div>
                    <span className="amount-container">
                        <button type="button" name="minusBottles" onClick={handleBottleDec} >-</button>
                        <input type="number" name="minusBottles" value={form.minusBottles} />
                        <button type="button" name="minusBottles" onClick={handleBottleInc} >+</button>
                    </span>
                </div>
            </div>
            <div className="form-fields">
                <div className="field-row">
                    <label htmlFor="name">Voornaam</label>
                    <div className="input-container">
                        <input type="text" required value={form.firstName} placeholder="John" onChange={handleNameChange} />
                    </div>
                </div>
                <div className="field-row">
                    <label htmlFor="lastname">Naam</label>
                    <div className="input-container">
                        <input type="text" required value={form.lastName} onChange={handleNameChange} placeholder="Smith" />
                    </div>
                </div>
                <div className="field-row">
                    <label htmlFor="email">Email</label>
                    <div className="input-container">
                        <input name="email" id="email" type="email" value={form.email} placeholder="Email" required />
                    </div>
                </div>
                <div className="field-row">
                    <label htmlFor="delivery-option">Delivery</label>
                    <div className="input-container">
                        <input type="checkbox" name="delivery" id="delivery" defaultChecked={form.delivery} checked={form.delivery} onChange={handleToggleDelivery} />
                    </div>
                </div>
                <div className="field-row">

                </div>
            </div>
            <button type="submit"></button>
        </form>
    )
}
