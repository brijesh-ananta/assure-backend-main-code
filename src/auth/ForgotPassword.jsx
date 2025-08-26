import { useState } from "react";
import Footer from "../common/Footer";
import axiosToken from "../utils/axiosToken";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // To show processing spinner
  const VITE_SITE_NAME = import.meta.env.VITE_SITE_NAME;

  // Handle Login Form Submission
  const handleLogin = async (e) => {
    e.preventDefault();

    // Early validation for empty fields
    if (!email) {
      toast.error("Email is required to reset password");
      return;
    }
    setIsProcessing(true); // Start processing spinner

    try {
      const response = await axiosToken.post("/users/forgot-password", {
        email,
      });
      if (response.data.success == true) {
        toast.success(
          response.data.message ||
            "If there's an account for this email, a password reset link was sent. If you didn't get the email, check that you've entered your email correctly."
        );
        setIsProcessing(false); // Stop processing spinner
      } else {
        // Handle the case where success is false but no exception was thrown
        toast.error(
          response.data.message || "Failed to send reset password link"
        );
        setIsProcessing(false); // Stop processing spinner
      }
    } catch (error) {
      setIsProcessing(false); // Stop processing spinner
      // Handle errors returned from the server, such as 401, etc.
      toast.error(
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
                  <div className="login-page mb-lg-4 mb-2">
                    <div className="mb-3">
                      <input
                        type="email"
                        placeholder="Enter Your Email Address"
                        className="form-control formcontrol"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
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

export default ForgotPassword;
