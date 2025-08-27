/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import axiosToken from "../../../utils/axiosToken";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";
import Multiselect from "multiselect-react-dropdown";
import { useNavigate } from "react-router-dom";
import apiService from "../../../services";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { dateToMMDDYYYY, toMMDDYYYY } from "../../maintain-card-stock/AddCard";
import { toYYYYMMDD } from "../../../utils/date";

export function mmddyyyyToDate(str) {
  if (!str || typeof str !== "string" || !str.includes("-")) return null;
  const [mm, dd, yyyy] = str.split("-");
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  return isNaN(date.getTime()) ? null : date;
}

export const countryCodes = [
  { label: "India (IND)", value: "IND" },
  { label: "USA (USA)", value: "USA" },
  { label: "UK (UK)", value: "UK" },
  { label: "Canada (CAN)", value: "CAN" },
  { label: "Australia (AUS)", value: "AUS" },
  { label: "Singapore (SGP)", value: "SGP" },
  { label: "Brazil (BRA)", value: "BRA" },
  { label: "Finland	(FIN)", value: "FIN" },
  { label: "France	(FRA)", value: "FRA" },
  { label: "Hong Kong	(HKG)", value: "HKG" },
  { label: "Japan	(JPN)", value: "JPN" },
  { label: "Mexico (MEX)", value: "MEX" },
  { label: "Puerto Rico (PRI)", value: "PRI" },
  { label: "Qatar (QAT)", value: "QAT" },
  { label: "Saudi Arabia (SAU)", value: "SAU" },
  { label: "South Africa (ZAF)", value: "ZAF" },
  { label: "Spain (ESP)", value: "ESP" },
  { label: "Sweden (SWE)", value: "SWE" },
  { label: "Switzerland (CHE)", value: "CHE" },
];

function TestInfo({
  requestInfoData,
  cardRequestId,
  terminalType,
  environment,
  handleSaveAndNext,
  fetchData,
  isCompleted,
  canEdit,
  isRequester,
  isSubmitted,
}) {
  const { userRole } = useAuth();
  const isTerminalDisabled = useMemo(
    () => environment == 3 || terminalType !== "Pos",
    [environment, terminalType]
  );
  const isApproved = useMemo(
    () => requestInfoData.status === "submitted",
    [requestInfoData.status]
  );

  const navigate = useNavigate();
  const [testInfoData, setTestInfoData] = useState({
    request_id: cardRequestId,
    environment: environment,
    terminalType: terminalType,
    testingObjective: "",
    startDate: "",
    endDate: "",
    individualTransactionLimit: "",
    totalTransactionLimit: "",
    mccCodesAll: true,
    allCountries: true,
    mccCodes: [],
    countryCodes: [],
    id: "",
    requestPriority: "Medium",
  });

  const [loading, setLoading] = useState(false);
  const [disableCountryCodes, setDisableCountryCodes] = useState(true);
  const [disableMccCodes, setDisableMccCodes] = useState(true);
  const [countryOptions, setCountryOptions] = useState([]);
  const [mccOptions, setMccOptions] = useState([]);

  useEffect(() => {
    if (requestInfoData?.testInfo) {
      const parsedTestInfo = JSON.parse(requestInfoData.testInfo);

      const selectedCountries = countryOptions.filter((option) =>
        parsedTestInfo.countries?.some((c) => c.country_id === option.id)
      );
      const selectedMccs = mccOptions.filter((option) =>
        parsedTestInfo.mccCodes?.some((c) => c.mcc_code_id === option.id)
      );

      setTestInfoData((prevData) => ({
        ...prevData,
        ...parsedTestInfo,
        startDate: toMMDDYYYY(parsedTestInfo.startDate),
        endDate: toMMDDYYYY(parsedTestInfo.endDate),
        countryCodes: selectedCountries,
        mccCodes: selectedMccs,
      }));
      setDisableCountryCodes(parsedTestInfo?.allCountries);
    }
  }, [countryOptions, mccOptions, requestInfoData]);

  useEffect(() => {
    const fetchOptions = async () => {
      const [countries, mccs] = await Promise.all([
        apiService.countries.get({ env: environment }),
        apiService.mccCode.get({ env: environment }),
      ]);

      setCountryOptions(countries?.data || []);
      setMccOptions(mccs?.data || []);
    };

    fetchOptions();

    if (requestInfoData?.testInfo) {
      const parsedTestInfo = JSON.parse(requestInfoData.testInfo);
      setTestInfoData((prev) => ({ ...prev, ...parsedTestInfo }));
      setDisableCountryCodes(parsedTestInfo?.allCountries);
      setDisableMccCodes(parsedTestInfo?.mccCodesAll);
    }
  }, [requestInfoData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestInfoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryCodesChange = (selected) => {
    if (selected.length > 5) {
      toast.info("You can only select up to 5 country codes.");
      return;
    }
    setTestInfoData((prev) => ({
      ...prev,
      countryCodes: selected,
    }));
  };

  const handleAllCountryCodesChange = (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setTestInfoData((prev) => ({
        ...prev,
        countryCodes: testInfoData.countryCodes,
      }));
    } else {
      setTestInfoData((prev) => ({
        ...prev,
        countryCodes: prev.countryCodes.filter(
          (country) =>
            !testInfoData.countryCodes.some(
              (code) => code.value === country.value
            )
        ),
      }));
    }

    setDisableCountryCodes(isChecked);
  };

  const validateForm = () => {
    if (!testInfoData.testingObjective.trim()) {
      toast.error("Please enter a testing objective.");
      return false;
    }

    if (!testInfoData.startDate) {
      toast.error("Please select a start date.");
      return false;
    }

    if (!testInfoData.endDate && environment !== "3") {
      toast.error("Please select an end date.");
      return false;
    }

    if (
      new Date(testInfoData.endDate) < new Date(testInfoData.startDate) &&
      environment !== "3"
    ) {
      toast.error("End date cannot be before the start date.");
      return false;
    }

    if (!testInfoData?.individualTransactionLimit && environment !== "3") {
      toast.error("Please enter an individual transaction limit.");
      return false;
    } else if (
      testInfoData.individualTransactionLimit &&
      +(testInfoData.individualTransactionLimit || 0) >
        +(testInfoData.totalTransactionLimit || 0)
    ) {
      toast.error(
        "Individual Transaction Limit can not be more then total Transaction limit"
      );
      return false;
    }

    if (
      isNaN(Number(testInfoData.individualTransactionLimit)) &&
      environment !== "3"
    ) {
      toast.error("Individual transaction limit must be a valid number.");
      return false;
    }

    if (!testInfoData.totalTransactionLimit && environment !== "3") {
      toast.error("Please enter a total transaction limit.");
      return false;
    }

    if (
      isNaN(Number(testInfoData.totalTransactionLimit)) &&
      environment !== "3"
    ) {
      toast.error("Total transaction limit must be a valid number.");
      return false;
    }
    if (testInfoData.mccCodes.length === 0 && disableMccCodes === false) {
      toast.error("Please select at least one MCC  code.");
      return false;
    }
    if (
      testInfoData.countryCodes.length === 0 &&
      disableCountryCodes === false
    ) {
      toast.error("Please select at least one country code.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e, goNext) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        submitData: {
          ...testInfoData,
          countryCodes: testInfoData.countryCodes.map((c) => c.id),
          mccCodes: testInfoData.mccCodes.map((m) => m.id),
          allCountries: disableCountryCodes,
          mccCodesAll: disableMccCodes,
          startDate: toYYYYMMDD(testInfoData.startDate),
          endDate: toYYYYMMDD(testInfoData.endDate),
        },
        column: "testInfo",
      };

      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setLoading(false);
        toast.success("Test information saved successfully");

        if (goNext) {
          handleSaveAndNext(isTerminalDisabled ? 4 : 3);
        } else {
          fetchData();
        }
      }
    } catch (error) {
      console.error("Error saving test info:", error);
      toast.error("An error occurred while saving the test information.");
      setLoading(false);
    }
  };

  const handleRequestPriorityChange = (e) => {
    const { value } = e.target;
    setTestInfoData((prev) => ({
      ...prev,
      requestPriority: value,
    }));
  };

  const handleNumberFieldChange = (e, fieldName) => {
    let value = e.target.value.replace(/[^0-9.]/g, "");

    if (value.includes(".")) {
      const [intPart, decPart] = value.split(".");
      value = intPart + "." + (decPart ? decPart.slice(0, 2) : "");
    }

    setTestInfoData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleMccCodeChange = (value) => {
    setTestInfoData((prev) => ({
      ...prev,
      mccCodes: value,
    }));
  };

  return (
    <div className="container-fluid">
      <p className="blue-heading text-center">Test Information</p>
      <form className="request-form">
        <div className="d-flex flex-column gap-3 w-80 m-auto">
          {/* Environment & Terminal Type (Display only) */}
          <div className="form-field-wrapper d-flex flex-column gap-3 ">
            <div className="w-100 row">
              <label className="me-3 col-4 text-right">Environment</label>
              <div className="d-lg-flex formcard col-7">
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="envProd"
                    value="Prod"
                    checked={environment == "1"}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="envProd">
                    Prod
                  </label>
                </div>
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="envQA"
                    value="QA"
                    checked={environment == "2"}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="envQA">
                    QA
                  </label>
                </div>
                <div className="form-check d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="envTest"
                    value="Test"
                    checked={environment == "3"}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="envTest">
                    Cert
                  </label>
                </div>
              </div>
            </div>
            <div className="w-100 row">
              <label className="me-3 col-4 text-right">Terminal Type</label>
              <div className="d-lg-flex formcard col-7">
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="terminalType"
                    id="terminalPos"
                    value="Pos"
                    checked={terminalType === "Pos"}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="terminalPos">
                    POS
                  </label>
                </div>
                <div className="form-check d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="terminalType"
                    id="terminalEcomm"
                    value="Ecomm"
                    checked={terminalType === "Ecomm"}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="terminalEcomm">
                    Ecomm
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Testing Objective */}
          <div className="form-field-wrapper d-flex flex-column">
            <div className="w-100 row align-items-center">
              <label className="col-4 form-check-label text-right">
                Testing Objective
              </label>
              <div className="col-6">
                <textarea
                  type="text"
                  name="testingObjective"
                  placeholder="Write short objective (200 Char max)"
                  className=" form-control formcontrol text-area"
                  value={testInfoData.testingObjective}
                  onChange={handleChange}
                  maxLength={200}
                  disabled={
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                />
              </div>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="form-field-wrapper d-flex flex-column">
            <div className="w-100 row align-items-center">
              <label className="col-4 form-check-label text-right">
                Start Date
              </label>
              <div className="col-7 row">
                <div className="col-4">
                  <DatePicker
                    selected={mmddyyyyToDate(testInfoData.startDate)}
                    onChange={(date) => {
                      const formatted = dateToMMDDYYYY(date);
                      setTestInfoData((prev) => ({
                        ...prev,
                        startDate: formatted,
                        endDate:
                          mmddyyyyToDate(prev.endDate) &&
                          mmddyyyyToDate(prev.endDate) < date
                            ? ""
                            : prev.endDate,
                      }));
                    }}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="form-control formcontrol"
                    disabled={
                      (requestInfoData.status !== "draft" &&
                        requestInfoData.status !== "returned" &&
                        requestInfoData.status !== undefined) ||
                      !isRequester ||
                      canEdit
                    }
                    minDate={new Date()}
                  />
                </div>

                <div className="col-6">
                  {environment != "3" && (
                    <div className="d-lg-flex align-items-center">
                      <label className="form-check-label flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                        End Date
                      </label>
                      <DatePicker
                        selected={mmddyyyyToDate(testInfoData.endDate)}
                        onChange={(date) => {
                          const formatted = dateToMMDDYYYY(date);
                          setTestInfoData((prev) => ({
                            ...prev,
                            endDate: formatted,
                          }));
                        }}
                        dateFormat="MM-dd-yyyy"
                        placeholderText="MM-DD-YYYY"
                        className="form-control formcontrol"
                        minDate={
                          mmddyyyyToDate(testInfoData.startDate) || new Date()
                        }
                        disabled={
                          (requestInfoData.status !== "draft" &&
                            requestInfoData.status !== "returned" &&
                            requestInfoData.status !== undefined) ||
                          !isRequester ||
                          canEdit
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Limits */}
          {/* Hide if environment is Test */}
          {environment != "3" && (
            <div className="form-field-wrapper d-flex flex-column">
              <div className="w-100 row mb-3 align-items-center">
                <label className="col-4 form-check-label text-right">
                  Individual Transaction Limit
                </label>
                <div className="col-2">
                  <input
                    type="text"
                    name="individualTransactionLimit"
                    placeholder="$10.00"
                    className="form-control formcontrol"
                    value={`${
                      testInfoData.individualTransactionLimit &&
                      `$${testInfoData.individualTransactionLimit}`
                    }`}
                    onChange={(e) =>
                      handleNumberFieldChange(e, "individualTransactionLimit")
                    }
                    disabled={
                      (requestInfoData.status != "draft" &&
                        requestInfoData.status != "returned" &&
                        requestInfoData.status != undefined) ||
                      !isRequester ||
                      canEdit
                    }
                  />
                </div>
              </div>
              <div className="w-100 row mb-3 align-items-center">
                <label className="col-4 form-check-label text-right">
                  Total Transaction Limit
                </label>
                <div className="col-2">
                  <input
                    type="text"
                    name="totalTransactionLimit"
                    placeholder="$100.00"
                    className="form-control formcontrol"
                    value={`${
                      testInfoData.totalTransactionLimit &&
                      `$${testInfoData.totalTransactionLimit}`
                    }`}
                    onChange={(e) =>
                      handleNumberFieldChange(e, "totalTransactionLimit")
                    }
                    disabled={
                      (requestInfoData.status != "draft" &&
                        requestInfoData.status != "returned" &&
                        requestInfoData.status != undefined) ||
                      !isRequester ||
                      canEdit
                    }
                  />
                </div>
              </div>

              {/* MCC Codes (only if terminalType is Pos) */}
              {testInfoData.terminalType === "Pos" && (
                <div className="form-field-wrapper d-flex flex-column align-items-center">
                  <div className="row w-100 align-items-center">
                    <span className="col-4 me-3 text-right">MCC Codes</span>
                    <div className="col-7 d-flex">
                      <div className="d-lg-flex formcard">
                        <div className="form-check me-4 d-flex gap-1 p-0 align-items-center">
                          <input
                            type="checkbox"
                            className="form-check-input custom-check-box"
                            name="mccCodesAll"
                            id="mccCodesAll"
                            checked={disableMccCodes}
                            onChange={(e) => {
                              setDisableMccCodes(e.target.checked);
                              if (e.target.checked) {
                                setTestInfoData({
                                  ...testInfoData,
                                  mccCodes: [],
                                });
                              }
                            }}
                            disabled={
                              (requestInfoData.status != "draft" &&
                                requestInfoData.status != "returned" &&
                                requestInfoData.status != undefined) ||
                              !isRequester ||
                              canEdit
                            }
                          />
                          <label
                            className="form-check-label ms-3"
                            htmlFor="mccCodesAll"
                          >
                            All
                          </label>
                        </div>
                      </div>
                      <div className="d-lg-flex gap-2">
                        <Multiselect
                          options={mccOptions}
                          selectedValues={
                            disableMccCodes ? [] : testInfoData.mccCodes
                          }
                          onSelect={handleMccCodeChange}
                          onRemove={handleMccCodeChange}
                          displayValue="mcc_code"
                          disable={
                            disableMccCodes ||
                            !isRequester ||
                            canEdit ||
                            isSubmitted
                          }
                          selectionLimit={5}
                          key={testInfoData.mccCodes}
                          placeholder={
                            disableMccCodes
                              ? "All codes selected"
                              : "Select Mcc Code"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row w-100 mt-3 align-items-center">
                    <span className="col-4 text-right">Country Codes</span>
                    <div className="ps-0 col-7 d-flex align-items-center">
                      <div className="d-lg-flex formcard">
                        <div className="form-check me-3 d-flex gap-2 align-items-center">
                          <input
                            type="checkbox"
                            className="form-check-input custom-check-box"
                            name="disableCountryCodes"
                            id="disableCountryCodes"
                            checked={disableCountryCodes}
                            onChange={handleAllCountryCodesChange}
                            disabled={!isRequester || canEdit || isSubmitted}
                          />
                          <label
                            className="form-check-label ms-3"
                            htmlFor="disableCountryCodes"
                          >
                            All
                          </label>
                        </div>
                      </div>
                      <div className="d-lg-flex gap-4 h-100 ">
                        <Multiselect
                          options={countryOptions}
                          selectedValues={
                            disableCountryCodes ? [] : testInfoData.countryCodes
                          }
                          onSelect={handleCountryCodesChange}
                          onRemove={handleCountryCodesChange}
                          displayValue="country_name"
                          disable={
                            disableCountryCodes ||
                            !isRequester ||
                            canEdit ||
                            isSubmitted
                          }
                          selectionLimit={5}
                          key={testInfoData.countryCodes}
                          placeholder={
                            disableCountryCodes
                              ? "All codes selected"
                              : "Select Country Code"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-100 row mb-3 align-items-center">
            <label className="col-4 form-check-label text-right">
              Request Priority
            </label>
            <div className="d-lg-flex formcard col-7">
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  id="high"
                  value="High"
                  checked={
                    (testInfoData?.requestPriority?.toLowerCase() || "") ===
                    "high"
                  }
                  disabled={
                    isApproved ||
                    isCompleted ||
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                  onChange={handleRequestPriorityChange}
                />
                <label className="form-check-label ms-2" htmlFor="high">
                  High
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  id="medium"
                  value="Medium"
                  disabled={
                    isApproved ||
                    isCompleted ||
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                  checked={
                    (testInfoData.requestPriority.toLowerCase() || "") ===
                    "medium"
                  }
                  onChange={handleRequestPriorityChange}
                />
                <label className="form-check-label ms-2" htmlFor="medium">
                  Medium (default)
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  id="low"
                  value="Low"
                  disabled={
                    isApproved ||
                    isCompleted ||
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                  checked={testInfoData.requestPriority.toLowerCase() === "low"}
                  onChange={handleRequestPriorityChange}
                />
                <label className="form-check-label ms-2" htmlFor="low">
                  Low
                </label>
              </div>
            </div>
          </div>

          <div className="btn-section col-12 d-flex justify-content-end me-5">
            {userRole == 2 &&
              (requestInfoData.status === "draft" ||
                requestInfoData.status == "returned" ||
                requestInfoData.status == undefined) && (
                <div className="button-group">
                  <button
                    type="button"
                    className="btn cancel-btn"
                    onClick={() => {
                      navigate("/dashboard/request-history");
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async (e) => {
                      try {
                        await handleSubmit(e, true);
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    type="button"
                    className="btn save-btn save-next-btn"
                    disabled={loading || canEdit}
                  >
                    <span>Save & Next</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    type="button"
                    disabled={loading || canEdit}
                    className="btn save-btn"
                  >
                    <span>Save</span>
                  </button>
                </div>
              )}
          </div>
        </div>
      </form>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

export default TestInfo;
