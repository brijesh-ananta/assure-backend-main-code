import { useState, useEffect } from "react";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

function Settings() {
  const [env, setEnv] = useState("1");
  const { userRole } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [systemDefaults, setSystemDefaults] = useState({
    offline_usage: 5,
    total_usage: 5,
    key_expiry: 5,
    offline_days: 5,
    days_to_free_card: 30,
    grace_days: 5
  });

  const fetchSystemDefaults = async () => {
    try {
      const { data } = await axiosToken.get(
        "/system-defaults?environment=" + env
      );
      setSystemDefaults(
        data?.[0] || {
          offline_usage: 5,
          total_usage: 5,
          key_expiry: 5,
          offline_days: 5,
          days_to_free_card: 30,
        }
      );
    } catch (error) {
      console.error("Error fetching system defaults:", error);
    }
  };
  
  useEffect(() => {
    fetchSystemDefaults();
  }, [env]);

  const handleEnvironmentChange = (e) => {
    setEnv(e.target.value);
  };

  const handleInputChange = (field, value) => {
    if (userRole === 1) {
      setSystemDefaults((prevDefaults) => ({
        ...prevDefaults,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axiosToken.put("/system-defaults/" + env, systemDefaults);
      setLoading(false);
      toast.success("Settings updated successfully!");
      fetchSystemDefaults()
    } catch (error) {
      console.error("Error updating system defaults:", error);
      toast.error("Error updating system defaults!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    params.set("recordId", 1);
    navigate({ search: params.toString() }, { replace: true });
  }, []);

  return (
    <>
      {/* Main Content */}
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="d-lg-flex align-items-center justify-content-evenly w-100">
          <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
            <span className="me-lg-5 font">Environment</span>

            <div className="d-lg-flex formcard">
              <div className="form-check me-3 d-flex gap-4 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"1"}
                  id="flexRadioDefault1"
                  checked={env === "1"}
                  onChange={handleEnvironmentChange}
                  disabled={userRole !== 1} // Disable radio buttons if userRole != 1
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check d-flex gap-4 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  id="flexRadioDefault2"
                  value="2"
                  checked={env === "2"}
                  onChange={handleEnvironmentChange}
                  disabled={userRole !== 1} // Disable radio buttons if userRole != 1
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-5 pb-5">
        <div className="container">
          <span className="font text-4">Test Card default Parameters</span>
          <form className="d-flex align-content-center justify-content-center mt-4 form-field-wrapper">
            <div className="row gap-5">
              <div className="col-11 col-md-5">
                <div className="col-12">
                  <div className="row align-items-center">
                    <label className="col-4 text-right font no-wrap">
                      Offline Usage
                    </label>

                    <div className="col-5 d-flex gap-4">
                      <input
                        value={systemDefaults.offline_usage}
                        onChange={(e) =>
                          handleInputChange("offline_usage", e.target.value)
                        }
                        type="number"
                        className="form-control formcontrol "
                        disabled={userRole !== 1}
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <div className="row align-items-center">
                    <label className="col-4 text-right font no-wrap">
                      Offline Days
                    </label>
                    <div className="col-5 d-flex gap-4">
                      <input
                        type="number"
                        className="form-control formcontrol"
                        value={systemDefaults.offline_days}
                        onChange={(e) =>
                          handleInputChange("offline_days", e.target.value)
                        }
                        disabled={userRole !== 1} // Disable input if userRole != 1
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <div className="row align-items-center">
                    <label className="col-4 text-right font no-wrap">
                      Grace days
                    </label>
                    <div className="col-5 d-flex gap-4">
                      <input
                        type="number"
                        className="form-control formcontrol"
                        value={systemDefaults.grace_days}
                        onChange={(e) =>
                          handleInputChange("grace_days", e.target.value)
                        }
                        disabled={userRole !== 1} 
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-11 col-md-5">
                <div className="col-12">
                  <div className="row align-items-center">
                    <label className="col-5 text-right font no-wrap">
                      Total Usage
                    </label>
                    <div className="col-5 d-flex gap-4">
                      <input
                        type="number"
                        className="form-control formcontrol"
                        value={systemDefaults.total_usage}
                        onChange={(e) =>
                          handleInputChange("total_usage", e.target.value)
                        }
                        disabled={userRole !== 1} // Disable input if userRole != 1
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <div className="row align-items-center">
                    <label className="col-5 text-right font no-wrap">
                      Key Expiry
                    </label>
                    <div className="col-5 d-flex gap-4">
                      <input
                        type="number"
                        className="form-control formcontrol"
                        value={systemDefaults.key_expiry}
                        onChange={(e) =>
                          handleInputChange("key_expiry", e.target.value)
                        }
                        disabled={userRole !== 1} // Disable input if userRole != 1
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <div className="row align-items-center">
                    <label className="col-5 text-right font no-wrap">
                      Release card after
                    </label>

                    <div className="col-5 d-flex gap-4">
                      <input
                        type="number"
                        className="form-control formcontrol"
                        value={systemDefaults.days_to_free_card}
                        onChange={(e) =>
                          handleInputChange("days_to_free_card", e.target.value)
                        }
                        disabled={userRole !== 1} // Disable input if userRole != 1
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="d-flex mt-5 justify-content-end gap-5">
            <button
              className="btn cancel-btn w-150p"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
            {userRole === 1 && (
              <button  className="w-150p btn save-btn" onClick={handleSave}>
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                Save
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Settings;
