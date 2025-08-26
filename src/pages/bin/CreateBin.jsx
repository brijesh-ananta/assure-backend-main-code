import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import binService from "../../services/bin";
import { toast } from "react-toastify";

const CreateBin = () => {
  const [params] = useSearchParams();
  const envFromQuery = params.get("environment");
  const cardTypeFromQuery = params.get("cardType");
  const [environment, setEnvironment] = useState(envFromQuery || "1");
  const [cardType, setCardType] = useState(cardTypeFromQuery || "Pos");
  const [issuerList, setIssuerList] = useState([]);
  const [issuerId, setIssuerId] = useState("");
  const [issuerData, setIssuerData] = useState({
    issuer_name: "",
    iisc: "",
    status: "",
    card_type: "",
    issuer_id: "",
    issuer_code: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues = useMemo(
    () => ({
      bin: "",
      binProduct: "Credit",
      pan_length: "",
      status: "Draft",
    }),
    []
  );

  useEffect(() => {
    const fetchIssuerList = async () => {
      try {
        const data = await binService.getIssuerList(environment, cardType);
        setIssuerList(data || []);
      } catch {
        setIssuerList([]);
      }
    };
    fetchIssuerList();
  }, [cardType, environment]);

  useEffect(() => {
    if (issuerId) {
      const fetchIssuerData = async () => {
        try {
          const data = await binService.getIssuerData(issuerId);
          setIssuerData(data || {});
          if (data && data.card_type) {
            setCardType(data.card_type);
          }
        } catch {
          setIssuerData({});
        }
      };
      fetchIssuerData();
    } else {
      setIssuerData({
        issuer_name: "",
        iisc: "",
        status: "",
        card_type: "",
        issuer_id: "",
        issuer_code: "",
      });
    }
  }, [issuerId]);

  const validate = (formData) => {
    let errs = {};
    if (!issuerId) errs.issuerId = "Issuer is required.";
    if (!formData.bin) errs.bin = "Bin is required.";
    if (!formData.pan_length) errs.pan_length = "PAN Length is required.";
    else if (formData.pan_length > 99)
      errs.pan_length = "PAN Length cannot exceed 99.";
    else if (!/^[0-9]+$/.test(formData.pan_length))
      errs.pan_length = "PAN Length must be a number.";
    return errs;
  };

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        issuer_id: issuerId,
        bin: values.bin,
        bin_product: values.binProduct,
        pan_length: values.pan_length,
        status: values.status,
        environment: environment, // Add the environment value here
        cardType
      };
      setIsLoading(true);
      try {
        await binService.createBin(payload);
        toast.success("Bin created successfully");
        setIsLoading(false);
        navigate("/dashboard/bin-list");
      } catch (error) {
        setIsLoading(false);
        toast.error(error?.response?.data.error || error.message || "Error creating bin");
      }
    },
  });

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
    setCardType("Pos");
  };

  const handleCardTypeChange = (e) => {
    setCardType(e.target.value);
  };

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
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3 ms-3">
              <span className="me-3 font">Card Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="cardType"
                  value={"Pos"}
                  checked={cardType === "Pos"}
                  onChange={handleCardTypeChange}
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
                  type="radio"
                  name="cardType"
                  value={"Ecomm"}
                  checked={cardType === "Ecomm"}
                  onChange={handleCardTypeChange}
                  id="cardType2"
                  disabled={environment === "2"}
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
        </div>
      </div>
      <section className="form-field-wrapper form-container">
        <form onSubmit={formik.handleSubmit} className="row">
          <div className="col-12 row">
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Issuer Name</p>
              <div className="col-5 p-0">
                <select
                  className="form-control formcontrol"
                  value={issuerId}
                  onChange={(e) => setIssuerId(e.target.value)}
                >
                  <option value="">Select Issuer</option>
                  {issuerList.map((issuer) => (
                    <option key={issuer.id} value={issuer.id}>
                      {issuer.issuer_name}
                    </option>
                  ))}
                </select>
                {formik.errors.issuerId && (
                  <div className="text-danger font mt-1">
                    {formik.errors.issuerId}
                  </div>
                )}
              </div>
            </div>

            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Issuer ID</p>
              <div className="col-5 p-0">
                <p className="form-control-plaintext mb-0">
                  {issuerData.issuer_unique_id || ""}
                </p>
              </div>
            </div>

            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">IISC</p>
              <div className="col-5 p-0">
                <p className="form-control-plaintext mb-0">
                  {issuerData.iisc || ""}
                </p>
              </div>
            </div>

            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Issuer Code</p>
              <div className="col-5 p-0">
                <p className="form-control-plaintext mb-0">
                  {issuerData.issuer_code || ""}
                </p>
              </div>
            </div>

            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Issuer Status</p>
              <div className="col-5 p-0">
                <p className="form-control-plaintext mb-0">
                  {issuerData.status || ""}
                </p>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              {/* blank */}
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Bin</p>
              <div className="col-5 p-0">
                <input
                  type="text"
                  name="bin"
                  value={formik.values.bin}
                  onChange={formik.handleChange}
                  placeholder="Bin"
                  className="form-control formcontrol"
                />
                {formik.errors.bin && (
                  <div className="text-danger font mt-1">
                    {formik.errors.bin}
                  </div>
                )}
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              {/* blank */}
            </div>

            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Card Type</p>
              <div className="col-5 p-0">
                <p className="form-control-plaintext mb-0">{cardType}</p>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              {/* blank */}
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Bin Product</p>
              <div className="col-5 p-0">
                <select
                  name="binProduct"
                  value={formik.values.binProduct}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                >
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                  <option value="US Debit">US Debit</option>
                </select>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              {/* blank */}
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Pan Length</p>
              <div className="col-5 p-0">
                <input
                  type="number"
                  name="pan_length"
                  value={formik.values.pan_length}
                  onChange={formik.handleChange}
                  onInput={(e) => {
                    if (e.target.value.length > 2) {
                      e.target.value = e.target.value.slice(0, 2); // Restrict to 2 digits
                      formik.setFieldValue("pan_length", e.target.value); // Update formik value
                    }
                  }}
                  placeholder="Pan Length"
                  className="form-control formcontrol"
                  max={99}
                  min={0} // Optional: You can also enforce a minimum of 0
                />
                {formik.errors.pan_length && (
                  <div className="text-danger font mt-1">
                    {formik.errors.pan_length}
                  </div>
                )}
              </div>
            </div>
            <div className="row mt-4">
              <label className="col-2 font text-right">Bin Status</label>
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
            </div>

            <div className="col-12 row align-items-center mb-3 mt-4">
              {/* <div className="col-4"></div> */}
              <div className="col-12 p-0 d-flex justify-content-end form-actions">
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => navigate("/dashboard/bin-list")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Create Bin"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default CreateBin;
