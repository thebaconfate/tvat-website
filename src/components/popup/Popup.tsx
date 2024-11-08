import "./styles.css"
import { PopupEnum } from "../../lib/popup";

function getPopupTypeClassName(type: any) {
    switch (type) {
        case PopupEnum.ERROR:
            return "error-popup";
        case PopupEnum.SUCCESS:
            return "success-popup";
        case PopupEnum.WARNING:
            return "warning-popup";
        case PopupEnum.INFO:
            return "info-popup";
        default:
            throw new Error(`Unknown popup type: ${(typeof type).toString()}`);
    }
}

export function Popup({
    title,
    message,
    onClose,
}: Readonly<{
    title: PopupEnum;
    message: string;
    onClose: () => void;
}>) {
    return (
        <div className='overlay'>
            <div className={`popup-container ${getPopupTypeClassName(title)}`}>
                <div className='popup'>
                    <h2>{title}</h2>
                    <p>{message}</p>
                    <button onClick={onClose}> Sluiten </button>
                </div>
            </div>
        </div>
    );
}
