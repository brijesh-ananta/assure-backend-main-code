import React, { useState } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

function AddTestPartners() {
  const [headerTitle] = useState("Testing Partner");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    partner_name: "",
    // partner_id: "",
    contact_person: "",
    email: "",
    status: "draft", // default status
  });

  // For validation errors
  const [error, setError] = useState("");

  // Handle input change for text fields
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle status radio button change
  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value,
    }));
  };

  // Validate required fields
  const validate = () => {
    if (
      !formData.partner_name.trim() ||
      // !formData.partner_id.trim() ||
      !formData.contact_person.trim() ||
      !formData.email.trim()
    ) {
      return "All fields are required.";
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleAddPartner = () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    } else {
      // show model popup
      const confirmModalEl = document.getElementById("confirmModal");
      if (confirmModalEl) {
        const confirmModal = new window.bootstrap.Modal(confirmModalEl);
        confirmModal.show();
      }
    }
  };

  // Handle form submission (triggered on confirm button click)
  const handleSubmit = async () => {
    try {
      // Include created_by from current user (assuming user.user_id exists)
      const payload = { ...formData, created_by: user.user_id };

      const response = await axiosToken.post("/partners", payload);
      toast.success(response.data.message);
      navigate("/dashboard/testing-partner"); // Redirect after successful creation
    } catch (err) {
      console.error("Error creating partner:", err);
      //   setError(err.response?.data?.message || "An error occurred while creating the partner.");
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error(err.message || "An error occurred.");
      }
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      <Header title={headerTitle} />

      <section className="notification pb-5">
        <div className="container-fluid">
          <div className="login-page mb-lg-4 mb-2 mt-4 row">
            <div className="col-12 col-lg-6 pe-lg-5">
              <div className="d-lg-flex align-items-center">
                <label
                  className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                  htmlFor="partner_name"
                >
                  Partner Name
                </label>
                <div className="position-relative w-100">
                  <input
                    id="partner_name"
                    name="partner_name"
                    placeholder="Testing Partner"
                    type="text"
                    className="form-control formcontrol"
                    value={formData.partner_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="d-lg-flex align-items-center">
                <label
                  className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  placeholder="janedoe@gmail.com"
                  type="email"
                  className="form-control formcontrol"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* <div className="col-12 col-lg-6">
                <div className="d-lg-flex align-items-center">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                    htmlFor="partner_id"
                  >
                    Partner Id
                  </label>
                  <input
                    id="partner_id"
                    name="partner_id"
                    placeholder="PT00001"
                    type="text"
                    className="form-control formcontrol"
                    value={formData.partner_id}
                    onChange={handleChange}
                  />
                </div>
              </div> */}
          </div>

          <div className="login-page mb-lg-4 mb-2 row">
            <div className="col-12 col-lg-6 pe-lg-5">
              <div className="d-lg-flex align-items-center">
                <label
                  className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                  htmlFor="contact_person"
                >
                  Partner Contact Person
                </label>
                <input
                  id="contact_person"
                  name="contact_person"
                  placeholder="Jane Doe"
                  type="text"
                  className="form-control formcontrol"
                  value={formData.contact_person}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12 mb-4">
              <div className="d-lg-flex align-items-center justify-content-start">
                <span className="me-lg-5 font">Status</span>
                <div className="d-lg-flex formcard">
                  <div className="form-check me-3 d-flex gap-4 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="flexRadioDefault"
                      id="statusDraft"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={handleStatusChange}
                    />
                    <label className="form-check-label" htmlFor="statusDraft">
                      DRAFT
                    </label>
                  </div>
                  <div className="form-check me-3 d-flex gap-4 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="flexRadioDefault"
                      id="statusActive"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={handleStatusChange}
                    />
                    <label className="form-check-label" htmlFor="statusActive">
                      Active
                    </label>
                  </div>
                  <div className="form-check d-flex gap-4 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="flexRadioDefault"
                      id="statusInactive"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={handleStatusChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="statusInactive"
                    >
                      Deactivate
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="col-12">
                <div className="alert alert-danger text-center">{error}</div>
              </div>
            )}

            <div className="login-page d-lg-flex row mb-5">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-secondary me-3"
                  >
                    Cancel
                  </button>
                  <div className="btn-section text-lg-center">
                    <button
                      type="button"
                      onClick={handleAddPartner}
                      className="btn-add mx-auto"
                    >
                      Add Partner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirm Modal */}
      <div
        className="modal fade"
        id="confirmModal"
        tabIndex="-1"
        aria-labelledby="confirmModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-0 shadow-xl">
            <div className="modal-header header-color rounded-0">
              <h5 className="modal-title text-white" id="confirmModalLabel">
                Confirm
              </h5>
              <button
                type="button"
                className="btn-close text-white btnclose"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              You are adding a new Testing Partner.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btncolor"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btncolor btnyellow"
                data-bs-dismiss="modal"
                onClick={handleSubmit}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      <Sidebar />
      <Footer />
    </>
  );
}

export default AddTestPartners;
