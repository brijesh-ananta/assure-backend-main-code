import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axiosToken from "../../utils/axiosToken";
import { Link } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";
import "datatables.net-bs4/js/dataTables.bootstrap4.min.js";
import CustomTable from "../../components/shared/table/CustomTable";
import { colorMapping, environmentMapping } from "../../utils/constent";

const formatDateToLocal = (date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-GB");
  } catch {
    return "N/A";
  }
};

function TCfulfilment() {
  const [environment, setEnvironment] = useState("All");
  const [terminalType, setTerminalType] = useState("All");
  const tableRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Submitted: 0,
    Approved: 0,
    "Assign Card": 0,
    "Ship Card": 0,
  });
  const [expandedRows, setExpandedRows] = useState({});

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
    if (e.target.value === "2" || e.target.value === "3") {
      setTerminalType("Pos");
    } else {
      setTerminalType("All");
    }
    setRequests([]);
    setStatusFilter("All");
    setStatusCounts({
      Submitted: 0,
      Approved: 0,
      "Assign Card": 0,
      "Ship Card": 0,
    });
  };

  const handleTerminalTypeChange = (e) => {
    setTerminalType(e.target.value);
  };

  const handleStatusFilter = (status) => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setStatusFilter(status);
  };

  const fetchCounts = useCallback(async () => {
    try {
      const url = `/card-requests/status?status=All&environment=${environment}&terminalType=${terminalType}`;
      const response = await axiosToken.get(url);
      const allRequests = response.data || [];
      setStatusCounts({
        Submitted: allRequests.filter((p) => p.status === "submitted").length,
        Approved: allRequests.filter((p) => p.status === "approved").length,
        "Ship Card": allRequests.filter((p) => p.status === "shipped").length,
        "Assign Card": allRequests.filter((p) => p.status === "assign_card")
          .length,
      });
    } catch (error) {
      console.error("Error fetching request counts:", error);
    }
  }, [environment, terminalType]);

  const fetchRequest = useCallback(async () => {
    try {
      const url = `/card-requests/status?status=${statusFilter}&environment=${environment}&terminalType=${terminalType}`;
      const response = await axiosToken.get(url);
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [statusFilter, environment, terminalType]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts, environment, terminalType]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest, statusFilter, environment, terminalType]);

  const toggleExpand = (requestId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // Toggle the expanded state for this row
    }));
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
        { key: "status", label: "Status", sortable: true,
          renderCell: (item) => colorMapping[ item.status] || item.status,
        },
        {
          key: "submittedDate",
          label: "Date Submitted",
          renderCell: (item) => formatDateToLocal(item.submitted_date),
        },
        {
          key: "updatedDate",
          label: "Last Updated",
          renderCell: (item) => formatDateToLocal(item.updated_at),
        },
        {
          key: "testObjective",
          label: "Test Objective",
          renderCell: (item, { expandedRows, onToggle }) => {
            const objective = item?.testing_objective || "N/A";
            const isExpanded = expandedRows[item.cardRequestId];
            const truncated =
              objective.length > 70
                ? objective.substring(0, 70) + "..."
                : objective;

            return objective === "N/A" ? (
              "N/A"
            ) : isExpanded ? (
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
            );
          },
          minWidth: "250px",
        },
        { key: "createdBy", label: "Requestor", sortable: true },
        {
          key: "environment_id",
          label: "Environment",
          renderCell: (item) =>
            environmentMapping[item.environment_id] || item.environment_id,
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
    [expandedRows]
  );

  const statuses = [
    { label: "Submitted", key: "submitted", count: statusCounts.Submitted },
    { label: "Approved", key: "approved", count: statusCounts.Approved },
    {
      label: "Assign Card",
      key: "assign_card",
      count: statusCounts["Assign Card"],
    },
    { label: "Ship Card", key: "shipped", count: statusCounts["Ship Card"] },
  ];

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-around w-100">
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
                    terminalType === "Pos" ||
                    environment === "2" ||
                    environment === "3"
                  }
                  onChange={handleTerminalTypeChange}
                  id="terminalType1"
                />
                <label className="form-check-label" htmlFor="terminalType1">
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
                    terminalType === "Ecomm" &&
                    environment !== "2" &&
                    environment !== "3"
                  }
                  onChange={handleTerminalTypeChange}
                  id="terminalType2"
                  // disabled if environment is 2
                  disabled={environment === "2" || environment === "3"}
                />
                <label className="form-check-label" htmlFor="terminalType2">
                  Ecomm
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section>
        <div className="notification">
          <div className="container-fluid">
            <ul className="list-unstyled d-flex stepform flex-wrap justify-content-lg-between justify-content-center gap-4 mb-lg-5 col-lg-12">
              {statuses.map((status) => (
                <li
                  key={status.key}
                  role="button"
                  tabIndex={0}
                  className="d-flex justify-content-center align-items-center flex-column text-center gap-2"
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
              <CustomTable
                options={tableConfig.options}
                styles={tableConfig.styles}
                data={requests}
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
        </div>
      </section>
    </>
  );
}

export default TCfulfilment;
