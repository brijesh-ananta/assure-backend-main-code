import { useEffect, useState } from "react";
import Footer from "../common/Footer";
import axiosToken from "../utils/axiosToken";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function ResetPassWord() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const VITE_SITE_NAME = import.meta.env.VITE_SITE_NAME;
  const [params] = useSearchParams()

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState(""); // To display login errors
  const [loginSuccess, setLoginSuccess] = useState(""); // To display login errors
  const [isProcessing, setIsProcessing] = useState(false); // To show processing spinner
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const [checkToken, setCheckToken] = useState(false);
  //   get token from url
  const RPWDtoken = params.get('token')

  // check token is valid or not expire
  const check_Token = async () => {
    try {
      setIsProcessing(true); // Start processing spinner
      setCheckToken(false);
      const response = await axiosToken.post("/users/check-token", {token: RPWDtoken});
      if (response.data.success === true) {
        setCheckToken(true);
        //setLoginSuccess(response.data.message || "Password reset token is valid");
        setIsProcessing(false); // Stop processing spinner
      } else {
        setLoginError(response.data.message || "Invalid token");
        setIsProcessing(false); // Stop processing spinner
        setCheckToken(false);
      }
    } catch (error) {
      setIsProcessing(false); // Stop processing spinner
      setCheckToken(false);
      // here in mesage add message link for forgot password

      setLoginError(
        error.response?.data?.message || "An error occurred during login."
      );
    }
  };

  // check token
  useEffect(() => {
    check_Token();
  }, [RPWDtoken]);

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Handle Login Form Submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission

    // validate password and confirm password
    if (newPassword != confirmPassword) {
      setLoginError("New password and confirm password do not match.");
      return;
    }

    // check rule for password
    if (!strongPasswordRegex.test(newPassword)) {
      setLoginError(
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a digit, and a special character."
      );
      return;
    }

    // Clear previous errors
    setLoginError("");
    setLoginSuccess("");
    setIsProcessing(true); // Start processing spinner

    try {
      const response = await axiosToken.post("/users/reset-password", {
        token: RPWDtoken,
        password: newPassword,
      });
      if (response.data.success == true) {
        setLoginSuccess(response.data.message || "Password reset successful");
        setIsProcessing(false); // Stop processing spinner
        // Wait for 2 seconds to show success message then redirect
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password reset successful. Please login with your new password.",
            },
          });
        }, 1000);
      }
    } catch (error) {
      setIsProcessing(false); // Stop processing spinner
      setLoginError(
        error.response?.data?.message || "An error occurred during login."
      );
    }
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
                <div className="login-headding mb-lg-4 mb-2">
                  <img
                    src="/images/Logo_side1.png"
                    alt="Login Logo"
                    className="img-fluid loginslide"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>

                {/* Unified Login & OTP Form */}
                <form onSubmit={handleLogin}>
                  {/* Display login error message */}
                  {loginError && (
                    <div className="text-danger mb-3 font-weight-bold">
                      {loginError}
                      <br />
                      {/* if checkToken is true show link */}
                      {checkToken == false && (
                        <a href="/forgot-password">
                          Request new password reset link
                        </a>
                      )}
                    </div>
                  )}

                  {loginSuccess && (
                    <div className="text-success mb-3 font-weight-bold">
                      {loginSuccess}
                    </div>
                  )}

                  {checkToken && (
                    <div className="login-page mb-lg-4 mb-2">
                      <div className="mb-3">
                        <div className="position-relative w-100">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="form-control formcontrol"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
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
                      <div className="mb-3">
                        <div className="position-relative w-100">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="form-control formcontrol"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          <img
                            className="postiop"
                            onClick={toggleConfirmPasswordVisibility}
                            src={
                              showConfirmPassword
                                ? "/images/eye-open.svg"
                                : "/images/eye-off.svg"
                            }
                            alt="Toggle Password"
                          />
                        </div>
                      </div>

                      {/* add forgot password */}
                      <div className="d-flex justify-content-between">
                        {/* if show otp field hide login button */}
                        <>
                          <div className="mb-3">
                            <Link to="/" className="back-to-login">
                              Back to Login
                            </Link>
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary mb-3 formcontrol"
                          >
                            {/* show processing */}
                            {isProcessing && (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            )}
                            Reset Password
                          </button>
                        </>
                      </div>
                    </div>
                  )}
                </form>
                {/* OTP Input (Visible Only After Login) with pass email address */}
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

export default ResetPassWord;
