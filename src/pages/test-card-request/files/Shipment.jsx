import React, { useState, useEffect } from "react";
import axiosToken from "../../../utils/axiosToken";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";

function Shipment({
  requestInfoData,
  cardRequestId,
  terminalType,
  environment,
}) {
  const navigate = useNavigate();
  const [shippingInfoData, setShippingInfoData] = useState(
    requestInfoData?.shipDetails || {}
  );
  const [shipmentInfoData, setShipmentInfoData] = useState(
    requestInfoData?.shipmentInfo || {}
  );
  const [cardType, setCardType] = useState(1);
  const [numTesters, setNumTesters] = useState(1);
  const [numPartners, setNumPartners] = useState(1);
  const [shipTo, setShipTo] = useState("one");
  const [issuerOptions, setIssuerOptions] = useState({});
  const [vaultCounts, setVaultCounts] = useState({});
  const [cardDetails, setCardDetails] = useState([]);
  const [testerDetails, setTesterDetails] = useState([]);
  const [addressDetails, setAddressDetails] = useState([
    { id: 1, unit: "", city: "", postalCode: "", state: "", country: "" },
  ]);
  const [shippingDates, setShippingDates] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userRole } = useAuth();
  // Parse shipDetails and shipmentInfo
  useEffect(() => {
    if (requestInfoData?.shipDetails) {
      const parsedShipDetails = JSON.parse(requestInfoData.shipDetails);
      setShippingInfoData((prevData) => ({
        ...prevData,
        ...parsedShipDetails,
      }));
    }

    if (requestInfoData?.shipmentInfo) {
      const parsedShipInfo = JSON.parse(requestInfoData.shipmentInfo);
      setShipmentInfoData((prevData) => ({
        ...prevData,
        ...parsedShipInfo,
      }));
    }
  }, [requestInfoData]);

  // Update state based on shippingInfoData and shipmentInfoData
  useEffect(() => {
    if (shippingInfoData) {
      setCardType(shippingInfoData.cardType || 1);
      setNumTesters(shippingInfoData.numTesters || 1);
      setShipTo(shippingInfoData.shipTo || "one");
      setCardDetails(shippingInfoData.cardDetails || []);
      setTesterDetails(shippingInfoData.testerDetails || []);
      setAddressDetails(
        shippingInfoData.addressDetails || [
          { id: 1, unit: "", city: "", state: "", country: "" },
        ]
      );
    }

    if (shipmentInfoData) {
      setShippingDates(shipmentInfoData.shippingDates || []);
      setTrackingNumbers(shipmentInfoData.trackingNumbers || []);
    }
  }, [shippingInfoData, shipmentInfoData]);

  // Update cardDetails based on cardType
  useEffect(() => {
    if (
      !shippingInfoData.cardDetails ||
      shippingInfoData.cardDetails.length === 0
    ) {
      const rows = Array.from({ length: cardType }, (_, index) => ({
        id: index + 1,
        specialFeature: "",
        product: "",
        domesticGlobal: "",
        issuer: "",
        quantity: 1,
        vault: vaultCounts?.[index] !== undefined ? vaultCounts[index] : "0",
      }));
      setCardDetails(rows);
    }
  }, [cardType, shippingInfoData.cardDetails, vaultCounts]);

  // Update testerDetails based on numTesters
  useEffect(() => {
    if (
      !shippingInfoData.testerDetails ||
      shippingInfoData.testerDetails.length === 0
    ) {
      const testers = Array.from({ length: numTesters }, (_, index) => ({
        id: index + 1,
        name: "",
        email: "",
        card: "",
      }));
      setTesterDetails(testers);
    }
  }, [numTesters, shippingInfoData.testerDetails]);

  // Update addressDetails based on shipTo and numPartners
  useEffect(() => {
    if (
      !shippingInfoData.addressDetails ||
      shippingInfoData.addressDetails.length === 0
    ) {
      if (shipTo === "multiple") {
        const addresses = Array.from({ length: numPartners }, (_, index) => ({
          id: index + 1,
          unit: "",
          city: "",
          postalCode: "",
          state: "",
          country: "",
        }));
        setAddressDetails(addresses);
      } else {
        setAddressDetails([
          { id: 1, unit: "", city: "", postalCode: "", state: "", country: "" },
        ]);
      }
    }
  }, [numPartners, shipTo, shippingInfoData.addressDetails]);

  // Calculate min date (current date - 7 days)
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 7);
    return today.toISOString().substring(0, 10); // Format as YYYY-MM-DD
  };

  const handleShippingDateChange = (index, value) => {
    const updatedShippingDates = [...shippingDates];
    updatedShippingDates[index] = value;
    setShippingDates(updatedShippingDates);
  };

  const handleTrackingNumberChange = (index, value) => {
    const updatedTrackingNumbers = [...trackingNumbers];
    updatedTrackingNumbers[index] = value;
    setTrackingNumbers(updatedTrackingNumbers);
  };

  const handleSave = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    const submitData = {
      shippingDates,
      trackingNumbers,
    };

    try {
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        {
          submitData,
          column: "shipmentInfo",
          status: "shipped",
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsLoading(false);
        toast.success("Shipping information saved successfully");
        // set timeout for 1.8 seconds
        setTimeout(() => {
          toast.dismiss();
          navigate(`/dashboard/test-card-fulfilment`);
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error saving shipping info:", error);
      toast.error("An error occurred while saving the shipping information.");
    }
  };

  return (
    <div className="container-fluid">
      <form>
        <div className="col-lg-12 mb-4 w-100">
          <div className="d-lg-flex align-items-center">
            <span className="me-3 font">Ship to</span>
            <form>
              <div className="d-lg-flex formcard">
                {["one", "multiple", "mobile"].map((option) => (
                  <div
                    key={option}
                    className="form-check me-3 d-flex gap-2 align-items-center"
                  >
                    <input
                      className="form-check-input"
                      type="radio"
                      name="shipTo"
                      value={option}
                      checked={shipTo === option}
                      onChange={(e) => setShipTo(e.target.value)}
                      disabled
                    />
                    <label className="form-check-label">
                      {option === "one"
                        ? "One Address"
                        : option === "multiple"
                        ? "Multiple Addresses"
                        : "Mobile Card Only"}
                    </label>
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>
        {shipTo === "one" &&
          addressDetails.map((address, index) => (
            <div
              key={address.id}
              className="login-page mb-lg-4 mb-2 bg-light p-3"
            >
              <div className="col-12 col-lg-12 pe-lg-0">
                <div className="d-lg-flex justify-content-start flexform gap-5 flexshrinks">
                  <div className="d-lg-flex align-items-center w-100">
                    <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                      One Address
                    </label>
                    {address.unit}
                  </div>
                  <div className="d-lg-flex align-items-center w-100">
                    <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                      City
                    </label>
                    {address.city}
                  </div>
                  <div className="d-lg-flex align-items-center w-100">
                    <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                      Postal Code
                    </label>
                    {address.postalCode}
                  </div>
                  <div className="d-lg-flex align-items-center w-100">
                    <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                      State
                    </label>
                    {address.state}
                  </div>
                  <div className="d-lg-flex align-items-center w-100">
                    <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                      Country
                    </label>
                    {address.country}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {testerDetails.map((tester, i) => (
          <div key={tester.id} className="login-page mb-lg-2 mb-2 bg-light p-3">
            <div className="col-12 col-lg-12">
              <div className="d-lg-flex justify-content-start flexform gap-5">
                <div className="d-lg-flex align-items-center w-100">
                  <label className="form-check-label fw-bold mb-0 me-3">
                    Tester Name {tester.id}
                  </label>
                  {tester.name}
                </div>
                <div className="d-lg-flex align-items-center w-100">
                  <label className="form-check-label fw-bold mb-0 me-3">
                    Email:
                  </label>
                  {tester.email}
                </div>
              </div>

              {shipTo === "multiple" && addressDetails[i] && (
                <>
                  <div
                    key={addressDetails[i].id}
                    className="login-page mb-lg-4 mb-2 bg-light p-3"
                  >
                    <div className="col col-lg-12 pe-lg-0">
                      <div className="d-lg-flex justify-content-start flexform gap-5 flexshrinks">
                        <div className="d-lg-flex align-items-center w-100">
                          <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                            Address {i + 1}
                          </label>
                          {addressDetails[i].unit}
                        </div>
                        <div className="d-lg-flex align-items-center w-100">
                          <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                            City
                          </label>
                          {addressDetails[i].city}
                        </div>
                        <div className="d-lg-flex align-items-center w-100">
                          <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                            Postal Code
                          </label>
                          {addressDetails[i].postalCode}
                        </div>
                        <div className="d-lg-flex align-items-center w-100">
                          <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                            State
                          </label>
                          {addressDetails[i].state}
                        </div>
                        <div className="d-lg-flex align-items-center w-100">
                          <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                            Country
                          </label>
                          {addressDetails[i].country}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="login-page mb-lg-2 mb-2 p-3 w-100 d-flex justify-content-between flexform gap-5 flexshrinks"
                    style={{ backgroundColor: "#FEF5EE" }}
                  >
                    <div className="col-12 col-lg-4 me-lg-4 me-0">
                      <div className="d-lg-flex align-items-center">
                        <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                          Shipping Date
                        </label>
                        <input
                          name="shippingDate"
                          placeholder="yyyy-mm-dd"
                          type="date"
                          value={
                            shippingDates[i]
                              ? new Date(shippingDates[i])
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                          }
                          className="form-control formcontrol"
                          onChange={(e) =>
                            handleShippingDateChange(i, e.target.value)
                          }
                          min={getMinDate()}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-lg-4 me-lg-4 me-0">
                      <div className="d-lg-flex align-items-center">
                        <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                          Tracking Number
                        </label>
                        <input
                          name="trackingNumber"
                          placeholder="Tracking Number"
                          type="text"
                          value={trackingNumbers[i] || ""}
                          className="form-control formcontrol"
                          onChange={(e) =>
                            handleTrackingNumberChange(i, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {shipTo !== "multiple" && (
          <div
            className="login-page mb-lg-2 mb-2 p-3 w-100 d-flex justify-content-between flexform gap-5 flexshrinks"
            style={{ backgroundColor: "#FEF5EE" }}
          >
            <div className="col-12 col-lg-4 me-lg-4 me-0">
              <div className="d-lg-flex align-items-center">
                <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                  Shipping Date
                </label>
                <input
                  name="shippingDate"
                  placeholder="yyyy-mm-dd"
                  type="date"
                  value={
                    shippingDates[0]
                      ? new Date(shippingDates[0])
                          .toISOString()
                          .substring(0, 10)
                      : ""
                  }
                  className="form-control formcontrol"
                  onChange={(e) =>
                    handleShippingDateChange(0, e.target.value)
                  }
                  min={getMinDate()}
                />
              </div>
            </div>
            <div className="col-12 col-lg-4 me-lg-4 me-0">
              <div className="d-lg-flex align-items-center">
                <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                  Tracking Number
                </label>
                <input
                  name="trackingNumber"
                  placeholder="Tracking Number"
                  type="text"
                  value={trackingNumbers[0] || ""}
                  className="form-control formcontrol"
                  onChange={(e) =>
                    handleTrackingNumberChange(0, e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="btn-section col-12 d-flex justify-content-end">
          {userRole === 1 && (requestInfoData.status !== "shipped") && (
            <a
              className="btn-add d-flex align-items-center gap-1"
              style={{ cursor: "pointer" }}
              onClick={handleSave}
            >
              {isLoading ? "Saving..." : "Save Shipping Information"}
            </a>
          )}
        </div>
      </form>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

export default Shipment;