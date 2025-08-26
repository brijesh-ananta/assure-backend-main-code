import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import SideButtons from "../../common/SideButtons/SideButtons";
import "./UserForm.css";
import axiosToken from "../../utils/axiosToken";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-dropdown-select";
import apiService from "../../services";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import { CircleCheck, ChevronDown, ChevronUp } from "lucide-react";
import "react-accessible-accordion/dist/fancy-example.css";
import "../onboard-user-v2/onboarduserv2.css";
import Separator from "../../common/Separator/Separator";

const OnBoardUser = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordType, setPasswordType] = useState("system");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerName, setSelectedPartnerName] = useState(null);

  const [updateUser, setUpdateUser] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  const [selectedEnvironments, setSelectedEnvironments] = useState([]);
  const [userAction, setUserAction] = useState("User Profile");
  const [userActionOptions, setUserActionOptions] = useState("Web User");
  const [selectedUserRole, setSelectedUserRole] = useState("5");
  const [mobileAccess, setMobileAccess] = useState("yes");
  const [user, setUser] = useState();

  const [webUserRoleOpen, setWebUserRoleOpen] = useState(false);
  const [mobileUserRole, setMobileUserRole] = useState(false);
  const [profileEditorRole, setProfileEditorRole] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [bypassOtp, setBypassOtp] = useState(false);
  const [bypassOtpReason, setBypassOtpReason] = useState("");
  const [apduLog, setApduLog] = useState(false);
  const [debugLog, setDebugLog] = useState(false);
  const [apduDebugReason, setApduDebugReason] = useState("");
  const [profileEditorEnvironments, setProfileEditorEnvironments] = useState(
    []
  );
  const [webEnvironments, setWebEnvironments] = useState([]);
  const [mobileEnvironments, setMobileEnvironments] = useState([]);

  const navigate = useNavigate();

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setUpdateUser(true);
    }
  }, [id]);

  useEffect(() => {
    if (userAction === "User Profile") {
      setUserActionOptions("Web User");
    } else if (userAction === "Card Usage History") {
      setUserActionOptions("Web Access");
    }
  }, [userAction]);

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

    // For web roles: if Request User or Request View User, require at least one web environment
    if (
      selectedRoles.includes("web") &&
      (selectedUserRole === "2" || selectedUserRole === "3") &&
      webEnvironments.length === 0
    ) {
      newErrors.environments = "At least one environment is required";
    }

    if (userActionOptions === "Mobile App user") {
      if (!shippingAddress?.postalCode?.trim()) {
        newErrors.postalCode = "Postal Code is required,";
      }

      if (!selectedPartnerName) {
        newErrors.testingPartnerName = "Testing Partner is requried";
      }
    }

    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateForm();
    if (!isValid) {
      const errorMessage = Object.values(validationErrors).join("\n");
      toast.error(errorMessage);
      return;
    }
    setIsLoading(true);

    const formData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      passwordType,
      ...(passwordType === "admin" && { password }),
      selectedRoles: selectedRoles,
      bypassOtp: bypassOtp,
      bypassOtpReason: bypassOtpReason,
      apduLog: apduLog,
      debugLog: debugLog,
      apduDebugReason: apduDebugReason,
      userType: selectedRoles.includes("mobile")
        ? "mobile"
        : selectedRoles.includes("web")
        ? "web"
        : "both",
      ...(selectedRoles.includes("web") && {
        webUser: {
          role: selectedUserRole,
          environments:
            selectedUserRole === "1"
              ? ["prod", "qa", "test"]
              : selectedUserRole === "4"
              ? ["prod", "qa", "test"]
              : webEnvironments.length > 0
              ? webEnvironments
              : [],
        },
      }),
      ...(selectedRoles.includes("mobile") && {
        shippingAddress: shippingAddress,
        partnerName: selectedPartnerName?.partner_name || null,
        partnerEmail: selectedPartnerName?.email || null,
        testingPartnerId: selectedPartnerName.pt_id || null,
        mobileUser: {
          environments: mobileEnvironments,
        },
      }),
      ...(selectedRoles.includes("profile_editor") && {
        profileEditorEnvironments: profileEditorEnvironments,
      }),
    };

    try {
      const response = await axiosToken.post(`/users`, formData);
      toast.success(response.data.message);
      setIsLoading(false);
      window.location.href = "/dashboard/user-list-view";
    } catch (error) {
      console.error("Error onboarding user:", error);
      toast.error(
        error.response?.data?.error || error.message || "An error occurred."
      );
      setIsLoading(false);
    }
  };

  const handleUserRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedUserRole(newRole);
    if (newRole === "1" || newRole === "4") {
      setWebEnvironments(["prod", "qa", "test"]);
      setProfileEditorEnvironments(["prod", "qa"]);
    } else {
      setWebEnvironments([]);
    }
  };

  const handleWebEnvironmentChange = (e) => {
    const value = e.target.value;
    if (webEnvironments.includes(value)) {
      setWebEnvironments(webEnvironments.filter((item) => item !== value));
    } else {
      setWebEnvironments([...webEnvironments, value]);
    }
  };

  const handleMobileEnvironmentChange = (e) => {
    const value = e.target.value;
    if (mobileEnvironments.includes(value)) {
      setMobileEnvironments(
        mobileEnvironments.filter((item) => item !== value)
      );
    } else {
      setMobileEnvironments([...mobileEnvironments, value]);
    }
  };

  const isEnvironmentDisabled =
    selectedUserRole === "1" || selectedUserRole === "4";

  const fetchPartners = async () => {
    try {
      const response = await axiosToken.get("/partners?status=active");
      setPartners(response.data.partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  useEffect(() => {
    if (selectedRoles.includes("mobile")) {
      fetchPartners();
    }
  }, [selectedRoles]);

  const handlePartnerChange = (selected) => {
    if (selected.length > 0) {
      setSelectedPartnerName(selected[0]);
    } else {
      setSelectedPartnerName(null);
    }
  };

  const transformedPartners = partners?.map((partner) => ({
    label: partner.partner_name,
    value: partner.partner_id,
    ...partner,
  }));

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      const resp = await apiService.user.getById(id);
      setUser(resp);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id, fetchUser]);

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setSelectedUserRole(user.role_id?.toString() || "5");
    setUserActionOptions(
      user.user_type === "mobile" ? "Mobile App user" : "Web User"
    );
    setMobileAccess(user.user_type === "mobile" ? "yes" : "no");

    // For partner (if mobile user)
    if (user.partnerName && user.partnerEmail) {
      setSelectedPartnerName({
        label: user.partnerName,
        value: user.partnerEmail, // Or partner_id if available
        partner_name: user.partnerName,
        email: user.partnerEmail,
      });
    } else {
      setSelectedPartnerName(null);
    }

    if (user.shippingAddress) {
      try {
        const addr =
          typeof user.shippingAddress === "string"
            ? JSON.parse(user.shippingAddress)
            : user.shippingAddress;
        setShippingAddress({
          name: addr.name || "",
          city: addr.city || "",
          state: addr.state || "",
          country: addr.country || "",
          postalCode: addr.postalCode || "",
        });
      } catch {
        setShippingAddress({
          name: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
        });
      }
    }

    // Environment access for web users
    if (user.prod || user.qa || user.test) {
      const envs = [];
      if (user.prod) envs.push("prod");
      if (user.qa) envs.push("qa");
      if (user.test) envs.push("test");
      setSelectedEnvironments(envs);
    } else {
      setSelectedEnvironments([]);
    }
  }, [user]);

  const handleCancel = () => {
    navigate("/dashboard/user-list-view");
  };

  // Handler for user type checkbox
  const handleUserTypeChange = (role) => {
    let updatedRoles = [...selectedRoles];
    if (updatedRoles.includes(role)) {
      updatedRoles = updatedRoles.filter((r) => r !== role);
    } else {
      updatedRoles.push(role);
      // If profile_editor is checked, also check mobile
      if (role === "profile_editor" && !updatedRoles.includes("mobile")) {
        updatedRoles.push("mobile");
      }
    }
    setSelectedRoles(updatedRoles);
    // Set accordions open/close based on selected roles
    setWebUserRoleOpen(updatedRoles.includes("web"));
    setMobileUserRole(updatedRoles.includes("mobile"));
    setProfileEditorRole(updatedRoles.includes("profile_editor"));
    // Optionally update userActionOptions for legacy logic
    if (updatedRoles.length === 1) {
      if (updatedRoles[0] === "web") setUserActionOptions("Web User");
      else if (updatedRoles[0] === "mobile")
        setUserActionOptions("Mobile User");
      else if (updatedRoles[0] === "profile_editor")
        setUserActionOptions("Profile Editor User");
    } else {
      setUserActionOptions("");
    }
  };

  // Handler for profile editor environment checkboxes
  const handleProfileEditorEnvironmentChange = (e) => {
    const value = e.target.value;
    if (profileEditorEnvironments.includes(value)) {
      setProfileEditorEnvironments(
        profileEditorEnvironments.filter((item) => item !== value)
      );
    } else {
      setProfileEditorEnvironments([...profileEditorEnvironments, value]);
    }
  };

  return (
    <div className="onboarduserv2">
      <div className="onboardv2-container form-field-wrapper">
        <form
          className="d-flex gap-4 flex-column w-100 m-auto"
          onSubmit={handleSubmit}
        >
          <div className="row">
            <div className="col-6 row align-items-center onboarduserv2-form">
              <label className="font text-right col-5 onboarduserv2-form-label">
                First Name
              </label>
              <div className="col-5">
                <input
                  name="first_name"
                  type="text"
                  className="form-control formcontrol"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-6 row align-items-center onboarduserv2-form">
              <label className="font text-right col-5 onboarduserv2-form-label">
                Last Name
              </label>
              <div className="col-5">
                <input
                  name="last_name"
                  type="text"
                  className="form-control formcontrol"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-6 row align-items-center onboarduserv2-form">
              <label className="font text-right col-5 onboarduserv2-form-label">
                Email
              </label>
              <div className="col-5">
                <input
                  name="email"
                  type="text"
                  className="form-control formcontrol"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-3 row align-items-center onboarduserv2-form">
              <label className="font text-right col-5 onboarduserv2-form-label">
                Password
              </label>
              <div className="col-7">
                <div className="label-password">
                  <div className="radio-group" style={{ gap: "2rem" }}>
                    <label className="d-flex align-items-center">
                      <input
                        type="radio"
                        className="form-check-input p-12p mt-0"
                        name="passwordType"
                        checked={passwordType === "system"}
                        style={{ marginRight: "0.5rem" }}
                        onChange={() => setPasswordType("system")}
                      />
                      {""}
                      System Generated
                    </label>
                    <label className="d-flex align-items-center">
                      <input
                        type="radio"
                        name="passwordType"
                        checked={passwordType === "admin"}
                        className="form-check-input p-12p mt-0"
                        style={{ marginRight: "1rem" }}
                        onChange={() => setPasswordType("admin")}
                      />{" "}
                      Admin Generated
                    </label>
                  </div>

                  {passwordType === "admin" && (
                    <div
                      className="input-with-icon mt-2"
                      style={{ width: "80%", marginLeft: "2rem" }}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Type password"
                        className="form-control formcontrol"
                        style={{ minWidth: 250, width: "100%" }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer", marginLeft: 8 }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Role Section (Web/Profile Editor/Mobile) */}
          <div className="row mt-3">
            <div className="col-6 row align-items-center onboarduserv2-form">
              <label className="font text-right col-5 onboarduserv2-form-label">
                User Type
              </label>
              <div className="col-5 d-flex gap-5">
                {[
                  { label: "Web", value: "web" },
                  { label: "Profile Editor", value: "profile_editor" },
                  { label: "Mobile", value: "mobile" },
                ].map((role, idx) => (
                  <label
                    key={role.value + "-" + idx}
                    className="tp-radio-label"
                  >
                    <input
                      className="form-check-input onboarduserv2-form-radio-square-label"
                      type="checkbox"
                      name="userType"
                      value={role.value}
                      required={selectedRoles.length === 0}
                      style={{ marginRight: "0.5rem" }}
                      checked={selectedRoles.includes(role.value)}
                      onChange={() => handleUserTypeChange(role.value)}
                    />
                    <span className="text-capitalize">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Bypass OTP Section */}
          <div className="onboarduserv2-bypass-otp">
            <div className="row align-items-center onboarduserv2-form">
              <label
                className="font text-right onboarduserv2-form-label"
                style={{ color: "red" }}
              >
                Bypass OTP
              </label>
              <div className="col-5">
                <div className="label-password">
                  <div className="radio-group" style={{ gap: "4rem" }}>
                    <label>
                      <input
                        type="radio"
                        className="form-check-input p-12p mt-0"
                        name="bypassOtp"
                        style={{ marginRight: "1rem" }}
                        checked={bypassOtp === true}
                        onChange={() => setBypassOtp(true)}
                      />{" "}
                      Yes
                    </label>
                    <label className="d-flex align-items-center">
                      <input
                        type="radio"
                        name="bypassOtp"
                        className="form-check-input p-12p mt-0"
                        style={{ marginRight: "1rem" }}
                        checked={bypassOtp === false}
                        onChange={() => setBypassOtp(false)}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <input
              type="text"
              className="bypass-otp-input"
              placeholder="Please provide reason for bypassing OTP"
              required={bypassOtp === true}
              value={bypassOtpReason}
              onChange={(e) => setBypassOtpReason(e.target.value)}
            />
          </div>

          {/* Accordions for Web, Mobile, Profile Editor roles, etc. */}
          {selectedRoles.includes("web") && (
            <>
              <Accordion
                allowZeroExpanded={true}
                className="onboarduserr-accordian"
                onChange={() => setWebUserRoleOpen(!webUserRoleOpen)}
                id="webUserRole"
                preExpanded={webUserRoleOpen ? ["webUserRole"] : []}
              >
                <AccordionItem uuid="webUserRole">
                  <AccordionItemHeading>
                    <AccordionItemButton className="onboarduserr-accordian-button">
                      <div className="onboarduserr-accordian-button-div">
                        <CircleCheck size={20} />
                        {!webUserRoleOpen ? (
                          <ChevronDown color="#000000" />
                        ) : (
                          <ChevronUp color="#000000" />
                        )}
                        <p>Web User Role</p>
                      </div>
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <div className="role-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="webUserRole"
                          value="1"
                          className="form-check-input p-12p"
                          required={selectedRoles.includes("web")}
                          checked={selectedUserRole === "1"}
                          onChange={handleUserRoleChange}
                        />
                        <span className="font">Test Card SME</span>
                      </label>

                      <label className="radio-label">
                        <input
                          type="radio"
                          name="webUserRole"
                          value="4"
                          className="form-check-input p-12p ms-2"
                          checked={selectedUserRole === "4"}
                          required={selectedRoles.includes("web")}
                          onChange={handleUserRoleChange}
                        />
                        <span className="font">Test Card Manager</span>
                      </label>
                    </div>

                    <div className="role-subgroup">
                      <div className="row w-100">
                        <label className="radio-label col-4">
                          <input
                            type="radio"
                            name="webUserRole"
                            className="form-check-input p-12p"
                            value="2"
                            checked={selectedUserRole === "2"}
                            onChange={handleUserRoleChange}
                          />
                          <span className="font">Test Card Request User</span>
                        </label>

                        <label className="radio-label col-5">
                          <input
                            type="radio"
                            name="webUserRole"
                            className="form-check-input p-12p"
                            value="3"
                            checked={selectedUserRole === "3"}
                            onChange={handleUserRoleChange}
                          />
                          <span className="font">
                            Test Card Request View User
                          </span>
                        </label>
                      </div>

                      <div className="env-access-group">
                        <span className="env-label">Test Card Env Access</span>
                        {["prod", "qa", "test"].map((env) => (
                          <label
                            key={env}
                            className="radio-label small"
                            style={{ marginLeft: env !== "prod" ? "1rem" : 0 }}
                          >
                            <input
                              type="checkbox"
                              name="envAccess"
                              className="form-check-input p-2"
                              style={{ margin: 0 }}
                              value={env}
                              checked={webEnvironments.includes(env)}
                              onChange={handleWebEnvironmentChange}
                              disabled={
                                selectedUserRole === "1" ||
                                selectedUserRole === "4"
                              }
                            />
                            <span className="font">
                              {env.charAt(0).toUpperCase() + env.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </AccordionItemPanel>
                </AccordionItem>
              </Accordion>
              {(selectedRoles.includes("mobile") ||
                selectedRoles.includes("profile_editor")) && <Separator />}
            </>
          )}
          {selectedRoles.includes("mobile") && (
            <>
              <Accordion
                allowZeroExpanded={true}
                className="onboarduserr-accordian"
                onChange={() => setMobileUserRole(!mobileUserRole)}
                id="mobileUserRole"
                preExpanded={mobileUserRole ? ["mobileUserRole"] : []}
              >
                <AccordionItem uuid="mobileUserRole">
                  <AccordionItemHeading>
                    <AccordionItemButton className="onboarduserr-accordian-button">
                      <div className="onboarduserr-accordian-button-div">
                        <CircleCheck size={20} />
                        {!mobileUserRole ? (
                          <ChevronDown color="#000000" />
                        ) : (
                          <ChevronUp color="#000000" />
                        )}
                        <p>Mobile User Role</p>
                      </div>
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <div className="d-flex gap-4 flex-column w-80 m-auto">
                      <div className="row">
                        <div className="col-6 row align-items-center onboarduserv2-form">
                          <label className="font text-right col-5 onboarduserv2-form-label">
                            Testing Partner
                          </label>
                          <div className="col-5">
                            <Select
                              options={transformedPartners}
                              labelField="label"
                              valueField="value"
                              className="form-control formcontrol"
                              style={{ padding: "0.5rem" }}
                              searchable
                              required={true}
                              placeholder="Select Testing Partner"
                              onChange={handlePartnerChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-6 row align-items-center onboarduserv2-form">
                          <label className="font">
                            Test Card Shipping Address
                          </label>
                        </div>
                        <div
                          className="col-6 row align-items-center onboarduserv2-form"
                          style={{ margin: "1rem 0 0 5rem" }}
                        >
                          <div className="col-10 row">
                            <div className="w-100 row">
                              <div className="col-6">
                                <input
                                  name="name"
                                  placeholder="Unit/Building and Street Name"
                                  className="form-control formcontrol"
                                  value={shippingAddress.name}
                                  required={true}
                                  onChange={handleAddressChange}
                                />
                              </div>
                              <div className="col-6">
                                <input
                                  name="city"
                                  placeholder="City"
                                  className="form-control formcontrol w-100"
                                  value={shippingAddress.city}
                                  required={true}
                                  onChange={handleAddressChange}
                                />
                              </div>
                            </div>

                            <div className="w-100 row mt-4">
                              <div className="col-4">
                                <input
                                  name="state"
                                  placeholder="State"
                                  className="form-control formcontrol"
                                  value={shippingAddress.state}
                                  required={true}
                                  onChange={handleAddressChange}
                                />
                              </div>

                              <div className="col-4">
                                <input
                                  name="country"
                                  placeholder="Country"
                                  className="form-control formcontrol"
                                  value={shippingAddress.country}
                                  required={true}
                                  onChange={handleAddressChange}
                                />
                              </div>

                              <div className="col-4">
                                <input
                                  name="postalCode"
                                  placeholder="Postal Code"
                                  className="form-control formcontrol"
                                  value={shippingAddress.postalCode}
                                  required={true}
                                  onChange={handleAddressChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="onboarduserv2-bypass-otp mt-4">
                      <div className="apdu-card">
                        <div className="row align-items-center onboarduserv2-form">
                          <label
                            className="font text-right onboarduserv2-form-label"
                            style={{ color: "red" }}
                          >
                            APDU Log
                          </label>
                          <div className="col-5">
                            <div className="label-password">
                              <div
                                className="radio-group"
                                style={{ gap: "4rem" }}
                              >
                                <label>
                                  <input
                                    type="radio"
                                    className="form-check-input p-12p mt-0"
                                    name="apduLog"
                                    style={{ marginRight: "1rem" }}
                                    checked={apduLog === true}
                                    onChange={() => setApduLog(true)}
                                  />{" "}
                                  Yes
                                </label>
                                <label className="d-flex align-items-center">
                                  <input
                                    type="radio"
                                    name="apduLog"
                                    className="form-check-input p-12p mt-0"
                                    style={{ marginRight: "1rem" }}
                                    checked={apduLog === false}
                                    onChange={() => setApduLog(false)}
                                  />{" "}
                                  No
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className="row align-items-left onboarduserv2-form"
                          style={{ justifyContent: "flex-end" }}
                        >
                          <label
                            className="font text-right onboarduserv2-form-label"
                            style={{ color: "red" }}
                          >
                            Debug Log
                          </label>
                          <div className="col-5">
                            <div className="label-password">
                              <div
                                className="radio-group"
                                style={{ gap: "4rem" }}
                              >
                                <label>
                                  <input
                                    type="radio"
                                    className="form-check-input p-12p mt-0"
                                    name="debugLog"
                                    style={{ marginRight: "1rem" }}
                                    checked={debugLog === true}
                                    onChange={() => setDebugLog(true)}
                                  />{" "}
                                  Yes
                                </label>
                                <label className="d-flex align-items-center">
                                  <input
                                    type="radio"
                                    name="debugLog"
                                    className="form-check-input p-12p mt-0"
                                    style={{ marginRight: "1rem" }}
                                    checked={debugLog === false}
                                    onChange={() => setDebugLog(false)}
                                  />{" "}
                                  No
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <input
                        type="text"
                        className="bypass-otp-input"
                        placeholder="Please provide reason for enabling APDU or debug log"
                        value={apduDebugReason}
                        onChange={(e) => setApduDebugReason(e.target.value)}
                        required={apduLog === true || debugLog === true}
                      />
                    </div>
                  </AccordionItemPanel>
                </AccordionItem>
              </Accordion>
              {selectedRoles.includes("profile_editor") && <Separator />}
            </>
          )}
          {selectedRoles.includes("profile_editor") && (
            <Accordion
              allowZeroExpanded={true}
              className="onboarduserr-accordian"
              onChange={() => setProfileEditorRole(!profileEditorRole)}
              id="profileEditorRole"
              preExpanded={profileEditorRole ? ["profileEditorRole"] : []}
            >
              <AccordionItem uuid="profileEditorRole">
                <AccordionItemHeading>
                  <AccordionItemButton className="onboarduserr-accordian-button">
                    <div className="onboarduserr-accordian-button-div">
                      <CircleCheck size={20} />
                      {!profileEditorRole ? (
                        <ChevronDown color="#000000" />
                      ) : (
                        <ChevronUp color="#000000" />
                      )}
                      <p>Profile Editor Role</p>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="row mt-3">
                    <div className="col-6 row align-items-center onboarduserv2-form">
                      <label className="font text-right col-5 onboarduserv2-form-label">
                        Test Card Env Access
                      </label>
                      <div className="col-5">
                        <div className="label-password">
                          <div className="radio-group" style={{ gap: "5rem" }}>
                            {["prod", "qa"].map((env) => (
                              <label
                                key={env}
                                className="d-flex align-items-center"
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input p-12p mt-0"
                                  name="testCardEnvAccess"
                                  style={{ marginRight: "1rem" }}
                                  value={env}
                                  checked={profileEditorEnvironments.includes(
                                    env
                                  )}
                                  required={
                                    profileEditorEnvironments.length === 0
                                  }
                                  onChange={
                                    handleProfileEditorEnvironmentChange
                                  }
                                  disabled={
                                    selectedUserRole === "1" ||
                                    selectedUserRole === "4"
                                  }
                                />
                                <span>{env.toUpperCase()}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            </Accordion>
          )}
          <Separator />

          <div className="form-actions" style={{ marginBottom: "1.5rem" }}>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span
                    className="loader"
                    style={{ marginRight: "8px" }}
                  ></span>
                  Saving User...
                </>
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnBoardUser;
