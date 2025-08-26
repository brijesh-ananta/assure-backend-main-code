import { useState, useEffect } from "react";
import axiosToken from "../../utils/axiosToken";
import { decryptData } from "../../utils/cryptoUtils";
import UpdateCardInner from "./UpdateCardInner";

// eslint-disable-next-line react/prop-types
function CardSearchFilter({ environment }) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cards, setCards] = useState([]); // Renamed from setUpdateCard
  const encryptionKey = import.meta.env.VITE_ENCKEY;

  useEffect(() => {
    getAllCards();
  }, [environment]);

  const getAllCards = async () => {
    try {
      let response;
      response = await axiosToken.get(`/cards?environment=${environment}`);

      // Decrypt card details and update state with decrypted data
      const decryptedCards = await Promise.all(
        response.data.map(async (card) => {
          if (!card.ivKey || !card.cardDetails) {
            return { ...card, decryptedCardDetails: {} };
          }

          try {
            const sanitizedIV = card.ivKey.replace(/\s+/g, "");
            const sanitizedEncryptedData = card.cardDetails.replace(/\s+/g, "");
            const decryptedText = await decryptData({
              encryptionKey,
              encryptedData: sanitizedEncryptedData,
              iv: sanitizedIV,
            });
            const decryptedObj = JSON.parse(decryptedText || "{}");

            return { ...card, decryptedCardDetails: decryptedObj };
          } catch (err) {
            console.error(`Error decrypting card ID ${card.id}:`, err);
            return { ...card, decryptedCardDetails: {} };
          }
        })
      );

      setCards(decryptedCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]);
    }
  };

  const filteredCards = cards.filter((card) => {
    // If a search field is non-empty, it must match
    let matches = true;

    if (userName.trim()) {
      matches =
        matches &&
        `${card.userName || ""}`
          .toLowerCase()
          .includes(userName.toLowerCase().trim());
    }

    if (email.trim()) {
      matches =
        matches &&
        `${card.userEmail || ""}`
          .toLowerCase()
          .includes(email.toLowerCase().trim());
    }

    if (cardNumber.trim()) {
      matches =
        matches &&
        `${card.decryptedCardDetails.cardNumber || ""}`
          .toLowerCase()
          .includes(cardNumber.toLowerCase().trim());
    }

    return matches;
  });

  const handleCardClick = () => {
    // Reset accordion
    document.querySelectorAll(".accordion-collapse").forEach((collapse) => {
      collapse.classList.remove("show");
    });
  };

  return (
    <>
      <form>
        <div className="login-page mb-lg-4 mb-2 row">
          {/* Search Inputs */}
          <div className="col-12 col-lg-6 pe-lg-0 mb-lg-4 mb-2 pe-lg-5">
            <div className="d-lg-flex align-items-center">
              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                Tester Name
              </label>
              <div className="position-relative w-100">
                <input
                  placeholder="FirstName* or LastName* (full or partial)"
                  type="text"
                  className="form-control formcontrol"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <img
                  className="postiop"
                  src="/images/search.svg"
                  alt="search"
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 mb-lg-4 mb-2">
            <div className="d-lg-flex align-items-center">
              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow2">
                Email
              </label>
              <div className="position-relative w-100">
                <input
                  placeholder="Email* (full or partial)"
                  type="email"
                  className="form-control formcontrol"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <img
                  className="postiop"
                  src="/images/search.svg"
                  alt="search"
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 pe-lg-0 mb-lg-4 mb-2 pe-lg-5">
            <div className="d-lg-flex align-items-center">
              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                Card Number
              </label>
              <div className="position-relative w-100">
                <input
                  placeholder="Card Number (full or partial)*"
                  type="text"
                  className="form-control formcontrol"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <img
                  className="postiop"
                  src="/images/search.svg"
                  alt="search"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="card rounded-0 accordian-flex">
        <div className="card-body">
          <div className="d-lg-flex align-items-center justify-content-between mb-lg-3 mb-2">
            <span className="search-title">Matching Cards</span>
          </div>

          <div className="accordion" id="accordionExample">
            {filteredCards.map((card, index) => (
              <div className="accordion-item" key={card.id}>
                <h2 className="accordion-header" id={`heading-${card.id}`}>
                  <button
                    className="accordion-button bgbutton collapsed p-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${card.id}`}
                    aria-expanded={index === 0}
                    aria-controls={`collapse-${card.id}`}
                    onClick={() => handleCardClick()}
                  >
                    <div className="table-responsive w-100">
                      <table className="table mb-0">
                        <thead className="table-theme themac themewidh">
                          <tr>
                            <th scope="col">Card {index + 1}</th>
                            <th scope="col">
                              {card.decryptedCardDetails?.cardNumber
                                ? card.decryptedCardDetails.cardNumber.replace(
                                    /^(\d{6})(\d+)(\d{6})$/,
                                    "$1XXXX$3"
                                  )
                                : "N/A"}
                            </th>
                            <th scope="col">
                              <div className="d-flex align-items-center">
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    checked={card.status === "assigned"}
                                    value="assigned"
                                    name={`isLocked-${card.id}`}
                                    disabled
                                  />
                                  <label className="form-check-label">
                                    Assigned
                                  </label>
                                </div>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="d-flex align-items-center">
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    checked={card.status === "unassigned"}
                                    value="unassigned"
                                    name={`isLocked-${card.id}`}
                                    disabled
                                  />
                                  <label className="form-check-label">
                                    Not Assigned
                                  </label>
                                </div>
                              </div>
                            </th>
                            <th scope="col">
                              <button className="btn btn-secondary btn-sm btn-color darkcolor">
                                View Details
                              </button>
                            </th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </button>
                </h2>
                <UpdateCardInner card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default CardSearchFilter;
