import { useEffect, useRef, useState } from 'react'
import './saint-ve-countdown.css'

function createStVDate(today: Date) {
    const year = today.getFullYear();
    const november = 11 - 1; // months are indexed from 0
    const day = 20;
    const beginHour = 12
    const endHour = beginHour + 6
    const thisYearNormalStartDate = new Date(year, november, day, beginHour)
    const thisYearNormalEndDate: Date = new Date(thisYearNormalStartDate)
    thisYearNormalEndDate.setHours(endHour)
    const normalDate = today.getTime() > thisYearNormalEndDate.getTime() ? new Date(year + 1, november, day, beginHour) : thisYearNormalStartDate
    const saturday = 0;
    const sunday = 6;
    if (normalDate.getDay() === saturday) normalDate.setDate(day - 2)
    else if (normalDate.getDay() === sunday) normalDate.setDate(day - 1)
    const endDate = new Date(normalDate)
    endDate.setHours(endHour)
    return { startDate: normalDate, endDate: endDate }
}


function calcPercentage(current: number, goal: number) {
    return (1 - current / goal);
}

function calcDifferenceInDates(date1: Date, date2: Date) {
    if (date1.getTime() >= date2.getTime()) return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    }
    const diffInMilis = date2.getTime() - date1.getTime();
    const secondInMilis = 1000;
    const minuteInMilis = secondInMilis * 60;
    const hourInMilis = 60 * minuteInMilis;
    const dayInMilis = 24 * hourInMilis;
    return {
        days: Math.floor(diffInMilis / dayInMilis),
        hours: Math.floor((diffInMilis % dayInMilis) / hourInMilis),
        minutes: Math.floor((diffInMilis % hourInMilis) / minuteInMilis),
        seconds: Math.floor((diffInMilis % minuteInMilis) / secondInMilis)
    }
}

export default function SaintVeCountdown() {
    const now = new Date();
    const nextSaintV = createStVDate(now)
    const diff = now.getTime() >= nextSaintV.startDate.getTime() && now.getTime() <= nextSaintV.endDate.getTime() ? { days: 0, hours: 0, minutes: 0, seconds: 0 } : calcDifferenceInDates(now, nextSaintV.startDate)
    const lowerCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const upperCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [remainders, setRemainders] = useState({
        days: diff.days,
        hours: diff.hours,
        minutes: diff.minutes,
        seconds: diff.seconds,
    });

    useEffect(() => {
        const lowerCanvas = lowerCanvasRef.current;
        const upperCanvas = upperCanvasRef.current;
        if (!lowerCanvas || !upperCanvas) return;
        const lowerContext = lowerCanvas.getContext('2d');
        const upperContext = upperCanvas.getContext('2d');
        if (!lowerContext || !upperContext) return;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const radius = lowerCanvas.height / 8 * 3; // Radius of the circle
        const centerX = lowerCanvas.width / 2;
        const centerY = lowerCanvas.height / 2;
        const firstQuantileX = centerX / 2;
        const thirdQuantileX = centerX + firstQuantileX;
        const green = '#4CAF50';
        const red = '#B32121'
        const purple = '#653199'
        const yellow = '#FFF10F'
        const startAngle = 0.5 * Math.PI;

        const clearCanvas = (context: CanvasRenderingContext2D) => {
            context.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height)
        }

        const drawCircle = (context: CanvasRenderingContext2D, counter: number, goal: number, label: string, color: string, location: number) => {

            // Draw the background circle (gray)
            context.beginPath();
            context.arc(location, centerY, radius, 0, 2 * Math.PI);
            context.strokeStyle = '#e6e6e6';
            context.lineWidth = 1;
            context.stroke();

            const percent = calcPercentage(counter, goal);
            const endAngle = 2 * Math.PI * percent;

            context.beginPath();
            context.arc(location, centerY, radius, -startAngle, endAngle - startAngle); // Start at the top (12 o'clock position)
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();

            context.font = '1rem Roboto';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(label, location, centerY - (rem / 2) - 3);

            // Draw the percentage text
            context.font = '1.5rem Roboto';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(`${counter}`, location, centerY + (rem / 2) + 3)
        }

        clearCanvas(lowerContext);
        drawCircle(lowerContext, remainders.minutes, 59, "Minuten", green, firstQuantileX)
        drawCircle(lowerContext, remainders.seconds, 59, "Seconden", red, thirdQuantileX)
        clearCanvas(upperContext);
        drawCircle(upperContext, remainders.days, 364, "Dagen", purple, firstQuantileX);
        drawCircle(upperContext, remainders.hours, 23, "Uren", yellow, thirdQuantileX);


        // Stop updating once we reach 0
        if (Object.values(remainders).some(value => value > 0)) {
            const interval = setInterval(() => {
                setRemainders((prev) => {
                    const now = new Date();
                    const newStV = createStVDate(now);
                    const diff = now.getTime() >= newStV.startDate.getTime() && now.getTime() <= newStV.endDate.getTime() ? {
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0
                    } : calcDifferenceInDates(now, newStV.startDate);
                    if (Object.values(diff).every(value => value <= 0)) {
                        clearInterval(interval);
                        return { ...prev, seconds: 0 };
                    }
                    return {
                        days: diff.days,
                        hours: diff.hours,
                        minutes: diff.minutes,
                        seconds: diff.seconds
                    };
                });
            }, 1000);

            return () => clearInterval(interval); // Cleanup interval on unmount
        }
    })
    return <>
        <canvas ref={upperCanvasRef}>

        </canvas>
        <canvas ref={lowerCanvasRef}>
        </canvas>
    </>
}
