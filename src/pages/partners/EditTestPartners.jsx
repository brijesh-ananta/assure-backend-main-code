import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

function EditTestPartners() {
  const [headerTitle] = useState("Testing Partner");
  const { user, userRole } = useAuth(); // Added userRole to useAuth
  const location = useLocation();
  const navigate = useNavigate();
  const { partnerData } = location.state || {};

  const [formData, setFormData] = useState({
    partner_name: "",
    partner_id: "",
    contact_person: "",
    email: "",
    status: "draft",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partnerData) {
      setFormData({
        partner_name: partnerData.partner_name || "",
        partner_id: partnerData.partner_id || "",
        contact_person: partnerData.contact_person || "",
        email: partnerData.email || "",
        status: partnerData.status || "draft",
      });
    }
  }, [partnerData]);

  const handleChange = (e) => {
    if (userRole === 1) {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleStatusChange = (e) => {
    if (userRole === 1) {
      setFormData((prev) => ({
        ...prev,
        status: e.target.value,
      }));
    }
  };

  const validate = () => {
    if (
      !formData.partner_name.trim() ||
      !formData.partner_id.trim() ||
      !formData.contact_person.trim() ||
      !formData.email.trim()
    ) {
      return "All fields are required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleAddPartner = () => {
    if (userRole === 1) {
      const validationError = validate();
      if (validationError) {
        toast.error(validationError);
        return;
      } else {
        const confirmModalEl = document.getElementById("confirmModal");
        if (confirmModalEl) {
          const confirmModal = new window.bootstrap.Modal(confirmModalEl);
          confirmModal.show();
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (userRole === 1) {
      setLoading(true);
      try {
        const payload = { ...formData, created_by: user.user_id };
        const response = await axiosToken.put(
          "/partners/" + partnerData.pt_id,
          payload
        );
        setLoading(false);
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/dashboard/testing-partner");
        }, 2000);
      } catch (err) {
        setLoading(false);
        console.error("Error updating partner:", err);
        if (err.response && err.response.data && err.response.data.error) {
          toast.error(err.response.data.error);
        } else {
          toast.error(err.message || "An error occurred.");
        }
      }
    }
  };

  const handleBack = () => {
    if (userRole === 1) {
      window.history.back();
    }
  };

  return (
    <>
      <Header title={headerTitle} />

      <section className="notification pb-5">
        <div className="container-fluid">
          <form>
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
                      disabled={userRole !== 1} // Disable if userRole != 1
                    />
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="d-lg-flex align-items-center">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                    htmlFor="partner_id"
                  >
                    Partner Id
                  </label>
                  {formData.partner_id}
                  {/* <input
                    id="partner_id"
                    name="partner_id"
                    placeholder="PT00001"
                    type="text"
                    className="form-control formcontrol"
                    value={formData.partner_id}
                    onChange={handleChange}
                    disabled={userRole !== 1} // Disable if userRole != 1
                  /> */}
                </div>
              </div>
            </div>
          </form>

          <form>
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
                    disabled={userRole !== 1} // Disable if userRole != 1
                  />
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
                    disabled={userRole !== 1} // Disable if userRole != 1
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="row">
            <div className="col-lg-12 mb-4">
              <div className="d-lg-flex align-items-center justify-content-start">
                <span className="me-lg-5 font">Status</span>
                <form>
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
                        disabled={userRole !== 1} // Disable if userRole != 1
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
                        disabled={userRole !== 1} // Disable if userRole != 1
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
                        disabled={userRole !== 1} // Disable if userRole != 1
                      />
                      <label className="form-check-label" htmlFor="statusInactive">
                        Deactivate
                      </label>
                    </div>
                  </div>
                </form>
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
                    disabled={userRole !== 1} // Disable if userRole != 1
                  >
                    Cancel
                  </button>
                  <div className="btn-section text-lg-center">
                    <button
                      type="button"
                      onClick={handleAddPartner}
                      className="btn-add mx-auto"
                      disabled={userRole !== 1} // Disable if userRole != 1
                    >
                      {loading ? "Updating..." : "Update Partner"}
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
                Confirm Update Partner
              </h5>
              <button
                type="button"
                className="btn-close text-white btnclose"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              You are updating the Testing Partner.
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
                disabled={userRole !== 1} // Disable if userRole != 1
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      <Sidebar />
      <Footer audit={true} tableName="partners" recordId={partnerData.pt_id} />
      <ToastContainer autoClose={2000} position="bottom-right" />
    </>
  );
}

export default EditTestPartners;