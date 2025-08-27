import { useParams } from "react-router-dom";
import BeforeAfterDiff from "./BeforeAfterDiff"; // Adjust the import path as needed
import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "../../services";

function AuditTrailView() {
  const { id } = useParams();

  const [data, setData] = useState({});

  const dateObj = useMemo(
    () => (data ? new Date(data.action_time) : null),
    [data]
  );
  const date = dateObj ? dateObj.toLocaleDateString() : "";
  const time = dateObj ? dateObj.toLocaleTimeString() : "";
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
