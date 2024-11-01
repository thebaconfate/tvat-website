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
    return (
        <>
        </>
    )
}
