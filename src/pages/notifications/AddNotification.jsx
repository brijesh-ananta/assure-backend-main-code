import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";

function AddNotification() {
  const [headerTitle] = useState("Manage Notification");
  const [form, setForm] = useState({
    userType: "web",
    startDate: "",
    endDate: "",
    notificationText: "",
    file: null,
  });
  const {user} = useAuth()
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // Generic change handler for text, date, and radio inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Separate change handler for file input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      alert("Please select a PDF file.");
      e.target.value = null; // Reset the input
      setForm((prev) => ({ ...prev, file: null }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      file: selectedFile,
    }));
  };

  // Simple form validation function
  const validate = () => {
    const newErrors = {};
    if (!form.startDate) newErrors.startDate = "Start date is required.";
    if (!form.endDate) newErrors.endDate = "End date is required.";
    if (!form.notificationText)
      newErrors.notificationText = "Notification text is required.";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.date = "Start date should be before end date.";
    }
    return newErrors;
  };

  // Helper function to post the notification with the given status
  const postNotification = async (status) => {
    const formData = new FormData();
    formData.append("userType", form.userType);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);
    formData.append("notificationText", form.notificationText);
    formData.append("status", status);
    if (form.file) {
      formData.append("file", form.file);
    }

    try {
      if (status === "Draft") {
        setLoadingDraft(true);
      } else {
        setLoading(true);
      }
      const response = await axiosToken.post("/notifications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(
        `Notification ${response.data.notification_number} successfully posted as ${response.data.status}`
      );
      window.location.href = "/dashboard/manage-notifications";
    } catch (error) {
      console.error(`Error saving notification as ${status}:`, error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert(error.message || "An error occurred.");
      }
    } finally {
      if (status === "Draft") {
        setLoadingDraft(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Handler for the Save Draft button – no validation here
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    postNotification("Draft");
  };

  // Handler for the Submit button – runs validation before submitting
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join("\n");
      alert(errorMessages);
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    postNotification("Submitted");
  };

  useEffect(() => {
    if (loading || loadingDraft) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [loading, loadingDraft]);
  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      {/* Notification Type Section */}
      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <span></span>
            <div className="d-lg-flex formcard">
              <span className="me-3 font">Interface</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  value="web"
                  checked={form.userType === "web"}
                  onChange={handleChange}
                  id="flexRadioDefault1"
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
                  checked={form.userType === "mobile"}
                  onChange={handleChange}
                  id="flexRadioDefault2"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  Mobile
                </label>
              </div>
            </div>
            <div className=""></div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <section className="notification pb-5">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="login-page mb-lg-4 mb-2 row g-3">
              <div className="col-12 col-lg-4">
                <div className="d-lg-flex align-items-center">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control formcontrol"
                    value={form.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="d-lg-flex align-items-center">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control formcontrol"
                    value={form.endDate}
                    onChange={handleChange}
                    min={form.startDate}
                  />
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="d-lg-flex align-items-center justify-content-end">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                    Status
                  </label>
                  <span className="btn btncolor btnyellow border-yellow">
                    New
                  </span>
                </div>
                {errors.date && <p className="text-danger">{errors.date}</p>}
              </div>

              <div className="col-12 col-lg-12">
                <div className="d-lg-flex align-items-center">
                  <textarea
                    placeholder="Short notification text."
                    name="notificationText"
                    className="form-control formcontrol h300 mb-3"
                    value={form.notificationText}
                    onChange={handleChange}
                  ></textarea>
                </div>
                {form.userType === "web" && (
                  <div className="file-upload-section">
                    <label
                      htmlFor="notificationFile"
                      className="form-check-label fw-bold mb-2 d-block"
                    >
                      Upload Notification PDF
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        id="notificationFile"
                        name="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="form-control formcontrol"
                      />
                    </div>
                    {form.file && (
                      <p className="mt-2">
                        Selected file: <strong>{form.file.name}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* userRole must be 1` */}
            {user.role === 1 && (
            <div className="btn-section text-lg-center d-lg-flex gap-3 justify-content-center">
              <button
                type="button"
                className="btn-add btn-gray mb-lg-0 mb-3"
                onClick={handleSaveDraft}
                disabled={loadingDraft}
              >
                {loadingDraft && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                Save Draft
              </button>
              <button type="submit" className="btn-add" disabled={loading}>
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                Submit
              </button>
            </div>
            )}
          </form>
        </div>
      </section>

      {/* Sidebar and Footer */}
      <Sidebar />
      <Footer />
    </>
  );
}

export default AddNotification;