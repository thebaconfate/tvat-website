import React, { useEffect, useState } from "react"
import "./styles.css"
import { DeliveryLocation, Price, Product, type PickUpLocation, type ProductInterface } from "../../lib/store"
import { Activity, type ActivityInterface } from "../../lib/activity"
import DOMPurify from 'dompurify'
import { apiRoutes } from "../../lib/routes"
import { createUrl } from "../../lib/utils"
import { Popup } from "../popup/Popup"
import { PopupEnum } from "../../lib/popup"

interface Props {
    products: ProductInterface[],
    pickUpLocations: PickUpLocation[],
    deliveryLocations: DeliveryLocation[],
    krambambouliCantus: ActivityInterface;
}

enum DeliveryOption {
    Delivery = "delivery",
    PickUp = "pick up"
}

interface Form {
    firstName: string,
    lastName: string,
    email: string,
    streetName: null | string,
    streetNumber: null | string,
    bus: null | string,
    post: null | number,
    city: null | string
}


export default function KrambambouliForm({ products: productObjs, pickUpLocations, deliveryLocations, krambambouliCantus: krambambouliCantusObj }: Props) {
    const products = productObjs.map(product => new Product(
        product.id,
        product.name,
        new Price(
            product.price.euros,
            product.price.cents
        ),
        product.description,
        product.imageUrl));
    const krambambouliCantus = new Activity(krambambouliCantusObj.name, krambambouliCantusObj.location, new Date(krambambouliCantusObj.date), krambambouliCantusObj.description, krambambouliCantusObj.id)
    deliveryLocations = deliveryLocations.map(loc => new DeliveryLocation(loc.area, loc.range, new Price(loc.price.euros, loc.price.cents)))
    deliveryLocations.sort()

    const deliveryStartDate = new Date(krambambouliCantus.date)
    deliveryStartDate.setDate(deliveryStartDate.getDate() + 1)

    const pickUpStartDate = new Date(deliveryStartDate)
    const pickUpEndDate = new Date(pickUpStartDate)
    pickUpEndDate.setFullYear(pickUpEndDate.getFullYear() + 1)
    pickUpEndDate.setDate(1)
    pickUpEndDate.setMonth(2)
    pickUpEndDate.setDate(pickUpEndDate.getDate() - 1)

    const deliveryEndDate = new Date(deliveryStartDate);
    deliveryEndDate.setDate(deliveryEndDate.getDate() + 10);

    const [amountList, setAmountList] = useState(products.map(_ => 0));
    const [selectedOption, setSelectedOption] = useState<null | DeliveryOption>(null)
    const [selectedPickUpOption, setSelectedPickUpOption] = useState<null | number>(null)
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<null | number>(null)
    const [form, setForm] = useState<Form>({
        firstName: "",
        lastName: "",
        email: "",
        streetName: null,
        streetNumber: null,
        bus: null,
        post: null,
        city: null
    })
    const [showPopup, setShowPopup] = useState<boolean>(false)
    const [popupContent, setPopupContent] = useState({
        title: PopupEnum.SUCCESS,
        text: ""
    })

    function handleChangeOption(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setSelectedOption(value as DeliveryOption)
    }

    function handleChangePickUpOption(e: React.ChangeEvent<HTMLInputElement>) {
        setSelectedPickUpOption(parseInt(e.target.value))
    }


    function makeHandleChangeAmount(idx: number) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value)
            const copy = [...amountList];
            copy[idx] = value <= 0 ? 0 : value;
            setAmountList(copy);
        }
    }

    function makeHandlePressAmount(func: (x: number) => number) {
        return (idx: number) => {
            return (_: React.MouseEvent<HTMLButtonElement>) => {
                const value = func(amountList[idx])
                const copy = [...amountList];
                copy[idx] = value <= 0 ? 0 : value;
                setAmountList(copy)
            }
        }
    }

    const handlePressAmountDec = makeHandlePressAmount((x: number) => x <= 0 ? 0 : x - 1);
    const handlePressAmountInc = makeHandlePressAmount((x: number) => x + 1);


    function makeHandleChangeDeliveryOption(idx: number) {
        return (_: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedDeliveryOption(idx)
    }


    function calcTotalAmount() {
        const total = amountList.reduce((acc: Price, amount: number, index: number) =>
            acc.add(products[index].price.mult(amount)), new Price(0))
        if (selectedOption === DeliveryOption.Delivery)
            if (selectedDeliveryOption != null)
                return total.add(deliveryLocations[selectedDeliveryOption].price)
        return total;
    }

    function handleTextInput(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
    }

    function handleNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: parseInt(value) })
    }
    useEffect(() => {
        if (window)
            DOMPurify.setConfig({
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            })
    }, [])

    function sanitize(input: any) {
        return DOMPurify.sanitize(input)
    }

    function closePopup() {
        setShowPopup(false)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("firstName", sanitize(form.firstName));
        formData.append("lastName", sanitize(form.lastName))
        formData.append("email", sanitize(form.email))
        formData.append("deliveryOption", sanitize(selectedOption))
        const total = calcTotalAmount()
        formData.append("owedAmount", JSON.stringify({
            euros: sanitize(total.euros),
            cents: sanitize(total.cents)
        }))
        if (selectedOption === DeliveryOption.PickUp && selectedPickUpOption != null) {
            if (selectedPickUpOption > 0)
                formData.append("pickUpLocation", sanitize(pickUpLocations[selectedPickUpOption].name))
            else
                formData.append("pickUpLocation", sanitize(krambambouliCantus.name))
        }
        else if (selectedOption === DeliveryOption.Delivery && selectedDeliveryOption != null) {
            formData.append("deliveryStreetName", sanitize(form.streetName))
            formData.append("deliveryStreetNumber", sanitize(form.streetNumber))
            formData.append("deliveryBus", sanitize(form.bus ?? ""))
            formData.append("deliveryPost", sanitize(form.post))
            formData.append("deliveryCity", sanitize(form.city))
        }
        for (let i = 0; i < products.length; i++) {
            if (amountList[i] > 0)
                formData.append("order", JSON.stringify({
                    id: sanitize(products[i].id),
                    amount: sanitize(amountList[i])
                }))
        }
        console.log(formData)
        await fetch(createUrl([window.location.origin, apiRoutes.krambambouli.url, apiRoutes.krambambouli.order.url]), {
            method: "POST",
            body: formData
        }).then((response) => {
            if (!response.ok) {
                setPopupContent({
                    title: PopupEnum.ERROR,
                    text: "Er is iets misgegaan bij het opsturen van de gegevens, probeer het later op nieuw"
                })
                setShowPopup(true)
            } else {
                setPopupContent({
                    title: PopupEnum.SUCCESS,
                    text: "Dankje voor de bestelling, eenmaal dat we de betaling hehheb ontvangen zullen we dit zo snel mogelijk behandelen en brouwen. Je zult nog een mail krijgen ivm afhaling of levering"
                })
                setShowPopup(true)
            }
        })
    }

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <div className="products-container">
                    {
                        products.map((product, index) => {
                            return (
                                <div key={product.id} className="product">
                                    <picture>
                                        {
                                            product.imageUrl ?
                                                <img src={product.imageUrl} alt={product.name + "image"} />
                                                : <img alt={product.name + "image"} />
                                        }
                                    </picture>
                                    <h3 className="product-title">{product.name}</h3>
                                    <div className="product-details">
                                        <p>{product.description}</p>
                                        <p>{product.price.toString()}</p>
                                    </div>
                                    <div className="product-button-container">
                                        <button type="button" onClick={handlePressAmountDec(index)} >-</button>
                                        <input
                                            type="number"
                                            value={amountList[index]}
                                            onChange={makeHandleChangeAmount(index)} />
                                        <button type="button" onClick={handlePressAmountInc(index)}>+</button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="fields-container">
                    <div className="field-row">
                        <div className="field-col">
                            <label htmlFor="firstName">Voornaam</label>
                            <input
                                id="firstName"
                                type="text"
                                placeholder="John"
                                name="firstName"
                                required
                                value={form.firstName}
                                onChange={handleTextInput}
                            />
                        </div>
                        <div className="field-col">
                            <label form="lastName">Achternaam</label>
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Doe"
                                name="lastName"
                                required
                                value={form.lastName}
                                onChange={handleTextInput} />
                        </div>
                    </div>
                    <div className="field-row">
                        <label form="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="john.doe@hotmail.com"
                            value={form.email}
                            onChange={handleTextInput}
                            name="email" />
                    </div>
                    <div className="field-row radio-options-container">
                        <label>Leveringsopties</label>
                        <label>
                            <input
                                type="radio"
                                name="option"
                                required
                                value={DeliveryOption.PickUp}
                                checked={selectedOption === DeliveryOption.PickUp}
                                onChange={handleChangeOption} />
                            {
                                `Afhalen tussen ${krambambouliCantus.fmtDate()} en ${pickUpEndDate.getDate()}/${pickUpEndDate.getMonth() + 1}/${pickUpEndDate.getFullYear()}`
                            }
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="option"
                                required
                                value={DeliveryOption.Delivery}
                                checked={selectedOption === DeliveryOption.Delivery}
                                onChange={handleChangeOption} />
                            {
                                `Leveren tussen ${deliveryStartDate.getDate()}/${deliveryStartDate.getMonth() + 1} en ${deliveryEndDate.getDate()}/${deliveryEndDate.getMonth() + 1}`
                            }
                        </label>
                    </div>
                    {
                        selectedOption === DeliveryOption.PickUp &&
                        <div className="field-row">
                            <label>Afhaallocatie</label>
                            <label>
                                <input
                                    type="radio"
                                    name="pick-up-option"
                                    value={-1}
                                    required
                                    checked={-1 == selectedPickUpOption}
                                    onChange={handleChangePickUpOption} />
                                {
                                    `${krambambouliCantus.name} (${krambambouliCantus.fmtDate()})`
                                }
                            </label>
                            {
                                pickUpLocations.map((loc, index) => {
                                    return (
                                        <label key={index}>
                                            <input
                                                type="radio"
                                                name="pick-up-option"
                                                value={index}
                                                required
                                                checked={(index) == selectedPickUpOption}
                                                onChange={handleChangePickUpOption} />
                                            {
                                                `Bij ${loc.name} (${loc.area}) (vanaf ${pickUpStartDate.getDate()}/${pickUpStartDate.getMonth() + 1})`
                                            }
                                        </label>
                                    )
                                })

                            }
                        </div>
                        ||
                        selectedOption === DeliveryOption.Delivery && <>
                            <div className="field-row">
                                <label form="delivery-option">
                                    Leveroptie
                                </label>
                                {
                                    deliveryLocations.map((loc, idx) => {
                                        return (
                                            <span key={idx} className="delivery-row">
                                                <label htmlFor={`delivery-option-${idx}`}>
                                                    <input
                                                        id={`delivery-option-${idx}`}
                                                        type="radio"
                                                        name="delivery-option"
                                                        value={idx}
                                                        required
                                                        checked={idx === selectedDeliveryOption}
                                                        onChange={makeHandleChangeDeliveryOption(idx)}
                                                    />
                                                    {
                                                        `Levering ${loc.area}`
                                                    }
                                                </label>
                                                <p>{loc.price.toString()}</p>
                                            </span>

                                        )
                                    })
                                }
                            </div>
                            <div className="address-row">
                                <div className="field-row">
                                    <label htmlFor="streetName">Straatnaam</label>
                                    <input
                                        id="streetName"
                                        type="text"
                                        value={form.streetName ?? ""}
                                        name="streetName"
                                        required
                                        onChange={handleTextInput} />
                                    <label htmlFor="bus">Nummer</label>
                                    <input
                                        id="streetNumber"
                                        type="text"
                                        name="streetNumber"
                                        required
                                        value={form.streetNumber ?? ""}
                                        onChange={handleTextInput}
                                    />
                                    <label>Bus</label>
                                    <input
                                        id="bus"
                                        type="text"
                                        name="bus"
                                        value={form.bus ?? ""}
                                        onChange={handleTextInput}
                                    />
                                </div>
                                <div className="field-row">
                                    <label htmlFor="post">Postcode</label>
                                    <input
                                        id="post"
                                        type="number"
                                        name="post"
                                        value={form.post ?? ""}
                                        onChange={handleNumberInput}
                                        required
                                    />
                                    <label htmlFor="city">Stad</label>
                                    <input
                                        id="city"
                                        type="text"
                                        required
                                        value={form.city ?? ""}
                                        name="city"
                                        onChange={handleTextInput} />
                                </div >
                            </div>
                        </>
                    }
                    <div className="information-container">
                        <p>Totaalbedrag <b>{calcTotalAmount().toString()}</b></p>
                        <p>Over te schrijven naar de VATrekening: <b>BE60 7310 1732 4070</b></p>
                        <p>Met mededeling: <b>krambambouli + {form.firstName} {form.lastName}</b></p>
                    </div>
                    {
                        selectedOption !== null &&
                        <div className="submit-button-container">
                            <button type="submit">Bestellen</button>
                        </div>
                    }
                </div>
            </form>
            {
                showPopup && <Popup title={popupContent.title} message={popupContent.text} onClose={closePopup}></Popup>
            }
        </div>
    )
}
