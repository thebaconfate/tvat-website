import { useState } from "react";
import "./styles.css";

interface Props {
    customerId: number,
    paid: number
}

export default function Checkbox({ customerId, paid }: Props) {
    const [checked, setChecked] = useState(paid === 1);
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.checked;
        console.log(newValue)
        fetch("/api/krambambouli/toggle-payment", {
            body: JSON.stringify({ customerId: customerId, paid: newValue }),
            method: "PUT"
        }).then((response) => {
            if (response.ok) return response.json()
        }).then((data: boolean) => { setChecked(data) })
    }
    return <div>
        <input type="checkbox" checked={checked} onChange={onChange} />
    </div>
}
