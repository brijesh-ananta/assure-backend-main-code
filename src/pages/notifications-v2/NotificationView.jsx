import React, { useState } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import { useLocation } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";

function NotificationView() {
  const [headerTitle] = useState("Manage Notifications");
  const { state } = useLocation();
  const { notice } = state;
  const { userRole } = useAuth();
  // loading
  const [loading, setLoading] = useState(false);

  // Editable fields: action selection, reject reason, notification text, and PDF
  const [selectedAction, setSelectedAction] = useState(
    notice.status === "returned"
      ? "returned"
      : notice.status === "approved"
      ? "approved"
      : notice.status === "draft"
      ? "draft"
      : notice.status === "deleted"
      ? "deleted"
      : notice.status === "submitted"
      ? "submitted"
      : ""
  );
  const [rejectReason, setRejectReason] = useState(notice.reject_reason || "");
  const [notificationText, setNotificationText] = useState(notice.notification_text || "");
  const [pdfFile, setPdfFile] = useState(null);

  // Determine if the notification is editable (not approved or expired)
  const isEditable = !["approved", "expired", "deleted"].includes(notice.status);

  const handleCancel = () => {
    window.history.back();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      e.target.value = null;
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async () => {
    if (!isEditable) {
      alert("This notification cannot be updated or deleted.");
      return;
    }

    if (!selectedAction) {
      alert("Please select an action (Draft, Submitted, Approve, Reject, or Delete).");
      return;
    }
    if (selectedAction === "returned" && !rejectReason.trim()) {
      alert("Reject reason is mandatory!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("status", selectedAction);
      formData.append("reject_reason", selectedAction === "returned" ? rejectReason : "");
      formData.append("notification_text", notificationText);
      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      const response = await axiosToken.put(
        `/notifications/${notice.notification_id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      alert(response.data.message);
      window.location.href = "/dashboard/manage-notifications";
    } catch (error) {
      console.error("Error updating notification:", error);
      alert(
        error.response?.data?.error ||
          error.message ||
          "An error occurred while updating the notification."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to format ISO dates into a readable format
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <>
      <Header title={headerTitle} />

      {/* Notification Type Section */}
      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <span></span>
            <div className="d-lg-flex formcard">
              <span className="me-3 font">Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  value="web"
                  checked={notice.type === "web"}
                  id="flexRadioDefault1"
                  disabled
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Web
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  value="mobile"
                  checked={notice.type === "mobile"}
                  id="flexRadioDefault2"
                  disabled
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
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
          <div className="container">
            {/* Row 1: Notification ID and Start Date */}
            <div className="row align-items-center mb-3">
              <div className="col-md-2 fw-bold">Notification ID:</div>
              <div className="col-md-4">{notice.notification_number}</div>
              <div className="col-md-2 fw-bold">Start Date:</div>
              <div className="col-md-4">{formatDate(notice.start_date)}</div>
            </div>

            {/* Row 2: End Date and Status */}
            <div className="row align-items-center mb-3">
              <div className="col-md-2 fw-bold">End Date:</div>
              <div className="col-md-4">{formatDate(notice.end_date)}</div>
              <div className="col-md-2 fw-bold">Status:</div>
              <div className="col-md-4">{notice.status}</div>
            </div>

            {/* Row 3: Notification Text */}
            <div className="row mb-3">
              <div className="col-md-2 fw-bold">Notification Text:</div>
              <div className="col-md-10 text-wrap">
                <textarea
                  className="form-control"
                  rows="5"
                  readOnly={!isEditable}
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  placeholder="Enter notification text"
                ></textarea>
              </div>
            </div>

            {/* Row 4: Notification PDF */}
            <div className="row mb-3">
              <div className="col-md-2 fw-bold">Notification PDF:</div>
              <div className="col-md-10">
                {isEditable ? (
                  <div className="file-upload-section">
                    <input
                      type="file"
                      id="notificationFile"
                      name="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="form-control formcontrol mb-2"
                    />
                    {pdfFile && (
                      <p className="mb-2">
                        Selected file: <strong>{pdfFile.name}</strong>
                      </p>
                    )}
                    {notice.pdf_url && !pdfFile && (
                      <p>
                        Current PDF:{" "}
                        <a
                          href={notice.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-link p-0"
                        >
                          View Current PDF
                        </a>
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {notice.pdf_url ? (
                      <a
                        href={notice.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-link p-0"
                      >
                        View Notification PDF
                      </a>
                    ) : (
                      "No PDF Available"
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Row 5: Action Selection (Editable only for non-approved/expired) */}
            {isEditable && (
              <div className="row formcard mb-3">
                <div className="col-md-2 fw-bold">Action:</div>
                <div className="col-md-10 d-flex gap-3 align-items-center flex-wrap">
                  {/* Draft */}
                  <div className="form-check d-flex gap-2 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="action"
                      id="draftRadio"
                      value="draft"
                      checked={selectedAction === "draft"}
                      onChange={(e) => setSelectedAction(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="draftRadio">
                      Draft
                    </label>
                  </div>
                  {/* Submitted */}
                  <div className="form-check d-flex gap-2 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="action"
                      id="submittedRadio"
                      value="submitted"
                      checked={selectedAction === "submitted"}
                      onChange={(e) => setSelectedAction(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="submittedRadio">
                      Submitted
                    </label>
                  </div>
                  {/* Approved */}
                  {/* userRole must be 4 */}
                  {userRole === 4 && (
                  <div className="form-check d-flex gap-2 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="action"
                      id="approveRadio"
                      value="approved"
                      checked={selectedAction === "approved"}
                      // disable if userRole is not 4
                      disabled={userRole !== 4}

                      onChange={(e) => setSelectedAction(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="approveRadio">
                      Approve
                    </label>
                  </div>
                  )}
                  {/* Rejected */}
                  {/* userRole must be 4 */}
                  {userRole === 4 && (
                  <div className="form-check d-flex gap-2 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="action"
                      id="returnRadio"
                      value="returned"
                      checked={selectedAction === "returned"}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      // disable if userRole is not 4
                      disabled={userRole !== 4}
                    />
                    <label className="form-check-label" htmlFor="returnRadio">
                      Reject (Return)
                    </label>
                  </div>
                  )}
                  {/* Delete */}
                  {/* userRole must be 4 */}
                  {userRole === 4 && (
                  <div className="form-check d-flex gap-2 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="action"
                      id="deleteRadio"
                      value="deleted"
                      checked={selectedAction === "deleted"}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      // disable if userRole is not 4
                      disabled={userRole !== 4}
                    />
                    <label className="form-check-label" htmlFor="deleteRadio">
                      Delete
                    </label>
                      
                  </div>
                  )}
                </div>
              </div>
            )}

            {/* Row 6: Reject Reason (Editable only for returned selection and editable status) */}
            {isEditable && selectedAction === "returned" && (
              <div className="row mb-3">
                <div className="col-md-2 fw-bold">Reject Reason:</div>
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Comment is mandatory for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Row 7: Save and Back Buttons */}
            <div className="row mb-3">
              <div className="col-md-2"></div>
              <div className="col-md-10 d-flex gap-3 justify-content-end">
                {isEditable && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-add btn-success"
                    disabled={loading}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    Save
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-add btn-gray btn btn-secondary"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer
        audit={true}
        tableName="notifications"
        recordId={notice.notification_id}
      />
    </>
  );
}

export default NotificationView;