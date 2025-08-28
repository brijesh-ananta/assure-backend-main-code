import { useParams } from "react-router-dom";
import BeforeAfterDiff from "./BeforeAfterDiff";
import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "../../services";

// Utility function to convert UTC to EST
const convertUTCToEST = (utcTimestamp) => {
  if (!utcTimestamp) return { date: "", time: "" };

  const utcDate = new Date(utcTimestamp);

  // Convert to EST/EDT (automatically handles daylight saving time)
  const estDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  // Format date as M/D/YYYY
  const date = estDate.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  // Format time as H:MM:SS AM/PM
  const time = estDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return { date, time };
};

function AuditTrailView() {
  const { id } = useParams();
  const [data, setData] = useState({});

  // Convert UTC to EST and format
  const { date, time } = useMemo(
    () => convertUTCToEST(data?.action_time),
    [data?.action_time]
  );

  const handleBackClick = () => {
    window.history.back();
  };

  const getDataById = useCallback(async () => {
    if (!id) return;

    try {
      const result = await apiService.auditTrail.getById(id);
      setData(result);
    } catch (error) {
      console.error("error", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      getDataById();
    }
  }, [id, getDataById]);

  return (
    <>
      <div className="notification my-4">
        <div className="container-fluid">
          <h2>Audit Trail Details</h2>
          {data ? (
            <>
              <div
                className="card p-3 mb-4 shadow-sm"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                {/* Top row: ID, Date, Time, and Updated By */}
                <div className="row mb-2">
                  <div className="col-md-3">
                    <strong>Trail ID:</strong> {data?.Trail_ID}
                  </div>
                  <div className="col-md-3">
                    <strong>Date:</strong> {date}
                  </div>
                  <div className="col-md-3">
                    <strong>Time:</strong> {time}
                  </div>
                  <div className="col-md-3">
                    <strong>Updated By:</strong>{" "}
                    {data?.performed_by_name || data?.username}
                  </div>
                </div>

                {/* Second row: Application Name and Description */}
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>Application Name:</strong> {data?.table_name}
                  </div>
                  <div className="col-md-6">
                    <strong>Description:</strong> {data?.action}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <strong>IP Address:</strong> {data?.ip_address}
                  </div>
                  <div className="col-md-4">
                    {/* You could place more fields here if desired */}
                  </div>
                </div>
              </div>

              <div className="w-100 ">
                <h3>Changes</h3>
                <BeforeAfterDiff
                  oldData={data?.old_data}
                  newData={data?.new_data}
                />
              </div>
            </>
          ) : (
            <p>No audit trail data available.</p>
          )}
          <div className="back-button align-center">
            <button
              className="btn save-btn ms-auto ws100"
              onClick={handleBackClick}
            >
              Back
            </button>
          </div>
        </div>
        {/* back button */}
      </div>
    </>
  );
}

export default AuditTrailView;
