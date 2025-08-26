import { useState } from "react";
import PropTypes from "prop-types";
import axiosToken from "../utils/axiosToken";

function OtpValidation({ email, clearSuccessMessage }) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [islocked, setLocked] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  // set otp process..
  const [otpProcess, setOtpProcess] = useState(false);

  // Handle OTP Submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    clearSuccessMessage();
    setOtpError("");
    setOtpSuccess("");
    if (!otp) {
      setOtpError("OTP is required");
      setOtpProcess(false);
      return;
    }
    setIsProcessing(true);
    setOtpProcess(true);
    try {
      const response = await axiosToken.post("/users/verify-otp", {
        email,
        otp,
      });
      if (response.data.success === true) {
        setOtpProcess(false);
        setOtpError("");
        //setOtpSuccess(response.data.message || "Otp sent successfully");
        setIsProcessing(false);
        localStorage.setItem("bhtoken", response.data.token);
        localStorage.setItem("ciperText", response.data.ciperText);
        clearSuccessMessage();
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setOtpError(error.response.data.message || "Failed to send otp");
      setIsProcessing(false);
      setOtpProcess(false);
      if (error.response.data.locked === true) {
        setIsProcessing(false);
        setLocked(true);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }
  };

  const handleResendOtp = async () => {
    clearSuccessMessage();
    setOtpProcess(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const response = await axiosToken.post("/users/resend-otp", {
        email,
      });
      if (response.data.success === true) {
        setOtpError("");
        setOtpSuccess(response.data.message || "Otp sent successfully");
        setOtpProcess(false);
      }
    } catch (error) {
      setOtpError(error.response.data.message || "Failed to send otp");
      setOtpProcess(false);
    }
  };

  const toggleOtpVisibility = () => {
    setShowOtp((prev) => !prev);
  };

  return (
    <form onSubmit={handleOtpSubmit}>
      <div className="otp mt-5">
        {otpError && (
          <div className="text-danger mb-3 font-weight-bold">{otpError}</div>
        )}

        {otpSuccess && (
          <div className="text-success mb-3 font-weight-bold">{otpSuccess}</div>
        )}
        <div className="mb-3 position-relative">
          <input
            placeholder="Enter OTP"
            className="form-control formcontrol"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            type={showOtp ? "text" : "password"}
          />
          <span
            className={`fa ${showOtp ? "fa-eye-slash" : "fa-eye"} eye-icon`}
            onClick={toggleOtpVisibility}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#666",
            }}
          ></span>
        </div>
        <p className="font mb-4">Your OTP will expire in 10 minutes.</p>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          {!islocked && (
            // show loading.. until response
            <div className="d-flex align-items-center">
              <a
                href="#"
                onClick={() => handleResendOtp()}
                className="resend-otp"
              >
                {otpProcess ? (
                  <span className="me-2">Sending OTP... </span>
                ) : (
                  "Resend OTP"
                )}
              </a>
            </div>
          )}
          <button type="submit" className="btn btn-primary formcontrol">
            {isProcessing && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            Validate OTP
          </button>
        </div>
      </div>
    </form>
  );
}

OtpValidation.propTypes = {
  email: PropTypes.string,
  clearSuccessMessage: PropTypes.any,
};

export default OtpValidation;
