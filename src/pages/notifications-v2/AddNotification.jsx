import { useState, useEffect } from "react";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import CustomFileUpload from "../../components/shared/form-fields/CustomFileUpload";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AddNotification() {
  const [form, setForm] = useState({
    userType: "web",
    startDate: "",
    endDate: "",
    short_title: "",
    notificationText: "",
    file: null,
  });
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState("submitted");

  // Generic change handler for text, date, and radio inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Separate change handler for file input
  const handleFileChange = (name, e) => {
    const selectedFile = e;

    if (selectedFile && selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
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
    if (!form.short_title) newErrors.short_title = "Short title is required.";
    if (form.short_title && form.short_title.length > 55)
      newErrors.short_title = "Short title must be at most 55 characters.";
    if (!form.notificationText)
      newErrors.notificationText = "Notification text is required.";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.date = "Start date should be before end date.";
    }
    return newErrors;
  };

  const postNotification = async (apiPath) => {
    const formData = new FormData();
    formData.append("userType", form.userType);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);
    formData.append("short_title", form.short_title);
    formData.append("notificationText", form.notificationText);
    if (form.file) {
      formData.append("file", form.file);
    }
    try {
      setLoading(true);
      const response = await axiosToken.post(apiPath, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        `Notification ${response.data.notification_number || ""} successfully posted.`
      );
      navigate("/dashboard/manage-notifications");
    } catch (error) {
      console.error(`Error saving notification:`, error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for the Draft button
  const handleDraft = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join("\n");
      toast.error(errorMessages);
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    postNotification("/notifications/draft-nortification");
  };

  // Handler for the Submit button
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join("\n");
      toast.error(errorMessages);
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    postNotification("/notifications/submit-nortification");
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
      {/* Notification Type Section */}
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Type</span>
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
          <form onSubmit={handleSubmit} className="form-field-wrapper">
            <div className="row col-12 mb-3">
              <div className="col-md-2 font">Notification ID:</div>
              <div className="col-md-4 font">New</div>
            </div>

            <div className="login-page mb-lg-4 mb-2 row g-3 mt-4">
              <div className="col-12 row">
                <div className="col-12 col-lg-5 row align-items-center">
                  <label className="col-4 form-check-label font">
                    Start Date
                  </label>
                  <div className="col-7">
                    <input
                      type="date"
                      name="startDate"
                      className="form-control formcontrol"
                      value={form.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.startDate && (
                      <p className="text-danger">{errors.startDate}</p>
                    )}
                  </div>
                </div>

                <div className="col-12 col-lg-5 row align-items-center">
                  <label className="col-4 form-check-label font">
                    End Date
                  </label>
                  <div className="col-7">
                    <input
                      type="date"
                      name="endDate"
                      className="form-control formcontrol"
                      value={form.endDate}
                      onChange={handleChange}
                      min={form.startDate}
                    />
                    {errors.endDate && (
                      <p className="text-danger">{errors.endDate}</p>
                    )}
                    {errors.date && (
                      <p className="text-danger">{errors.date}</p>
                    )}
                  </div>
                </div>

                <div className="col-12 col-lg-2 row">
                  <div className="d-lg-flex align-items-center justify-content-end">
                    <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                      Status :
                    </label>
                    <span className=" ">New</span>
                  </div>
                </div>
              </div>

              <div className="row align-items-center mb-3 mt-4">
                <div className="col-12 text-align-left margin">
                  <input
                    type="text"
                    name="short_title"
                    className="form-control formcontrol"
                    value={form.short_title}
                    onChange={handleChange}
                    maxLength={55}
                    placeholder="Short title (max 55 characters)"
                  />
                  {errors.short_title && (
                    <p className="text-danger">{errors.short_title}</p>
                  )}
                </div>
              </div>

              <div className="col-12 col-lg-12">
                <div className="d-lg-flex align-items-center">
                  <textarea
                    placeholder="Short notification text."
                    name="notificationText"
                    className="form-control formcontrol mb-3"
                    rows={5}
                    value={form.notificationText}
                    onChange={handleChange}
                  ></textarea>
                </div>
                {form.userType === "web" && (
                  <div className="file-upload-section">
                    <div className="input-group">
                      <CustomFileUpload
                        name="file"
                        onChange={handleFileChange}
                        className="form-control formcontrol p-2"
                        accept="application/pdf"
                        buttonText="Upload Notification PDF"
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

            <div className="row">
              <div className="col-1">
                {/* <div className="font">Action</div> */}
              </div>
              <div className="btn-section text-lg-center d-lg-flex gap-3 justify-content-end">
                <button
                  type="button"
                  className="btn btn-add btn-gray mb-lg-0 mb-3"
                  onClick={() => navigate("/dashboard/manage-notifications")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: "#fff2cc", color: "black" }}
                  className="btn btn-add mb-lg-0 mb-3"
                  onClick={handleDraft}
                  disabled={loading}
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-add"
                  disabled={loading}
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default AddNotification;
