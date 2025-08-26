import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

function EditTCissuer() {
  const navigate = useNavigate();
  const location = useLocation();
  const issuerId = location.state?.id;
  const envID = location.state?.environment;
  const issuer = location.state?.issuer;
  const [headerTitle, setHeaderTitle] = useState("Test Card Issuer");
  const [environment, setEnvironment] = useState(envID); // Default to Prod ("1")
  const { user } = useAuth(); // user now contains profile info
  const userRole = user?.role; // assuming role is stored in user object
  const [initialSecuredConnection, setInitialSecuredConnection] = useState(null);


  const [isLoading, setIsLoading] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const [formData, setFormData] = useState({
    environment,
    issuer_name: "",
    issuer_id: "",
    iisc: "",
    test_card_type: "Pos",
    bin: "",
    binProduct: "Credit",
    pan_length: "",
    confirm_secured_connection: "yes",
    contact_person: "",
    contact_email: "",
    status: "draft",
    initialSecuredConnection : "no"
  });

  const [errors, setErrors] = useState({});

  const handleEnvironmentChange = (e) => {
    if (userRole === 1) {
      const newEnv = e.target.value;
      setEnvironment(newEnv);
      setFormData((prev) => ({ ...prev, environment: newEnv }));
    }
  };

  const handleInputChange = (e) => {
    if (userRole === 1) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    let errs = {};

    if (!formData.issuer_name.trim()) {
      errs.issuer_name = "Issuer Name is required.";
    }
    if (!formData.issuer_id.trim()) {
      errs.issuer_id = "Issuer ID is required.";
    }
    if (!formData.iisc.trim()) {
      errs.iisc = "IISC is required.";
    }
    if (!formData.bin.trim()) {
      errs.bin = "BIN is required.";
    }
    if (!formData.pan_length.trim()) {
      errs.pan_length = "PAN Length is required.";
    } else if (!/^\d+$/.test(formData.pan_length.trim())) {
      errs.pan_length = "PAN Length must be a number.";
    }
    if (!formData.contact_person.trim()) {
      errs.contact_person = "Contact Person is required.";
    }
    if (!formData.contact_email.trim()) {
      errs.contact_email = "Contact Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.contact_email)
    ) {
      errs.contact_email = "Invalid email address.";
    }

    if (
      formData.test_card_type === "Pos" &&
      formData.confirm_secured_connection !== "yes" && formData.status !== "draft"
    ) {
      errs.confirm_secured_connection =
        "For POS test card type, Confirm Secured Connection must be 'yes'.";
    }

    return errs;
  };

  const handleValidate = (e) => {
    if (userRole === 1) {
      e.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.values(validationErrors).join("\n");
        alert(errorMessages);
      } else {
        setErrors({});
        const confirmModalEl = document.getElementById("confirmModal");
        if (confirmModalEl) {
          const confirmModal = new window.bootstrap.Modal(confirmModalEl);
          confirmModal.show();
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    if (userRole === 1) {
      e.preventDefault();
      setIsLoading(true);
      try {
        const response = await axiosToken.put(`/issuers/${issuer.id}`, formData);
        alert(response.data.message);
        setIsLoading(false);
        window.location.href = "/dashboard/test-card-issuer";
      } catch (error) {
        setIsLoading(false);
        console.error("Error adding issuer:", error);
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error);
        } else {
          alert(error.message || "An error occurred.");
        }
      }
    }
  };

  useEffect(() => {
    if (issuer) {
      setFormData({
        environment: issuer.environment || environment,
        issuer_name: issuer.issuer_name || "",
        issuer_id: issuer.issuer_id || "",
        iisc: issuer.iisc || "",
        test_card_type: issuer.test_card_type || "Pos",
        bin: issuer.bin || "",
        binProduct: issuer.binProduct || "Credit",
        pan_length: issuer.pan_length ? String(issuer.pan_length) : "",
        confirm_secured_connection: issuer.confirm_secured_connection || "no",
        contact_person: issuer.contact_person || "",
        contact_email: issuer.contact_email || "",
        status: issuer.status || "draft",
      });
      setInitialSecuredConnection(issuer.confirm_secured_connection || "no");
    }
  }, [issuer]);

  return (
    <>
      <Header title={headerTitle} />
      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-2">
        <div className="container">
          <div className="d-lg-flex align-items-center justify-content-center">
            <span className="me-lg-5 font">Environment</span>
            <div className="d-lg-flex formcard">
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"1"}
                  checked={environment === "1"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault1"
                  disabled={userRole !== 1}
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"2"}
                  checked={environment === "2"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault2"
                  disabled={userRole !== 1}
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="notification pb-5">
        <div className="container-fluid">
          <form>
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="issuerName"
                  >
                    Issuer Name
                  </label>
                  <input
                    id="issuerName"
                    name="issuer_name"
                    placeholder="Bank 1"
                    type="text"
                    className="form-control formcontrol"
                    onChange={handleInputChange}
                    value={formData.issuer_name}
                    disabled={userRole !== 1}
                  />
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow2"
                    htmlFor="issuerId"
                  >
                    Issuer ID
                  </label>
                  {formData.issuer_id}
                  {/* <input
                    id="issuerId"
                    placeholder="TCInnnnnn"
                    type="text"
                    name="issuer_id"
                    onChange={handleInputChange}
                    value={formData.issuer_id}
                    className="form-control formcontrol"
                    disabled={userRole !== 1}
                  /> */}
                </div>
              </div>
            </div>

            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="bin1"
                  >
                    IISC
                  </label>
                  <input
                    id="bin1"
                    placeholder="99999999"
                    type="text"
                    name="iisc"
                    onChange={handleInputChange}
                    value={formData.iisc}
                    className="form-control formcontrol"
                    disabled={userRole !== 1}
                  />
                </div>
              </div>
              <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start">
                <span className="me-lg-5 font">Test Card Type</span>
                <div className="d-lg-flex formcard">
                  <div className="form-check me-3 d-flex gap-4 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      value={"Pos"}
                      name="test_card_type"
                      id="cardTypePOS"
                      onChange={handleInputChange}
                      checked={formData.test_card_type === "Pos"}
                      disabled={userRole !== 1}
                    />
                    <label className="form-check-label" htmlFor="cardTypePOS">
                      POS
                    </label>
                  </div>
                  <div className="form-check me-3 d-flex gap-4 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      value={"Ecomm"}
                      name="test_card_type"
                      id="cardTypeEcomm"
                      onChange={handleInputChange}
                      checked={formData.test_card_type === "Ecomm"}
                      disabled={userRole !== 1}
                    />
                    <label className="form-check-label" htmlFor="cardTypeEcomm">
                      Ecomm
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="bin2"
                  >
                    BIN
                  </label>
                  <input
                    id="bin2"
                    name="bin"
                    placeholder="999999"
                    type="text"
                    onChange={handleInputChange}
                    value={formData.bin}
                    className="form-control formcontrol"
                    disabled={userRole !== 1}
                  />
                </div>
              </div>
              {formData.test_card_type === "Pos" && (
                <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start">
                  <mark>
                    <span className="me-lg-5 font">secure connection?</span>
                  </mark>
                  <div className="d-lg-flex formcard">
                    <div className="form-check me-3 d-flex gap-4 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="confirm_secured_connection"
                        id="securedYes"
                        value={"yes"}
                        onChange={handleInputChange}
                        checked={formData.confirm_secured_connection === "yes"}
                        disabled={userRole !== 1}
                      />
                      <label className="form-check-label" htmlFor="securedYes">
                        Yes
                      </label>
                    </div>
                    <div className="form-check me-3 d-flex gap-4 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="confirm_secured_connection"
                        id="securedNo"
                        value={"no"}
                        onChange={handleInputChange}
                        checked={formData.confirm_secured_connection === "no"}
                        disabled={userRole !== 1 || initialSecuredConnection === "yes"}
                      />
                      <label className="form-check-label" htmlFor="securedNo">
                        No
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="bin2"
                  >
                    BIN Product
                  </label>
                  <select
                    className="form-control formcontrol"
                    name="binProduct"
                    onChange={handleInputChange}
                    value={formData.binProduct}
                    disabled={userRole !== 1}
                  >
                    <option value={"Credit"}>Credit</option>
                    <option value={"Debit"}>Debit</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="pan_length"
                  >
                    PAN Length
                  </label>
                  <input
                    id="pan_length"
                    placeholder="99"
                    name="pan_length"
                    type="text"
                    onChange={handleInputChange}
                    value={formData.pan_length}
                    className="form-control formcontrol"
                    disabled={userRole !== 1}
                  />
                </div>
              </div>
            </div>

            <div className="login-page mb-lg-4 mb-2 bg-light p-3">
              <div className="col-12 col-lg-12 pe-lg-0">
                <span className="issuername">Issuer Contact Person</span>
                <div className="d-lg-flex justify-content-start flexform gap-5 flexshrinks">
                  <div className="d-lg-flex align-items-center col-lg-5">
                    <label
                      className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2"
                      htmlFor="contactName"
                    >
                      Name
                    </label>
                    <input
                      id="contactName"
                      placeholder="Jane Doe"
                      name="contact_person"
                      type="text"
                      onChange={handleInputChange}
                      value={formData.contact_person}
                      className="form-control formcontrol"
                      disabled={userRole !== 1}
                    />
                  </div>
                  <div className="d-lg-flex align-items-center col-lg-5">
                    <label
                      className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2"
                      htmlFor="contactEmail"
                    >
                      Email
                    </label>
                    <input
                      id="contactEmail"
                      placeholder="Johndoe@gmail.com"
                      name="contact_email"
                      type="email"
                      onChange={handleInputChange}
                      value={formData.contact_email}
                      className="form-control formcontrol"
                      disabled={userRole !== 1}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 mb-4">
                <div className="d-lg-flex align-items-center">
                  <span className="me-lg-5 font">Status</span>
                  <form>
                    <div className="d-lg-flex formcard">
                      <div className="form-check me-3 d-flex gap-4 align-items-center">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="statusDraft"
                          value={"draft"}
                          onChange={handleInputChange}
                          checked={formData.status === "draft"}
                          disabled={userRole !== 1}
                        />
                        <label className="form-check-label" htmlFor="statusDraft">
                          DRAFT
                        </label>
                      </div>
                      <div className="form-check me-3 d-flex gap-4 align-items-center">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="statusActive"
                          value={"active"}
                          onChange={handleInputChange}
                          checked={formData.status === "active"}
                          disabled={userRole !== 1}
                        />
                        <label className="form-check-label" htmlFor="statusActive">
                          Active
                        </label>
                      </div>
                      <div className="form-check me-3 d-flex gap-4 align-items-center">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="statusDeactivate"
                          value={"inactive"}
                          onChange={handleInputChange}
                          checked={formData.status === "inactive"}
                          disabled={userRole !== 1}
                        />
                        <label className="form-check-label" htmlFor="statusDeactivate">
                          Deactivate
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="login-page d-lg-flex row">
                <div className="col-12 col-lg-6 pe-lg-5 me-0">
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary me-3"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </button>
                    {userRole === 1 && (
                      <div className="btn-section text-lg-center">
                        <button
                          type="button"
                          className="btn-add mx-auto"
                          onClick={handleValidate}
                          disabled={isLoading}
                        >
                          {isLoading && (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          )}
                          Update Issuer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Modal */}
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
                Confirm Update Issuer
              </h5>
              <button
                type="button"
                className="btn-close text-white btnclose"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to Update Issuer?
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
                onClick={handleSubmit}
                disabled={userRole !== 1}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer audit={true} tableName="issuers" recordId={issuer.id} />
    </>
  );
}

export default EditTCissuer;