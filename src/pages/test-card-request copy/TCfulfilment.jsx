import React, { useEffect, useState, useRef } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { Link } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";
import "datatables.net-bs4/js/dataTables.bootstrap4.min.js";

function TCfulfilment() {
  const [headerTitle, setHeaderTitle] = useState("Test Card Fulfilment"); // Default title
  const [environment, setEnvironment] = useState("All"); // Default to Prod ("1")

  const environmentMapping = { 1: "Prod", 2: "QA", 3: "Test" };

  const [termialType, setTermialType] = useState("All"); // Default to Prod ("1")

  const { user } = useAuth(); // user now contains profile info
  const userRole = user?.role; // assuming role is stored in user object
  const tableRef = useRef(null);

  const handleEnvironmentChange = (e) => {
    const newEnv = e.target.value;
    setEnvironment(newEnv);
  };

  const handleTerminalTypeChange = (e) => {
    const newTerminalType = e.target.value;
    setTermialType(newTerminalType);
  };

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Submitted: 0,
    Approved: 0,
    Shipped: 0,
  });

  // Handler for status filter update
  const handleStatusFilter = (status) => {
    // Destroy any existing DataTable instance on the tableRef element
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setStatusFilter(status);
  };

  // Fetch counts for all statuses on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        let url = `/card-requests/status`;
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        if (environment) {
          url += `&environment=${environment}`;
        }
        if (termialType) {
          url += `&terminalType=${termialType}`;
        }
        const response = await axiosToken.get(url);
        const allRequests = response.data || [];
        setStatusCounts({
          Submitted: allRequests.filter((p) => p.status === "submitted").length,
          Approved: allRequests.filter((p) => p.status === "approved").length,
          "Shipment pending": allRequests.filter(
            (p) => p.status === "shipment_pending"
          ).length,
        });
      } catch (error) {
        console.error("Error fetching request counts:", error);
      }
    };
    fetchCounts();
  }, [environment, termialType]);

  // Fetch filtered partners when statusFilter changes
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        let url = `/card-requests/status`;
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        if (environment) {
          url += `&environment=${environment}`;
        }
        if (termialType) {
          url += `&terminalType=${termialType}`;
        }
        const response = await axiosToken.get(url);
        setRequests(response.data || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequest();
  }, [statusFilter, environment, termialType]);

  // Initialize DataTable when partners data updates.
  useEffect(() => {
    let dataTable = null;
    const initDataTable = () => {
      if (tableRef.current) {
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
          $(tableRef.current).DataTable().destroy();
        }
        if (requests.length > 0) {
          dataTable = $(tableRef.current).DataTable({
            responsive: true,
            pageLength: 10,
            lengthMenu: [
              [10, 25, 50, -1],
              [10, 25, 50, "All"],
            ],
          });
        }
      }
    };

    const timer = setTimeout(() => {
      initDataTable();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (dataTable) {
        dataTable.destroy();
        dataTable = null;
      }
    };
  }, [requests, statusFilter, environment, termialType]);

  // Define status filter options
  const statuses = [
    { label: "Submitted", key: "submitted", count: statusCounts.Submitted },
    { label: "Approved", key: "approved", count: statusCounts.Approved },
    {
      label: "Shipment pending",
      key: "shipment_pending",
      count: statusCounts["Shipment pending"],
    },
  ];

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />
      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <span></span>
            <div className="d-lg-flex formcard">
              <span className="me-3 font">Environment</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"1"}
                  checked={environment === "1"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault1"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"2"}
                  checked={environment === "2"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault2"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"3"}
                  checked={environment === "3"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault3"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault3">
                  Test
                </label>
              </div>
            </div>

            <div className="d-lg-flex formcard">
              <span className="me-3 font">Terminal Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="terminalType"
                  value={"pos"}
                  checked={termialType === "Pos"}
                  onChange={handleTerminalTypeChange}
                  id="termialType1"
                />
                <label className="form-check-label" htmlFor="termialType1">
                  Pos
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="terminalType"
                  value={"ecomm"}
                  checked={termialType === "Ecomm"}
                  onChange={handleTerminalTypeChange}
                  id="termialType2"
                />
                <label className="form-check-label" htmlFor="termialType2">
                  Ecomm
                </label>
              </div>
            </div>

            <div className="">
              {userRole == 1 && (
                <div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <section>
        <div className="notification">
          <div className="container-fluid">
            {/* Status summary */}
            <ul className="list-unstyled d-flex stepform flex-wrap justify-content-lg-between justify-content-center gap-4 mb-lg-5 col-lg-12">
              {statuses.map((status) => (
                <li
                  key={status.key}
                  role="button"
                  tabIndex={0}
                  className="d-flex justify-content-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleStatusFilter(status.key);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span
                    className={`totavalue ${
                      statusFilter === status.key ? "active-value" : ""
                    }`}
                  >
                    {status.count}
                  </span>
                  <p>{status.label}</p>
                </li>
              ))}
              <li
                key="all"
                role="button"
                tabIndex={0}
                className="d-flex justify-content-center flex-column text-center gap-2"
                onClick={() => handleStatusFilter("All")}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleStatusFilter("All");
                }}
                style={{ cursor: "pointer" }}
              >
                <span
                  className={`totavalue ${
                    statusFilter === "All" ? "active-value" : ""
                  }`}
                >
                  {Object.values(statusCounts).reduce(
                    (total, count) => total + count,
                    0
                  )}
                </span>
                <p>Total</p>
              </li>
            </ul>
          </div>
          <div className="container-fluid mb-lg-5 mb-3">
            <div className="table-responsive">
              {/* Use key prop based on statusFilter to force remount on filter change */}
              <table
                key={statusFilter}
                id="notificationTable"
                ref={tableRef}
                className="table table-bordered border row-border border-3 table-hover"
              >
                <thead className="table-theme theme_noti">
                  <tr>
                    <th>Request ID</th>
                    <th>Status</th>
                    <th>Date Submitted</th>
                    <th>Last update</th>
                    <th>Test Objective</th>
                    <th>Requestor</th>
                    <th>Environment</th>
                  </tr>
                </thead>
                <tbody>
                  {requests && requests.length > 0 ? (
                    requests.map((request) => {
                      let testInfo = {};
                      try {
                        testInfo = JSON.parse(request.testInformation);
                        // If the data is wrapped in a nested object, adjust accordingly:
                        if (testInfo.testInfoData) {
                          testInfo = testInfo.testInfoData;
                        }
                      } catch (error) {
                        console.error("Error parsing testInformation:", error);
                      }
                      return (
                        <tr key={request.cardRequestId}>
                          <td>
                          <Link
                              to={`/dashboard/test-card-request/requestor-info/${request.cardRequestId}`}
                              state={{
                                environment: request.environment,
                                terminalType: request.terminalType,
                                status: request.status,
                              }}
                            >
                              {request.requestid}
                            </Link>
                          </td>
                          <td>{request.status}</td>
                          <td>
                            {new Date(request.submittedDate)
                              .toLocaleDateString("en-GB")
                             }
                          </td>
                          <td>
                            {new Date(request.updatedDate)
                              .toLocaleDateString("en-GB")
                              }
                          </td>

                          {/* Use the correct key from parsed object */}
                          <td>{testInfo.testingObjective || "N/A"}</td>
                          <td>{request.createdBy}</td>
                          <td>
                            {environmentMapping[request.environment] ||
                              environment}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default TCfulfilment;
