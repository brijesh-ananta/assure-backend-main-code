import { useState, useRef, useEffect } from "react";
import axiosToken from "../utils/axiosToken";

function Footer({ audit = false, tableName, recordId }) {
  const [showAuditTrailDetails, setShowAuditTrailDetails] = useState(false);
  const [auditData, setAuditData] = useState({
    dateCreated: "",
    createdBy: "",
    lastUpdateDate: "",
    updatedBy: "",
  });
  const [loading, setLoading] = useState(false);
  const detailsRef = useRef(null);
  const auditTrailRef = useRef(null);

  const toggleAuditTrailDetails = () => {
    setShowAuditTrailDetails((prev) => !prev);
  };

  useEffect(() => {
    const fetchAuditTrail = async () => {
      if (audit && tableName && recordId) {
        setLoading(true);
        try {
          const data = await axiosToken.get(
            `/audit-trails/two-events/${recordId}/${tableName}`
          );
          setAuditData(data.data);
        } catch (error) {
          console.error("Error fetching audit trail:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAuditTrail();
  }, [audit, tableName, recordId]);

  // Handle audit trail animation
  useEffect(() => {
    const detailsElement = detailsRef.current;
    if (detailsElement) {
      if (showAuditTrailDetails) {
        detailsElement.style.maxHeight = `${detailsElement.scrollHeight}px`;
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
        }, 300);
      } else {
        detailsElement.style.maxHeight = "0px";
      }
    }
  }, [showAuditTrailDetails]);

  // Close audit trail on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAuditTrailDetails &&
        auditTrailRef.current &&
        !auditTrailRef.current.contains(event.target)
      ) {
        setShowAuditTrailDetails(false);
      }
    };

    // Only add listener when audit trail is open
    if (showAuditTrailDetails) {
      document.addEventListener("click", handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showAuditTrailDetails]);

  const siteVersion = import.meta.env.VITE_SITE_VERSION;

  return (
    <>
      {audit && (
        <div
          className="audit-trail bg-light p-2 mb-0 border-top text-center"
          ref={auditTrailRef}
        >
          <h5
            className="text-primary mb-1 align-items-center"
            onClick={toggleAuditTrailDetails}
            style={{ cursor: "pointer" }}
            role="button"
            aria-expanded={showAuditTrailDetails}
            aria-label="Toggle Audit Trail Details"
          >
            Audit Trail
          </h5>
          <div
            className="audit-details w-90"
            ref={detailsRef}
            style={{
              maxHeight: "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease-in-out",
            }}
          >
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Fetching audit data...</p>
              </div>
            ) : (
              <div className="row align-items-center m-auto">
                <div className="col-md-12 row">
                  <p className="col-6 row justify-content-end">
                    <strong className="col-4 text-right">Date Created:</strong>{" "}
                    <span className="col-5 d-flex">
                      {tableName === "system_defaults"
                        ? "01/01/2025 12:00:00"
                        : auditData.dateCreated}
                    </span>
                  </p>
                  <p className="col-6 row justify-content-end">
                    <strong className="col-4 text-right">
                      Last Update Date:
                    </strong>{" "}
                    <span className="col-5 d-flex">
                      {auditData.lastUpdateDate}
                    </span>
                  </p>
                </div>
                <div className="col-md-12 row">
                  <p className="col-6 row justify-content-end">
                    <strong className="col-4 text-right">Created by:</strong>{" "}
                    <span className="col-5 d-flex">
                      {tableName === "system_defaults"
                        ? "TC SME"
                        : auditData.createdBy}
                    </span>
                  </p>
                  <p className="col-6 row justify-content-end">
                    <strong className="col-4 text-right">Updated by:</strong>
                    <span className="col-5 d-flex">{auditData.updatedBy}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="z-3 d-flex justify-content-between align-items-center py-0 px-3 bg-white border-top">
        <p>Copyright © Ayris Global LLC</p>
        <div>
          <span className="d-flex align-items-end">
            {siteVersion} &nbsp;<p className="fs-4">?</p>
          </span>
        </div>
      </footer>
    </>
  );
}

export default Footer;
