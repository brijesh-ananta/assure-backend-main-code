import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosToken from "../../utils/axiosToken";

const AddNewIssuer = () => {
  const [params] = useSearchParams();

  const envFromQuery = params.get("environment");
  const termFromQuery = params.get("terminalType");

  const [environment, setEnvironment] = useState(envFromQuery || "1");
  const [cardType, setcardType] = useState(
    termFromQuery ? [termFromQuery] : ["Pos"]
  );
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = useMemo(
    () => ({
      issuerName: "",
      issuerId: "",
      iisc: "",
      bin: "",
      binProduct: "",
      panLength: "",
      contactPerson: "",
      email: "",
      issuerCode: "",
      status: "Draft",
    }),
    []
  );

  useEffect(() => {
    if (cardType === "Pos") {
      initialValues.securedConnection = "Yes";
    } else {
      initialValues.securedConnection = "No";
    }
  }, [cardType, initialValues]);

  const validate = (formData) => {
    let errs = {};
    if (!formData.issuerName.trim()) {
      errs.issuerName = "Issuer Name is required.";
    }
    if (!formData.issuerCode.trim()) {
      errs.issuerCode = "Issuer Code is required.";
    }
    if (!formData.iisc.trim()) {
      errs.iisc = "IISC is required.";
    }

    if (!formData.contactPerson.trim()) {
      errs.contactPerson = "Contact Person is required.";
    }
    if (!formData.email.trim()) {
      errs.email = "Contact Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      errs.email = "Invalid email address.";
    }
    return errs;
  };

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: async (values) => {
      let finalCardType;
      if (cardType.includes("Pos") && cardType.includes("Ecomm")) {
        finalCardType = "Both";
      } else if (cardType.includes("Pos")) {
        finalCardType = "Pos";
      } else if (cardType.includes("Ecomm")) {
        finalCardType = "Ecomm";
      } else {
        finalCardType = "Pos";
      }

      const payload = {
        environment_id: environment,
        issuer_name: values.issuerName,
        issuer_code: values.issuerCode,
        iisc: values.iisc,
        card_type: finalCardType,
        contact_person: values.contactPerson,
        contact_email: values.email,
        status: values.status?.toLowerCase() || "draft",
        confirm_secured_connection: cardType.includes("Pos")
          ? values.securedConnection?.toLowerCase() || "yes"
          : undefined,
        createdBy: 178, // Uncomment if you have user context
      };
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      setIsLoading(true);
      try {
        const response = await axiosToken.post(`/issuers`, payload);
        toast.success(response.data.message);
        setIsLoading(false);
        navigate("/dashboard/test-card-issuer", { reloadDocument: true });
      } catch (error) {
        setIsLoading(false);
        console.error("Error adding issuer:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message || "An error occurred.");
        }
      }
    },
  });

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
    setcardType(["Pos"]);
  };

  const handlecardTypeChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setcardType((prevCardType) => {
      if (isChecked) {
        return [...new Set([...prevCardType, value])];
      } else {
        return prevCardType.filter((type) => type !== value);
      }
    });
  };

  useEffect(() => {
    if (cardType.includes("Pos")) {
      if (!formik.values.securedConnection) {
        formik.setFieldValue("securedConnection", "Yes");
      }
      if (formik.values.securedConnection === "Yes") {
        formik.setFieldValue("status", "Active");
      } else if (formik.values.securedConnection === "No") {
        formik.setFieldValue("status", "Draft");
      }
    } else {
      formik.setFieldValue("securedConnection", "No");
    }
  }, [cardType, formik.values.securedConnection, formik.setFieldValue]);

  const isStatusLocked =
    cardType.includes("Pos") &&
    (formik.values.securedConnection === "Yes" ||
      formik.values.securedConnection === "No");

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
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
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault1"
                  disabled
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
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault2"
                  disabled
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
      <section className="form-field-wrapper form-container">
        <form onSubmit={formik.handleSubmit} className="row">
          <div className="col-12 row">
            <div className="col-6 row align-items-center">
              <p className="font col-4 pe-4 text-right m-0">IISC</p>
              <div className="col-5 p-0">
                <input
                  type="text"
                  name="iisc"
                  value={formik.values.iisc}
                  onChange={formik.handleChange}
                  placeholder="IISC"
                  className="form-control formcontrol"
                />
                {formik.touched.iisc && formik.errors.iisc && (
                  <div className="text-danger font mt-1">
                    {formik.errors.iisc}
                  </div>
                )}
              </div>
            </div>

            <div className="col-6 row align-items-center">
              <p className="font col-3 text-right m-0">Issuer ID</p>
              <div className="col-6">
                <p className="font col-3 text-left m-0">New</p>
                {formik.touched.issuerId && formik.errors.issuerId && (
                  <div className="text-danger font mt-1">
                    {formik.errors.issuerId}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 row mt-5">
            <div className="col-6 row align-items-center">
              <p className="font col-4 pe-4 text-right m-0">Issuer Name</p>
              <div className="col-5 p-0">
                <input
                  type="text"
                  name="issuerName"
                  value={formik.values.issuerName}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                  placeholder="Issuer Name"
                />
                {formik.touched.issuerName && formik.errors.issuerName && (
                  <div className="text-danger font mt-1">
                    {formik.errors.issuerName}
                  </div>
                )}
              </div>
            </div>

            <div className="col-6 row align-items-center">
              <p className="font col-3 text-right m-0">Issuer Code</p>
              <div className="col-6">
                <input
                  max={4}
                  maxLength={4}
                  type="text"
                  name="issuerCode"
                  value={formik.values.issuerCode}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                  placeholder="Issuer Code"
                />
                {formik.touched.issuerCode && formik.errors.issuerCode && (
                  <div className="text-danger font mt-1">
                    {formik.errors.issuerCode}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 row mt-5">
            <div className="col-6 row align-items-center">
              <p className="font col-4 pe-4 text-right m-0">Card type</p>
              <div className="col-5 p-0 d-flex gap-3">
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    style={{ borderRadius: 0, width: "20px", height: "20px" }}
                    name="cardType"
                    value="Pos"
                    checked={cardType.includes("Pos")}
                    onChange={handlecardTypeChange}
                    id="cardType1"
                  />
                  <label
                    style={{ marginBottom: 0, fontSize: "18px" }}
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
                    style={{ borderRadius: 0, width: "20px", height: "20px" }}
                    name="cardType"
                    value="Ecomm"
                    checked={cardType.includes("Ecomm")}
                    disabled={environment === "2"}
                    onChange={handlecardTypeChange}
                    id="cardType2"
                  />
                  <label
                    style={{ marginBottom: 0, fontSize: "18px" }}
                    className="form-check-label"
                    htmlFor="cardType2"
                  >
                    Ecomm
                  </label>
                </div>
              </div>
            </div>

            <div className="col-6 row align-items-end">
              <div className="col-12 d-flex gap-3 align-items-start">
                {cardType.includes("Pos") && (
                  <div className="col-6 row align-items-end">
                    <div className="col-12 d-flex gap-3 align-items-start">
                      <label
                        style={{
                          textDecoration: "underline dotted",
                          fontStyle: "italic",
                          color: "#7eb7df",
                        }}
                        className="rounded-4 p-1 no-wrap d-flex align-items-start font"
                      >
                        Secured connection established?
                      </label>
                      <div className="d-flex gap-1">
                        {["Yes", "No"].map((opt) => (
                          <label
                            style={{
                              marginBottom: 0,
                              gap: 0,
                              marginRight: "2rem",
                            }}
                            key={opt}
                            className="radio-label"
                          >
                            <input
                              className="form-check-input"
                              type="radio"
                              name="securedConnection"
                              value={opt}
                              checked={formik.values.securedConnection === opt}
                              onChange={formik.handleChange}
                              style={{
                                marginTop: 0,
                                width: "1.3rem",
                                height: "1.3rem",
                                marginRight: "12px",
                              }}
                            />
                            <span
                              className={
                                formik.values.securedConnection === opt
                                  ? "highlight"
                                  : ""
                              }
                            >
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 row mt-5">
            <div className="col-6 row align-items-center">
              <p className="font col-4 pe-4 text-right m-0">
                Issuer Contact Person
              </p>
              <div className="col-5 p-0">
                <input
                  type="text"
                  name="contactPerson"
                  value={formik.values.contactPerson}
                  onChange={formik.handleChange}
                  placeholder="Partner Contact Person"
                  className="form-control formcontrol"
                />
                {formik.touched.contactPerson &&
                  formik.errors.contactPerson && (
                    <div className="text-danger font mt-1">
                      {formik.errors.contactPerson}
                    </div>
                  )}
              </div>
            </div>

            <div className="col-6 row align-items-center">
              <p className="font col-3 text-right m-0">Email</p>
              <div className="col-6">
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                  placeholder="Enter Email"
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
          {/* <div className="row mt-4">
            <label className="col-2 font text-right">Status</label>
            <div className="radio-group col-8">
              {["Draft", "Active", "Inactive"].map((status) => (
                <label
                  style={{
                    marginBottom: 0,
                    gap: "0.1rem",
                    marginRight: "4rem",
                  }}
                  key={status}
                  className="radio-label"
                >
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    value={status}
                    checked={formik.values.status === status}
                    onChange={formik.handleChange}
                    style={{
                      marginTop: 0,
                      width: "1.3rem",
                      height: "1.3rem",
                      marginRight: "10px",
                    }}
                  />
                  <span
                    className={
                      formik.values.status === status ? "highlight" : ""
                    }
                  >
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div> */}

          <div className="row mt-4">
            <label className="col-2 font text-right">Status</label>
            <div className="radio-group col-8">
              {["Draft", "Active", "Inactive"].map((status) => (
                <label
                  style={{
                    marginBottom: 0,
                    gap: "0.1rem",
                    marginRight: "4rem",
                  }}
                  key={status}
                  className="radio-label"
                >
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    value={status}
                    checked={formik.values.status === status}
                    onChange={formik.handleChange}
                    disabled={isStatusLocked}
                    style={{
                      marginTop: 0,
                      width: "1.3rem",
                      height: "1.3rem",
                      marginRight: "10px",
                    }}
                  />
                  <span
                    className={
                      formik.values.status === status ? "highlight" : ""
                    }
                  >
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              disabled={isLoading}
              type="button"
              onClick={() => navigate("/dashboard/test-card-issuer")}
            >
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span
                    className="loader"
                    style={{ marginRight: "8px" }}
                  ></span>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default AddNewIssuer;
