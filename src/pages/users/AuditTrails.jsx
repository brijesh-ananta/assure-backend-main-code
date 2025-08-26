import React, { useState, useEffect, useRef } from "react";
import axiosToken from "../../utils/axiosToken";

function AuditTrails({ tableName, recordId }) {
  const [auditData, setAuditData] = useState({
    dateCreated: "",
    createdBy: "",
    lastUpdateDate: "",
    updatedBy: "",
  });
  const [loading, setLoading] = useState(false);
  const accordionRef = useRef(null); // Ref to track the accordion element

  const getAuditData = async () => {
    if (!recordId || !tableName) return; // Prevent fetch if props are invalid
    setLoading(true);
    try {
      const response = await axiosToken.get(
        `/audit-trails/two-events/${recordId}/${tableName}`
      );
      setAuditData(response.data || auditData); // Fallback to current state if no data
    } catch (error) {
      console.error("Error fetching audit data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when accordion is opened
  useEffect(() => {
    const accordionElement = accordionRef.current;
    if (!accordionElement) return;

    const handleShow = () => {
      getAuditData();
    };

    // Add event listener for Bootstrap collapse show event
    accordionElement.addEventListener("show.bs.collapse", handleShow);

    // Cleanup listener on unmount
    return () => {
      accordionElement.removeEventListener("show.bs.collapse", handleShow);
    };
  }, [recordId, tableName]); // Re-run if recordId or tableName changes

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="headingThreeCard">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseThreeCard"
          aria-expanded="false"
          aria-controls="collapseThreeCard"
        >
          <p className="mb-0 text-center fw-bold d-block w-100">Audit Trail</p>
        </button>
      </h2>
      <div
        id="collapseThreeCard"
        className="accordion-collapse collapse"
        ref={accordionRef} // Attach ref to the collapse div
        aria-labelledby="headingThreeCard"
        data-bs-parent="#accordionCard"
      >
        <div className="accordion-body text-center">
          <div className="cardbody bg-light-theme">
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Fetching audit data...</p>
              </div>
            ) : (
              <form>
                <div className="login-page mb-lg-4 mb-2 row">
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                        Date Created:
                      </label>
                      <div className="position-relative w-75">
                        {auditData.dateCreated || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                        Last Update Date:
                      </label>
                      <div className="position-relative w-75">
                        {auditData.lastUpdateDate || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                        Created by:
                      </label>
                      <div className="position-relative w-75">
                        {auditData.createdBy || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                        Updated by:
                      </label>
                      <div className="position-relative w-75">
                        {auditData.updatedBy || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditTrails;