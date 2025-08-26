import { useEffect, useState, useRef, useMemo } from "react";
import axiosToken from "../../utils/axiosToken";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";
import "datatables.net-bs4/js/dataTables.bootstrap4.min.js";
import CustomTable from "../../components/shared/table/CustomTable";
import { formatDateToLocal } from "../../utils/date";

function ManageNotifications() {
  const tableRef = useRef(null);
  const { user } = useAuth();
  const userRole = user?.role;

    const [expandedRows, setExpandedRows] = useState({});
  
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [interfaceFilter, setInterfaceFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Returned: 0,
    Submitted: 0,
    Approved: 0,
    Deleted: 0,
    Expired: 0,
  });

  // Fetch notifications when interfaceFilter or statusFilter changes
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch for counts (interfaceFilter only)
        let countUrl = "/notifications";
        if (interfaceFilter !== "All") {
          countUrl += `?interface=${interfaceFilter}`;
        }
        const countResponse = await axiosToken.get(countUrl);
        const countNotifications = countResponse.data.notifications || [];
        setNotifications(countNotifications);
        setStatusCounts({
          Draft: countNotifications.filter((n) => n.status === "draft").length,
          Returned: countNotifications.filter((n) => n.status === "returned")
            .length,
          Submitted: countNotifications.filter((n) => n.status === "submitted")
            .length,
          Approved: countNotifications.filter((n) => n.status === "approved")
            .length,
          Deleted: countNotifications.filter((n) => n.status === "deleted")
            .length,
          Expired: countNotifications.filter((n) => n.status === "expired")
            .length,
        });

        // Fetch for table (interfaceFilter + statusFilter)
        let tableUrl = "/notifications";
        const params = [];
        if (interfaceFilter !== "All") {
          params.push(`interface=${interfaceFilter}`);
        }
        if (statusFilter !== "All") {
          params.push(`status=${statusFilter}`);
        }
        if (params.length > 0) {
          tableUrl += `?${params.join("&")}`;
        }
        const tableResponse = await axiosToken.get(tableUrl);
        setFilteredNotifications(tableResponse.data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [interfaceFilter, statusFilter]);

  // Initialize DataTable after filteredNotifications change
  useEffect(() => {
    const timer = setTimeout(() => {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      if (filteredNotifications.length > 0 && tableRef.current) {
        $(tableRef.current).DataTable({
          responsive: true,
          pageLength: 10,
          lengthMenu: [
            [10, 25, 50, -1],
            [10, 25, 50, "All"],
          ],
          order: [[0, "desc"]],
          columnDefs: [
            { width: "150px", targets: 0 },
            { width: "100px", targets: 1 },
            { width: "120px", targets: 2 },
            { width: "120px", targets: 3 },
            { width: "120px", targets: 4 },
            { width: "400px", targets: 5 },
            { width: "120px", targets: 6 },
            { width: "120px", targets: 7 },
          ],
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [filteredNotifications]);

  // Define statuses for summary
  const statuses = [
    { label: "Draft", key: "draft", count: statusCounts.Draft },
    { label: "Returned", key: "returned", count: statusCounts.Returned },
    { label: "Submitted", key: "submitted", count: statusCounts.Submitted },
    { label: "Approved", key: "approved", count: statusCounts.Approved },
    { label: "Deleted", key: "deleted", count: statusCounts.Deleted },
    { label: "Expired", key: "expired", count: statusCounts.Expired },
  ];

  // Handler for status filter clicks
  const handleStatusFilter = (status) => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setStatusFilter(status);
    // Do not reset interfaceFilter, so counts and table respect the current interface
  };

  // Handler for interface filter clicks
  const handleInterfaceFilter = (interfaceType) => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setInterfaceFilter(interfaceType);
    setStatusFilter("All"); // Reset status filter when interface changes
  };

  const toggleExpand = (notificationId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }));
  };

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "notification_number",
          label: "Notification Number",
          sortable: true,
          renderCell: (item) => (
            <Link to={`/notification/view/${item?.notification_id}`}>
              {item.notification_number}
            </Link>
          ),
        },
        {
          key: "type",
          label: "Type",
          sortable: true,
          width: "120px",
        },
        {
          key: "status",
          label: "Status",
          renderCell: (item) => <span className="text-capitalize">{item.status}</span>
        },
        {
          key: "start_date",
          label: "Start Date",
          renderCell: (item) =>
            item.start_date && item.start_date !== ""
              ? formatDateToLocal(item.start_date)
              : "N/A",
        },
        {
          key: "end_date",
          label: "End Date",
          renderCell: (item) =>
            item.end_date && item.end_date !== ""
              ? formatDateToLocal(item.end_date)
              : "N/A",
        },
        {
          key: "testObjective",
          label: "Test Objective",
          renderCell: (item, { expandedRows, onToggle }) => {
            const text = item.notification_text || "N/A";
            const isExpanded = expandedRows[item.notification_id];
            const truncated =
              text.length > 70 ? text.substring(0, 70) + "..." : text;

            return (
              <>
                {isExpanded ? (
                  <>
                    {text}{" "}
                    <span
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => onToggle(item.notification_id)}
                    >
                      View Less
                    </span>
                  </>
                ) : (
                  <>
                    {truncated}
                    {text.length > 70 && (
                      <span
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => onToggle(item.notification_id)}
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
          label: "Created By",
          sortable: true,
        },
        {
          key: "created_at",
          label: "Created At",
          sortable: true,
          renderCell: (item) =>
            item.created_at && item.created_at !== ""
              ? formatDateToLocal(item.created_at)
              : "N/A",
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

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Interface</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  value="web"
                  checked={interfaceFilter === "web"}
                  id="flexRadioDefault1"
                  onChange={() => handleInterfaceFilter("web")}
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Web
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  value="mobile"
                  checked={interfaceFilter === "mobile"}
                  id="flexRadioDefault2"
                  onChange={() => handleInterfaceFilter("mobile")}
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  Mobile
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  value="All"
                  checked={interfaceFilter === "All"}
                  id="flexRadioDefault3"
                  onChange={() => handleInterfaceFilter("All")}
                />
                <label className="form-check-label" htmlFor="flexRadioDefault3">
                  All
                </label>
              </div>
            </div>
            <div>
              {userRole === 1 && (
                <Link
                  className="btn save-btn"
                  to={`/dashboard/create-notification`}
                >
                  Create Notification
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <section>
        <div className="notification mb-5">
          <div className="container-fluid">
            {/* Status summary */}
            <ul className="list-unstyled d-flex stepform flex-wrap justify-content-lg-between justify-content-center gap-4 mb-lg-5 col-lg-12">
              {statuses.map((status) => (
                <li
                  key={status.key}
                  className="d-flex justify-content-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
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
                className="d-flex justify-content-center align-items-center flex-column text-center gap-2"
                onClick={() => handleStatusFilter("All")}
                style={{ cursor: "pointer" }}
              >
                <span
                  className={`totavalue ${
                    statusFilter === "All" ? "active-value" : ""
                  }`}
                >
                  {notifications.length}
                </span>
                <p>All</p>
              </li>
            </ul>
          </div>

          <div className="mb-lg-5 mb-3 table-responsive">
            <CustomTable
              options={tableConfig.options}
              styles={tableConfig.styles}
              data={filteredNotifications}
              columns={tableConfig.columns}
              expandable={tableConfig.options.expandable}
              emptyState={
                <div className="text-center p-5 font fa-1x">No data found.</div>
              }
            />
          </div>
          {/*            
          <div className="container-fluid">
            <div className="table-responsive">
              <table
                id="notificationTable"
                ref={tableRef}
                className="table table-bordered border row-border border-3 table-hover"
              >
                <thead className="table-theme theme_noti">
                  <tr>
                    <th>Notification Number</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th style={{ width: "400px" }}>Notification Text</th>
                    <th>Created By</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => {
                      const isExpanded =
                        expandedRows[notification.notification_id];
                      const text = notification.notification_text || "N/A";
                      const truncatedText =
                        text.length > 50 ? text.substring(0, 50) + "..." : text;

                      return (
                        <tr key={notification.notification_id}>
                          <td>
                            <Link
                              to="/notification/view"
                              state={{ notice: notification }}
                            >
                              {notification.notification_number}
                            </Link>
                          </td>
                          <td>{notification.type}</td>
                          <td>{notification.status.toUpperCase()}</td>
                          <td>
                            {new Date(
                              notification.start_date
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(
                              notification.end_date
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            {isExpanded ? (
                              <>
                                {text}{" "}
                                <span
                                  style={{ color: "blue", cursor: "pointer" }}
                                  onClick={() =>
                                    toggleExpand(notification.notification_id)
                                  }
                                >
                                  View Less
                                </span>
                              </>
                            ) : (
                              <>
                                {truncatedText}{" "}
                                {text.length > 50 && (
                                  <span
                                    style={{ color: "blue", cursor: "pointer" }}
                                    onClick={() =>
                                      toggleExpand(notification.notification_id)
                                    }
                                  >
                                    View More
                                  </span>
                                )}
                              </>
                            )}
                          </td>
                          <td>{notification.createdBy}</td>
                          <td>
                            {new Date(
                              notification.created_at
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No notifications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div> */}
        </div>
      </section>
    </>
  );
}

export default ManageNotifications;
