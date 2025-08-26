import React, { useState } from "react";
import Footer from "../common/Footer";
import OtpValidation from "./OtpValidation";
import axiosToken from "../utils/axiosToken";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const location = useLocation();
  let message = location.state?.message;
  const VITE_SITE_NAME = import.meta.env.VITE_SITE_NAME;

  React.useEffect(() => {
    if (message) {
      toast.success(message);
    }
  }, [message]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setLoginError("Email and password are required");
      return;
    }
    setLoginError("");
    setIsProcessing(true);

    try {
      const response = await axiosToken.post("/users/login", {
        email,
        password,
      });
      if (response.data.success == true) {
        if (response.data.showOtp) {
          toast.success(response.data.message || "Otp sent successfully");
          setShowOtpField(true);
          setIsProcessing(false);
        } else {
          setLoginSuccess(response.data.message || "Login successful");
          localStorage.setItem("bhtoken", response.data.token);
          localStorage.setItem("ciperText", response.data.ciperText);
          setIsProcessing(false);
          clearSuccessMessage();
          window.location.href = "/dashboard";
        }
      } else {
        setLoginError(response.data.message || "Login failed");
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
      setLoginError(
        error.response?.data?.message || "An error occurred during login."
      );
    }
  };

  const clearSuccessMessage = () => {
    setLoginSuccess("");
  };

  return (
    <div
      className="d-flex flex-column"
      style={{ minHeight: "100vh", height: "100vh" }}
    >
      <header className="login-header">
        <div className="logo d-flex align-items-center gap-4">
          <a
            href="#"
            className="d-flex align-items-center text-decoration-none"
          >
            <img
              src="/images/Logobottomwhite.png"
              alt="Login Logo"
              className="img-fluid"
              style={{ width: "5%", height: "auto" }}
            />
            <span className="ms-2">{VITE_SITE_NAME}</span>
          </a>
        </div>
      </header>

      <div className="flex-grow-1 d-flex">
        <div className="container-fluid">
          <div className="row h-100">
            <div className="col-lg-6 g-0 d-flex align-items-lg-center">
              <div className="form-login">
                <div className="image-section -headding mb-lg-4 mb-2">
                  <img
                    src="/images/Logo_side1.png"
                    alt="Login Logo"
                    className="img-fluid loginslide"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>

                {/* Unified Login & OTP Form */}
                <form onSubmit={handleLogin} className="form-section">
                  {/* Display login error message */}
                  {loginError && (
                    <div className="text-danger mb-3 font-weight-bold">
                      {loginError}
                    </div>
                  )}

                  {loginSuccess && (
                    <div className="text-success mb-3 font-weight-bold">
                      {loginSuccess}
                    </div>
                  )}

                  <div className="login-page mb-lg-4 mb-2">
                    <div className="mb-3">
                      <input
                        type="email"
                        placeholder="User ID/Email"
                        className="form-control formcontrol"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={showOtpField}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="position-relative w-100">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="form-control formcontrol"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          // disable password after send otp
                          disabled={showOtpField}
                        />
                        <img
                          className="postiop"
                          onClick={togglePasswordVisibility}
                          src={
                            showPassword
                              ? "/images/eye-open.svg"
                              : "/images/eye-off.svg"
                          }
                          alt="Toggle Password"
                        />
                      </div>
                    </div>

                    {/* add forgot password */}
                    <div className="d-flex justify-content-between gap-5">
                      {/* if show otp field hide login button */}
                      {!showOtpField && (
                        <>
                          <div className="mb-3">
                            <Link
                              to="/forgot-password"
                              className="forgot-password"
                            >
                              Forgot Password?
                            </Link>
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary mb-3 formcontrol ms-0"
                          >
                            {/* show processing */}
                            {isProcessing && (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            )}
                            Login
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </form>
                {/* OTP Input (Visible Only After Login) with pass email address */}

                {showOtpField && (
                  <OtpValidation
                    email={email}
                    clearSuccessMessage={clearSuccessMessage}
                  />
                )}
              </div>
            </div>

            {/* Right Side Image Section */}
            <div className="col-lg-6 g-0 d-lg-block d-none">
              <div className="image-form h-100 bg-dark">
                <img src="/images/login-img.jpg" alt="Login Background" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
