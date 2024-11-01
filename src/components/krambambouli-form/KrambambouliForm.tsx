import React, { useState } from "react"
import "./styles.css"
import type { DeliveryLocation, PickUpLocation, Product } from "../../lib/store"
import type { Activity } from "../../lib/activity"

interface Props {
    products: Product[],
    pickUpLocations: PickUpLocation[],
    deliveryLocations: DeliveryLocation[],
    krambambouliCantus: Activity
}

export default function KrambambouliForm({ products, pickUpLocations, deliveryLocations, krambambouliCantus }: Props) {
    const [amount, setAmount] = useState(products.map(product => { return { id: product.id, amount: 0 } }));

    return (
        <div className="form-container">
            <form>
                <div className="products-container">
                    {
                        products.map((product) => {
                            return (
                                <div className="product">
                                    <p>{product.id}</p>
                                    <p>{product.name}</p>
                                    <p>{product.price.toString()}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </form>
        </div>
    )
}
