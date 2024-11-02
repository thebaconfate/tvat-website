import React, { useState } from "react"
import "./styles.css"
import { Price, Product, type DeliveryLocation, type PickUpLocation, type ProductInterface } from "../../lib/store"
import type { Activity } from "../../lib/activity"

interface Props {
    products: ProductInterface[],
    pickUpLocations: PickUpLocation[],
    deliveryLocations: DeliveryLocation[],
    krambambouliCantus: Activity
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
    const [amount, setAmount] = useState(products.map(product => { return { id: product.id, amount: 0 } }));
    return (
        <div className="form-container">
            <form>
                <div className="products-container">
                    {
                        products.map((product) => {
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
                                        <input type="number" />
                                        <button>+</button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </form>
        </div>
    )
}
