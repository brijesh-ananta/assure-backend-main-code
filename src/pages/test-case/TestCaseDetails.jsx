import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestCaseService from "../../services/TestCase";

const ViewTestCase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await TestCaseService.getTestCaseById(id);
        setTestCase(data.data);
      } catch (error) {
        console.error("Failed to fetch test case", error);
      }
    };
    fetchData();
  }, [id]);

  if (!testCase) return <div>Loading...</div>;

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-evenly w-100">
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Environment</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input className="form-check-input" type="radio" name="environment" value="1" checked={testCase.environment_id === 1} id="envProd" />
                <label className="form-check-label" htmlFor="envProd">Prod</label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input className="form-check-input" type="radio" name="environment" value="2" checked={testCase.environment_id === 2} id="envQA" />
                <label className="form-check-label" htmlFor="envQA">QA</label>
              </div>

             
            </div>

          </div>
        </div>
      </div>

      <section className="form-field-wrapper form-container">
        <div className="row">
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">Test Case ID</p>
            <p className="col-5">{testCase.test_cases_unique_id}</p>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">Terminal Type</p>
            <p className="col-5">{testCase.terminal_type}</p>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">Testing Type</p>
            <p className="col-5">{testCase.testing_type}</p>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">Testing Scope</p>
            <p className="col-5">{testCase.testing_scope}</p>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">PIN Entry Capability</p>
            <p className="col-5">{testCase.pin_entry_capability}</p>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">Cashback PIN</p>
            <p className="col-5">{testCase.cashback_pin ? "True" : "False"}</p>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">Payment Technology</p>
            <p className="col-5">{testCase.payment_technology}</p>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 text-right">Short Description</p>
            <p className="col-5">{testCase.short_description}</p>
          </div>

          <div className="col-12 mb-3 mt-4 row">
            <label className="font col-2 text-right">Testing Steps</label>
            <div className="col-6 d-block">
              {testCase.testing_steps
  ? testCase.testing_steps.split("\n").map((step, index) => (
      <p key={index}>{step}</p>
    ))
  : <p className="text-muted">No steps provided.</p>
}
            </div>
          </div>

          <div className="row mt-4">
            <label className="col-2 font text-right">Bin Status</label>
            <p className="col-8">{testCase.status}</p>
          </div>

          <div className="col-12 row align-items-center mb-3 mt-4">
            <div className="col-12 p-0 d-flex justify-content-end form-actions">
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => navigate(`/dashboard/test-case-list`)}
                >
                  Back
                </button>
              <button
                type="button"
                className="btn save-btn"
                onClick={() => navigate(`/dashboard/test-case/update/${testCase.id}`)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewTestCase;
