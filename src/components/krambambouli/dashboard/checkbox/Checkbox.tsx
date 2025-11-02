import { useState } from "react";
import "./styles.css";

interface Props {
  customerId: number;
  currentValue: boolean;
  endpoint: string;
  bodyKey: string;
}

export default function Checkbox({
  customerId,
  currentValue,
  endpoint,
  bodyKey,
}: Props) {
  const [checked, setChecked] = useState(currentValue);
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.checked;
    console.log(newValue);
    fetch(endpoint, {
      body: JSON.stringify({ customerId, [bodyKey]: newValue }),
      method: "PUT",
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((data: boolean) => {
        setChecked(data);
      });
  }
  return (
    <div>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </div>
  );
}
