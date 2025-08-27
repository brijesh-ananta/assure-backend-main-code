import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import apiService from "../../services";
import CustomFileUpload from "../../components/shared/form-fields/CustomFileUpload";
import { toast } from "react-toastify";
import { dateToMMDDYYYY } from "../maintain-card-stock/AddCard";
function NotificationView() {
  const { id } = useParams();
  const { userRole } = useAuth();
  const params = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State for edit mode

  // States for form fields that are always managed by component state
  const [selectedAction, setSelectedAction] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [shortTitle, setShortTitle] = useState("");
  const [startDate, setStartDate] = useState(""); // State for start date (YYYY-MM-DD)
  const [endDate, setEndDate] = useState(""); // State for end date (YYYY-MM-DD)
  const [notificationType, setNotificationType] = useState(""); // State for notification type (web/mobile)
  const [history, setHistory] = useState([]);

  // Determine if the notification status allows content creators to modify it.
  // Approved, Expired, and Deleted notifications are generally uneditable by content creators.
  const isUpdatableStatusForContentCreator = useMemo(
    () => !["approved", "expired", "deleted"].includes(data.status),
    [data.status]
  );

  // areFieldsEditable controls if inputs are enabled for content creators.
  // For content creators (userRole !== 4), this depends on `isEditing` and `isUpdatableStatusForContentCreator`.
  // For approvers (userRole === 4), the main content fields are never editable here.
  const areFieldsEditable = useMemo(() => {
    if (userRole === 4) {
      return false; // Approvers do not edit the main content fields via 'Edit' mode
    }
    return isUpdatableStatusForContentCreator && isEditing;
  }, [userRole, isUpdatableStatusForContentCreator, isEditing]);

  const handleCancel = (e) => {
    if (isEditing) {
      // If exiting edit mode (Cancel Edit was clicked), revert to original data
      getDataById();
      setPdfFile(null); // Clear selected PDF when canceling edit
    }
    setIsEditing(!isEditing);
    e.preventDefault();

    navigate("/dashboard/manage-notifications");
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If exiting edit mode (Cancel Edit was clicked), revert to original data
      getDataById();
      setPdfFile(null); // Clear selected PDF when canceling edit
    }
    setIsEditing(!isEditing);
  };

  // replace your current handleFileChange with this
  const handleFileChange = (...args) => {
    let file = null;

    if (args.length === 1) {
      const input = args[0];
      if (input && input.target && input.target.files) {
        file = input.target.files[0];
      } else {
        file = input;
      }
    } else if (args.length >= 2) {
      file = args[1];
    }

    if (!file) {
      setPdfFile(null);
      return;
    }

    console.log("file---->", file);

    if (file && file.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

  const handleAction = async (status) => {
    setSelectedAction(status); // Set the selected action first
    // If the action is 'returned' and reason is empty, prompt user
    if (status === "returned" && userRole === 4 && !rejectReason.trim()) {
      toast.error("Reject reason is mandatory!");
      return;
    }
    // Directly call handleSubmit with the status
    await handleSubmit(status);
  };

  const handleSubmit = async (statusOverride) => {
    const statusToUse = statusOverride || selectedAction;

    // Validation for content creators attempting actions on un-updatable statuses
    // 'deleted' is an exception because they can delete drafts/submitted, even if "not updateable".
    if (
      userRole !== 4 &&
      !isUpdatableStatusForContentCreator &&
      statusToUse !== "deleted"
    ) {
      toast.error(
        "This notification cannot be updated (approved, expired statuses are final)."
      );
      return;
    }

    // General validation for selected action (should always be present for a submit)
    if (!statusToUse) {
      toast.error("Please select an action or try again.");
      return;
    }

    // Role 4 (Approver) specific validations for their actions
    if (userRole === 4) {
      if (
        !["approved", "deleted", "returned", "expired"].includes(statusToUse)
      ) {
        toast.error("Please select approved, delete, returned, or expire.");
        return;
      }
      if (statusToUse === "returned" && !rejectReason.trim()) {
        toast.error("Reject reason is mandatory!");
        return;
      }
    }

    // Basic validation for content creator's editable fields when saving/saving draft/submitting
    // This applies to non-approver roles when `isEditing` is true
    if (
      userRole !== 4 &&
      isEditing &&
      (statusToUse === "submitted" || statusToUse === "draft")
    ) {
      if (!notificationText.trim() || !shortTitle.trim()) {
        toast.error("Short Title and Notification Text are mandatory.");
        return;
      }
      if (!startDate || !endDate) {
        toast.error("Start Date and End Date are mandatory.");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error("Start Date cannot be after End Date.");
        return;
      }
      if (!notificationType) {
        toast.error("Notification Type (Web/Mobile) is mandatory.");
        return;
      }
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("status", statusToUse);

      // Always append reject_reason if it's 'returned', regardless of role
      formData.append(
        "reject_reason",
        statusToUse === "returned" ? rejectReason : ""
      );

      // ************* CRITICAL CHANGE HERE *************
      // For content creators, always send the current state of content fields
      // when they perform any action (save, draft, delete).
      // For approvers, we typically only send status and reject_reason.
      if (userRole !== 4) {
        formData.append("notification_text", notificationText);
        formData.append("short_title", shortTitle);
        formData.append("start_date", startDate);
        formData.append("end_date", endDate);
        formData.append("type", notificationType);

        // Only append file if a new one is selected
        if (pdfFile) {
          formData.append("file", pdfFile);
        }
        // If pdfFile is null, it means no new file was selected,
        // so the backend should retain the existing one if data.pdf_url exists.
        // No need to explicitly send `null` or a placeholder for an existing file.
      }

      const response = await axiosToken.put(
        `/notifications/${data.notification_id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.message);
      getDataById(); // Re-fetch data to reflect changes
      setPdfFile(null); // Clear selected PDF after successful submission
      setIsEditing(false); // Exit edit mode after saving (for content creators)

      // Navigate away after a short delay for approvers
      setTimeout(() => {
        if (userRole == 4) {
          navigate("/dashboard/manage-notifications");
        }
      }, 100);
    } catch (error) {
      console.error("Error updating notification:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "An error occurred while updating the notification."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to format ISO dates into a readable format for display
  // Use UTC to avoid timezone shifts and return YYYY-MM-DD for input[type=date]
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // YYYY-MM-DD for input[type=date]
  };

  // Display-friendly format (MM/DD/YYYY) — also using UTC to avoid shifts
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  };

  const getDataById = useCallback(async () => {
    try {
      const resp = await apiService.notification.getById(id);

      const response = resp.notification;
      console.log("response------------->", response);
      setData(response);
      // Initialize states with fetched data
      setRejectReason(response?.reject_reason || "");
      setNotificationText(response?.notification_text || "");
      setShortTitle(response?.short_title || "");
      setStartDate(formatDateForInput(response?.start_date));
      setEndDate(formatDateForInput(response?.end_date));
      setNotificationType(response?.type || ""); // Set notification type
      setHistory(response?.history || []);

      setSelectedAction(response.status); // Initialize selectedAction with current status for consistency
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notification data.");
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      getDataById();
    }
  }, [getDataById, id]);

  useEffect(() => {
    const profileId = data.notification_id;
    if (profileId) {
      params.set("recordId", profileId);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [data.id, data.notification_id]);
  console.log("data", data);
  return (
    <>
      {/* Notification Type Section */}
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container">
          <div className="d-lg-flex align-items-start justify-content-start w-100">
            <span></span>
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="notificationType"
                  value="web"
                  checked={notificationType === "web"}
                  onChange={(e) => setNotificationType(e.target.value)}
                  id="notificationTypeWeb"
                  disabled={!areFieldsEditable} // Enable/disable based on edit mode
                />
                <label
                  className="form-check-label"
                  htmlFor="notificationTypeWeb"
                >
                  Web
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="notificationType"
                  value="mobile"
                  checked={notificationType === "mobile"}
                  onChange={(e) => setNotificationType(e.target.value)}
                  id="notificationTypeMobile"
                  disabled={!areFieldsEditable} // Enable/disable based on edit mode
                />
                <label
                  className="form-check-label"
                  htmlFor="notificationTypeMobile"
                >
                  Mobile
                </label>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      <section>
        <div className="notification-section mb-lg-0 mb-3 py-lg-3 py-2 mt-3">
          <div className="container form-field-wrapper">
            {/* Row 1: Notification ID and Status */}
            <div className="row mb-3 align-items-center">
              <div className="col-md-3 col-lg-2 text-md-end font">
                Notification ID:
              </div>
              <div className="col-md-3 col-lg-4">
                {data.notification_number}
              </div>
              <div className="col-md-3 col-lg-2 text-md-end font">Status:</div>
              <div className="col-md-3 col-lg-4">{data.status}</div>
            </div>

            {/* Row 2: Start Date, End Date */}
            <div className="row mb-3 align-items-center">
              <div className="col-md-3 col-lg-2 text-md-end font">
                Start Date:
              </div>
              <div className="col-md-3 col-lg-4">
                {areFieldsEditable ? (
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Start Date"
                  />
                ) : (
                  <p className="form-control-plaintext">
                    {formatDateDisplay(data.start_date)}
                  </p>
                )}
              </div>

              <div className="col-md-3 col-lg-2 text-md-end font">
                End Date:
              </div>
              <div className="col-md-3 col-lg-4">
                {areFieldsEditable ? (
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="End Date"
                    min={startDate}
                  />
                ) : (
                  <p className="form-control-plaintext">
                    {formatDateDisplay(data.end_date)}
                  </p>
                )}
              </div>
            </div>

            {/* Short Title */}
            <div className="row mb-3">
              <div className="col-12c">
                <input
                  type="text"
                  className="form-control formcontrol"
                  placeholder="Short Title (max 55 characters)"
                  maxLength={55}
                  value={shortTitle}
                  onChange={(e) => setShortTitle(e.target.value)}
                  readOnly={!areFieldsEditable}
                  aria-label="Short Title"
                />
              </div>
            </div>

            {/* Notification Text */}
            <div className="row mb-3">
              <div className="col-12">
                <textarea
                  className="form-control formcontrol"
                  rows="5"
                  readOnly={!areFieldsEditable}
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  placeholder="Enter notification text"
                  aria-label="Notification Text"
                ></textarea>
              </div>
            </div>

            {/* Notification PDF */}
            <div className="row mb-3">
              <div className="col-md-12">
                {notificationType === "web" ? ( // Check notificationType state for conditional rendering
                  <>
                    {areFieldsEditable && userRole === 1 ? (
                      <div className="file-upload-section">
                        <CustomFileUpload
                          name="file"
                          onChange={handleFileChange}
                          className="w-25 mt-2 no-wrap p-2"
                          accept="application/pdf"
                          buttonText="Upload Notification PDF"
                        />
                        {pdfFile && (
                          <p className="mb-2">
                            Selected file: <strong>{pdfFile.name}</strong>
                          </p>
                        )}
                        {/* Show current PDF only if no new file selected AND there was a previous PDF */}
                        {data.pdf_url && !pdfFile && (
                          <p className="mt-4 font">
                            Current PDF:
                            <a
                              href={data.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-link p-"
                            >
                              View Current PDF
                            </a>
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {data.pdf_url ? (
                          <a
                            href={data.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-link p-0 py-1"
                          >
                            View Notification PDF
                          </a>
                        ) : (
                          "No PDF Available"
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* Action Buttons Section */}
            {(userRole !== 4 && isUpdatableStatusForContentCreator) ||
            userRole === 4 ? (
              <div className="row formcard mb-3 justify-content-end">
                <div className="col-md-12 d-flex gap-3 align-items-center justify-content-end flex-wrap">
                  <button
                    type="button"
                    className="btn btn-add btn-gray"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                  {userRole === 4 ? ( // Approver actions
                    <>
                      <button
                        type="button"
                        className="btn btn-add"
                        style={{ backgroundColor: "#fee599" }}
                        onClick={() => handleAction("expired")}
                        disabled={loading}
                      >
                        Expire
                      </button>
                      <button
                        type="button"
                        className="btn btn-warning btn-add"
                        style={{ backgroundColor: "#d9958f" }}
                        onClick={() => handleAction("returned")}
                        disabled={loading}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-add"
                        onClick={() => handleAction("approved")}
                        disabled={loading}
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    // Regular user actions (Edit/Save/Delete/Draft based on `isEditing`)
                    <>
                      {/* Show Edit button only if not in editing mode and status is updatable for content creator */}
                      {!isEditing && isUpdatableStatusForContentCreator && (
                        <button
                          type="button"
                          onClick={handleEditToggle}
                          className="btn save-btn w-150p"
                        >
                          Edit
                        </button>
                      )}

                      {/* Show Save/Delete/Save Draft/Cancel Edit buttons only if in editing mode */}
                      {isEditing && isUpdatableStatusForContentCreator && (
                        <>
                          {/* <button
                            type="button"
                            onClick={handleEditToggle} // This acts as "Cancel Edit" button
                            className="btn btn-secondary w-150p"
                          >
                            Cancel Edit
                          </button> */}
                          <button
                            type="button"
                            onClick={() => handleAction("deleted")}
                            className="btn w-150p"
                            style={{ backgroundColor: "#d9958f" }}
                            disabled={loading}
                          >
                            {loading && (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            )}
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction("draft")}
                            className="btn w-150p"
                            style={{ backgroundColor: "#b7dde8" }}
                            disabled={loading}
                          >
                            {loading && (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            )}
                            Save Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAction("Submitted");
                              setTimeout(() => handleSubmit("Submitted"), 0);
                            }}
                            className="btn save-btn w-150p"
                            disabled={loading}
                          >
                            {loading && (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            )}
                            Submit
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              // If status is not updatable for content creators, and it's not an approver,
              // and it's not a deletable status, then perhaps no action buttons are shown.
              // For example, if user is not role 4 and status is 'approved' or 'expired',
              // only the 'Cancel' (back to list) button would make sense if not handled above.
              userRole !== 4 &&
              (!isUpdatableStatusForContentCreator ||
                data.status === "deleted" ||
                data.status === "expired" ||
                data.status === "approved") && (
                <div className="row formcard mb-3 justify-content-end">
                  <div className="col-md-12 d-flex gap-3 align-items-center justify-content-end flex-wrap">
                    <button
                      type="button"
                      className="btn btn-add btn-gray"
                      onClick={handleCancel}
                    >
                      Back to List
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Reject Reason (only visible if user is approver AND action is 'returned' or if data.status is 'returned') */}
            {userRole === 4 &&
              (selectedAction === "returned" || data.status === "returned") && (
                <div className="row mb-3">
                  <div className="col-md-2 fw-bold">Reject Reason:</div>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Comment is mandatory for rejection"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      readOnly={false} // Approvers can always edit their reject reason here.
                    />
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Notification History Section */}
      {history.length > 0 && (
        <div className="container mt-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: 16,
                  background: "#fafbfc",
                }}
              >
                <h5 className="mb-3">Notification History</h5>
                {history.map((item, idx) => (
                  <div key={item.id} className="mb-2">
                    <span style={{ fontWeight: 500 }}>{idx + 1}.</span>{" "}
                    {item.comment_date_time
                      ? new Date(item.comment_date_time).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          }
                        )
                      : "-"}{" "}
                    {item.commented_by ? item.commented_by : ""} -{" "}
                    {item.comment_text || (
                      <span className="text-muted">No comment</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationView;
