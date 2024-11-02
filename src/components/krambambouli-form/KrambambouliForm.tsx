import React, { useState } from "react"
import "./styles.css"
import { DeliveryLocation, Price, Product, type PickUpLocation, type ProductInterface } from "../../lib/store"
import { Activity, type ActivityInterface } from "../../lib/activity"

interface Props {
    products: ProductInterface[],
    pickUpLocations: PickUpLocation[],
    deliveryLocations: DeliveryLocation[],
    krambambouliCantus: ActivityInterface | Activity;
}

enum DeliveryOption {
    Delivery,
    PickUp
}


export default function KrambambouliForm({ products, pickUpLocations, deliveryLocations, krambambouliCantus }: Props) {
    products = products.map(product => new Product(
        product.id,
        product.name,
        new Price(
            product.price.euros,
            product.price.cents
        ),
        product.description,
        product.imageUrl));
    krambambouliCantus = new Activity(krambambouliCantus.name, krambambouliCantus.location, new Date(krambambouliCantus.date), krambambouliCantus.description, krambambouliCantus.id)
    console.log(deliveryLocations)
    deliveryLocations = deliveryLocations.map(loc => new DeliveryLocation(loc.area, loc.range, new Price(loc.price.euros, loc.price.cents)))

    const deliveryStartDate = new Date(krambambouliCantus.date)
    deliveryStartDate.setDate(deliveryStartDate.getDate() + 1)
    const pickUpStartDate = new Date(deliveryStartDate)
    const deliveryEndDate = new Date(deliveryStartDate);
    deliveryEndDate.setDate(deliveryEndDate.getDate() + 10);
    const [amountList, setAmountList] = useState(products.map(_ => 0));
    const [selectedOption, setSelectedOption] = useState<null | DeliveryOption>(null)
    const [selectedPickUpOption, setSelectedPickUpOption] = useState<null | number>(null)

    function handleChangeOption(e: React.ChangeEvent<HTMLInputElement>) {
        const value = parseInt(e.target.value)
        setSelectedOption(value as DeliveryOption)
    }

    function handleChangePickUpOption(e: React.ChangeEvent<HTMLInputElement>) {
        setSelectedPickUpOption(parseInt(e.target.value))
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }
    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <div className="products-container">
                    {
                        products.map((product, index) => {
                            return (
                                <div key={product.id} className="product">
                                    {
                                        product.imageUrl ?
                                            <picture>
                                                <img src={product.imageUrl} />
                                            </picture> : ""
                                    }
                                    <h3 className="product-title">{product.name}</h3>
                                    <div className="product-details">
                                        <p>{product.description}</p>
                                        <p>{product.price.toString()}</p>
                                    </div>
                                    <div className="product-button-container">
                                        <button>-</button>
                                        <input type="number" defaultValue={amountList[index]} />
                                        <button>+</button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="fields-container">
                    <div className="field-row">
                        <div className="field-col">
                            <label>Voornaam</label>
                            <input type="text" />
                        </div>
                        <div className="field-col">
                            <label>Achternaam</label>
                            <input type="text" />
                        </div>
                    </div>
                    <div className="field-row">
                        <label>E-mail</label>
                        <input type="email" />
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
                            {`Afhalen vanaf ${krambambouliCantus.fmtDate()}`}
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
                                    value={0}
                                    checked={0 == selectedPickUpOption}
                                    onChange={handleChangePickUpOption} />
                                {`${krambambouliCantus.name} (${krambambouliCantus.fmtDate()})`}
                            </label>
                            {
                                pickUpLocations.map((loc, index) => {
                                    return (
                                        <label>
                                            <input
                                                type="radio"
                                                name="pick-up-option"
                                                value={index + 1}
                                                checked={(index + 1) == selectedPickUpOption}
                                                onChange={handleChangePickUpOption} />
                                            {
                                                `Bij ${loc.name} (${loc.area}) vanaf (${pickUpStartDate.getDate()}/${pickUpStartDate.getMonth() + 1})`
                                            }
                                        </label>
                                    )
                                })

                            }
                        </div>
                        ||
                        selectedOption === DeliveryOption.Delivery && <>

                            <div className="field-row">
                                <label>
                                    Leveroptie
                                </label>
                                {
                                    deliveryLocations.map((loc, idx) => {
                                        return (
                                            <span className="delivery-row">
                                                <label>
                                                    <input type="radio"
                                                        name="delivery-option"
                                                        value={idx}
                                                    />
                                                    {`Levering ${loc.area}`}
                                                </label>
                                                <p>{loc.price.toString()}</p>
                                            </span>

                                        )
                                    })
                                }
                            </div>
                            <div className="address-row">
                                <div className="field-row">
                                    <label>Straatnaam</label>
                                    <input type="text" />
                                    <label>Nummer</label>
                                    <input type="number" />
                                    <label>Bus</label>
                                    <input type="number" />
                                </div>
                                <div className="field-row">
                                    <label>Postcode</label>
                                    <input type="number" />
                                    <label>Stad</label>
                                    <input type="number" />
                                </div >
                            </div>
                        </>
                    }
                </div>
            </form>
        </div>
    )
}
