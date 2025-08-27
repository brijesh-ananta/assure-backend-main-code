import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
import { formatDateToLocal } from "../../utils/date";
import CustomTable from "../../components/shared/table/CustomTable";
import { toast } from "react-toastify";
import { environmentMapping } from "../../utils/constent";

const priorityColors = {
  medium: "#F7CB73",
  high: "#e80e0e",
  low: "#32a818",
};

function TCrequesetHistory() {
  const formatStatusDisplay = (status) => {
    const statusMap = {
      assign_card: "Assign Card",
      draft: "Draft",
      returned: "Returned",
      submitted: "Submitted",
      approved: "Approved",
      shipped: "Shipped",
      completed: "Completed",
    };

    return (
      statusMap[status] ||
      (status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A")
    );
  };

  const [environment, setEnvironment] = useState("All");
  const [termialType, setTermialType] = useState("All");
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState("all"); // "all" or "my"

  const { user } = useAuth();

  const userRole = user?.role;
  const tableRef = useRef(null);

  const handleEnvironmentChange = (e) => {
    const newEnv = e.target.value;
    setEnvironment(newEnv);
    setStatusFilter("All");

    if (newEnv === "2" || newEnv === "3") {
      setTermialType("Pos");
    } else {
      setTermialType("All");
    }
    setRequests([]);
  };

  const handleTerminalTypeChange = (e) => {
    const newTerminalType = e.target.value;
    setTermialType(newTerminalType);
  };

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Returned: 0,
    Submitted: 0,
    Approved: 0,
    "Assign Card": 0,
    Shipped: 0,
    Completed: 0,
  });

  const handleStatusFilter = (status) => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setStatusFilter(status);
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        let url = `/card-requests`;
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        if (environment) {
          url += `&environment=${environment}`;
        }
        if (termialType) {
          url += `&terminalType=${termialType}`;
        }
        if (requestType) {
          url += `&requestType=${requestType}`;
        }
        const response = await axiosToken.get(url);
        const allRequests = response.data || [];
        setStatusCounts({
          Draft: allRequests.filter((p) => p.status === "draft").length,
          Returned: allRequests.filter((p) => p.status === "returned").length,
          Submitted: allRequests.filter((p) => p.status === "submitted").length,
          Approved: allRequests.filter((p) => p.status === "approved").length,
          "Assign Card": allRequests.filter((p) => p.status === "assign_card")
            .length,
          Shipped: allRequests.filter((p) => p.status === "shipped").length,
          Completed: allRequests.filter((p) => p.status === "completed").length,
        });
      } catch (error) {
        console.error("Error fetching request counts:", error);
      }
    };
    fetchCounts();
  }, [environment, requestType, termialType]);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        let url = `/card-requests`;
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        if (environment) {
          url += `&environment=${environment}`;
        }
        if (termialType) {
          url += `&terminalType=${termialType}`;
        }
        if (requestType) {
          url += `&requestType=${requestType}`;
        }
        const response = await axiosToken.get(url);
        const all = response.data || [];

        const updateuser = all.map((item) => {
          let environment = environmentMapping[item?.environment_id];

          return { ...item, environment };
        });

        setRequests(updateuser || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequest();
  }, [statusFilter, environment, termialType, requestType]);

  const hasEnvAccess = useCallback(
    (env) => {
      if (env == "1") return user?.prod !== 0;
      if (env == "2") return user?.qa !== 0;
      if (env == "3") return user?.test !== 0;
      return false;
    },
    [user?.prod, user?.qa, user?.test]
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => hasEnvAccess(item.environment_id));
  }, [hasEnvAccess, requests]);

  const statuses = [
    { label: "Draft", key: "draft", count: statusCounts.Draft },
    { label: "Returned", key: "returned", count: statusCounts.Returned },
    { label: "Submitted", key: "submitted", count: statusCounts.Submitted },
    { label: "Approved", key: "approved", count: statusCounts.Approved },
    {
      label: "Assign Card",
      key: "assign_card",
      count: statusCounts["Assign Card"],
    },
    { label: "Shipped", key: "shipped", count: statusCounts.Shipped },
    { label: "Completed", key: "completed", count: statusCounts.Completed },
  ];
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (requestId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  const handleDuplicate = (requestId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to duplicate this card request?"
    );
    if (!isConfirmed) return;
    setLoading(true);
    axiosToken
      .post(`/card-requests/duplicate/${requestId}`)
      .then(() => {
        setLoading(false);
        toast.success("Card request duplicated successfully");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error duplicating card request:", error);
        setLoading(false);
        toast.error("Error duplicating card request");
      });
  };

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "request_id",
          label: "Request ID",
          sortable: true,
          renderCell: (item) => (
            <Link
              to={`/dashboard/test-card-request/requestor-info/${item.cardRequestId}`}
              state={{
                environment: item.environment_id,
                terminalType: item.terminalType,
                status: item.status,
              }}
            >
              {item.request_id}
            </Link>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          width: "120px",
          renderCell: (item) => formatStatusDisplay(item.status),
        },
        {
          key: "submitted_date",
          label: "Date Submitted",
          sortable: true,
          renderCell: (item) =>
            item.submitted_date && item.submitted_date !== ""
              ? formatDateToLocal(item.submitted_date)
              : "N/A",
        },
        {
          key: "updated_at",
          label: "Last Update",
          sortable: true,
          renderCell: (item) =>
            item.updated_at && item.updated_at !== ""
              ? formatDateToLocal(item.updated_at)
              : "N/A",
        },
        {
          key: "request_priority",
          label: "Priority",
          sortable: true,
          renderCell: (item) => {
            return (
              <span
                style={{
                  color: item?.request_priority
                    ? priorityColors[item?.request_priority]
                    : "black",
                }}
              >
                {item?.request_priority || "-"}
              </span>
            );
          },
          width: "100px",
        },
        {
          key: "testing_objective",
          label: "Test Objective",
          sortable: true,
          renderCell: (item, { expandedRows, onToggle }) => {
            const objective = item?.testing_objective || "N/A";
            const isExpanded = expandedRows[item.cardRequestId];
            const truncated =
              objective.length > 70
                ? objective.substring(0, 70) + "..."
                : objective;

            return (
              <>
                {isExpanded ? (
                  <>
                    {objective}{" "}
                    <span
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => onToggle(item.cardRequestId)}
                    >
                      View Less
                    </span>
                  </>
                ) : (
                  <>
                    {truncated}
                    {objective.length > 70 && (
                      <span
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => onToggle(item.cardRequestId)}
                      >
                        View More
                      </span>
                    )}
                  </>
                )}
              </>
            );
          },
          minWidth: "250px",
        },
        {
          key: "createdBy",
          label: "Requestor",
          sortable: true,
        },
        {
          key: "duplicate",
          label: "Duplicate",
          hide: userRole != 2,
          renderCell: (item) => {
            return (
              item.status !== "draft" &&
              userRole === 2 &&
              (loading ? (
                <i className="fa fa-spinner fa-spin"></i>
              ) : (
                <i
                  className="fa fa-clone"
                  onClick={() => handleDuplicate(item.cardRequestId)}
                  style={{ cursor: "pointer" }}
                ></i>
              ))
            );
          },
          width: "100px",
        },
        {
          key: "environment",
          label: "Environment",
          renderCell: (item) => (
            <span>
              {environmentMapping[item.environment_id] || item.environment_id}
            </span>
          ),
          sortable: true,
        },
      ],
      options: {
        isServerSide: false,
        expandable: {
          expandedRows: expandedRows,
          onToggle: toggleExpand,
        },
        sortConfig: {
          initialSortColumn: "submittedDate",
          initialSortDirection: "desc",
        },
        pagination: {
          initialEntriesPerPage: 10,
          pageOptions: [10, 25, 50, 100],
        },
        responsive: {
          breakpoint: "768px",
          minWidth: "600px",
        },
      },
      styles: {
        header: {
          backgroundColor: "#f8f9fa",
          borderBottom: "4px solid #dee2e6",
        },
        row: {
          striped: true,
          hover: true,
        },
      },
    }),
    [environmentMapping, expandedRows, loading, userRole]
  );

  const handleRequestFilterChange = (e) => {
    setRequestType(e.target.value);
  };

  return (
    <dic className="">
      <Header title="Request History" />
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid ">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <span></span>
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
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
                  disabled={user?.prod == 0}
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor="flexRadioDefault1"
                >
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
                  disabled={user?.qa == 0}
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor="flexRadioDefault2"
                >
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
                  disabled={user?.test == 0}
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor="flexRadioDefault3"
                >
                  Cert
                </label>
              </div>
            </div>

            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Terminal Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="terminalType"
                  value={"Pos"}
                  checked={
                    termialType === "Pos" ||
                    environment === "2" ||
                    environment === "3"
                  }
                  onChange={handleTerminalTypeChange}
                  id="termialType1"
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor="termialType1"
                >
                  POS
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="terminalType"
                  value={"Ecomm"}
                  checked={
                    termialType === "Ecomm" &&
                    environment !== "2" &&
                    environment !== "3"
                  }
                  onChange={handleTerminalTypeChange}
                  id="termialType2"
                  // disabled if environment is 2
                  disabled={environment === "2" || environment === "3"}
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor="termialType2"
                >
                  Ecomm
                </label>
              </div>
            </div>

            <div className="">
              {userRole == 2 && (
                <>
                  {environment !== "All" && termialType !== "All" && (
                    <div>
                      <Link
                        className="btn save-btn py-2"
                        to="/dashboard/test-card-request"
                        state={{
                          environment: environment,
                          terminalType: termialType, // Corrected typo from 'termialType' to 'terminalType'
                          status: "new",
                        }}
                      >
                        Submit New Request
                      </Link>
                    </div>
                  )}
                  {/* If environment or terminalType are not set, disable the link */}
                  {(environment === "All" || termialType === "All") && (
                    <button
                      className="btn save-btn"
                      onClick={() =>
                        toast.error(
                          "Please select environment and terminal type"
                        )
                      }
                    >
                      Submit New Request
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <section className="min-h-100-200px">
        <div className="notification">
          <div className="container-fluid">
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
                    className={`card-custom-shadow-1 totavalue ${
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
                  className={`card-custom-shadow-1 totavalue ${
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

          {userRole == 2 && (
            <div className="max-500 w-50 mb-4 p-3 d-flex gap-4 fw-bold align-items-center rounded-3 card-custom-shadow-1 custom-bg-to-left">
              Select Requests
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="requestType"
                  value="my"
                  checked={requestType === "my"}
                  onChange={handleRequestFilterChange}
                  id="radioMyRequests"
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor="flexRadioDefault1"
                >
                  My Requests
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 justify-content-center align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="requestType"
                  value="all"
                  checked={requestType === "all"}
                  onChange={handleRequestFilterChange}
                  id="radioAllRequests"
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor="flexRadioDefault1"
                >
                  All Requests
                </label>
              </div>
            </div>
          )}
          <div className="mb-lg-5 mb-3 table-responsive">
            <CustomTable
              options={tableConfig.options}
              styles={tableConfig.styles}
              data={filteredRequests}
              columns={tableConfig.columns}
              expandable={tableConfig.options.expandable}
              emptyState={
                <div className="text-center p-5 font fa-1x">
                  No requests found.
                </div>
              }
            />
          </div>
        </div>
      </section>
      <Sidebar />
      <Footer />
    </dic>
  );
}

export default TCrequesetHistory;
