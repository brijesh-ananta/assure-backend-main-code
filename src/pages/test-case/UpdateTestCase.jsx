import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import TestCaseService from "../../services/TestCase";

const UpdateTestCase = () => {
  const { id } = useParams();
  const [environment, setEnvironment] = useState("1");
  const [cardType, setCardType] = useState("Pos");
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([""]);
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({
    test_cases_unique_id: "",
    terminal_type: "ATM",
    testing_type: "Regression",
    testing_scope: "Contact",
    pin_entry_capability: true,
    cashback_pin: false,
    payment_technology: "Magstripe",
    short_description: "",
    status: "Draft",
  });

  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        const response = await TestCaseService.getTestCaseById(id);
        const data = response.data;
        setInitialValues({
          test_cases_unique_id: data.test_cases_unique_id,
          terminal_type: data.terminal_type,
          testing_type: data.testing_type,
          testing_scope: data.testing_scope,
          pin_entry_capability: Boolean(data.pin_entry_capability), // Convert 1/0 to boolean
          cashback_pin: Boolean(data.cashback_pin), // Convert 1/0 to boolean
          payment_technology: data.payment_technology,
          short_description: data.short_description,
          status: data.status,
        });
        setSteps(data.testing_steps?.split("\n") || [""]);
        setEnvironment(String(data.environment_id));
        setCardType(data.card_type);
      } catch (error) {
        console.error("Failed to fetch test case", error);
      }
    };
    fetchTestCase();
  }, [id]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        environment_id: environment,
        testing_steps: steps.join("\n"),
        // Convert boolean back to 1/0 for API
        pin_entry_capability: values.pin_entry_capability ? 1 : 0,
        cashback_pin: values.cashback_pin ? 1 : 0,
      };
      setIsLoading(true);
      try {
        await TestCaseService.updateTestCase(id, payload);
        setIsLoading(false);
        navigate("/dashboard/test-case-list");
      } catch (error) {
        setIsLoading(false);
        console.error("Error updating test case", error);
      }
    },
  });

  const handleAddStep = () => setSteps([...steps, ""]);

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
    setCardType("Pos");
  };

  const handleCardTypeChange = (e) => setCardType(e.target.value);

  // Boolean handler for Yes/No radio buttons
  const handleBooleanChange = (fieldName) => (e) => {
    formik.setFieldValue(fieldName, e.target.value === "Yes");
  };

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex  w-100 " style={{ paddingLeft: "170px" }}>
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Environment</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value="1"
                  checked={environment === "1"}
                  onChange={handleEnvironmentChange}
                  id="envProd"
                  disabled
                />
                <label className="form-check-label" htmlFor="envProd">
                  Prod
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value="2"
                  checked={environment === "2"}
                  onChange={handleEnvironmentChange}
                  id="envQA"
                  disabled
                />
                <label className="form-check-label" htmlFor="envQA">
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
            <div className="col-6 row align-items-center mb-4">
              <p className="font col-4 pe-4 text-right m-0">Terminal Type</p>
              <div className="col-5 ps-3">
                <select
                  name="terminal_type"
                  value={formik.values.terminal_type}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                >
                  <option value="Transit">Transit</option>
                  <option value="AFD">AFD</option>
                  <option value="ATM">ATM</option>
                  <option value="Attended POS">Attended POS</option>
                  <option value="TOM/SoftPOS">TOM/SoftPOS</option>
                  <option value="Unattended POS">Unattended POS</option>
                </select>
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <span className="font col-2 pe-4 text-right m-0">
                Testing Scope
              </span>
              <div className="row formcard col-7 ps-4 ">
                {["Contact", "Contactless", "Both"].map((scope) => {
                  const isTransitOrTOM =
                    formik.values.terminal_type === "Transit" ||
                    formik.values.terminal_type === "TOM/SoftPOS";

                  const shouldDisable =
                    isTransitOrTOM && scope !== "Contactless";

                  return (
                    <div key={scope} className="form-check col-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="testing_scope"
                        value={scope}
                        checked={formik.values.testing_scope === scope}
                        onChange={formik.handleChange}
                        disabled={shouldDisable}
                      />
                      <label className="form-check-label ms-3">{scope}</label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <span className="font col-2 pe-4 text-right m-0">
                Payment Technology
              </span>
              <div className="row formcard col-7 ps-4">
                {["DPAS 1.0", "DPAS Connect"].map((spec) => (
                  <div key={spec} className="form-check col-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment_technology"
                      value={spec}
                      checked={formik.values.payment_technology === spec}
                      onChange={formik.handleChange}
                    />
                    <label className="form-check-label ms-3">{spec}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <span className="font col-2 pe-4 text-right m-0">
                Cashback PIN
              </span>
              <div className="row formcard col-7 ps-4 ">
                {["Yes", "No"].map((option) => (
                  <div key={option} className="form-check col-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="cashback_pin"
                      value={option}
                      checked={
                        formik.values.cashback_pin === (option === "Yes")
                      }
                      onChange={handleBooleanChange("cashback_pin")}
                    />
                    <label className="form-check-label ms-3">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <span className="font col-2 pe-4 text-right m-0">
                PIN Entry Capability
              </span>
              <div className="row formcard col-7 ps-4">
                {["Yes", "No"].map((option) => (
                  <div key={option} className="form-check col-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="pin_entry_capability"
                      value={option}
                      checked={
                        formik.values.pin_entry_capability ===
                        (option === "Yes")
                      }
                      onChange={handleBooleanChange("pin_entry_capability")}
                    />
                    <label className="form-check-label ms-3">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-6 row align-items-center mb-4">
              <p className="font col-4 pe-4 text-right m-0">
                Short Description
              </p>
              <div className="col-5 ps-3">
                <input
                  type="text"
                  name="short_description"
                  value={formik.values.short_description}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                />
              </div>
            </div>

            <div className="col-12 mb-3 d-flex align-items-center ">
              <label className="font col-2 pe-5 text-right m-0">
                Testing Steps
              </label>
              <div className="col-6 p-0">
                {steps.map((step, index) => (
                  <div key={index} className="mb-2 col-12">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      className="form-control formcontrol"
                      placeholder={`Step ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-block mx-3"
                onClick={handleAddStep}
              >
                +
              </button>
            </div>

            <div className="row mt-4">
              <label className="col-2 font text-right">Test Case Status</label>
              <div className="radio-group col-8">
                {["draft", "active", "inactive"].map((status) => (
                  <label
                    key={status}
                    className="radio-label"
                    style={{
                      marginBottom: 0,
                      gap: "0.1rem",
                      marginRight: "4rem",
                    }}
                  >
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      value={status}
                      checked={formik.values.status?.toLowerCase() === status}
                      onChange={formik.handleChange}
                      style={{
                        marginTop: 0,
                        width: "1.3rem",
                        height: "1.3rem",
                        marginRight: "10px",
                      }}
                      disabled={
                        (formik.values.status?.toLowerCase() === "active" ||
                          formik.values.status?.toLowerCase() === "inactive") &&
                        status === "draft"
                      }
                    />
                    <span
                      className={
                        formik.values.status?.toLowerCase() === status
                          ? "highlight"
                          : ""
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-12 row align-items-center mb-3 mt-4">
              <div className="col-12 p-0 d-flex justify-content-end form-actions">
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => navigate(`/dashboard/test-case/view/${id}`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Test Case"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default UpdateTestCase;
