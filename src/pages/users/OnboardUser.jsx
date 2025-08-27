import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import { useAuth } from "../../utils/AuthContext";
import axiosToken from "../../utils/axiosToken";

function OnboardUser() {
  const [passwordType, setPasswordType] = useState("system");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("2"); // Default: Test Card Request User
  const [selectedEnvironments, setSelectedEnvironments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const currentUserRole = user?.role;
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/dashboard/user-management");
  };

  // Handle environment checkbox changes
  const handleEnvironmentChange = (e) => {
    const value = e.target.value;
    if (selectedEnvironments.includes(value)) {
      setSelectedEnvironments(
        selectedEnvironments.filter((item) => item !== value)
      );
    } else {
      setSelectedEnvironments([...selectedEnvironments, value]);
    }
  };

  // Handle user role changes
  const handleUserRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedUserRole(newRole);
    if (newRole === "1" || newRole === "4") {
      // Auto-check all environments for SME or Manager
      setSelectedEnvironments(["prod", "qa", "test"]);
    } else {
      // Clear environments for other roles
      setSelectedEnvironments([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (passwordType === "admin" && !password.trim()) {
      newErrors.password = "Password is required for admin generated password";
    }
    if (
      !(selectedUserRole === "1" || selectedUserRole === "4") &&
      selectedEnvironments.length === 0
    ) {
      newErrors.environments = "At least one environment is required";
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateForm();
    if (!isValid) {
      const errorMessage = Object.values(validationErrors).join("\n");
      alert(errorMessage);
      return;
    }
    setIsLoading(true);

    const formData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      passwordType,
      ...(passwordType === "admin" && { password }),
      userRole: selectedUserRole,
      environments: selectedEnvironments,
      userType: "web",
    };

    try {
      const response = await axiosToken.post(`/users`, formData);
      alert(response.data.message);
      setIsLoading(false);
      window.location.href = "/dashboard/user-management";
    } catch (error) {
      console.error("Error onboarding user:", error);
      alert(
        error.response?.data?.error || error.message || "An error occurred."
      );
      setIsLoading(false);
    }
  };

  // Determine if environments should be disabled
  const isEnvironmentDisabled =
    selectedUserRole === "1" || selectedUserRole === "4";

  return (
    <>
      <Header title={"Onboard User"} />

      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <span></span>
            <div className="d-lg-flex formcard">
              <span className="me-3 font">User Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  value="web"
                  id="webuser"
                  checked
                  disabled
                />
                <label className="form-check-label" htmlFor="webuser">
                  Web User (Test Card Request/View/SME/Manager)
                </label>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      <section className="notification pb-5">
        <div className="container-fluid">
          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                    style={{ width: "120px" }}
                    htmlFor="firstName"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="first_name"
                    placeholder="First Name"
                    type="text"
                    className="form-control formcontrol"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Last Name */}
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                    style={{ width: "120px" }}
                    htmlFor="lastName"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="last_name"
                    placeholder="Last Name"
                    type="text"
                    className="form-control formcontrol"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                    style={{ width: "120px" }}
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    placeholder="Email Address"
                    type="email"
                    className="form-control formcontrol"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="login-page row mb-3">
              <div className="col-12 col-lg-6 pe-lg-6 me-0">
                <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3"
                    style={{ width: "120px" }}
                    htmlFor="password"
                  >
                    Password:
                  </label>
                  <div className="d-flex gap-4 align-items-center">
                    <div className="form-check formcard d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="passwordType"
                        id="securedYes"
                        value="system"
                        checked={passwordType === "system"}
                        onChange={(e) => setPasswordType(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="securedYes">
                        System Generated Password
                      </label>
                    </div>
                    <div className="form-check formcard d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="passwordType"
                        id="securedNo"
                        value="admin"
                        checked={passwordType === "admin"}
                        onChange={(e) => setPasswordType(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="securedNo">
                        Admin Generated Password
                      </label>
                    </div>
                  </div>
                </div>
                {passwordType === "admin" && (
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: "120px" }}></div> {/* Spacer */}
                    <input
                      className="form-control formcontrol"
                      type="password"
                      placeholder="Type password"
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* User Role */}
            <div className="login-page formcard row mb-3">
              <div className="col-12 col-lg-7 pe-lg-4 me-0">
                <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3"
                    style={{ width: "120px" }}
                    htmlFor="roleRequestUser"
                  >
                    User Role:
                  </label>
                  <div className="d-flex flex-wrap gap-4 align-items-center">
                    <div className="form-check d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="userRole"
                        id="roleRequestUser"
                        value="2"
                        checked={selectedUserRole === "2"}
                        onChange={handleUserRoleChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="roleRequestUser"
                      >
                        Test Card Request User
                      </label>
                    </div>
                    <div className="form-check d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="userRole"
                        id="roleViewUser"
                        value="3"
                        checked={selectedUserRole === "3"}
                        onChange={handleUserRoleChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="roleViewUser"
                      >
                        Test Card Request View User
                      </label>
                    </div>
                    <div className="form-check d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="userRole"
                        id="roleSME"
                        value="1"
                        checked={selectedUserRole === "1"}
                        onChange={handleUserRoleChange}
                      />
                      <label className="form-check-label" htmlFor="roleSME">
                        Test Card SME
                      </label>
                    </div>
                    <div className="form-check d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="userRole"
                        id="roleManager"
                        value="4"
                        checked={selectedUserRole === "4"}
                        onChange={handleUserRoleChange}
                      />
                      <label className="form-check-label" htmlFor="roleManager">
                        Test Card Manager
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Access to request Test Card for */}
            <div className="login-page formcard row mb-3">
              <div className="col-12 col-lg-6 pe-lg-6 me-0">
                <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
                  <label
                    className="fw-bold mb-0 flex-shrink-0 me-3"
                    style={{ width: "30%" }}
                    htmlFor="envProd"
                  >
                    Test Card ENV Access:
                  </label>
                  <div className="d-flex gap-4 align-items-center">
                    <div className="form-check d-flex gap-2 align-items-center mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="envProd"
                        name="environments"
                        value="prod"
                        checked={selectedEnvironments.includes("prod")}
                        onChange={handleEnvironmentChange}
                        disabled={isEnvironmentDisabled}
                      />
                      <label className="form-check-label" htmlFor="envProd">
                        Prod
                      </label>
                    </div>
                    <div className="form-check d-flex gap-2 align-items-center mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="envQA"
                        name="environments"
                        value="qa"
                        checked={selectedEnvironments.includes("qa")}
                        onChange={handleEnvironmentChange}
                        disabled={isEnvironmentDisabled}
                      />
                      <label className="form-check-label" htmlFor="envQA">
                        QA
                      </label>
                    </div>
                    <div className="form-check d-flex gap-2 align-items-center mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="envTest"
                        name="environments"
                        value="test"
                        checked={selectedEnvironments.includes("test")}
                        onChange={handleEnvironmentChange}
                        disabled={isEnvironmentDisabled}
                      />
                      <label className="form-check-label" htmlFor="envTest">
                        Test
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-flex justify-content-end mt-4 gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-add"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Sidebar />
      <Footer />
    </>
  );
}

export default OnboardUser;
