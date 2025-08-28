import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { toast, ToastContainer } from "react-toastify";
import PasswordInput from "../../components/shared/form-fields/PasswordField";

function AddUser() {
  const [searchParams] = useSearchParams();
  const testingPartnerId = searchParams.get("testingPartner") || "";
  const reqId = searchParams.get("reqId") || "";
  const from = searchParams.get("from") || "";
  const userEmail = searchParams.get("email") || "";

  const [passwordType, setPasswordType] = useState("system");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [password, setPassword] = useState("");
  const [selectedUserRole] = useState("5");
  const [selectedEnvironments, setSelectedEnvironments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const navigate = useNavigate();
  const { id: userId = "" } = useParams();
  const [testingPartner, setTestingPartner] = useState(testingPartnerId);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [existingUserData, setExistingUserData] = useState(null);
  const handleCancel = () => {
    if (reqId) {
      navigate(`/dashboard/test-card-request/requestor-info/${reqId}`);
    } else {
      navigate("/dashboard");
    }
  };

  const validateForm = () => {
    if (!userId) {
      if (!firstName?.trim()) {
        toast.error("First name is required");
        return false;
      }

      if (!lastName?.trim()) {
        toast.error("Last name is required");
        return false;
      }

      if (!email?.trim()) {
        toast.error("Email is required");
        return false;
      } else if (passwordType === "admin" && !password.trim()) {
        toast.error("Password is required for admin generated password");
        return false;
      }
    }

    if (!shippingAddress?.postalCode?.trim()) {
      toast.error("Postal code is required");
      return false;
    }

    return true;
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axiosToken.get(`/users/getUserData/${userId}`);
      const userData = response.data;
      console.log("userdata--->", userData);
      const shippingAddress =
        (userData?.user?.shippingAddress &&
          JSON.parse(userData?.user?.shippingAddress)) ||
        {};
      console.log(shippingAddress);
      const partner = partners.find((p) => p.email === userData.partnerEmail);
      setExistingUserData(userData?.user || {});
      setShippingAddress(shippingAddress);
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
      setEmail(userData.email);
      setTestingPartner(partner?.partner_id);
      setPasswordType(userData.passwordType);
      setSelectedEnvironments(userData?.user?.environments || []);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [partners, userId]);

  const fetchPartners = async () => {
    try {
      const response = await axiosToken.get("/partners?status=active");
      setPartners(response.data.partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, userId]);

  const getPartner = useCallback(() => {
    return partners.find((partner) => partner.partner_id == testingPartnerId);
  }, [partners, testingPartnerId]);

  console.log("exit user--->", existingUserData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);

    const partner = partners.find((p) => p.partner_id === testingPartner);
    let formData;

    if (userId) {
      formData = {
        ...existingUserData,
        shippingAddress,
      };
    } else {
      formData = {
        shippingAddress: shippingAddress,
        ...(passwordType === "admin" && password && { password }),
        ...(!userId && {
          userRole: selectedUserRole,
          userType: "mobile",
          partnerName: partner?.partner_name,
          first_name: firstName,
          last_name: lastName,
          email: email,
          passwordType,
          selectedRoles: ["mobile"],
          partnerEmail: partner?.email,
          testingPartnerId: partner?.pt_id,
        }),
        environments: selectedEnvironments,
      };
    }

    try {
      console.log("formdata--->", formData);
      const response = userId
        ? await axiosToken.put(`/users/${userId}/shipping-address`, formData)
        : await axiosToken.post(`/users`, formData);

      toast.success(response.data.message);
      setIsLoading(false);
      if (from) {
        if (from.includes("addmail")) {
          window.location.href = from?.replace(
            "addmail",
            `addmail=${encodeURIComponent(email)}`
          );
        } else {
          window.location.href = from;
        }
      } else if (userId) {
        window.location.href = `/dashboard`;
      } else {
        window.location.href = `/dashboard/test-card-request/requestor-info/${reqId}`;
      }
    } catch (error) {
      console.error("Error onboarding user:", error);
      toast.error(
        error.response?.data?.error || error.message || "An error occurred."
      );
      setIsLoading(false);
    }
  };
  return (
    <section className="notification pb-5">
      <div className="container-fluid">
        <form onSubmit={handleSubmit} className="form-field-wrapper">
          {!userId && (
            <>
              {/* Testing partner */}
              <div className="login-page d-lg-flex row">
                <div className="col-12 col-lg-6 pe-lg-5 me-0">
                  <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                    <label
                      className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                      style={{ width: "120px" }}
                      htmlFor="firstName"
                    >
                      Testing partner
                    </label>
                    <span className="ms-2 font opacity-04">
                      {getPartner()?.partner_name}
                    </span>
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
                    <span className="ms-2 font opacity-04">{email}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {!userId && (
            <>
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
            </>
          )}

          {/* Shipping details */}
          <div className="login-page d-lg-flex row">
            <div className="col-12">
              <div className="d-lg-flex mb-lg-4 mb-2">
                <label
                  className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                  htmlFor="name"
                >
                  Shipping address
                </label>
                <div className="row gap-1">
                  <div className="col-5">
                    <input
                      id="name"
                      name="name"
                      placeholder="Unit/Building ans Street Name"
                      type="text"
                      className="form-control formcontrol"
                      value={shippingAddress?.name}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-6">
                    <input
                      id="city"
                      name="city"
                      placeholder="City"
                      type="text"
                      className="form-control formcontrol"
                      value={shippingAddress?.city}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-5">
                    <input
                      id=""
                      name="state"
                      placeholder="State"
                      type="text"
                      className="form-control formcontrol"
                      value={shippingAddress?.state}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-3">
                    <input
                      id=""
                      name="country"
                      placeholder="Country"
                      type="text"
                      className="form-control formcontrol"
                      value={shippingAddress?.country}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-3">
                    <input
                      id=""
                      name="postal_code"
                      placeholder="Postal code"
                      type="text"
                      className="form-control formcontrol"
                      value={shippingAddress?.postalCode}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          postalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          {!userId && (
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
                  <div className="d-flex align-items-end justify-content-end w-100 gap-3 mb-3">
                    <div className="w-50">
                      <PasswordInput
                        className="w-50"
                        placeholder="Type password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {/* <input
                        className="form-control formcontrol"
                        type="password"
                        placeholder="Type password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      /> */}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Role */}
          {!userId && (
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
                        id="mobileAppUser"
                        value="5"
                        checked={selectedUserRole === "5"}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="mobileAppUser"
                      >
                        Mobile App User
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="login-page d-lg-flex row">
            <div className="col-12">
              <div className="d-flex justify-content-end mt-4 gap-3">
                <button
                  type="button"
                  className="btn cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn save-btn"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  )}
                  {userId ? "Update User" : "Add User"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        style={{ zIndex: 9999 }}
      />
    </section>
  );
}

export default AddUser;
