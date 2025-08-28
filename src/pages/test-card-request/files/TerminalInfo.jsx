/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axiosToken from "../../../utils/axiosToken";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";
import { useNavigate } from "react-router-dom";

function TerminalInfo({
  canEdit,
  requestInfoData,
  handleSaveAndNext,
  fetchData,
  isRequester,
}) {
  const [terminalInfoData, setTerminalInfoData] = useState(
    requestInfoData?.termInfo || {}
  );
  const [testcaseData, settestCaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requestInfoData?.termInfo) {
      const parsedTermInfo =
        JSON.parse(requestInfoData?.termInfo || "{}") || "";

      setTerminalInfoData((prevData) => ({
        ...prevData,
        ...parsedTermInfo,
      }));
      fetchTestCaseData(parsedTermInfo);
    }
  }, [requestInfoData]);

  const fetchTestCaseData = async (datainfo = terminalInfoData) => {
    setLoading(true);

    const flattenedData = {
      terminalType: datainfo.terminalType,
      testingScope: datainfo.testingScope,
      paymentTechnology: datainfo.paymentTechnology,
      pinEntryCapability: datainfo.pinEntryCapability,
      // routesToDebitNet: datainfo.routesToDebitNet,
      cashbackPIN: datainfo.cashbackPIN,
      status: "active",
    };
    try {
      const response = await axiosToken.get(
        `/test-cases/filter/terminal?terminalType=${flattenedData.terminalType}&testingScope=${flattenedData.testingScope}&pinEntryCapability=${flattenedData.pinEntryCapability}&paymentTechnology=${flattenedData.paymentTechnology}&cashbackPIN=${flattenedData.cashbackPIN}&status=active`
      );

      if (response.status == 200) {
        settestCaseData(response?.data?.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Testcase info:", error);
      toast.error("An error occurred while fetch testcase data");
      setLoading(false);
    }
  };

  console.log("terminal data----->", terminalInfoData);
  const handleSubmit = async (e, goNext = false) => {
    if (!validateForm()) return;
    setLoading(true);
    e.preventDefault();

    const flattenedData = {
      terminalType: terminalInfoData.terminalType,
      testingScope: terminalInfoData.testingScope,
      paymentTechnology: terminalInfoData.paymentTechnology,
      pinEntryCapability: terminalInfoData.pinEntryCapability,
      // routesToDebitNet: terminalInfoData.routesToDebitNet,
      cashbackPIN: terminalInfoData.cashbackPIN,
    };

    try {
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        {
          submitData: flattenedData,
          column: "termInfo",
        }
      );

      if (response.status === 200 || response.status === 201) {
        setLoading(false);
        toast.success("Terminal information saved successfully");

        if (goNext) {
          handleSaveAndNext(4);
        } else {
          await fetchData();
        }
      }
    } catch (error) {
      console.error("Error saving terminal info:", error);
      toast.error("An error occurred while saving the terminal information.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const updatedData = {
      ...terminalInfoData,
      [e.target.name]: e.target.value,
    };
    setTerminalInfoData(updatedData);
    fetchTestCaseData(updatedData);
  };

  const validateForm = () => {
    if (!terminalInfoData.terminalType) {
      toast.error("Please select a Terminal Type.");
      return false;
    }
    if (!terminalInfoData.testingScope) {
      toast.error("Please select a Testing Scope.");
      return false;
    }

    if (!terminalInfoData.paymentTechnology) {
      toast.error("Please select a Payment Technology.");
      return false;
    }
    if (!terminalInfoData.pinEntryCapability) {
      toast.error("Please select PIN Entry Capability.");
      return false;
    }

    if (!terminalInfoData.cashbackPIN) {
      toast.error("Please select Cashback PIN.");
      return false;
    }

    return true; // If all validations pass
  };
  console.log(testcaseData);

  const isContactOnlyTerminal = (type) => {
    const restrictedTypes = ["Transit", "TOM/SoftPOS"];
    return restrictedTypes.includes(type);
  };

  const handleTestingScopeChange = (scope, checked) => {
    const isRestricted = isContactOnlyTerminal(terminalInfoData.terminalType);
    if (isRestricted && scope === "Contact") return;

    let current = terminalInfoData.testingScope;

    // Normalize to array
    let currentArray = [];
    if (current === "Both") {
      currentArray = ["Contact", "Contactless"];
    } else if (typeof current === "string" && current !== "") {
      currentArray = [current];
    }

    // Update selection
    let updatedArray = checked
      ? [...new Set([...currentArray, scope])]
      : currentArray.filter((item) => item !== scope);

    let newValue = "";
    if (
      updatedArray.includes("Contact") &&
      updatedArray.includes("Contactless")
    ) {
      newValue = "Both";
    } else if (updatedArray.length === 1) {
      newValue = updatedArray[0];
    }
    // If updatedArray is empty, newValue remains empty string

    const updatedData = {
      ...terminalInfoData,
      testingScope: newValue,
    };

    setTerminalInfoData(updatedData);
    // fetchTestCaseData(updatedData);
  };

  return (
    <div className="container-fluid">
      <p className="blue-heading text-center">Terminal Details</p>
      <form className="request-form">
        <div className="form-field-wrapper w-100 row">
          <span className="col-4 text-right me-lg-0 mb-lg-3 flex-shrink-0">
            Terminal Type
          </span>

          <div className="d-lg-flex col-7 formcard gap-5">
            {[
              "Transit",
              "AFD",
              "ATM",
              "Attended POS",
              "TOM/SoftPOS",
              "Unattended POS",
            ]?.map((type) => (
              <div
                key={type}
                className="form-check d-flex align-items-center flex-column p-0"
              >
                <input
                  className="form-check-input ms-0 me-0 mb-2"
                  type="radio"
                  name="terminalType"
                  value={type}
                  checked={terminalInfoData.terminalType === type}
                  onChange={handleChange}
                  disabled={
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                />
                <label className="form-check-label">{type}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-field-wrapper w-100 row mt-4">
          <span className="col-4 text-right me-lg-0 mb-lg-3  flex-shrink-0">
            Testing Scope
          </span>

          <div className="row formcard col-7 ps-3 ms-1">
            {["Contact", "Contactless"].map((scope) => {
              const isRestricted = isContactOnlyTerminal(
                terminalInfoData.terminalType
              );
              const isDisabledScope =
                (scope === "Contact" && isRestricted) ||
                (requestInfoData.status !== "draft" &&
                  requestInfoData.status !== "returned" &&
                  requestInfoData.status !== undefined) ||
                !isRequester ||
                canEdit;

              return (
                <div key={scope} className="form-check col-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="testingScope"
                    value={scope}
                    checked={
                      terminalInfoData.testingScope === scope ||
                      terminalInfoData.testingScope === "Both"
                    }
                    onChange={(e) =>
                      handleTestingScopeChange(scope, e.target.checked)
                    }
                    disabled={isDisabledScope}
                  />
                  <label className="form-check-label ms-3">{scope}</label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-field-wrapper w-100 row mt-4">
          <span className="col-4 text-right me-lg-0 mb-lg-3  flex-shrink-0">
            Payment Technology
          </span>

          <div className="row formcard col-7 ps-3 ms-1">
            {["DPAS 1.0", "DPAS Connect"].map((spec) => (
              <div key={spec} className="form-check col-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentTechnology"
                  value={spec}
                  checked={terminalInfoData.paymentTechnology === spec}
                  onChange={handleChange}
                  disabled={
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                />
                <label className="form-check-label ms-3">{spec}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-field-wrapper w-100 row mt-4">
          <span className="col-4 text-right me-lg-0 mb-lg-3  flex-shrink-0">
            PIN Entry Capability
          </span>

          <div className="row formcard col-7 ps-3 ms-1">
            {["Yes", "No"].map((option) => (
              <div key={option} className="form-check col-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="pinEntryCapability"
                  value={option}
                  checked={terminalInfoData.pinEntryCapability === option}
                  onChange={handleChange}
                  disabled={
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                />
                <label className="form-check-label ms-3">{option}</label>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="form-field-wrapper w-100 row mt-4">
          <span className="col-4 text-right me-lg-0 mb-lg-3  flex-shrink-0">
            Routes XX-D to Debit Net
          </span>

          <div className="row formcard col-7 ps-3 ms-1">
            {["Net1", "Other"].map((route) => (
              <div key={route} className="form-check col-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="routesToDebitNet"
                  value={route}
                  checked={terminalInfoData.routesToDebitNet === route}
                  onChange={handleChange}
                  disabled={
                    requestInfoData.status != "draft" &&
                    requestInfoData.status != "returned" &&
                    requestInfoData.status != undefined || !isRequester || canEdit
                  }
                />
                <label className="form-check-label ms-3">{route}</label>
              </div>
            ))}
          </div>
        </div> */}

        <div className="form-field-wrapper w-100 row mt-4">
          <span className="col-4 text-right me-lg-0 mb-lg-3  flex-shrink-0">
            Cashback PIN
          </span>

          <div className="row formcard col-7 ps-3 ms-1">
            {["Yes", "No"].map((option) => (
              <div key={option} className="form-check col-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="cashbackPIN"
                  value={option}
                  checked={terminalInfoData.cashbackPIN === option}
                  onChange={handleChange}
                  disabled={
                    (requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined) ||
                    !isRequester ||
                    canEdit
                  }
                />
                <label className="form-check-label ms-3">{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="btn-section col-12 d-flex justify-content-end">
          {userRole == 2 &&
            (requestInfoData.status === "draft" ||
              requestInfoData.status == "returned" ||
              requestInfoData.status == undefined) && (
              <div className="button-group me-5">
                <button
                  type="button"
                  className="btn cancel-btn"
                  onClick={() => navigate("/dashboard/request-history")}
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
                  className="btn save-btn"
                  disabled={canEdit}
                >
                  <span>Save</span>
                </button>
              </div>
            )}
        </div>

        {testcaseData?.length > 0 ? (
          <>
            <div className="container-fluid d-flex justify-content-center ">
              <div
                className="w-100 accordion border-2"
                style={{ maxWidth: "1000px" }}
              >
                <div className="accordion-item border-0">
                  <h2 className="accordion-header" id="headingTestCases">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapseTestCases`}
                      aria-expanded="false"
                      aria-controls={`collapseTestCases`}
                    >
                      <div className="check-circle me-2">
                        <i className="fas fa-check"></i>
                      </div>
                      <span className="text-primary text-decoration-underline">
                        Application Test Cases
                      </span>
                    </button>
                  </h2>

                  <div
                    id="collapseTestCases"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingTestCases"
                    data-bs-parent="#testerAccordion"
                  >
                    <div className="accordion-body p-0 ms-5">
                      <div className="row mb-3">
                        <div className="col-2 text-center">
                          <strong>Test ID</strong>
                        </div>
                        <div className="col-10">
                          <strong>Description</strong>
                        </div>
                      </div>

                      {testcaseData?.map((testcase, index) => (
                        <div key={index} className="row mb-3 align-items-start">
                          <div className="col-2 text-center">
                            <span className="text-primary text-decoration-underline">
                              {testcase?.test_cases_unique_id}
                            </span>
                          </div>
                          <div className="col-10">
                            <div
                              className="border rounded p-3"
                              style={{ width: "400px" }}
                            >
                              <div className="text-dark">
                                {testcase?.short_description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </form>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

export default TerminalInfo;
