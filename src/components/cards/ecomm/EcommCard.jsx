/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { useCallback, useState } from "react";
import { formatMaskedCardNumber } from "../../../utils/function";
import "./style.css";
import { cardStyles } from "../pos/PosCard";

const getCardNetwork = (cardNumber = "") => {
  const trimmed = cardNumber.replace(/\s|-/g, "");

  if (/^65|^6011/.test(trimmed)) return "discover";
  if (/^36|^38/.test(trimmed)) return "diners";
  if (/^4/.test(trimmed)) return "visa";
  if (/^5[1-5]/.test(trimmed)) return "mastercard";
  if (/^50|^60/.test(trimmed)) return "rupay";
  if (/^37/.test(trimmed)) return "amex";

  return "default";
};

const EcommCard = (props) => {
  const { data } = props;
  const cardDetails = data?.decryptedCardDetails;
  const [showCardNumber, setShowCardNumber] = useState(false);

  const getCardValidityDate = useCallback((data) => {
    if (!data) return "";

    const str = String(data).trim();

    // If already MMYY (e.g. "0825")
    if (/^\d{4}$/.test(str)) {
      const mm = str.slice(0, 2);
      const yy = str.slice(2, 4);
      return `${mm}/${yy}`;
    }

    // If MM-YYYY or MM/YYYY
    const m4 = str.match(/^(\d{2})[-\/](\d{4})$/);
    if (m4) {
      return `${m4[1]}/${m4[2].slice(2)}`; // → 08/25
    }

    // If it's a Date or ISO string
    const date = new Date(str);
    if (!isNaN(date)) {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear().toString().slice(2, 4);
      return `${month}/${year}`;
    }

    return "";
  }, []);

  const handleToggleCardNumber = () => {
    setShowCardNumber((prevState) => !prevState);
  };

  const network = getCardNetwork(cardDetails?.cardNumber);
  const styles = cardStyles[network];

  return (
    <>
      <div
        className="ecomm-card rounded-2"
        style={{ background: styles.bgColor, color: styles.textColor }}
      >
        <div className="credit-card-inner">
          <div className="card-chip">
            <img src="/images/card-chip.png" />
          </div>
          <div className="contactless-icon">
            <i
              className="fas fa-wifi fa-rotate-90"
              style={{ color: styles.wifiColor }}
            ></i>
          </div>
          <div
            className={`d-flex align-items-end justify-content-end right-comp-image ${network == "mastercard" && "master-card"}`}
          >
            <img
              src={styles.logo}
              className="credit-network-logo"
              alt="card logo"
            />
          </div>
          <div className="card-number">
            <span className="font">
              {showCardNumber
                ? formatMaskedCardNumber(cardDetails?.cardNumber, "full")
                : formatMaskedCardNumber(cardDetails?.cardNumber)}
            </span>
            <span className="eye-icon">
              <i className="fas fa-eye" onClick={handleToggleCardNumber}></i>
            </span>
          </div>
          <div className="card-details px-3">
            <div className="expiry m-auto d-flex align-items-center">
              <small>
                Valid
                <br />
                Thru
              </small>
              <span className="font">
                {getCardValidityDate(cardDetails?.validThru)}
              </span>
            </div>
          </div>
          <div className="card-holder font fa-1x">
            {cardDetails?.nameOnCard ||
              cardDetails?.name ||
              cardDetails?.cardholder_name}
          </div>
          <div className="right-bottom-box">
            <div className="seq text-right">
              <span className="font"> CVV# &nbsp;</span>{" "}
              <span className="font text-right">
                {cardDetails?.cvv} <br />{" "}
              </span>
            </div>
            <div className="seq text-right">
              <span className="font"> Seq# &nbsp;</span>{" "}
              <span className="font text-right">
                {cardDetails?.seqNumber || cardDetails?.sequence_number}{" "}
                <br />{" "}
              </span>
            </div>
            <p className="text-right font">
              {cardDetails?.binProduct || cardDetails?.bin_product} <br />{" "}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EcommCard;
