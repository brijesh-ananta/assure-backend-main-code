import React, { useState, useEffect, useRef } from "react";
import axiosToken from "../../../utils/axiosToken";
import { useNavigate } from "react-router-dom";

function ShippingCardTestEnv({
  requestInfoData,
  cardRequestId,
  terminalType = "Pos",
  environment = "3",
}) {
  const navigate = useNavigate();
  const [shippingInfoData, setShippingInfoData] = useState(
    requestInfoData?.shipDetails || {}
  );
  const [reqInfoData, setReqInfoData] = useState(
    requestInfoData?.reqInfo || {}
  );
  const initialDataLoaded = useRef(false);
  const [hasFetched, setHasFetched] = useState(false);

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

  // State initializations
  const [cardType, setCardType] = useState(1);
  const [numTesters, setNumTesters] = useState(1);
  const [numPartners, setNumPartners] = useState(1);
  const [shipTo, setShipTo] = useState("one");
  const [issuerOptions, setIssuerOptions] = useState([]);
  const [vaultCount, setVaultCount] = useState(0);
  const [cardDetails, setCardDetails] = useState({
    bundleName: "",
    vault: "0",
  });
  const [testerDetails, setTesterDetails] = useState([]);
  const [addressDetails, setAddressDetails] = useState([
    { id: 1, unit: "", city: "", state: "", country: "" },
  ]);

  // Log props for debugging

  // Update state based on shippingInfoData on mount
  useEffect(() => {
    if (terminalType === "Ecomm") {
      setShipTo("mobile");
    }

    if (shippingInfoData) {
      setCardType(shippingInfoData.cardType || 1);
      setNumTesters(shippingInfoData.numTesters || 1);
      setNumPartners(shippingInfoData.numPartners || 1);
      setShipTo(shippingInfoData.shipTo);

      if (
        shippingInfoData.cardDetails &&
        shippingInfoData.cardDetails.length > 0
      ) {
        setCardDetails({
          bundleName: shippingInfoData.cardDetails[0]?.bundleName || "",
          vault: shippingInfoData.cardDetails[0]?.vault || "0",
        });
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
      !cardDetails.bundleName
    ) {
      setCardDetails({
        bundleName: "",
        vault: vaultCount !== undefined ? vaultCount.toString() : "0",
      });
    }
  }, [shippingInfoData.cardDetails, cardDetails.bundleName, vaultCount]);

  // Update vault field in cardDetails when vaultCount changes
  useEffect(() => {
    setCardDetails((prev) => ({
      ...prev,
      vault: vaultCount !== undefined ? vaultCount.toString() : "0",
    }));
  }, [vaultCount]);

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

  // API call function to fetch issuers and update vaultCount
  const fetchIssuers = async (bundleName = "") => {
    if (!environment || !terminalType) {
      return;
    }
    try {
      let status;
      if (
        requestInfoData.status === "draft" ||
        requestInfoData.status === undefined ||
        requestInfoData.status === "submitted" ||
        requestInfoData.status === "approved" ||
        requestInfoData.status === "return"
      ) {
        status = "active";
      } else {
        status = "assigned";
      }

      const response = await axiosToken.get(`/test-card-bundles/available`);
      const bundles = response.data;

      // Update issuer options
      setIssuerOptions(bundles);

      // Update vault count if a bundleName is provided
      if (bundleName) {
        const selectedBundle = bundles.find(
          (bundle) => bundle.bundleName === bundleName
        );
        if (selectedBundle) {
          const vaultCount =
            selectedBundle.total -
            (selectedBundle.assigned !== null ? selectedBundle.assigned : 0);
          setVaultCount(vaultCount);
        } else {
          setVaultCount(0);
        }
      }
    } catch (error) {
      console.error("Error fetching issuers:", error);
      setIssuerOptions([]);
      setVaultCount(0);
    }
  };

  // Fetch issuers on mount and when bundleName changes
  useEffect(() => {
    fetchIssuers(cardDetails.bundleName);
    if (!hasFetched) {
      setHasFetched(true);
    }
  }, [cardDetails.bundleName, hasFetched]);

  // Handle changes in card details
  const handleCardChange = (field, value) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "bundleName") {
      fetchIssuers(value);
    }
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
    if (!cardDetails.bundleName) {
      alert("Please select a card bundle.");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    let parsedReqInfo = null;
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

    if (!parsedReqInfo) {
      alert("Request information not found.");
      return;
    }

    if (vaultCount === 0 || vaultCount === undefined) {
      alert("No vaults available for the selected card.");
      return;
    }

    if (numTesters > vaultCount) {
      alert("Number of testers cannot be more than available vaults.");
      return;
    }

    if (!validateForm()) return;

    const submitData = {
      ...shippingInfoData,
      cardDetails: [cardDetails],
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

    let parsedReqInfo = null;
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

    if (!parsedReqInfo) {
      alert("Request information not found.");
      return;
    }

    if (parsedReqInfo.status !== "approved") {
      alert("Request is not in approved state.");
      return;
    }

    if (vaultCount === 0 || vaultCount === undefined) {
      alert("No vaults available for the selected card.");
      return;
    }

    if (numTesters > vaultCount) {
      alert("Number of testers cannot be more than available vaults.");
      return;
    }

    if (!validateForm()) return;

    const submitData = {
      ...shippingInfoData,
      cardDetails: [cardDetails],
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
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-theme theme_noti">
              <tr>
                <th scope="col">Product Bundle</th>
                <th scope="col">Bundles Available</th>
                <th scope="col">Number of Testers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <select
                    className="form-control formcontrol"
                    value={cardDetails.bundleName}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleCardChange("bundleName", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {issuerOptions.map((bundle) => (
                      <option key={bundle.id} value={bundle.bundleName}>
                        {bundle.bundleName}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{cardDetails.vault}</td>
                <td>
                  <select
                    className="form-control formcontrol"
                    value={numTesters}
                    disabled={
                      requestInfoData.status !== "draft" &&
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
        {terminalType === "Pos" && shipTo === "one" && (
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
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "city", e.target.value)
                    }
                    className="form-control formcontrol"
                  />
                </div>
                {/* zipcode */}
                <div className="d-lg-flex align-items-center">
                  <input
                    placeholder="Postal Code"
                    type="text"
                    name="postalCode"
                    value={addressDetails[0]?.postalCode || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleAddressChange(0, "postalCode", e.target.value)
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
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleTesterChange(index, "email", e.target.value)
                    }
                  />
                </div>
                {/* <div className="d-lg-flex align-items-center w-100">
                  <label className="form-check-label fw-bold mb-0 me-3">
                    Card #
                  </label>
                  <select
                    className="form-control formcontrol w-auto"
                    value={tester.card || ""}
                    disabled={
                      requestInfoData.status !== "draft" &&
                      requestInfoData.status !== undefined
                    }
                    onChange={(e) =>
                      handleTesterChange(index, "card", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="1">Card 1</option>
                  </select>
                </div> */}
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
                        requestInfoData.status !== undefined
                      }
                      onChange={(e) =>
                        handleAddressChange(index, "city", e.target.value)
                      }
                      className="form-control formcontrol"
                    />
                  </div>
                  {/* zipcode */}
                  <div className="d-lg-flex align-items-center">
                    <input
                      placeholder="Postal Code"
                      type="text"
                      name="postalCode"
                      value={addressDetails[index]?.postalCode || ""}
                      disabled={
                        requestInfoData.status !== "draft" &&
                        requestInfoData.status !== undefined
                      }
                      onChange={(e) =>
                        handleAddressChange(index, "postalCode", e.target.value)
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
          {requestInfoData.status === "draft" && (
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

export default ShippingCardTestEnv;
