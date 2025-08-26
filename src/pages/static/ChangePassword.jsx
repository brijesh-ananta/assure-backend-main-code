import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";

// React Icons for eye/eye-slash
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ChangePassword() {
  const [headerTitle] = useState("Change Password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // For toggling the visibility of each password field
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Strong password regex: 
  // - At least 8 characters
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one digit
  // - At least one special character
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    // 2. Validate strong password
    if (!strongPasswordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a digit, and a special character."
      );
      return;
    }

    try {
      // Adjust the endpoint as needed
      const response = await axiosToken.post("/users/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data && response.data.success) {
        setSuccess("Password changed successfully.");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError("An error occurred while changing the password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      {/* Main Content */}
      <div className="notification my-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title mb-4 text-center">
                    Change Password
                  </h3>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Current Password */}
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="form-control"
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        New Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="form-control"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <small className="text-muted">
                        Must be at least 8 characters, include an uppercase
                        letter, a lowercase letter, a digit, and a special
                        character.
                      </small>
                    </div>

                    {/* Confirm New Password */}
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="row">
                      <div className="btn-section text-lg-center">
                        <button className="btn-add mx-auto">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default ChangePassword;
