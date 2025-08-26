import { useState, useEffect, useRef, useCallback } from "react";
import axiosToken from "../utils/axiosToken";

function Notifications() {
  const [activeNotification, setActiveNotification] = useState(null);
  const [hoveredNotificationId, setHoveredNotificationId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [statusFilter] = useState("approved");
  const [isLoading, setIsLoading] = useState(true); // Set initial loading to true for first fetch
  const [page, setPage] = useState(1); // Current page number for pagination
  const [hasMore, setHasMore] = useState(true); // Indicates if there are more notifications to load from backend
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Loading state for subsequent fetches (API or local repeat)
  const [allUniqueNotifications, setAllUniqueNotifications] = useState([]); // Stores all unique notifications fetched from the backend

  const observer = useRef(); // Ref for the IntersectionObserver
  // Ref for the last element in the list to observe for infinite scrolling
  const lastNotificationElementRef = useCallback(
    (node) => {
      if (isFetchingMore) return; // Don't observe if already fetching
      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if (hasMore) {
              // If there's still unique data to fetch from the backend
              setPage((prevPage) => prevPage + 1); // Increment page to load more unique notifications
            } else if (allUniqueNotifications.length > 3) {
              // If all unique data has been fetched, and we have unique notifications to repeat
              setIsFetchingMore(true); // Indicate loading for local append
              // Simulate a small delay for the "loading more" effect before appending
              setTimeout(() => {
                setNotifications((prevNotifications) => [
                  ...prevNotifications,
                  ...allUniqueNotifications,
                ]);
                setIsFetchingMore(false); // Done loading
              }, 300); // Small delay for visual effect
            }
          }
        },
        {
          root: null, // viewport
          rootMargin: "0px", // no margin
          threshold: 0.1, // trigger when 10% of the target is visible
        }
      );

      if (node) observer.current.observe(node); // Observe the node
    },
    [isFetchingMore, hasMore, allUniqueNotifications]
  ); // Dependencies for useCallback

  const fetchNotifications = useCallback(async () => {
    // Determine which loading state to use (initial or fetching more from API)
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const limit = 10; // Number of notifications per page
      let url = `/notifications/web?page=${page}&limit=${limit}`;
      if (statusFilter !== "All") {
        url += `&status=${statusFilter}`;
      }
      const response = await axiosToken.get(url);
      console.log("response", response);

      const notificationsData = Array.isArray(response.data.notifications)
        ? response.data.notifications
        : response.data || [];

      setNotifications((prevNotifications) => {
        // Filter out duplicates based on notification_id to ensure unique display initially
        const newNotifications = notificationsData.filter(
          (newNoti) =>
            !prevNotifications.some(
              (existingNoti) =>
                existingNoti.notification_id === newNoti.notification_id
            )
        );
        return [...prevNotifications, ...newNotifications];
      });

      // Check if there are more notifications to load from the backend
      const hasMoreFromBackend = notificationsData.length === limit;
      setHasMore(hasMoreFromBackend);

      // If this is the last page from the backend, store all unique notifications
      // This ensures all unique notifications are captured only once for repetition
      if (!hasMoreFromBackend && notificationsData.length > 0) {
        setAllUniqueNotifications((prevUnique) => {
          const combinedUnique = [...prevUnique];
          notificationsData.forEach((newNoti) => {
            if (
              !combinedUnique.some(
                (existingNoti) =>
                  existingNoti.notification_id === newNoti.notification_id
              )
            ) {
              combinedUnique.push(newNoti);
            }
          });
          return combinedUnique;
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // If error occurs during initial load, set to empty array
      if (page === 1) {
        setNotifications([]);
      }
      setHasMore(false); // No more data from backend if there's an error
    } finally {
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsFetchingMore(false);
      }
    }
  }, [page, statusFilter]); // Dependencies for useCallback

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // Re-fetch when fetchNotifications changes (due to page or statusFilter change)

  const handleViewPdf = (pdf_url) => {
    if (pdf_url) {
      window.open(pdf_url, "_blank");
    }
  };

  // mm/dd/yyyy format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  return (
    <>
      <div className="col-lg-5">
        <div className="noti">
          <div
            className="card rounded-2 border-0"
            style={{ background: "#F9F9F9" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-start align-items-center">
                <span>Notifications</span>
                <div
                  className="notification-icon-wrapper"
                  style={{ cursor: "not-allowed" }}
                >
                  <img src="/images/noti.svg" alt="Notifications" />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger roudpill">
                    {allUniqueNotifications.length
                      ? allUniqueNotifications.length > 9
                        ? "9+"
                        : allUniqueNotifications.length
                      : ""}
                  </span>
                </div>
              </div>
            </div>
            <div
              className="overflowauto"
              style={{
                position: "relative",
                minHeight: "100px",
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {" "}
              {/* Added maxHeight and overflowY */}
              {isLoading && page === 1 && notifications.length === 0 ? ( // Show initial loading spinner only for the very first page load
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification, index) => {
                  const isActive =
                    activeNotification?.notification_id ===
                    notification.notification_id;
                  const isHovered =
                    hoveredNotificationId === notification.notification_id;
                  const msgClass = isActive || isHovered ? "msg" : "msg";

                  // Attach ref to the last notification element for infinite scrolling
                  // This ref will trigger loading more data (either from API or repeating local data)
                  const isLastNotification = notifications.length === index + 1;

                  return (
                    <div
                      ref={
                        isLastNotification ? lastNotificationElementRef : null
                      }
                      key={`${notification.notification_id}-${index}`} // Unique key for repeated items
                      className="card-body py-0 mb-3"
                    >
                      <div
                        className={msgClass}
                        onMouseEnter={() =>
                          setHoveredNotificationId(notification.notification_id)
                        }
                        onMouseLeave={() => setHoveredNotificationId(null)}
                      >
                        <p>
                          <span className="float-start me-2 fw-bold">
                            {notification.notification_number}{" "}
                          </span>
                          <span className="float-end">
                            End Date &nbsp;
                            {formatDate(notification.end_date)}
                          </span>
                        </p>
                        <p className="mb-2">
                          <span>{notification.notification_text}</span>
                        </p>
                        <a
                          onClick={() => setActiveNotification(notification)}
                          data-bs-toggle="modal"
                          data-bs-target="#confirmModal"
                          href="#"
                        >
                          Read More
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Only show "No notifications" if not loading and no notifications are present
                !isLoading &&
                !isFetchingMore && (
                  <p className="font d-flex align-items-center justify-content-center">
                    No notifications available.
                  </p>
                )
              )}
              {isFetchingMore && ( // Show loading spinner for fetching more data (API or local repeat)
                <div className="loading-spinner-bottom">
                  <div className="spinner-small"></div>
                  <p>Loading more...</p>
                </div>
              )}
              {/* Removed "You've reached the end of the list." message for infinite feel */}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      <div className="modal fade" id="confirmModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-md">
            <div className="modal-header rounded-0 border-0">
              <div className="d-lg-flex align-items-center justify-content-center">
                <span className="me-3 font text-dark">
                  <i>
                    Notification ID: {activeNotification?.notification_number}
                  </i>
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
                <div className="d-flex justify-content-start align-items-center addbundle mb-3 gap-5">
                  <div className="d-lg-flex justify-content-start align-items-center addbundle gap-3 col-lg-6">
                    <span>
                      <i>Start Date:</i>
                    </span>
                    <span>
                      <i>{formatDate(activeNotification?.start_date)}</i>
                    </span>
                  </div>
                  <div className="d-lg-flex justify-content-start align-items-center addbundle gap-3 col-lg-6 float-end">
                    <span>
                      <i>End Date:</i>
                    </span>
                    <span>
                      <i>{formatDate(activeNotification?.end_date)}</i>
                    </span>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center addbundle addundle2 mb-2">
                  <textarea
                    rows="10"
                    className="form-control formcontrol formcon bg-white w-100 mw-100"
                    readOnly
                    disabled
                    value={activeNotification?.notification_text || ""}
                  />
                </div>
                {activeNotification?.pdf_url && (
                  <a
                    className="pdfviewr"
                    onClick={() => handleViewPdf(activeNotification.pdf_url)}
                    href="#"
                  >
                    <i>View Notification PDF</i>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline CSS for the loading spinner */}
      <style>{`
        .loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-spinner-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
        }
        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default Notifications;
