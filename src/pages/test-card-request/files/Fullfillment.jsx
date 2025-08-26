import React, { useState, useEffect } from "react";
import axiosToken from "../../../utils/axiosToken";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";

function Fullfillment({
  requestInfoData,
  handleAccordionExpand,
  handleCardAssignmentAvailability,
  cardRequestId,
  terminalType,
  environment,
  snStatusVerify,
  updateStatus,
}) {
  const navigate = useNavigate();
  const [fulfilmentData, setFulfilmentData] = useState({
    tcsmeComments: "",
    status: "",
    snStatusVerify: snStatusVerify, // To track updates
  });
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();
  // Parse testInfo if it exists in the response
  useEffect(() => {
    if (requestInfoData?.tcsmeComments) {
      const parsedTestInfo = requestInfoData.tcsmeComments;
      setFulfilmentData((prevData) => ({
        ...prevData,
        tcsmeComments: parsedTestInfo,
      }));
    }
    if (requestInfoData?.status) {
      const parsedStatus = requestInfoData.status;
      setFulfilmentData((prevData) => ({
        ...prevData,
        status: parsedStatus,
      }));
    }
    if (requestInfoData?.snStatusVerify) {
      const parsedSnStatusVerify = requestInfoData.snStatusVerify;
      setFulfilmentData((prevData) => ({
        ...prevData,
        snStatusVerify: parsedSnStatusVerify,
      }));
    }
  }, [requestInfoData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFulfilmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!fulfilmentData.tcsmeComments) {
      errors.tcsmeComments = "TCSME Comments field is required.";
    }
    // here check status must be returned or approved otherwise error
    if (
      fulfilmentData.status != "returned" &&
      fulfilmentData.status != "approved"
    ) {
      errors.status = "Status field is required.";
    }

    return errors;
  };

  // Handle form submission.

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // There are errors, construct an alert message
      let errorMessage = "Please correct the following errors:\n";
      Object.entries(errors).forEach(([key, value]) => {
        errorMessage += `${value}\n`;
      });
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    if (
      fulfilmentData.snStatusVerify !== "1" &&
      fulfilmentData.status == "approved"
    ) {
      toast.error("Please verify SN status.");
      setLoading(false);
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...fulfilmentData,
      column: "tcsmeComments",
      submitData: fulfilmentData.tcsmeComments, // Ensure full data is sent
      status: fulfilmentData.status,
      snStatusVerify: fulfilmentData.snStatusVerify,
      environment: environment,
    };

    try {
      const response = await axiosToken.put(
        `/card-requests/${cardRequestId}`,
        submitData
      );

      if (response.status === 200 || response.status === 201) {
        setLoading(false);
        toast.success("Status updated successfully.");
        // set timeout to navigate
        setTimeout(() => {
          // dismiss toast
          toast.dismiss();
          if (fulfilmentData.status == "approved" && environment != 3) {
            handleCardAssignmentAvailability(true);
            handleAccordionExpand("collapseSix");
            navigate(`/dashboard/test-card-request/${cardRequestId}`, {
              state: { environment, terminalType, status: "approved" },
            });
          } else {
            window.location.href = `/dashboard/test-card-fulfilment`;
          }
        }, 2000);
      } else {
        toast.error("Error: " + response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error(
        (error.response && error.response.data && error.response.data.error) ||
          error.message ||
          "An error occurred."
      );
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <form>
        <div className="form-field-wrapper">
          <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
            <div className="col-12 col-lg-9 me-lg-4 me-0">
              <div className="d-lg-flex align-items-center">
                <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                  TC SME Comment
                </label>
                {/* status in submitted, approved, returned, assign_card, shipped */}

                <input
                  placeholder="TC SME Comment"
                  type="text"
                  value={fulfilmentData?.tcsmeComments || ""}
                  onChange={handleChange}
                  name="tcsmeComments"
                  disabled={requestInfoData.status != "submitted"}
                  className="form-control formcontrol"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="col-12 col-lg-9 me-lg-4 me-0">
              <div className="d-lg-flex align-items-center formcard">
                <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                  Status
                </label>
                {/* radio button */}
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    id="inlineRadio1"
                    value="approved"
                    disabled={requestInfoData.status != "submitted"}
                    checked={
                      fulfilmentData.status == "approved" ||
                      fulfilmentData.status == "assign_card" ||
                      fulfilmentData.status == "shipped"
                    }
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="inlineRadio1">
                    Approved
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    id="inlineRadio2"
                    value="returned"
                    disabled={requestInfoData.status != "submitted"}
                    checked={fulfilmentData.status == "returned"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="inlineRadio2">
                    Rejected
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="btn-section col-12 d-flex justify-content-end">
          <>
            {/* if requestInfo.status  == submitted */}
            {/* userRole == 1 */}
            {requestInfoData.status == "submitted" && userRole == 1 && (
              <a
                className="btn-add d-flex align-items-center gap-1"
                style={{ cursor: "pointer" }}
                onClick={handleSubmit}
              >
                {loading ? "Submitting..." : "Submit"}
              </a>
            )}
          </>
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

export default Fullfillment;
