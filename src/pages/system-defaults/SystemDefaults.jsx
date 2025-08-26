import { useState, useEffect, useCallback } from "react";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./systemdefaults.css";

const default_details = {
  offline_usage: 0,
  total_usage: 0,
  key_expiry: 0,
  offline_days: 0,
  grace_days: 0,
  release_card_after: 0,
  key_usage: 0,
  encryption_method: 0,
  brands: [],
};

function SystemDefaults() {
  const [env, setEnv] = useState("1");
  const { userRole } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [systemDefaults, setSystemDefaults] = useState(default_details);

  const [recordId, setRecordId] = useState(null); // new
  const [brandsList, setBrandsList] = useState([]);

  const fetchSystemDefaults = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosToken.get(
        "/system-defaults?environment=" + env
      );
      if (data?.length) {
        console.log(data)
        setSystemDefaults(data[0]);
        setRecordId(data[0].id);
      } else {
        setSystemDefaults(default_details);
        setRecordId(null);
      }
    } catch (error) {
      console.error("Error fetching system defaults:", error);
    } finally {
      setLoading(false);
    }
  }, [env]);

  useEffect(() => {
    fetchSystemDefaults();
  }, [env, fetchSystemDefaults]);

  const handleEnvironmentChange = (e) => {
    setEnv(e.target.value);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      delete systemDefaults.encryption_method
      
      if (recordId) {
        await axiosToken.put(`/system-defaults/${recordId}`, {
          ...systemDefaults,
          environment: env,
        });
        toast.success("Settings updated successfully!");
      } else {
        await axiosToken.post("/system-defaults", {
          ...systemDefaults,
          environment: env,
        });
        toast.success("Settings created successfully!");
        fetchSystemDefaults(); // refresh after save
      }
    } catch (error) {
      console.error("Error updating system defaults:", error);
      toast.error("Error updating system defaults!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    params.set("recordId", recordId);
    navigate({ search: params.toString() }, { replace: true });
  }, [recordId]);

  const fetchBrands = async () => {
    try {
      const { data } = await axiosToken.get(`/brands?environment=${env}`);
      setBrandsList(data?.data);
    } catch (err) {
      console.error("Failed to fetch brands", err);
      toast.error("Failed to load brands.");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <>
      {/* Main Content */}
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="d-lg-flex align-items-start justify-content-start container w-100">
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
          <form className="mt-4 form-field-wrapper">
            <div className="system-default-container">
              <div className="system-default-container">
                <label className="text-right font no-wrap">Offline Usage</label>
                <div className="system-default-container-div">
                  <input
                    type="number"
                    className="system-default-container-input"
                    min={0}
                    value={systemDefaults.offline_usage}
                    onChange={(e) =>
                      setSystemDefaults({
                        ...systemDefaults,
                        offline_usage: Number(e.target.value),
                      })
                    }
                  />
                  <span>days</span>
                </div>
              </div>

              <div className="system-default-container">
                <label className="text-right font no-wrap">Total Usage #</label>
                <div className="system-default-container-div">
                  <input
                    type="number"
                    className="system-default-container-input"
                    min={0}
                    value={systemDefaults.total_usage}
                    onChange={(e) =>
                      setSystemDefaults({
                        ...systemDefaults,
                        total_usage: Number(e.target.value),
                      })
                    }
                  />
                  <span>days</span>
                </div>
              </div>
            </div>

            <div className="system-default-container">
              <div className="system-default-container">
                <label className="text-right font no-wrap">Offline Days</label>
                <div className="system-default-container-div">
                  <input
                    type="number"
                    className="system-default-container-input"
                    min={0}
                    value={systemDefaults.offline_days}
                    onChange={(e) =>
                      setSystemDefaults({
                        ...systemDefaults,
                        offline_days: Number(e.target.value),
                      })
                    }
                  />
                  <span>days</span>
                </div>
              </div>

              <div className="system-default-container">
                <label className="text-right font no-wrap">Key Expiry</label>
                <div className="system-default-container-div">
                  <input
                    type="number"
                    className="system-default-container-input"
                    min={0}
                    value={systemDefaults.key_expiry}
                    onChange={(e) =>
                      setSystemDefaults({
                        ...systemDefaults,
                        key_expiry: Number(e.target.value),
                      })
                    }
                  />
                  <span>days</span>
                </div>
              </div>
            </div>

            <div className="system-default-container">
              <div className="system-default-container">
                <label className="text-right font no-wrap">Grace Days</label>
                <div className="system-default-container-div">
                  <input
                    type="number"
                    className="system-default-container-input"
                    min={0}
                    value={systemDefaults.grace_days}
                    onChange={(e) =>
                      setSystemDefaults({
                        ...systemDefaults,
                        grace_days: Number(e.target.value),
                      })
                    }
                  />
                  <span>days</span>
                </div>
              </div>

              <div className="system-default-container">
                <label className="text-right font no-wrap">
                  Release card after
                </label>
                <div className="system-default-container-div">
                  <input
                    type="number"
                    className="system-default-container-input"
                    min={0}
                    value={systemDefaults.release_card_after}
                    onChange={(e) =>
                      setSystemDefaults({
                        ...systemDefaults,
                        release_card_after: Number(e.target.value),
                      })
                    }
                  />
                  <span>days</span>
                </div>
              </div>
            </div>

            <div className="system-default-container">
              <div className="system-default-container">
                <label className="text-right font no-wrap">Key Usage</label>
                <div className="system-default-container-div">
                  <select
                    className="form-select me-2"
                    style={{ width: "250px" }}
                    value={systemDefaults?.encryption_method}
                    onChange={(e) => {
                        setSystemDefaults({
                        ...systemDefaults,
                        encryption_method: Number(e.target.value),
                      })
                    }}
                  >
                    <option value={0}>
                      Single key for all users & issuers
                    </option>
                    <option value={1}>
                      Separate keys: One for users, one for issuers
                    </option>
                    <option value={2}>
                      Unique key for each issuer, shared key for users
                    </option>
                    <option value={3}>Unique key for each user & issuer</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              className="system-default-container"
              style={{
                gridTemplateColumns: "1fr 3fr",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <label className="text-right font no-wrap">
                Supported Brands
              </label>
              <div
                className="system-default-container-div"
                style={{ gap: "2rem", flexWrap: "wrap" }}
              >
                {brandsList?.map((brand) => (
                  <div className="d-flex align-items-center" key={brand.id}>
                    <input
                      id={`brand-${brand.id}`}
                      className="form-check-input onboarduserv2-form-radio-square-label"
                      type="checkbox"
                      value={brand.id}
                      checked={systemDefaults.brands.includes(brand.id)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const updated = systemDefaults.brands.includes(value)
                          ? systemDefaults.brands.filter((id) => id !== value)
                          : [...systemDefaults.brands, value];
                        setSystemDefaults({
                          ...systemDefaults,
                          brands: updated,
                        });
                      }}
                    />
                    <label
                      htmlFor={`brand-${brand.id}`}
                      className="form-check-label no-wrap font"
                    >
                      {brand.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="system-default-container">
              <div className="system-default-container">
                <label className="text-right font no-wrap">
                  Supported Countries
                </label>
                <div
                  className="system-default-container-div"
                  onClick={() =>
                    navigate("/dashboard/system-settings/manage-countries")
                  }
                  style={{ cursor: "pointer" }}
                >
                  <p>View Country list</p>
                </div>
              </div>

              <div className="system-default-container">
                <label className="text-right font no-wrap">Supported MCC</label>
                <div
                  className="system-default-container-div"
                  onClick={() =>
                    navigate("/dashboard/system-defaults-v2/manage-mcc")
                  }
                  style={{ cursor: "pointer" }}
                >
                  <p>View MCC list</p>
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
              <button className="w-150p btn save-btn" onClick={handleSave}>
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

export default SystemDefaults;
