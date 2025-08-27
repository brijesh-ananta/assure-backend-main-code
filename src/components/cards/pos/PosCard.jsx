/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { useCallback, useState } from "react";
import { formatMaskedCardNumber } from "../../../utils/function";
import "./style.css";
import { useAuth } from "../../../utils/AuthContext";

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

export const cardStyles = {
  discover: {
    bgColor: "linear-gradient(270deg, #91CCDB, #32869C)",
    logo: "/images/card-logos/discover.png",
    textColor: "#6f6f6f",
    wifiColor: "#6f6f6f",
  },
  diners: {
    bgColor: "linear-gradient(120deg, #A5A5A5, #BFBFBF)",
    logo: "/images/card-logos/diners.png",
    textColor: "#6f6f6f",
    wifiColor: "#6f6f6f",
  },
  visa: {
    bgColor: "linear-gradient(120deg, #0F0F0F, #595959)",
    logo: "/images/card-logos/visa.png",
    textColor: "#FFF",
    wifiColor: "#46A4D2",
  },
  mastercard: {
    bgColor: "linear-gradient(120deg, #923831, #D9958F)",
    logo: "/images/card-logos/master-card.png",
    textColor: "#3F3F3F",
    wifiColor: "#3F3F3F",
  },
  rupay: {
    bgColor: "linear-gradient(120deg, #F59D56, #EA700F)",
    logo: "/images/card-logos/rupay.png",
    textColor: "#3F3F3Fs",
    wifiColor: "#3F3F3F",
  },
  amex: {
    bgColor: "linear-gradient(270deg, #FFFFFF, #F2F2F2)",
    logo: "/images/card-logos/amex.png",
    textColor: "#6f6f6f",
    wifiColor: "#6f6f6f",
  },
  default: {
    bgColor: "linear-gradient(to bottom, #EDE9F1, #D6CEE0, #CDC3DA)",
    logo: "/images/card-logos/default-network.png",
    textColor: "#6f6f6f",
    wifiColor: "#6f6f6f",
  },
};

const PosCard = (props) => {
  const { data } = props;
  const { user } = useAuth();
  const cardDetails = data?.decryptedCardDetails;
  const [showCardNumber, setShowCardNumber] = useState(false);

  const getCardValidityDate = useCallback(
    (data) =>
      `${new Date(data).getMonth() + 1}/${new Date(data)
        .getFullYear()
        .toString()
        .slice(2, 54)}`,
    []
  );

  const handleToggleCardNumber = () => {
    setShowCardNumber((prevState) => !prevState);
  };

  const network = getCardNetwork(cardDetails?.cardNumber);
  const styles = cardStyles[network];

  return (
    <>
      <div
        className="pos-card rounded-2"
        style={{ background: styles.bgColor, color: styles.textColor }}
      >
        <div>
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
            className={`d-flex align-items-end justify-content-end right-comp-image ${
              network == "mastercard" && "master-card"
            }`}
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
            {user.role === 2 ? (
              <></>
            ) : (
              <>
                <span className="eye-icon">
                  <i
                    className="fas fa-eye"
                    onClick={handleToggleCardNumber}
                  ></i>
                </span>
              </>
            )}
          </div>
          <div className="card-details px-3">
            <div className="expiry m-auto d-flex align-items-center">
              <small>
                Valid
                <br />
                Thru
              </small>
              <span className="font">
                {getCardValidityDate(cardDetails?.expDate)}
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
              <span className="font"> PIN# &nbsp;</span>{" "}
              <span className="font text-right">
                {cardDetails?.pin || cardDetails?.pinNumber} <br />{" "}
              </span>
            </div>

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

export default PosCard;
