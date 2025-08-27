import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import TestCaseService from "../../services/TestCase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateTestCase = () => {
  const [params] = useSearchParams();
  const envFromQuery = params.get("environment");
  const cardTypeFromQuery = params.get("cardType");
  const [environment, setEnvironment] = useState(envFromQuery || "1");
  const [cardType, setCardType] = useState(cardTypeFromQuery || "Pos");
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([""]);
  const navigate = useNavigate();

  const initialValues = useMemo(
    () => ({
      test_cases_unique_id: "",
      terminal_type: "ATM",
      testing_scope: "Contactless",
      pin_entry_capability: "No",
      cashback_pin: "No",
      payment_technology: "DPAS Connect",
      short_description: "",
      status: "Active",
    }),
    []
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const requiredErrors = [];

      let testing_scope_value = values.testing_scope;
      if (typeof testing_scope_value === "string") {
        if (testing_scope_value === "Both") {
          testing_scope_value = ["Contact", "Contactless"];
        } else {
          testing_scope_value = [testing_scope_value];
        }
      }

      if (!values.terminal_type)
        requiredErrors.push("Terminal Type is required");
      if (!testing_scope_value || testing_scope_value.length === 0)
        requiredErrors.push("Testing Scope is required");
      if (!values.payment_technology)
        requiredErrors.push("Payment Technology is required");
      if (!values.pin_entry_capability)
        requiredErrors.push("PIN Entry Capability is required");
      if (!values.cashback_pin) requiredErrors.push("Cashback PIN is required");
      if (!values.short_description?.trim())
        requiredErrors.push("Short Description is required");
      if (!steps.length || steps.some((s) => !s.trim()))
        requiredErrors.push(" Testing Steps are required");

      if (requiredErrors.length > 0) {
        toast.error(requiredErrors[0]);
        return;
      }

      const payload = {
        ...values,
        environment_id: environment,

        // card_type: cardType,
        testing_steps: steps.join("\n"),

        pin_entry_capability: values.pin_entry_capability === "Yes",
        cashback_pin: values.cashback_pin === "Yes",
      };
      setIsLoading(true);
      try {
        await TestCaseService.createTestCase(payload);
        setIsLoading(false);
        navigate("/dashboard/test-case-list");
      } catch (error) {
        setIsLoading(false);
        console.error("Error submitting test case", error);
      }
    },
  });

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
    setCardType("Pos");
  };

  useEffect(() => {
    console.log("Selected testing_scope:", formik.values.testing_scope);
  }, [formik.values.testing_scope]);

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex w-100" style={{ paddingLeft: "170px" }}>
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
                <label className="form-check-label" htmlFor="flexRadioDefault1">
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
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="form-field-wrapper form-container">
        <form onSubmit={formik.handleSubmit} className="row">
          <div className="col-12 w-full row">
            <div className="row align-items-center mb-4">
              <div className="d-flex w-full ">
                <p className="font col-2 pe-4 text-right m-0">Terminal Type</p>
                <div className="col-5 p-0">
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
            </div>

            <div className="row align-items-center mb-4">
              <span className="font col-2 pe-4 text-right m-0">
                Testing Scope
              </span>
              <div className="row formcard col-7 ps-2 ms-1">
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
                        defaultValue={"Contactless"}
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
              <div className="row formcard col-7 ps-2 ms-1">
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
                PIN Entry Capability
              </span>
              <div className="row formcard col-7 ps-2 ms-1">
                {["Yes", "No"].map((option) => (
                  <div key={option} className="form-check col-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="pin_entry_capability"
                      value={option}
                      checked={formik.values.pin_entry_capability === option}
                      onChange={formik.handleChange}
                    />
                    <label className="form-check-label ms-3">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <span className="font col-2 pe-4 text-right m-0">
                Cashback PIN
              </span>
              <div className="row formcard col-7 ps-2 ms-1">
                {["Yes", "No"].map((option) => (
                  <div key={option} className="form-check col-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="cashback_pin"
                      value={option}
                      checked={formik.values.cashback_pin === option}
                      onChange={formik.handleChange}
                    />
                    <label className="form-check-label ms-3">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <p className="font col-2 pe-4 text-right m-0">
                Short Description
              </p>
              <div className="col-7">
                <input
                  type="text"
                  name="short_description"
                  value={formik.values.short_description}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                />
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <label className="font col-2 pe-4 text-right m-0">
                Testing Steps
              </label>
              <div className="col-6">
                {steps.map((step, index) => (
                  <div key={index} className="mb-2">
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
              <div className="col-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddStep}
                >
                  +
                </button>
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <label className="font col-2 pe-4 text-right m-0">
                Test Case Status
              </label>
              <div className="row formcard col-7 ps-3 ms-1">
                {["Draft", "Active", "Inactive"].map((status) => (
                  <div key={status} className="form-check col-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      value={status}
                      checked={formik.values.status === status}
                      onChange={formik.handleChange}
                    />
                    <label className="form-check-label ms-3">
                      <span
                        className={
                          formik.values.status === status ? "highlight" : ""
                        }
                      >
                        {status}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="row align-items-center mb-4">
              <div className="col-12 d-flex justify-content-end form-actions">
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => navigate("/dashboard/test-case-list")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Create Test Case"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default CreateTestCase;
