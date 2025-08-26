import React, { useState, useEffect, useRef } from "react";
import axiosToken from "../../../utils/axiosToken";
import { useNavigate } from "react-router-dom";

function ShippingCardCopy({
  requestInfoData,
  cardRequestId,
  terminalType,
  environment,
}) {
  const navigate = useNavigate();
  const [shippingInfoData, setShippingInfoData] = useState(
    requestInfoData?.shipDetails || {}
  );
  const [reqInfoData, setReqInfoData] = useState(
    requestInfoData?.reqInfo || {}
  );
  // Ref to track if initial data has been loaded
  const initialDataLoaded = useRef(false);
  const [hasFetched, setHasFetched] = useState(false);
  const prevCardDetailsRef = useRef([]);

  // Parse shipDetails if it exists in the response
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

  useEffect(() => {
    if (requestInfoData?.reqInfo) {
      try {
        const parsedReqInfo = JSON.parse(requestInfoData.reqInfo);
        setReqInfoData((prevData) => ({
          ...prevData,
          ...parsedReqInfo,
        }));
      } catch (error) {
        console.error("Error parsing reqInfo:", error);
      }
    }
  }, [requestInfoData]);

  // Fixed cardType and other state initializations
  const [cardType, setCardType] = useState(1);
  const [numTesters, setNumTesters] = useState(1);
  const [numPartners, setNumPartners] = useState(1);

  const [shipTo, setShipTo] = useState("one");
  const [issuerOptions, setIssuerOptions] = useState({});
  const [vaultCounts, setVaultCounts] = useState({});
  const [cardDetails, setCardDetails] = useState([]);
  const [testerDetails, setTesterDetails] = useState([]);
  const [addressDetails, setAddressDetails] = useState([
    { id: 1, unit: "", city: "", state: "", country: "" },
  ]);

  // Update state based on shippingInfoData on mount
  // Update state based on shippingInfoData on mount
  useEffect(() => {
    if (terminalType === "Ecomm") {
      setShipTo("mobile");
    } else if (shippingInfoData) {
      setShipTo(shippingInfoData.shipTo || "one"); // Adjust this line to ensure shipTo is set correctly
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
        // Mark that we've loaded initial data
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

  // Initialize cardDetails if not provided
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

  // Update vault field in cardDetails only if it has changed
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

  // Update tester details based on number of testers
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

  // Update address inputs based on shipping option and number of testers
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
          { id: 1, unit: "", city: "", state: "", country: "" },
        ]);
      }
    }
  }, [shipTo, numTesters, addressDetails]);

  // API call function to fetch issuers and update vaultCounts
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
        requestInfoData.status == "draft" ||
        requestInfoData.status == undefined ||
        requestInfoData.status == "submitted" ||
        requestInfoData.status == "approved" ||
        requestInfoData.status == "returned"
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

  // Fetch issuers whenever cardDetails changes with complete info
  useEffect(() => {
    if (cardDetails.length > 0 && !hasFetched) {
      const shouldFetch = cardDetails.some((card, index) => {
        // Only fetch issuers if we have the necessary data
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
              card.issuer,
              environment,
              terminalType
            );
          }
        });
        setHasFetched(true); // Set the flag to true after fetching
      }
    }

    // Update the ref with the current cardDetails
    prevCardDetailsRef.current = cardDetails;
  }, [cardDetails, environment, terminalType, hasFetched]);

  // Handle changes in card details and fetch issuers if key fields change
  const handleCardChange = (index, field, value) => {
    // Create a current card object with updated field value
    const currentCard = { ...cardDetails[index] };
    currentCard[field] = value;

    // Update state
    setCardDetails((prevCards) => {
      const updatedCards = [...prevCards];
      updatedCards[index] = currentCard;
      return updatedCards;
    });

    // Use the current updated values for API call, not from state
    // This ensures the API gets the latest selected value
    fetchIssuers(
      index,
      field === "specialFeature" ? value : currentCard.specialFeature,
      field === "product" ? value : currentCard.product,
      field === "domesticGlobal" ? value : currentCard.domesticGlobal,
      field === "issuer" ? value : currentCard.issuer,
      environment,
      terminalType
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
        state: "",
        country: "",
      };
    }
    updatedAddresses[index][field] = value;
    setAddressDetails(updatedAddresses);
  };

  const validateForm = () => {
    if (cardDetails.length === 0) {
      alert("At least one card is required.");
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
          alert("Please fill all required fields in the card details.");
          return false;
        }
      }
    } else {
      for (const card of cardDetails) {
        if (!card.product || !card.issuer) {
          alert("Please fill all required fields in the card details.");
          return false;
        }
      }
    }
    // if (
    //   shipTo != "mobile" &&
    //   addressDetails.some(
    //     (addr) => !addr.unit || !addr.city || !addr.state || !addr.country
    //   )
    // ) {
    //   alert("Please complete all address fields.");
    //   return false;
    // }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // check status using api
    // Declare parsedReqInfo outside the try block to make it accessible in the full function scope
    let parsedReqInfo = null;

    // Check status using API
    try {
      const response = await axiosToken.get(
        `/card-requests/${requestInfoData.id}`
      );
      const reqData = response.data.reqInfo;
      parsedReqInfo = JSON.parse(reqData);
    } catch (error) {
      console.error("Error checking request status:", error);
      alert("Error checking request status. Please try again.");
      return;
    }

    // Check if parsedReqInfo was successfully retrieved and parsed
    if (!parsedReqInfo) {
      alert("Request information not found.");
      return;
    }

   

    if (vaultCounts?.[0] === 0 || vaultCounts?.[0] === undefined) {
      alert("No vaults available for the selected card.");
      return;
    }

    // tester cannot be more then vaults
    if (numTesters > vaultCounts?.[0]) {
      alert("Number of testers cannot be more than available vaults.");
      return;
    }

    if (!validateForm()) return;

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
        alert("Shipping information saved successfully");
        navigate(`/dashboard/request-history`);
      }
    } catch (error) {
      console.error("Error saving shipping info:", error);
      alert("An error occurred while saving the shipping information.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // check status using api
    // Declare parsedReqInfo outside the try block to make it accessible in the full function scope
    let parsedReqInfo = null;

    // Check status using API
    try {
      const response = await axiosToken.get(
        `/card-requests/${requestInfoData.id}`
      );
      const reqData = response.data.reqInfo;
      parsedReqInfo = JSON.parse(reqData);
    } catch (error) {
      console.error("Error checking request status:", error);
      alert("Error checking request status. Please try again.");
      return;
    }

    // Check if parsedReqInfo was successfully retrieved and parsed
    if (!parsedReqInfo) {
      alert("Request information not found.");
      return;
    }

    // Check if the request is in the correct state
    // If you want to ensure it's in approved state (not draft):
    if (parsedReqInfo.status !== "approved") {
      alert("Request is not in approved state.");
      return;
    }

    if (vaultCounts?.[0] == 0 || vaultCounts?.[0] == undefined) {
      alert("No vaults available for the selected card.");
      return;
    }

    // tester cannot be more then vaults
    if (numTesters > vaultCounts?.[0]) {
      alert("Number of testers cannot be more than available vaults.");
      return;
    }
    if (!validateForm()) return;

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
        alert("Shipping information saved successfully");
        navigate(`/dashboard/request-history`);
      }
    } catch (error) {
      console.error("Error saving shipping info:", error);
      alert("An error occurred while saving the shipping information.");
    }
  };

  return (
    <div className="container-fluid">
      <form>
        {/* Removed the Types of Card section so only a single card is available */}
        {/* <div className="login-page mb-lg-4 mb-2 row justify-content-between">
          <div className="col-12 col-lg-3">
            <div className="d-lg-flex align-items-center">
              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3">
                Number of Tester/s{" "}
              </label>
              <select
                className="form-control formcontrol"
                value={numTesters}
                disabled={
                  requestInfoData.status !== "draft" &&
                  requestInfoData.status !== "returned" &&
                  requestInfoData.status !== undefined
                }
                name="numTesters"
                onChange={(e) => setNumTesters(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div> */}

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-theme theme_noti">
              <tr>
                {(terminalType === "pos" || terminalType === "Pos") && (
                  <th scope="col">Special Feature</th>
                )}
                <th scope="col">Product</th>
                {(terminalType === "pos" || terminalType === "Pos") && (
                  <th scope="col">Domestic/Global</th>
                )}
                <th scope="col">Issuer</th>
                {/* <th scope="col">Quantity</th> */}
                <th scope="col">Available Cards</th>
                <th scope="col">Number of Tester</th>
              </tr>
            </thead>
            <tbody>
              {cardDetails.map((card, index) => (
                <tr key={card.id}>
                  {(terminalType === "pos" || terminalType === "Pos") && (
                    <td>
                      <select
                        className="form-control formcontrol"
                        value={card.specialFeature}
                        disabled={
                          requestInfoData.status !== "draft" &&
                          requestInfoData.status !== "returned" &&
                          requestInfoData.status !== undefined
                        }
                        onChange={(e) =>
                          handleCardChange(
                            index,
                            "specialFeature",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        <option value="transit">Transit</option>
                        <option value="online_pin">Online pin</option>
                        <option value="transit_online_pin">
                          Transit online pin
                        </option>
                        <option value="generic">Generic</option>
                      </select>
                    </td>
                  )}
                  <td>
                    <select
                      className="form-control formcontrol"
                      value={card.product}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined
                      }
                      name="product"
                      id="product"
                      onChange={(e) =>
                        handleCardChange(index, "product", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </td>
                  {(terminalType === "pos" || terminalType === "Pos") && (
                    <td>
                      <select
                        className="form-control formcontrol"
                        value={card.domesticGlobal}
                        disabled={
                          requestInfoData.status !== "draft" &&
                          requestInfoData.status !== "returned" &&
                          requestInfoData.status !== undefined
                        }
                        onChange={(e) =>
                          handleCardChange(
                            index,
                            "domesticGlobal",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        <option value="Domestic">Domestic</option>
                        <option value="Global">Global</option>
                      </select>
                    </td>
                  )}
                  <td>
                    <select
                      className="form-control formcontrol"
                      value={card.issuer || ""}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined
                      }
                      onChange={(e) =>
                        handleCardChange(index, "issuer", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {issuerOptions[index] &&
                      issuerOptions[index].length > 0 ? (
                        // Filter unique issuers by ID
                        [
                          ...new Map(
                            issuerOptions[index].map((item) => [item.id, item])
                          ).values(),
                        ].map((issuer) => (
                          <option
                            key={`${issuer.id}-${issuer.name}`}
                            value={issuer.id}
                          >
                            {issuer.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No Issuers Available
                        </option>
                      )}
                    </select>
                  </td>
                 
                  <td>{card.vault}</td>
                  <td>
                    <select
                      className="form-control formcontrol"
                      value={numTesters}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined
                      }
                      name="numTesters"
                      onChange={(e) => setNumTesters(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-lg-4 mb-4 w-100">
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
                      checked={
                        terminalType === "Ecomm"
                          ? option === "mobile"
                          : shipTo === option
                      }
                      disabled={
                        (terminalType === "Ecomm" && option !== "mobile") ||
                        (requestInfoData.status !== "draft" &&
                          requestInfoData.status !== "returned" &&
                          requestInfoData.status !== undefined)
                      }
                      onChange={(e) => setShipTo(e.target.value)}
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

        {/* One Address Section */}
        {terminalType == "Pos" && shipTo == "one" && (
          <div className="login-page mb-lg-4 mb-2 bg-light p-3">
            <div className="col-12 col-lg-12 pe-lg-0">
              <div className="d-lg-flex justify-content-start flexform gap-5 flexshrinks">
                <div className="d-lg-flex align-items-center w-100">
                  <label className="form-check-label fw-bold mb-0 me-3">
                    One Address
                  </label>
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
                  />
                </div>
                <div className="d-lg-flex align-items-center">
                  <input
                    placeholder="city"
                    type="text"
                    name="city"
                    value={addressDetails[0]?.city || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "city", e.target.value)
                    }
                    className="form-control formcontrol"
                  />
                </div>
                <div className="d-lg-flex align-items-center">
                  <input
                    placeholder="State"
                    type="text"
                    name="state"
                    value={addressDetails[0]?.state || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "state", e.target.value)
                    }
                    className="form-control formcontrol"
                  />
                </div>
                <div className="d-lg-flex align-items-center">
                  <input
                    placeholder="Country"
                    type="text"
                    name="country"
                    value={addressDetails[0]?.country || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "country", e.target.value)
                    }
                    className="form-control formcontrol"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testers and Multiple Address Section */}
        {testerDetails.map((tester, index) => (
          <div key={tester.id} className="login-page mb-lg-4 mb-2 bg-light p-3">
            {/* Tester Information */}
            <div className="col-12 col-lg-12 mb-3">
              <div className="d-lg-flex justify-content-start flexform gap-5">
                <div className="d-lg-flex align-items-center w-100">
                  <label className="form-check-label fw-bold mb-0 me-3">
                    Tester Name {tester.id}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    className="form-control formcontrol"
                    value={tester.name || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleTesterChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="d-lg-flex align-items-center w-100">
                  <label className="form-check-label fw-bold mb-0 me-3">
                    Email:
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="form-control formcontrol"
                    value={tester.email || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleTesterChange(index, "email", e.target.value)
                    }
                  />
                </div>
                <div className="d-lg-flex align-items-center w-100">
                  <label className="form-check-label fw-bold mb-0 me-3">
                    Card #
                  </label>
                  <select
                    className="form-control formcontrol w-auto"
                    value={tester.card || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== "returned" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleTesterChange(index, "card", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {cardDetails.map((card) => (
                      <option key={card.id} value={card.id}>
                        Card {card.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Multiple Address Section - Render for each tester when in multiple mode */}
            {shipTo === "multiple" && (
              <div className="col-12 col-lg-12 pe-lg-0 mt-2">
                <div className="d-lg-flex justify-content-start flexform gap-5 flexshrinks">
                  <div className="d-lg-flex align-items-center">
                    <label className="form-check-label fw-bold mb-0 me-3">
                      Address {index + 1}
                    </label>
                    <input
                      placeholder="Unit/Building and Street Name"
                      type="text"
                      name="unit"
                      value={addressDetails[index]?.unit || ""}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined
                      }
                      onChange={(e) =>
                        handleAddressChange(index, "unit", e.target.value)
                      }
                      className="form-control formcontrol"
                    />
                  </div>
                  <div className="d-lg-flex align-items-center">
                    <input
                      placeholder="City"
                      type="text"
                      name="city"
                      value={addressDetails[index]?.city || ""}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined
                      }
                      onChange={(e) =>
                        handleAddressChange(index, "city", e.target.value)
                      }
                      className="form-control formcontrol"
                    />
                  </div>
                  <div className="d-lg-flex align-items-center">
                    <input
                      placeholder="State"
                      type="text"
                      name="state"
                      value={addressDetails[index]?.state || ""}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined
                      }
                      onChange={(e) =>
                        handleAddressChange(index, "state", e.target.value)
                      }
                      className="form-control formcontrol"
                    />
                  </div>
                  <div className="d-lg-flex align-items-center">
                    <input
                      placeholder="Country"
                      type="text"
                      name="country"
                      value={addressDetails[index]?.country || ""}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined
                      }
                      onChange={(e) =>
                        handleAddressChange(index, "country", e.target.value)
                      }
                      className="form-control formcontrol"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="btn-section col-12 d-flex justify-content-end">
          {(requestInfoData.status === "draft" ||
            requestInfoData.status === "returned" ||
            requestInfoData.status === undefined) && (
            <>
              <a
                className="btn-add d-flex align-items-center colorgreen gap-1 me-3"
                style={{ cursor: "pointer" }}
                onClick={handleSave}
              >
                Save
              </a>
              <a
                className="btn-add d-flex align-items-center gap-1"
                style={{ cursor: "pointer" }}
                onClick={handleSubmit}
              >
                Submit
              </a>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default ShippingCardCopy;
