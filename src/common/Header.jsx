/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react"; // Added useRef
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import axiosToken from "../utils/axiosToken";
import {
  formatDateTime,
  formatDateToLocal,
  formatTodayDateOnly,
} from "../utils/date";

const Header = ({ title, page }) => {
  const { logout, user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [statusFilter] = useState("approved");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [hoveredNotificationId, setHoveredNotificationId] = useState(null);

  // Ref for the notification dropdown
  const dropdownRef = useRef(null);

  // Inactivity timeout (15 minutes = 15 * 60 * 1000 milliseconds)
  const INACTIVITY_TIMEOUT = 45 * 60 * 1000; // 15 minutes
  let inactivityTimer = null;

  // Polling interval for notifications (30 seconds = 30 * 1000 milliseconds)
  const POLLING_INTERVAL = 30 * 1000; // 30 seconds

  // Toggle dropdown
  const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      let url = `/notifications/web`;
      if (statusFilter !== "All") {
        url += `?status=${statusFilter}`;
      }
      const response = await axiosToken.get(url);
      const newNotifications = response.data.notifications || [];

      // Only update state if the notifications have changed
      if (JSON.stringify(newNotifications) !== JSON.stringify(notifications)) {
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Set up polling for notifications
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [statusFilter]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, []);

  // Function to reset the inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    inactivityTimer = setTimeout(() => {
      handleLogoutDueToInactivity();
    }, INACTIVITY_TIMEOUT);
  };

  // Function to handle logout due to inactivity
  const handleLogoutDueToInactivity = () => {
    logout(true);
  };

  // Handle manual logout
  const handleLogout = () => {
    logout(true);
  };

  // Helper function to view PDF
  const handleViewPdf = (pdf_url) => {
    if (pdf_url) {
      window.open(pdf_url, "_blank");
    }
  };

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Add event listener for mousedown events
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: Remove event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header
        className="position-sticky login-header mb-lg-0 mb-3 z-2"
        style={{ top: "0px" }}
      >
        <div className="logo d-lg-flex align-items-center gap-4 justify-content-between">
          <div className="d-flex align-items-center justify-content-between">
            <div className="sidebar me-lg-5 me-2 ">
              <a href="/dashboard">
                <img
                  src="/images/Logobottomwhite.png"
                  alt="Login Logo"
                  className="img-fluid"
                  style={{ width: "100%", height: "auto" }}
                />

                {/* <img src="/images/logo.png" alt="Logo" style={{ width: "100%", height: "auto" }} /> */}
              </a>
            </div>
          </div>

          <span className="justify-content-lg-start justify-content-center text-capitalize">
            {title || "Test Card Dashboard"}
          </span>

          <div className="d-flex align-items-center">
            {/* Notification Icon + Dropdown */}
            <div className="position-relative me-lg-4 me-2 d-inline-block">
              {page !== "notifications" && page !== "dashboard" && (
                <div
                  className="notification-icon-wrapper"
                  onClick={handleNotificationClick}
                  style={{ cursor: "pointer" }}
                >
                  <img src="/images/noti.svg" alt="Notifications" />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger roudpill">
                    {notifications.length
                      ? notifications.length > 9
                        ? "9+"
                        : notifications.length
                      : ""}
                  </span>
                </div>
              )}

              {/* Conditionally render the dropdown */}
              {showDropdown && page !== "dashboard" && (
                <div
                  className="noti"
                  ref={dropdownRef} // Attach the ref to the dropdown
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: 0,
                    width: "520px",
                    zIndex: 999,
                  }}
                >
                  <div className="card rounded-0">
                    {/* Header */}
                    <div className="card-body border-bottom mb-3 cardbg">
                      <div className="d-flex justify-content-start align-items-center">
                        <span>Notifications</span>
                      </div>
                    </div>
                    {/* Notifications List */}
                    <div
                      className="overflowauto"
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        paddingRight: "8px",
                        fontSize: "14px !important",
                      }}
                    >
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const isActive =
                            activeNotification &&
                            activeNotification.notification_id ===
                              notification.notification_id;
                          const isHovered =
                            hoveredNotificationId ===
                            notification.notification_id;
                          const msgClass =
                            isActive || isHovered ? "msg" : "msg";

                          return (
                            <div
                              key={notification.notification_id}
                              className="card-body py-0 mb-3"
                            >
                              <div
                                className={msgClass}
                                onMouseEnter={() =>
                                  setHoveredNotificationId(
                                    notification.notification_id
                                  )
                                }
                                onMouseLeave={() =>
                                  setHoveredNotificationId(null)
                                }
                              >
                                <div
                                  className="mb-0"
                                  style={{ whiteSpace: "pre-wrap" }}
                                >
                                  <span
                                    className="float-start me-2 text-wrap"
                                    style={{ color: "#000" }}
                                  >
                                    {notification.notification_number}{" "}
                                  </span>
                                  <span
                                    className="float-end"
                                    style={{ color: "#000" }}
                                  >
                                    {notification.end_date
                                      ? formatDateToLocal(notification.end_date)
                                      : ""}
                                  </span>
                                </div>
                                <div className="clearfix" />
                                <p className="mb-2" style={{ color: "#000" }}>
                                  {notification.notification_text}
                                </p>
                                <a
                                  onClick={() =>
                                    setActiveNotification(notification)
                                  }
                                  data-bs-toggle="modal"
                                  data-bs-target="#confirmModalNotification"
                                  href="#"
                                >
                                  Read More
                                </a>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="px-3">No notifications available.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Logout */}
            <div className="d-flex flex-column login-con">
              <div className="d-lg-flex align-items-center mb-1">
                <span className="me-3">
                  Welcome Back
                  {user.firstName ? `, ${user.firstName} ${user.lastName}` : ""}
                </span>
                <div className="d-flex align-items-center gap-3">
                  <Link to={"/dashboard"}>
                    <img src="/images/home.svg" alt="Home" />
                  </Link>
                  <Link to={"/dashboard/profile"}>
                    <img src="/images/user.svg" alt="User Profile" />
                  </Link>
                  <Link onClick={handleLogout}>
                    <img src="/images/login-icon.svg" alt="Logout" />
                  </Link>
                </div>
              </div>
              <p className="m-0 d-flex justify-content-end">
                <span className="me-2">Last Log-in:</span>
                {user.last_login && user.last_login != "N/A"
                  ? formatDateTime(user.last_login || new Date())
                  : formatTodayDateOnly()}{" "}
                EST
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="modal fade" id="confirmModalNotification" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content rounded-0 shadow-xl">
            <div className="modal-header header-color rounded-0">
              <div className="d-lg-flex align-items-center justify-content-center">
                <span className="me-3 font text-white">
                  Notification ID: {activeNotification?.notification_number}
                </span>
              </div>
              <button
                type="button"
                className="btn-close text-white btnclose"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-start align-items-center addbundle mb-2 gap-5">
                  <div className="d-lg-flex justify-content-start align-items-center addbundle gap-3 col-lg-6">
                    <span>Start Date:</span>
                    <span>
                      {activeNotification
                        ? new Date(
                            activeNotification.start_date
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="d-lg-flex justify-content-start align-items-center addbundle gap-3 col-lg-6 float-end">
                    <span>End Date:</span>
                    <span>
                      {activeNotification
                        ? new Date(
                            activeNotification.end_date
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center addbundle mb-2">
                  <textarea
                    rows="4"
                    className="form-control formcontrol formcon w-100 mw-100"
                    readOnly
                    disabled
                    defaultValue={activeNotification?.notification_text}
                  />
                </div>
                {activeNotification?.pdf_url && (
                  <a
                    className="pdfviewr"
                    onClick={() => handleViewPdf(activeNotification.pdf_url)}
                    href="#"
                  >
                    View Notification PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
