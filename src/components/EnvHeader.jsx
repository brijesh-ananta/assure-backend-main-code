/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EnvHeader = ({
  environmentOptions = [],
  terminalTypeOptions = [],
  onEnvironmentChange,
  onTerminalTypeChange,
  onSubmit,
  isSubmitDisabled = false,
  showSubmit = true,
  submitLabel = "Submit New Request",
  disableHeader = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get query params
  const params = new URLSearchParams(location.search);
  const envFromQuery = params.get("environment");
  const termFromQuery = params.get("terminalType");

  const [selectedEnvironment, setSelectedEnvironment] = useState(
    envFromQuery || environmentOptions[0]?.value || ""
  );
  const [selectedTerminalType, setSelectedTerminalType] = useState(
    termFromQuery || terminalTypeOptions[0]?.value || ""
  );

  useEffect(() => {
    if (!selectedEnvironment && environmentOptions[0]?.value) {
      setSelectedEnvironment(environmentOptions[0].value);
    }
    if (!selectedTerminalType && terminalTypeOptions[0]?.value) {
      setSelectedTerminalType(terminalTypeOptions[0].value);
    }
  }, [
    environmentOptions,
    navigate,
    params,
    selectedEnvironment,
    selectedTerminalType,
    terminalTypeOptions,
  ]);

  useEffect(() => {
    if (envFromQuery && envFromQuery !== selectedEnvironment) {
      setSelectedEnvironment(envFromQuery);
    }
    if (termFromQuery && termFromQuery !== selectedTerminalType) {
      setSelectedTerminalType(termFromQuery);
    }
    // eslint-disable-next-line
  }, [envFromQuery, termFromQuery]);

  useEffect(() => {
    if (!envFromQuery) {
      const val = environmentOptions[0]?.value;
      setSelectedEnvironment(val);
      params.set("environment", val);
      navigate({ search: params.toString() }, { replace: true });
      onEnvironmentChange && onEnvironmentChange(val);
    }

    if (!termFromQuery) {
      const val = terminalTypeOptions[0]?.value;
      setSelectedTerminalType(val);
      params.set("terminalType", val);
      navigate({ search: params.toString() }, { replace: true });
      onEnvironmentChange && onEnvironmentChange(val);
    }
  }, [
    envFromQuery,
    environmentOptions,
    navigate,
    onEnvironmentChange,
    params,
    selectedEnvironment,
    selectedTerminalType,
    termFromQuery,
    terminalTypeOptions,
  ]);

  const handleEnvChange = (val) => {
    setSelectedEnvironment(val);
    params.set("environment", val);
    navigate({ search: params.toString() }, { replace: true });
    onEnvironmentChange && onEnvironmentChange(val);
  };
  const handleTypeChange = (val) => {
    setSelectedTerminalType(val);
    params.set("terminalType", val);
    navigate({ search: params.toString() }, { replace: true });
    onTerminalTypeChange && onTerminalTypeChange(val);
  };

  return (
    <div className="notification mangeissuer mb-5 py-lg-3 py-2 aqua-border-b">
      <div className="container-fluid ">
        <div className="d-lg-flex align-items-center justify-content-evenly w-100">
          <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
            <span className="me-3 font">Environment</span>
            {environmentOptions.map((env) => (
              <div
                key={env.value}
                className="form-check me-3 d-flex gap-2 align-items-center"
              >
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  id={`env_${env.value}`}
                  value={env.value}
                  checked={selectedEnvironment == env.value}
                  onChange={() => handleEnvChange(env.value)}
                  disabled={env.disabled || disableHeader}
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor={`env_${env.value}`}
                >
                  {env.label}
                </label>
              </div>
            ))}
          </div>

          <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
            <span className="me-3 font">Terminal Type</span>
            {terminalTypeOptions?.map((type) => (
              <div
                key={type.value}
                className="form-check me-3 d-flex gap-2 align-items-center"
              >
                <input
                  className="form-check-input"
                  type="radio"
                  name="terminalType"
                  id={`terminalType_${type.value}`}
                  value={type.value}
                  checked={selectedTerminalType === type.value}
                  onChange={() => handleTypeChange(type.value)}
                  disabled={type.disabled || disableHeader}
                />
                <label
                  className="fw-bold form-check-label"
                  htmlFor={`terminalType_${type.value}`}
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>

          {showSubmit && (
            <button
              className={`btn save-btn py-2${isSubmitDisabled ? " disabled" : ""}`}
              onClick={onSubmit}
              disabled={isSubmitDisabled}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvHeader;
