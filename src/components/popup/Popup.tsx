import styles from "./Popup.module.css";
import { PopupEnum } from "../../lib/popup";

function getPopupTypeClassName(type: any) {
  switch (type) {
    case PopupEnum.ERROR:
      return styles.errorPopup;
    case PopupEnum.SUCCESS:
      return styles.successPopup;
    case PopupEnum.WARNING:
      return styles.warningPopup;
    case PopupEnum.INFO:
      return styles.infoPopup;
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
    <div className={styles.overlay}>
      <div
        className={`${styles.popupContainer} ${getPopupTypeClassName(title)}`}
      >
        <div className={styles.popup}>
          <h2>{title}</h2>
          <p>{message}</p>
          <button onClick={onClose}> Sluiten </button>
        </div>
      </div>
    </div>
  );
}
