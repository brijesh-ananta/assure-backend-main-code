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
          pin_entry_capability: data.pin_entry_capability,
          cashback_pin: data.cashback_pin,
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
                  value="1"
                  checked={environment === "1"}
                  onChange={handleEnvironmentChange}
                  id="envProd"
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
                />
                <label className="form-check-label" htmlFor="envQA">
                  QA
                </label>
              </div>
            </div>
            {/* <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3 ms-3">
              <span className="me-3 font">Card Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input className="form-check-input" type="radio" name="cardType" value="Pos" checked={cardType === "Pos"} onChange={handleCardTypeChange} id="cardType1" />
                <label className="form-check-label" htmlFor="cardType1">POS</label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input className="form-check-input" type="radio" name="cardType" value="Ecomm" checked={cardType === "Ecomm"} onChange={handleCardTypeChange} id="cardType2" disabled={environment === "2"} />
                <label className="form-check-label" htmlFor="cardType2">Ecomm</label>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <section className="form-field-wrapper form-container">
        <form onSubmit={formik.handleSubmit} className="row">
          <div className="col-12 row">
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Test Case ID</p>
              <div className="col-5 p-0">
                <input
                  type="text"
                  name="test_cases_unique_id"
                  value={formik.values.test_cases_unique_id}
                  onChange={formik.handleChange}
                  placeholder="Test Case ID"
                  className="form-control formcontrol"
                />
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Terminal Type</p>
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
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Testing Type</p>
              <div className="col-5 p-0">
                <select
                  name="testing_type"
                  value={formik.values.testing_type}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                >
                  <option value="Regression">Regression</option>
                </select>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Testing Scope</p>
              <div className="col-5 p-0">
                <select
                  name="testing_scope"
                  value={formik.values.testing_scope}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                >
                  <option value="Contact">Contact</option>
                  <option value="Contactless">Contactless</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">
                PIN Entry Capability
              </p>
              <div className="col-5 p-0">
                <select
                  name="pin_entry_capability"
                  value={formik.values.pin_entry_capability}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">Cashback PIN</p>
              <div className="col-5 p-0">
                <select
                  name="cashback_pin"
                  value={formik.values.cashback_pin}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "cashback_pin",
                      e.target.value === "true"
                    )
                  }
                  className="form-control formcontrol"
                >
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </select>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">
                Payment Technology
              </p>
              <div className="col-5 p-0">
                <select
                  name="payment_technology"
                  value={formik.values.payment_technology}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                >
                  <option value="Magstripe">Magstripe</option>
                  <option value="Spec 1">Spec 1</option>
                  <option value="Spec 2">Spec 2</option>
                </select>
              </div>
            </div>
            <div className="col-6 row align-items-center mb-3">
              <p className="font col-4 pe-4 text-right m-0">
                Short Description
              </p>
              <div className="col-5 p-0">
                <input
                  type="text"
                  name="short_description"
                  value={formik.values.short_description}
                  onChange={formik.handleChange}
                  className="form-control formcontrol"
                />
              </div>
            </div>
            <div className="col-12 mb-3 d-flex align-items-center mt-4">
              <label className="font col-2 px-4 text-right m-0">
                Testing Steps
              </label>
              <div className="d-block col-6">
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
              <label className="col-2 font text-right">Bin Status</label>
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
