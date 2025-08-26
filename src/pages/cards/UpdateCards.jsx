import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { encryptData, decryptData } from "../../utils/cryptoUtils"; // Adjust the import path as needed
import CardSearchFilter from "./CardSearchFilter";

function UpdateCards() {
  const [headerTitle] = useState("Update Card");
  const [environment, setEnvironment] = useState("1");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cards, setCards] = useState([]);
  // New state to force table remount
  const [tableKey, setTableKey] = useState(0);

  const { user } = useAuth();
  const userRole = user?.role;

  // Change environment and force table remount
  const handleEnvironmentChange = (e) => {
    const newEnv = e.target.value;
    setTableKey((prev) => prev + 1);
    setEnvironment(newEnv);
  };

  // Fetch cards and decrypt cardDetails for each card
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axiosToken.get(
          `/cards?environment=${environment}&status=${statusFilter}`
        );
        const cardsData = response.data || [];
        const encryptionKey = import.meta.env.VITE_ENCKEY; // Replace with your actual key

        // Decrypt cardDetails for each card if available
        const decryptedCards = await Promise.all(
          cardsData.map(async (card) => {
            if (card.cardDetails) {
              try {
                const sanitizedEncryptedData = card.cardDetails.replace(
                  /\s+/g,
                  ""
                );
                const sanitizedIV = card.ivKey.replace(/\s+/g, "");

                // decryptData expects { encryptionKey, encryptedData, iv }
                const decryptedText = await decryptData({
                  encryptionKey,
                  encryptedData: sanitizedEncryptedData,
                  iv: sanitizedIV,
                });
                // The decrypted text is a JSON string; parse it
                const decryptedObj = JSON.parse(decryptedText);
                return { ...card, decryptedCardDetails: decryptedObj };
              } catch (error) {
                console.error(
                  "Error decrypting card details for card",
                  card.id,
                  error
                );
                return card;
              }
            }
            return card;
          })
        );
        setCards(decryptedCards);
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };
    fetchCards();
  }, [environment, statusFilter]);



  return (
    <>
      <Header title={headerTitle} />
      <section>
        <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-2">
          <div className="container-fluid">
            <div className="d-lg-flex align-items-center justify-content-center">
              <span className="me-lg-5 font">Environment</span>
              <div className="d-lg-flex formcard">
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="environment"
                    value={"1"}
                    checked={environment == "1"}
                    onChange={handleEnvironmentChange}
                    id="flexRadioDefault1"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault1"
                  >
                    Prod
                  </label>
                </div>
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="environment"
                    value={"2"}
                    checked={environment == "2"}
                    onChange={handleEnvironmentChange}
                    id="flexRadioDefault2"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault2"
                  >
                    QA
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="notification">
          <div className="container-fluid">
            <CardSearchFilter environment={environment} />
          </div>
        </div>
      </section>
      <Sidebar />
      <Footer />
    </>
  );
}

export default UpdateCards;
