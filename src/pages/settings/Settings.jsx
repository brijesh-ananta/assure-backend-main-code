import { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";

function Settings() {
  const [headerTitle, ] = useState("System Defaults");
  const [env, setEnv] = useState("1");
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [systemDefaults, setSystemDefaults] = useState({
    offline_usage: 5,
    total_usage: 5,
    key_expiry: 5,
    offline_days: 5,
    days_to_free_card: 30,
  });

  useEffect(() => {
    const fetchSystemDefaults = async () => {
      try {
        const { data } = await axiosToken.get("/system-defaults?environment=" + env);
        setSystemDefaults(data?.[0] || {
          offline_usage: 5,
          total_usage: 5,
          key_expiry: 5,
          offline_days: 5,
          days_to_free_card: 30,
        });
      } catch (error) {
        console.error("Error fetching system defaults:", error);
      }
    };

    fetchSystemDefaults();
  }, [env]);

  const handleEnvironmentChange = (e) => {
    setEnv(e.target.value);
  };

  const handleInputChange = (field, value) => {
    if (userRole === 1) { // Only allow changes if userRole is 1
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
      alert("Settings updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating system defaults:", error);
      alert("Error updating system defaults!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      {/* Main Content */}
      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-2">
        <div className="container">
          <div className="d-lg-flex align-items-center justify-content-center">
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

      <section className="notification pb-5">
        <div className="container-fluid">
          <form className="mxwidth">
            <div className="login-page mb-lg-4 mb-2 row flex-column g-3">
              <div className="col-12 col-lg-3 pe-lg-0">
                <div className="d-lg-flex align-items-center">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                    Offline Usage
                  </label>
                  <input
                    value={systemDefaults.offline_usage}
                    onChange={(e) =>
                      handleInputChange("offline_usage", e.target.value)
                    }
                    type="number"
                    className="form-control formcontrol me-lg-3 flex-shrink-0"
                    disabled={userRole !== 1} // Disable input if userRole != 1
                  />
                  <span>days</span>
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-0">
                <div className="d-lg-flex align-items-center">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                    Total Usage
                  </label>
                  <input
                    type="number"
                    className="form-control formcontrol me-lg-3 flex-shrink-0"
                    value={systemDefaults.total_usage}
                    onChange={(e) =>
                      handleInputChange("total_usage", e.target.value)
                    }
                    disabled={userRole !== 1} // Disable input if userRole != 1
                  />
                  <span>days</span>
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-0">
                <div className="d-lg-flex align-items-center">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                    Key Expiry
                  </label>
                  <input
                    type="number"
                    className="form-control formcontrol me-lg-3 flex-shrink-0"
                    value={systemDefaults.key_expiry}
                    onChange={(e) =>
                      handleInputChange("key_expiry", e.target.value)
                    }
                    disabled={userRole !== 1} // Disable input if userRole != 1
                  />
                  <span>days</span>
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-0">
                <div className="d-lg-flex align-items-center">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                    Offline Days
                  </label>
                  <input
                    type="number"
                    className="form-control formcontrol me-lg-3 flex-shrink-0"
                    value={systemDefaults.offline_days}
                    onChange={(e) =>
                      handleInputChange("offline_days", e.target.value)
                    }
                    disabled={userRole !== 1} // Disable input if userRole != 1
                  />
                  <span>days</span>
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-0">
                <div className="d-lg-flex align-items-center">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                    Days to free card after Last use
                  </label>
                  <input
                    type="number"
                    className="form-control formcontrol me-lg-3 flex-shrink-0"
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
          </form>

          <div className="row">
            <div className="btn-section text-lg-center">
              {userRole === 1 && (
                <button className="btn-add mx-auto" onClick={handleSave}>
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  )}
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer audit={true} tableName="system_defaults" recordId={1} />
    </>
  );
}

export default Settings;