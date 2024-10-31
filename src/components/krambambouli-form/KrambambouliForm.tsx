import React, { useState } from "react"
import "./styles.css"

interface FormDetails {
    firstName: string,
    lastName: string,
    email: string,
    minusBottles: number,
    classicBottles: number,
    deliveryAddress: string | false,
    deliveryPostcode: string | false,
    deliveryNumber: string | false,
    pickupAddress: number | false
}

interface Price {
    euros: number,
    cents?: number
}

interface Bottle {
    volume: number,
    price: Price
}

interface Range {
    lower: number,
    upper: number
}

interface DeliveryLocation {
    location: string,
    range?: Range[],
    price: Price
}

interface Props {
    classic: Bottle,
    minus: Bottle,
    deliveryLocations: DeliveryLocation[],
    pickUpLocations: PickUpLocation[]
}

interface PickUpLocation {
    name: string,
    area: string,
}

enum DeliveryOptions {
    PICK_UP = "AFHALEN",
    DELIVERY = "LEVEREN"
}

function fmtPrice(price: Price) {
    return !price.cents || price?.cents === 0 ? `€${price.euros},-` : `€${price.euros},${price.cents}`
}

function fmtLocation(location: PickUpLocation) {
    return `Bij ${location.name} (${location.area})`
}

function capitalizeFirstWord(str: string) {
    if (!str) return str;
    const [firstWord, ...rest] = str.split(' ');
    return `${firstWord.charAt(0).toUpperCase()}${firstWord.slice(1).toLowerCase()} ${rest.join(' ')}`;
}

function addPrice(price1: Price, price2: Price) {
    let cents = 0;
    if (price1.cents)
        cents += price1.cents;
    if (price2.cents)
        cents += price2.cents;
    return {
        euros: price1.euros + price2.euros + (Math.floor(cents / 100)),
        cents: cents % 100
    }
}

function multPrice(price: Price, mult: number) {
    let cents = 0
    if (price.cents)
        cents = price.cents * mult;
    return {
        euros: price.euros * mult + Math.floor(cents / 100),
        cents: cents % 100
    }
}


export default function KrambambouliForm({ classic, minus, deliveryLocations, pickUpLocations }: Props) {
    const [form, setForm] = useState<FormDetails>({
        firstName: "",
        lastName: "",
        email: "",
        minusBottles: 0,
        classicBottles: 0,
        deliveryAddress: false,
        deliveryNumber: false,
        deliveryPostcode: false,
        pickupAddress: 0,
    })
    const [formErrors, setFormErrors] = useState({
        firstName: [],
        lastName: [],
        email: [],
        minusBottles: 0,
        classicBottles: 0,
        deliveryAddress: false,
        deliveryNumber: false,
        deliveryPostcode: false,
        pickupAddress: 0,
    })

    const [deliveryPreference, setDeliveryPreference] = useState<DeliveryOptions>(DeliveryOptions.PICK_UP)

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
    }

    function makeHandleBottleChangeFunction(func: (number: number) => number) {
        return (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
            const { name } = e.target as HTMLButtonElement;
            const value = form[name as keyof typeof form];
            setForm({ ...form, [name]: func(value as number) })
        }
    }

    function increase(number: number) { return number + 1 };
    function decrease(number: number) { return number <= 0 ? 0 : number - 1 };
    function update(input: string) {
        try {
            const inputAsNumber = parseInt(input.trim())
            return !isNaN(inputAsNumber) && isFinite(inputAsNumber) ? inputAsNumber : 0
        } catch (e) {
            return 0
        }
    }

    const handleBottleInc = makeHandleBottleChangeFunction(increase);
    const handleBottleDec = makeHandleBottleChangeFunction(decrease);
    function handleBottleUpdate(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        const newValue = update(value);
        setForm({ ...form, [name]: newValue })
    }

    function handleDeliveryPreferenceChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        switch (value) {
            case DeliveryOptions.PICK_UP:
                setDeliveryPreference(DeliveryOptions.PICK_UP)
                setForm({ ...form, deliveryAddress: false, deliveryPostcode: false, deliveryNumber: false })
                break;
            case DeliveryOptions.DELIVERY:
                setDeliveryPreference(DeliveryOptions.DELIVERY)
                setForm({
                    ...form,
                    pickupAddress: false
                })
                break;
            default:
                break;
        }
    }


    function getDeliveryCosts() {
        return {
            euros: 0,
            cents: 0
        }
    }

    function calcTotalPrice() {
        const total = addPrice(multPrice(minus.price, form.minusBottles), multPrice(classic.price, form.classicBottles));
        if (deliveryPreference === DeliveryOptions.DELIVERY)
            return addPrice(total, getDeliveryCosts());
        return total;
    }


    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(form)
    }

    return (
        <form onSubmit={handleSubmit}>
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
                                    fmtPrice(classic.price)
                                } per stuk
                            </h4>
                        </div>
                    </div>
                    <span className="amount-container">
                        <button type="button" name="classicBottles" onClick={handleBottleDec}>-</button>
                        <input type="number" name="classicBottles" value={form.classicBottles} onChange={handleBottleUpdate} />
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
                                    fmtPrice(minus.price)
                                } per stuk
                            </h4>
                        </div>
                    </div>
                    <span className="amount-container">
                        <button type="button" name="minusBottles" onClick={handleBottleDec} >-</button>
                        <input type="number" name="minusBottles" value={form.minusBottles} onChange={handleBottleUpdate} />
                        <button type="button" name="minusBottles" onClick={handleBottleInc} >+</button>
                    </span>
                </div>
            </div>
            <div className="form-fields">
                <div className="field-row">
                    <label htmlFor="FirstName">Voornaam</label>
                    <div className="input-container">
                        <input type="text" name="firstName" required value={form.firstName} placeholder="John" onChange={handleNameChange} />
                    </div>
                </div>
                <div className="field-row">
                    <label htmlFor="lastName">Naam</label>
                    <div className="input-container">
                        <input type="text" name="lastName" required value={form.lastName} onChange={handleNameChange} placeholder="Smith" />
                    </div>
                </div>
                <div className="field-row">
                    <label htmlFor="email">Email</label>
                    <div className="input-container">
                        <input name="email" id="email" type="email" value={form.email} placeholder="Email" onChange={handleNameChange} required />
                    </div>
                </div>
                <span className="information-row">
                    <p>Krambambouli kan pas vanaf de krambambouli cantus op {"13 december"} afgehaald worden op de cantus zelf of na de cantus op een ander afhaalpunt. Indien je het zelf niet kunt ophalen bieden we ook een leveringsdienst aan tegen een prijs afhankelijk waar we in België moeten leveren. Levering is enkel in België mogelijk.</p>
                    {
                        deliveryLocations.map((location, index) => <p key={index}>
                            {`${location.location}: ${fmtPrice(location.price)}`}
                        </p>
                        )
                    }
                </span>
                <div className="field-row">
                    <label htmlFor="delivery-option">Leveringsvoorkeur</label>
                    <div className="radio-container">
                        {
                            Object.values(DeliveryOptions).map((option, index) =>
                                <label key={index} htmlFor={option}>
                                    <input type="radio" value={option.toString()} checked={deliveryPreference === option} name={option} onChange={handleDeliveryPreferenceChange} />
                                    {capitalizeFirstWord(option.toString())}
                                </label>)
                        }
                    </div>
                </div>
                {
                    deliveryPreference === DeliveryOptions.PICK_UP && (
                        <div className="field-row">
                            <label htmlFor="pickupAddress">
                                Afhaalpunt
                            </label>
                            <select name="pickupAddress">
                                <option key={0} value={0}>--- Kies een afhaalpunt ---</option>
                                <option key={1} value={1}>Op de Krambambouli cantus (13/12 in BSG) </option>
                                {
                                    pickUpLocations.map((location, index) =>
                                        <option key={index + 2} value={index + 2}>{fmtLocation(location)}</option>
                                    )
                                }
                            </select>
                        </div>
                    )
                    ||
                    deliveryPreference == DeliveryOptions.DELIVERY && (
                        <>
                            <div className="field-row">
                                <label htmlFor="deliveryAddress">
                                    Leveringsadres
                                </label>
                                <div className="input-container">
                                    <input type="text" name="deliveryAddress" />
                                </div>
                            </div>
                            <div className="field-row">
                                <label htmlFor="deliveryNumber">Huisnummer</label>
                                <div className="input-container">
                                    <input type="text" name="deliveryNumber" />
                                </div>
                            </div>
                            <div className="field-row">
                                <label htmlFor="deliveryPostcode">
                                    Postcode
                                </label>
                                <div className="input-container">
                                    <input type="number" name="deliveryPostcode" />
                                </div>
                            </div>
                        </>
                    )
                }

                <div className="information-row">
                    <h4>Betaling</h4>
                    <p>Vooraleer de bestelling voltooid is moet u </p>
                    <p><b>{`${fmtPrice(calcTotalPrice())}`}</b></p>
                    <p>overschrijven naar onze rekening:</p>
                    <p><b>BE60 7310 1732 4070</b></p>
                    <p>Met de mededeling: <b>Krambambouli + Naam en Voornaam</b></p>
                </div>
                <div className="field-row">
                    <div></div>
                    <div className="input-container">
                        <button type="submit">Bestellen</button>
                    </div>
                </div>
            </div>
        </form>
    )
}
