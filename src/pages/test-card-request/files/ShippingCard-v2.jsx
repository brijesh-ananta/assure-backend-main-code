/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import axiosToken from "../../../utils/axiosToken";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ShippingCardV2({ requestInfoData, terminalType, environment }) {
  const navigate = useNavigate();
  const [shippingInfoData, setShippingInfoData] = useState(
    requestInfoData?.shipDetails || {}
  );

  const initialDataLoaded = useRef(false);
  const [hasFetched, setHasFetched] = useState(false);
  const prevCardDetailsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  useEffect(() => {
    if (requestInfoData?.shipDetails) {
      try {
        const parsedShipDetails = JSON.parse(requestInfoData.shipDetails);
        setShippingInfoData((prevData) => ({
          ...prevData,
          ...parsedShipDetails,
        }));
      } catch (error) {
        console.error("Error parsing shipDetails:", error);
      }
    }
  }, [requestInfoData]);

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

  // Update state based on shippingInfoData
  useEffect(() => {
    if (terminalType === "Ecomm") {
      setShipTo("mobile");
    } else if (shippingInfoData) {
      setShipTo(shippingInfoData.shipTo || "one");
    }

    if (shippingInfoData) {
      setCardType(shippingInfoData.cardType || 1);
      setNumTesters(shippingInfoData.numTesters || 1);
      setNumPartners(shippingInfoData.numPartners || 1);

      if (
        shippingInfoData.cardDetails &&
        shippingInfoData.cardDetails.length > 0
      ) {
        setCardDetails(shippingInfoData.cardDetails);
        initialDataLoaded.current = true;
      }

      if (
        shippingInfoData.testerDetails &&
        shippingInfoData.testerDetails.length > 0
      ) {
        setTesterDetails(shippingInfoData.testerDetails);
      }

      if (
        shippingInfoData.addressDetails &&
        shippingInfoData.addressDetails.length > 0
      ) {
        setAddressDetails(shippingInfoData.addressDetails);
      }
    }
  }, [shippingInfoData, terminalType]);

  // Initialize cardDetails if empty
  useEffect(() => {
    if (
      (!shippingInfoData.cardDetails ||
        shippingInfoData.cardDetails.length === 0) &&
      cardDetails.length === 0
    ) {
      const row = {
        id: 1,
        specialFeature: "",
        product: "",
        domesticGlobal: "",
        issuer: "",
        quantity: 1,
        vault: vaultCounts?.[0] !== undefined ? vaultCounts[0] : "0",
      };
      setCardDetails([row]);
    }
  }, [shippingInfoData.cardDetails, cardDetails.length, vaultCounts]);

  // Update vault field in cardDetails
  useEffect(() => {
    setCardDetails((prevCards) =>
      prevCards.map((card, index) => {
        const newVault =
          vaultCounts?.[index] !== undefined ? vaultCounts[index] : "0";
        if (card.vault !== newVault) {
          return { ...card, vault: newVault };
        }
        return card;
      })
    );
  }, [vaultCounts]);

  // Update tester details
  useEffect(() => {
    if (testerDetails.length !== numTesters) {
      const updatedTesters = [...testerDetails];
      if (updatedTesters.length < numTesters) {
        for (let i = updatedTesters.length; i < numTesters; i++) {
          updatedTesters.push({
            id: i + 1,
            name: "",
            email: "",
            card: "",
          });
        }
      } else {
        updatedTesters.splice(numTesters);
      }
      setTesterDetails(updatedTesters);
    }
  }, [numTesters, testerDetails]);

  // Update address details
  useEffect(() => {
    if (shipTo === "multiple") {
      const neededAddresses = numTesters;
      if (addressDetails.length !== neededAddresses) {
        const updatedAddresses = [...addressDetails];
        if (updatedAddresses.length < neededAddresses) {
          for (let i = updatedAddresses.length; i < neededAddresses; i++) {
            updatedAddresses.push({
              id: i + 1,
              unit: "",
              city: "",
              postalCode: "",
              state: "",
              country: "",
            });
          }
        } else {
          updatedAddresses.splice(neededAddresses);
        }
        setAddressDetails(updatedAddresses);
      }
    } else if (shipTo === "one") {
      if (addressDetails.length !== 1) {
        setAddressDetails([
          { id: 1, unit: "", city: "", postalCode: "", state: "", country: "" },
        ]);
      }
    }
  }, [shipTo, numTesters, addressDetails]);

  // Fetch issuers
  const fetchIssuers = async (
    index,
    specialFeature,
    product,
    domesticGlobal,
    issuer
  ) => {
    let status;
    if (!product || !environment || !terminalType) return;
    try {
      if (
        requestInfoData.status === "draft" ||
        requestInfoData.status === undefined ||
        requestInfoData.status === "submitted" ||
        requestInfoData.status === "approved" ||
        requestInfoData.status === "returned"
      ) {
        status = "unassigned";
      } else {
        status = "assigned";
      }

      const response = await axiosToken.get(`/cards/list`, {
        params: {
          binProduct: product,
          feature: specialFeature,
          region: domesticGlobal,
          environment: environment,
          terminalType: terminalType,
          issuer: issuer,
          status: status,
        },
      });
      const issuers = response.data.map(({ issuerId, issuerName }) => ({
        id: issuerId,
        name: issuerName,
      }));
      const vaultCount = response.data.length;

      setIssuerOptions((prev) => ({
        ...prev,
        [index]: issuers,
      }));
      setVaultCounts((prev) => ({
        ...prev,
        [index]: vaultCount,
      }));
    } catch (error) {
      console.error("Error fetching issuers:", error);
      setIssuerOptions((prev) => ({
        ...prev,
        [index]: [],
      }));
      setVaultCounts((prev) => ({
        ...prev,
        [index]: 0,
      }));
    }
  };

  // Fetch issuers on cardDetails change
  useEffect(() => {
    if (cardDetails.length > 0 && !hasFetched) {
      const shouldFetch = cardDetails.some((card, index) => {
        return (
          card.product &&
          (prevCardDetailsRef.current[index]?.product !== card.product ||
            prevCardDetailsRef.current[index]?.specialFeature !==
              card.specialFeature ||
            prevCardDetailsRef.current[index]?.domesticGlobal !==
              card.domesticGlobal)
        );
      });

      if (shouldFetch) {
        cardDetails.forEach((card, index) => {
          if (card.product) {
            fetchIssuers(
              index,
              card.specialFeature,
              card.product,
              card.domesticGlobal,
              card.issuer
            );
          }
        });
        setHasFetched(true);
      }
    }

    prevCardDetailsRef.current = cardDetails;
  }, [cardDetails, environment, terminalType, hasFetched]);

  const handleCardChange = (index, field, value) => {
    const currentCard = { ...cardDetails[index] };
    currentCard[field] = value;

    setCardDetails((prevCards) => {
      const updatedCards = [...prevCards];
      updatedCards[index] = currentCard;
      return updatedCards;
    });

    fetchIssuers(
      index,
      field === "specialFeature" ? value : currentCard.specialFeature,
      field === "product" ? value : currentCard.product,
      field === "domesticGlobal" ? value : currentCard.domesticGlobal,
      field === "issuer" ? value : currentCard.issuer
    );
  };

  const handleTesterChange = (index, field, value) => {
    const updatedTesters = [...testerDetails];
    updatedTesters[index][field] = value;
    setTesterDetails(updatedTesters);
  };

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...addressDetails];
    if (!updatedAddresses[index]) {
      updatedAddresses[index] = {
        id: index + 1,
        unit: "",
        city: "",
        postalCode: "",
        state: "",
        country: "",
      };
    }
    updatedAddresses[index][field] = value;
    setAddressDetails(updatedAddresses);
  };

  const validateForm = () => {
    // Card details validation
    if (cardDetails.length === 0) {
      toast.error("At least one card is required.");
      return false;
    }
    if (terminalType === "Pos") {
      for (const card of cardDetails) {
        if (
          !card.specialFeature ||
          !card.product ||
          !card.domesticGlobal ||
          !card.issuer
        ) {
          toast.error("Please fill all required fields in the card details.");
          return false;
        }
      }
    } else {
      for (const card of cardDetails) {
        if (!card.product || !card.issuer) {
          toast.error("Please fill all required fields in the card details.");
          return false;
        }
      }
    }

    // Tester details validation
    if (testerDetails.length === 0) {
      toast.error("At least one tester is required.");
      return false;
    }
    for (const tester of testerDetails) {
      if (!tester.name || tester.name.trim() === "") {
        toast.error("Tester name is required for all testers.");
        return false;
      }
      if (!tester.email || tester.email.trim() === "") {
        toast.error("Tester email is required for all testers.");
        return false;
      }
    }
    const names = testerDetails.map((tester) =>
      tester.name.trim().toLowerCase()
    );
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      toast.error("Tester names must be unique.");
      return false;
    }
    const emails = testerDetails.map((tester) =>
      tester.email.trim().toLowerCase()
    );
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      toast.error("Tester emails must be unique.");
      return false;
    }

    // Address validation
    if (shipTo !== "mobile") {
      if (shipTo === "one") {
        const addr = addressDetails[0];
        if (
          !addr.unit?.trim() ||
          !addr.city?.trim() ||
          !addr.state?.trim() ||
          !addr.country?.trim() ||
          !addr.postalCode?.trim()
        ) {
          toast.error(
            "All address fields (unit, city, state, country, postal code) are required."
          );
          return false;
        }
      } else if (shipTo === "multiple") {
        for (let i = 0; i < addressDetails.length; i++) {
          const addr = addressDetails[i];
          if (
            !addr.unit?.trim() ||
            !addr.city?.trim() ||
            !addr.state?.trim() ||
            !addr.country?.trim() ||
            !addr.postalCode?.trim()
          ) {
            toast.error(
              `All address fields (unit, city, state, country, postal code) for tester ${
                i + 1
              } are required.`
            );
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saveLoading) return;
    setSaveLoading(true);

    let parsedReqInfo = null;
    try {
      const response = await axiosToken.get(
        `/card-requests/${requestInfoData.id}`
      );
      const reqData = response.data.reqInfo;
      parsedReqInfo = JSON.parse(reqData);
    } catch (error) {
      console.error("Error checking request status:", error);
      toast.error("Error checking request status. Please try again.");
      setSaveLoading(false);
      return;
    }

    if (!parsedReqInfo) {
      toast.error("Request information not found.");
      setSaveLoading(false);
      return;
    }

    if (vaultCounts?.[0] === 0 || vaultCounts?.[0] === undefined) {
      toast.error("No vaults available for the selected card.");
      setSaveLoading(false);
      return;
    }

    if (numTesters > vaultCounts?.[0]) {
      toast.error("Number of testers cannot be more than available vaults.");
      setSaveLoading(false);
      return;
    }

    if (!validateForm()) {
      setSaveLoading(false);
      return;
    }

    const submitData = {
      ...shippingInfoData,
      cardDetails,
      testerDetails,
      addressDetails,
      cardType,
      numTesters,
      numPartners,
      shipTo,
    };

    try {
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        {
          submitData,
          column: "shipDetails",
          status: "draft",
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Shipping information saved successfully");
        setTimeout(() => {
          setSaveLoading(false);
          navigate(`/dashboard/request-history`);
        }, 1800);
      }
    } catch (error) {
      console.error("Error saving shipping info:", error);
      toast.error("An error occurred while saving the shipping information.");
      setSaveLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    let parsedReqInfo = null;
    try {
      const response = await axiosToken.get(
        `/card-requests/${requestInfoData.id}`
      );
      const reqData = response.data.reqInfo;
      parsedReqInfo = JSON.parse(reqData);
    } catch (error) {
      console.error("Error checking request status:", error);
      toast.error("Error checking request status. Please try again.");
      setLoading(false);
      return;
    }

    if (!parsedReqInfo) {
      toast.error("Request information not found.");
      setLoading(false);
      return;
    }

    if (parsedReqInfo.status !== "approved") {
      toast.error("Request is not in approved state.");
      setLoading(false);
      return;
    }

    if (vaultCounts?.[0] === 0 || vaultCounts?.[0] === undefined) {
      toast.error("No vaults available for the selected card.");
      setLoading(false);
      return;
    }

    if (numTesters > vaultCounts?.[0]) {
      toast.error("Number of testers cannot be more than available vaults.");
      setLoading(false);
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const submitData = {
      ...shippingInfoData,
      cardDetails,
      testerDetails,
      addressDetails,
      cardType,
      numTesters,
      numPartners,
      shipTo,
    };

    try {
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        {
          submitData,
          column: "shipDetails",
          status: "submitted",
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Shipping information saved successfully");
        setTimeout(() => {
          toast.dismiss();
          setLoading(false);
          navigate(`/dashboard/request-history`);
        }, 1800);
      }
    } catch (error) {
      console.error("Error saving shipping info:", error);
      toast.error("An error occurred while saving the shipping information.");
      setLoading(false);
    }
  };

  return (
    <>
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
      <div className="container-fluid">
        <p className="blue-heading text-center">Shipping Details</p>
        <form onSubmit={handleSave} className="request-form">
          <div className="row mb-4 w-100 align-items-center">
            <span className="me-3 font col-4 text-right">Ship to</span>
            <div className="d-lg-flex formcard col-4">
              {["one", "multiple"].map((option) => (
                <div
                  key={option}
                  className="form-check me-3 d-flex gap-2 align-items-center justify-content-center d-flex flex-column align-items-center justify-content-center"
                >
                  <input
                    className="form-check-input"
                    type="radio"
                    name="shipTo"
                    value={option}
                    id={option}
                    checked={
                      terminalType === "Ecomm"
                        ? option === "mobile"
                        : shipTo === option
                    }
                    onChange={(e) => setShipTo(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={option}>
                    {option === "one" ? (
                      "One Address"
                    ) : option === "multiple" ? (
                      <>
                        Multiple Addresses (3) <br /> (Tester's Address in
                        profile)
                      </>
                    ) : (
                      "Mobile Card Only"
                    )}
                  </label>
                </div>
              ))}
            </div>

            <div className="col-3 d-flex align-items-center gap-3">
              <input
                name="requestorName"
                placeholder="0"
                type="text"
                className="form-control formcontrol custom-input-w-100"
                value=""
              />

              <span>Quantity</span>
            </div>
          </div>

          {shipTo === "one" && (
            <div className="d-flex flex-column align-items-center gap-3">
              <div className="row">
                <div className="col-6">
                  <label className="font">First Name</label>
                  <input
                    placeholder="First name"
                    type="text"
                    name="unit"
                    value={addressDetails[0]?.unit || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "unit", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>

                <div className="col-6">
                  <label className="font">Last Name</label>

                  <input
                    placeholder="Last name"
                    type="text"
                    name="unit"
                    value={addressDetails[0]?.unit || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "unit", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="font">Address</label>

                  <input
                    placeholder="Unit/Building and Street Name"
                    type="text"
                    name="unit"
                    value={addressDetails[0]?.unit || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "unit", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>

                <div className="col-6">
                  <label className="font">City</label>
                  <input
                    placeholder="City"
                    type="text"
                    name="unit"
                    value={addressDetails[0]?.unit || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "unit", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="font">State</label>
                  <input
                    placeholder="State"
                    type="text"
                    name="unit"
                    value={addressDetails[0]?.unit || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "unit", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>

                <div className="col-6">
                  <label className="font">Country</label>
                  <input
                    placeholder="Country"
                    type="text"
                    name="unit"
                    value={addressDetails[0]?.unit || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "unit", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>
              </div>

              <div className="">
                <label className="font">Zip Code</label>
                <input
                  placeholder="Zip Code"
                  type="text"
                  name="unit"
                  value={addressDetails[0]?.unit || ""}
                  disabled={
                    requestInfoData.status !== "draft" &&
                    requestInfoData.status !== "returned" &&
                    requestInfoData.status !== undefined
                  }
                  onChange={(e) =>
                    handleAddressChange(0, "unit", e.target.value)
                  }
                  className="form-control formcontrol"
                  required
                />
              </div>

              <div className="d-flex flex-column align-items-center gap-3 mt-5">
                <div className="row">
                  <div className="col-4">
                    <label className="font">Shipping Date</label>
                    <input
                      placeholder="Shipping Date"
                      type="date"
                      name="shipping_date"
                      className="form-control formcontrol mt-2 pe-1"
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="font">Tracking Number</label>
                    <input
                      placeholder="State"
                      type="text"
                      name="tracking_number"
                      value={""}
                      className="form-control formcontrol mt-2"
                      required
                    />
                  </div>
                  <div className="col-4 mt-2">
                    <button className="save-btn w-100 mt-4 border-0">
                      {loading ? "Saving..." : <div>Save</div>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {shipTo === "multiple" && (
            <div className="mt-4">
              <div className="row">
                {[1, 2, 3].map((id, index) => (
                  <div key={id} className="mt-1">
                    <div className="accordion" id="testerAccordion">
                      <div className="accordion-item">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse1"
                            aria-expanded="true"
                            aria-controls="collapse1"
                          >
                            <div className="d-flex align-items-center w-100">
                              <div className="check-circle me-2">
                                <i className="fas fa-check"></i>
                              </div>
                              <span className="tester-link">
                                Tester_{index + 1}
                              </span>
                              <div className="ms-4 flex-grow-1 row">
                                <div className="col-md-6">
                                  <span className="font">
                                    FirstName LastName
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        </h2>
                        <div
                          id="collapse1"
                          className="accordion-collapse collapse show"
                          data-bs-parent="#testerAccordion"
                        >
                          <div className="accordion-body">
                            <div className="w-100 me-5 pe-5 d-flex align-items-end justify-content-end">
                              <div className="d-flex flex-column">
                                <span className="font">Address</span>
                                <span>Full address here...</span>
                              </div>
                            </div>
                            <div className="row mt-5">
                              <div className="col-5 d-flex align-items-center gap-2">
                                <label className="font no-wrap">
                                  Shipping Date
                                </label>
                                <input
                                  placeholder="Shipping Date"
                                  type="date"
                                  name="shipping_date"
                                  className="form-control formcontrol mt-2 pe-1 max-60"
                                  required
                                />
                              </div>
                              <div className="col-5 d-flex align-items-center gap-2">
                                <label className="font no-wrap">
                                  Tracking Number
                                </label>
                                <input
                                  placeholder="Tracking NUmber"
                                  type="text"
                                  name="tracking_number"
                                  className="form-control formcontrol mt-2 pe-1 max-60"
                                  required
                                />
                              </div>
                              <div className="col-2">
                                <button className="save-btn w-100 mt-2">
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

export default ShippingCardV2;
