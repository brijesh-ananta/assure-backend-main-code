import { useState, useEffect } from "react";
import Bundle from "./components/Bundle";
import { ToastContainer } from "react-toastify";
import axiosToken from "../../utils/axiosToken";
import ProdPosTable from "./components/ProdPosTable";

const ProductBundleTable = () => {
  const [environment, setEnvironment] = useState("1");
  const [cardType, setcardType] = useState("Pos");
  const [posDetails, setPosDetails] = useState([]);
  const [ecommDetails, setEcommDetails] = useState([]);

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);

    if (e.target.value != 1) {
      setcardType("Pos");
    }
  };

  const handlecardTypeChange = (e) => {
    setcardType(e.target.value);
  };

  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        const response = await axiosToken.get(
          `/issuers/get-all-issuers-with-bin?environment=${environment}&status=All&cardType=${cardType}`
        );
        const allIssuers = response.data || [];

        const pos = allIssuers.filter(
          (issuer) =>
            issuer.test_card_type === "Pos" || issuer.card_type == "Pos"
        );

        const ecomm = allIssuers.filter(
          (issuer) =>
            issuer.test_card_type === "Ecomm" || issuer.card_type === "Ecomm"
        );

        setPosDetails(pos);
        setEcommDetails(ecomm);
      } catch (error) {
        console.error("Error fetching issuers:", error);
      }
    };

    fetchIssuers();
  }, [cardType, environment]);

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-evenly w-100">
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Environment</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"1"}
                  checked={environment === "1"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault1"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"2"}
                  checked={environment === "2"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault2"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="test"
                  value={"3"}
                  checked={environment === "3"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault3"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault3">
                  Cert
                </label>
              </div>
            </div>

            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Card Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="cardType"
                  value={"Pos"}
                  onChange={handlecardTypeChange}
                  id="cardType1"
                  checked={cardType === "Pos"}
                />
                <label className="form-check-label" htmlFor="cardType1">
                  POS
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="cardType"
                  value={"Ecomm"}
                  onChange={handlecardTypeChange}
                  id="cardType2"
                  checked={cardType === "Ecomm"}
                  disabled={environment === "2" || environment === "3"}
                />
                <label className="form-check-label" htmlFor="cardType2">
                  Ecomm
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {environment === "1" && cardType === "Pos" && (
        <ProdPosTable
          environment={environment}
          cardType={cardType}
          issuers={posDetails}
        />
      )}
      {environment === "1" && cardType === "Ecomm" && (
        <ProdPosTable
          environment={environment}
          cardType={cardType}
          issuers={ecommDetails}
        />
      )}
      {environment === "2" && cardType === "Pos" && (
        <ProdPosTable
          environment={environment}
          cardType={cardType}
          issuers={posDetails}
        />
      )}
      {environment === "3" && cardType === "Pos" && <Bundle />}
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

export default ProductBundleTable;
