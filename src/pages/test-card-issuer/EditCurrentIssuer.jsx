import { useState, useEffect, useCallback, useRef } from "react";
import { useFormik } from "formik";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import apiService from "../../services";
import "./IssuerDetail.css"; // Assuming this CSS file exists
import { useAuth } from "../../utils/AuthContext"; // Assuming AuthContext exists
import axiosToken from "../../utils/axiosToken"; // Assuming axiosToken exists
import { toast } from "react-toastify"; // Assuming react-toastify is installed

const EditCurrentIssuer = () => {
  const { issuerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const envParam = queryParams.get("environment") || "1";
  const { user } = useAuth();
  const userRole = user?.role; // Safely access user role
  const [environment, setEnvironment] = useState(envParam);
  const [isLoading, setIsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [issuer, setIssuer] = useState([]);
  // Stores the initial secured_connection value (0 or 1) from the API
  const [initialSecuredConnection, setInitialSecuredConnection] =
    useState(null);
  const isEditingRef = useRef(false);

  // Validation schema for Formik
  const validate = (values) => {
    const errors = {};
    if (!values.issuerName.trim()) {
      errors.issuerName = "Issuer Name is required.";
    }
    if (!values.contactPerson.trim()) {
      errors.contactPerson = "Contact Person is required.";
    }
    if (!values.issuerCode.trim()) {
      errors.issuerCode = "Issuer Code is required.";
    }
    if (!values.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address.";
    }
    if (!values.status) {
      errors.status = "Status is required.";
    }
    return errors;
  };

  // Formik hook for form management
  const formik = useFormik({
    initialValues: {
      issuerName: "",
      issuerUniqueId: "",
      iisc: "",
      cardType: "",
      securedConnection: "No", // Default to "No"
      issuerCode: "",
      contactPerson: "",
      email: "",
      status: "",
    },
    validate,
    onSubmit: async (values) => {
      // Construct payload for API call
      const payload = {
        issuer_name: values.issuerName,
        issuer_unique_id: values.issuerUniqueId,
        card_type: values.cardType,
        iisc: values.iisc,
        issuer_code: values.issuerCode,
        secured_connection: values.securedConnection === "Yes" ? 1 : 0, // Convert "Yes"/"No" to 1/0
        contact_person_name: values.contactPerson,
        contact_person_email: values.email,
        status: values.status?.toLowerCase() || "draft", // Ensure status is lowercase
        environment_id: Number(environment),
      };

      // Only allow updates if user has role 1 (admin)
      if (userRole === 1) {
        setIsLoading(true);
        try {
          const response = await axiosToken.put(
            `/issuers/${issuer.id}`, // Use issuer.id for update
            payload
          );
          toast.success(response.data.message || "Updated successfully!");
          setIsLoading(false);
          setIsEditing(false); // Exit editing mode after successful save

          // Navigate back to the issuer list after a short delay
          setTimeout(() => {
            navigate("/dashboard/test-card-issuer");
          }, 200);
        } catch (error) {
          setIsLoading(false);
          console.error("Error updating issuer:", error);
          // Display error message from API or a generic one
          if (
            error.response &&
            error.response.data &&
            error.response.data.error
          ) {
            toast.error(error.response.data.error);
          } else {
            toast.error(error.message || "An error occurred during update.");
          }
        }
      }
    },
  });

  // // --- DEBUG LOGGING ---
  // useEffect(() => {
  //   console.log('isEditing:', isEditing, 'formik.values:', formik.values);
  // }, [isEditing, formik.values]);
  // useEffect(() => {
  //   isEditingRef.current = isEditing;
  // }, [isEditing]);
  // // --- END DEBUG LOGGING ---

  // Function to fetch issuer data by ID
  const fetchIssuerById = async () => {
    try {
      const resp = await apiService.issuers.getIssuerInfoById(
        issuerId,
        envParam
      );
      setIssuer(resp?.issuer); // Store the full issuer object

      const {
        issuer_name,
        issuer_unique_id,
        card_type,
        iisc,
        issuer_code,
        secured_connection,
        contact_person_name,
        contact_person_email,
        status,
      } = resp?.issuer || {};

      // Only set values if NOT editing (prevents overwriting user input)
      if (resp?.issuer && !isEditingRef.current) {
        setEnvironment(resp.issuer.environment_id?.toString() || environment);
        formik.setValues({
          issuerName: issuer_name || "",
          issuerUniqueId: issuer_unique_id || "",
          iisc: iisc || "",
          cardType: card_type || "",
          securedConnection: secured_connection === 1 ? "Yes" : "No",
          issuerCode: issuer_code || "",
          contactPerson: contact_person_name || "",
          email: contact_person_email || "",
          status: status || "",
        });
        setInitialSecuredConnection(secured_connection);
      }
    } catch (error) {
      console.error("Error fetching issuer details:", error);
      toast.error("Failed to fetch issuer details.");
    }
  };

  // Effect to fetch issuer data on component mount or when envParam/issuerId changes
  useEffect(() => {
    if (envParam && issuerId) {
      fetchIssuerById();
    }
  }, [envParam, issuerId]); // Only run when envParam or issuerId changes

  // Effect to update URL query params with recordId
  useEffect(() => {
    if (issuerId) {
      const params = new URLSearchParams(location.search);
      params.set("recordId", issuerId);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [issuerId, navigate, location.search]);

  // Handler for environment radio button changes (currently disabled)
  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
  };

  // Helper function to determine if a status radio button should be disabled
  const getStatusDisabled = (
    currentStatus,
    isEditing,
    cardType,
    securedConnection,
    initialSecuredConnection
  ) => {
    if (!isEditing) {
      return true; // Always disabled if not in editing mode
    }

    if (cardType === "Ecomm") {
      return (
        currentStatus.toLowerCase() === "draft" &&
        ["active", "inactive"].includes(formik.values.status.toLowerCase())
      );
    }

    // Logic for POS card type
    if (cardType === "Pos") {
      if (initialSecuredConnection === 1) {
        // Condition 1: if card_type = pos and secured_connection === 1 (initially)
        // We cannot change secured connection to 'No' (handled by securedConnection radio disabled state)
        // Status cannot be 'Draft'
        return currentStatus.toLowerCase() === "draft";
      } else {
        // Condition 2: if card_type = pos and secured_connection === 0 (initially)
        if (securedConnection === "Yes") {
          // If secured connection is now 'Yes', status cannot be 'Draft'
          return currentStatus.toLowerCase() === "draft";
        } else {
          // securedConnection === "No"
          // If secured connection is now 'No', status can only be 'Draft'
          // If secured connection is now 'No', status can only be 'Draft'
          return (
            currentStatus.toLowerCase() === "active" ||
            currentStatus.toLowerCase() === "inactive"
          );
        }
      }
    }
    return false; // Default case, should ideally be covered by above logic
  };

  // Effect to handle automatic status changes based on securedConnection for POS
  useEffect(() => {
    // Only apply this logic if in editing mode and cardType is "Pos"
    if (isEditing && formik.values.cardType === "Pos") {
      // This part of the logic applies only if the issuer was initially NOT secured (initialSecuredConnection === 0)
      if (initialSecuredConnection === 0) {
        if (formik.values.securedConnection === "Yes") {
          // If securedConnection is changed to "Yes", force status to "Active" if it was "Draft"
          // Only update if the current status is 'draft' to avoid unnecessary re-renders
          if (formik.values.status.toLowerCase() === "draft") {
            formik.setFieldValue("status", "Active");
          }
        } else if (formik.values.securedConnection === "No") {
          // If securedConnection is changed to "No", force status to "Draft" if it was "Active" or "Inactive"
          // Only update if the current status is 'active' or 'inactive' to avoid unnecessary re-renders
          if (
            formik.values.status.toLowerCase() === "active" ||
            formik.values.status.toLowerCase() === "inactive"
          ) {
            formik.setFieldValue("status", "Draft");
          }
        }
      }
    }
  }, [
    formik.values.securedConnection,
    formik.values.cardType,
    isEditing,
    initialSecuredConnection,
    formik.setFieldValue,
  ]);

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center w-100 ps-5">
            <div className="d-lg-flex align-items-center justify-content-evenly w-100">
              <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
                <span className="me-3 font">Environment</span>
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="environment"
                    value={"1"}
                    checked={environment === "1"}
                    disabled // Environment selection is disabled
                    onChange={handleEnvironmentChange}
                    id="flexRadioDefault1"
                  />
                  <label
                    style={{ marginBottom: 0 }}
                    className="form-check-label"
                    htmlFor="flexRadioDefault1"
                  >
                    Prod
                  </label>
                </div>
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="environment"
                    value={"2"}
                    checked={environment === "2"}
                    disabled // Environment selection is disabled
                    onChange={handleEnvironmentChange}
                    id="flexRadioDefault2"
                  />
                  <label
                    style={{ marginBottom: 0 }}
                    className="form-check-label"
                    htmlFor="flexRadioDefault2"
                  >
                    QA
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="form-field-wrapper form-container">
        <form className="row flex-wrap" onSubmit={formik.handleSubmit}>
          <div className="col-12 col-md-6 d-flex flex-column gap-3">
            <div className="row align-items-center">
              <p className="font col-5 text-right m-0">Issuer Name</p>
              <div className="col-6">
                <div className="input-icon-group">
                  <input
                    type="text"
                    name="issuerName"
                    value={formik.values.issuerName}
                    className="form-control formcontrol"
                    disabled // Always disabled
                  />
                  {formik.touched.issuerName && formik.errors.issuerName && (
                    <div className="text-danger font mt-1">
                      {formik.errors.issuerName}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Card Type below Issuer Name as disabled radio group */}
            <div className="row align-content-center">
              <p className="font col-5 text-right m-0 d-flex align-content-center justify-content-end">
                Card Type
              </p>
              <div className="col-5 p-0 d-flex gap-3">
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="cardType"
                    style={{ borderRadius: 0, width: "20px", height: "20px" }}
                    value="Pos"
                    checked={
                      formik.values.cardType === "Pos" ||
                      formik.values.cardType === "Both"
                    }
                    disabled // Always disabled
                    id="cardType1"
                  />
                  <label
                    style={{ marginBottom: 0 }}
                    className="form-check-label"
                    htmlFor="cardType1"
                  >
                    POS
                  </label>
                </div>
                <div className="form-check d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="cardType"
                    value="Ecomm"
                    style={{ borderRadius: 0, width: "20px", height: "20px" }}
                    checked={
                      formik.values.cardType === "Ecomm" ||
                      formik.values.cardType === "Both"
                    }
                    disabled // Always disabled
                    id="cardType2"
                  />
                  <label
                    style={{ marginBottom: 0 }}
                    className="form-check-label"
                    htmlFor="cardType2"
                  >
                    Ecomm
                  </label>
                </div>
              </div>
            </div>
            {/* IISC */}
            <div className="row align-content-center">
              <p className="font col-5 text-right m-0 d-flex align-content-center justify-content-end">
                IISC
              </p>
              <div className="col-5">
                <input
                  type="text"
                  name="iisc"
                  value={formik.values.iisc}
                  className="form-control formcontrol"
                  disabled // Always disabled
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 d-flex flex-column gap-3">
            <div className="row align-items-center">
              <p className="font col-3 text-right">Issuer ID</p>
              <div className="col-5 font">
                <input
                  type="text"
                  name="issuerUniqueId"
                  value={formik.values.issuerUniqueId}
                  className="form-control formcontrol"
                  disabled // Always disabled
                />
              </div>
            </div>
            <div className="row align-items-center">
              <label className="col-3 font text-right">Issuer Code</label>
              <div className="col-5">
                <input
                  type="text"
                  maxLength={4}
                  max={4}
                  name="issuerCode"
                  value={formik.values.issuerCode}
                  className="form-control formcontrol"
                  onChange={isEditing ? formik.handleChange : undefined}
                />
                {formik.touched.issuerCode && formik.errors.issuerCode && (
                  <div className="text-danger font mt-1">
                    {formik.errors.issuerCode}
                  </div>
                )}
              </div>
            </div>
            {formik.values.cardType === "Pos" && (
              <div className="col-12 col-lg-12 d-lg-flex align-items-center justify-content-start mb-3">
                <span className=" font">Secured connection?</span>
                <div className="d-lg-flex formcard mx-3">
                  <div className="form-check me-3 d-flex gap-4 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="securedConnection"
                      id="securedYes"
                      value="Yes"
                      onChange={isEditing ? formik.handleChange : undefined}
                      disabled={!isEditing}
                      checked={formik.values.securedConnection === "Yes"}
                    />
                    <label className="form-check-label" htmlFor="securedYes">
                      Yes
                    </label>
                  </div>
                  <div className="form-check me-3 d-flex gap-4 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="securedConnection"
                      id="securedNo"
                      value="No"
                      onChange={isEditing ? formik.handleChange : undefined}
                      disabled={
                        !isEditing ||
                        (initialSecuredConnection === 1 &&
                          formik.values.cardType === "Pos")
                      }
                      checked={formik.values.securedConnection === "No"}
                    />
                    <label className="form-check-label" htmlFor="securedNo">
                      No
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row mt-3">
            {/* Partner Contact Person */}
            <div className="col-6 d-flex gap-4 align-items-center">
              <label className="font text-right col-5 m-0">
                Partner Contact Person
              </label>
              <div className="col-6">
                <input
                  type="text"
                  name="contactPerson"
                  value={formik.values.contactPerson}
                  onChange={isEditing ? formik.handleChange : undefined}
                  className="form-control formcontrol"
                  disabled={!isEditing}
                />
                {formik.touched.contactPerson &&
                  formik.errors.contactPerson && (
                    <div className="text-danger font mt-1">
                      {formik.errors.contactPerson}
                    </div>
                  )}
              </div>
            </div>

            {/*Email */}
            <div className="col-6 d-flex gap-4 align-items-center">
              <label className="col-3 font text-right">Email</label>
              <div className="col-7">
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={isEditing ? formik.handleChange : undefined}
                  className="form-control formcontrol"
                  disabled={!isEditing}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-danger font mt-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="col-6 row mt-4">
            <label className="font col-5 text-right">Status</label>
            <div className="col-6 d-flex gap-5">
              {["Draft", "Active", "Inactive"].map((status) => (
                <label key={status} className="radio-label">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    value={status}
                    checked={
                      formik.values.status.toLowerCase() ===
                      status.toLowerCase()
                    }
                    onChange={isEditing ? formik.handleChange : undefined}
                    disabled={getStatusDisabled(
                      status,
                      isEditing,
                      formik.values.cardType,
                      formik.values.securedConnection,
                      initialSecuredConnection
                    )}
                    style={{
                      marginTop: 0,
                      width: "1.3rem",
                      height: "1.3rem",
                      marginRight: "10px",
                    }}
                  />
                  <span
                    className={
                      formik.values.status.toLowerCase() ===
                      status.toLowerCase()
                        ? "highlight"
                        : ""
                    }
                  >
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/dashboard/test-card-issuer")}
              disabled={isLoading}
            >
              Back
            </button>
            {userRole === 1 && // Only show edit/save buttons for userRole 1
              (isEditing ? (
                <button disabled={isLoading} type="submit">
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(true); // Enter editing mode
                  }}
                  disabled={isLoading}
                >
                  Edit
                </button>
              ))}
          </div>
        </form>
      </section>
    </>
  );
};

export default EditCurrentIssuer;
