import React, { useState, useEffect, useRef } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

function ManageNotifications() {
  const [headerTitle] = useState("Manage Notifications");
  const tableRef = useRef(null);
  const { user } = useAuth();
  const userRole = user?.role;

  // State for all notifications (used to compute summary counts)
  const [allNotifications, setAllNotifications] = useState([]);
  // State for filtered notifications (based on API call with status filter)
  const [notifications, setNotifications] = useState([]);

  // Filter state for client-side filters (if needed)
  const [filters, setFilters] = useState({
    notification_number: "",
    status: "",
    type: "",
  });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Status filter state; "All" means no filter applied at the API level.
  const [statusFilter, setStatusFilter] = useState("All");

  // Separate state for status counts
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Returned: 0,
    Submitted: 0,
    Approved: 0,
    Deleted: 0,
    Expired: 0,
  });

  // Fetch full notifications for counts on mount
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const response = await axiosToken.get("/notifications");
        const allData = response.data.notifications || [];
        setAllNotifications(allData);
        setStatusCounts({
          Draft: allData.filter((n) => n.status === "draft").length,
          Returned: allData.filter((n) => n.status === "returned").length,
          Submitted: allData.filter((n) => n.status === "submitted").length,
          Approved: allData.filter((n) => n.status === "approved").length,
          Deleted: allData.filter((n) => n.status === "deleted").length,
          Expired: allData.filter((n) => n.status === "expired").length,
        });
      } catch (error) {
        console.error("Error fetching all notifications:", error);
      }
    };
    fetchAllNotifications();
  }, []);

  // Fetch notifications for table display when statusFilter changes
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let url = `/notifications`;
        if (statusFilter !== "All") {
          url += `?status=${statusFilter}`;
        }
        const response = await axiosToken.get(url);
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [statusFilter]);

  // (Optional) Client-side filtering on notifications using filters and date range
  const filteredNotifications = notifications.filter((n) => {
    const withinStartDate =
      !dateRange.start || new Date(n.start_date) >= new Date(dateRange.start);
    const withinEndDate =
      !dateRange.end || new Date(n.end_date) <= new Date(dateRange.end);
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return n[key].toString().toLowerCase().includes(value.toLowerCase());
    });
    return withinStartDate && withinEndDate && matchesFilters;
  });

  // Define statuses for the summary list using statusCounts
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
    setStatusFilter(status);
  };

  // (Optional) Handler for filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate" || name === "endDate") {
      setDateRange((prev) => ({ ...prev, [name]: value }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <Header title={headerTitle} />
      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <span></span>
            {/* No environment section here */}
            <div className="">
              {userRole === 1 && (
                <div>
                  <Link
                    className="btn-add py-2"
                    to={`/dashboard/create-notification`}
                  >
                    Create Notification
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <section>
        <div className="notification">
          <div className="container-fluid">
            {/* Status summary */}
            <ul className="list-unstyled d-flex stepform flex-wrap justify-content-lg-between justify-content-center gap-4 mb-lg-5">
              {/* "All" filter option */}
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
                  {allNotifications.length}
                </span>
                <p>All</p>
              </li>
              {statuses.map((status) => (
                <li
                  key={status.key}
                  className="d-flex justify-content-center align-items-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
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
            </ul>
          </div>
          <div className="container-fluid">
            <div className="table-responsive">
              <table
                ref={tableRef}
                id=""
                className="table table-bordered border row-border border-3 table-hover"
              >
                <thead className="table-theme theme_noti">
                  <tr>
                    <th>Notification Number</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Notification Text</th>
                    <th>Created By</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <tr key={notification.notification_id}>
                        <td>
                          <Link>{notification.notification_number}</Link>
                        </td>
                        <td>{notification.type}</td>
                        <td>{notification.status.toUpperCase()}</td>
                        <td>
                          {new Date(
                            notification.start_date
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(notification.end_date).toLocaleDateString()}
                        </td>
                        <td>{notification.notification_text}</td>
                        <td>{notification.createdBy}</td>
                        <td>
                          {new Date(
                            notification.created_at
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
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
          </div>
        </div>
      </section>

      <Sidebar />
      <Footer />
    </>
  );
}

export default ManageNotifications;
