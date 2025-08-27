import { useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import CustomFileUpload from "../../components/shared/form-fields/CustomFileUpload";
import { toast } from "react-toastify";

const AddNotificationv2 = () => {
  const [form, setForm] = useState({
    userType: "web",
    startDate: "",
    endDate: "",
    notificationText: "",
    file: null,
  });
  const { user } = useAuth();
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
  };
  1;
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
                      Status
                    </label>
                    <span className="btn btncolor btnyellow border-yellow">
                      New
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-12">
                <div className="d-lg-flex align-items-center">
                  <textarea
                    placeholder="Short notification text (55 Char max)"
                    name="notificationText"
                    className="form-control formcontrol mb-3"
                    rows={2}
                    value={form.notificationText}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="d-lg-flex align-items-center">
                  <textarea
                    placeholder="Short notification text (255 Char max)"
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

            {user.role === 1 && (
              <div className="btn-section text-lg-center d-lg-flex gap-3 justify-content-end">
                <button type="button" className="btn cancel-btn w-150p">
                  Cancel
                </button>

                <button type="button" className="btn save-draft-btn w-150p">
                  Save Draft
                </button>

                <button type="submit" className="btn save-btn w-150p">
                  Submit
                </button>
              </div>
            )}
          </form>
        </div>
      </section>
    </>
  );
};

export default AddNotificationv2;
