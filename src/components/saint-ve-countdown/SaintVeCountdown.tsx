import { useEffect, useRef } from 'react'
import './saint-ve-countdown.css'


export default function SaintVeCountdown({ }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;

    })
    return <>
        <canvas ref={canvasRef}>

        </canvas>
    </>
}
