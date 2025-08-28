import { useState, useEffect, useMemo } from "react";
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
import { useAuth } from "../../utils/AuthContext";

const UpdateUser = () => {
  const [passwordType, setPasswordType] = useState("system");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerName, setSelectedPartnerName] = useState(null);
  const [isPartnerValid, setIsPartnerValid] = useState(true);
  const [updateUser, setUpdateUser] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [userAction, setUserAction] = useState("User Profile");
  const [userActionOptions, setUserActionOptions] = useState("Web User");
  const [selectedUserRole, setSelectedUserRole] = useState("5");
  const [mobileAccess, setMobileAccess] = useState("yes");
  const { user } = useAuth();

  const [webUserRoleOpen, setWebUserRoleOpen] = useState(false);
  const [mobileUserRole, setMobileUserRole] = useState(false);
  const [profileEditorRole, setProfileEditorRole] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [bypassOtp, setBypassOtp] = useState(null);
  const [bypassOtpReason, setBypassOtpReason] = useState("");
  const [apduLog, setApduLog] = useState(null);
  const [debugLog, setDebugLog] = useState(null);
  const [apduDebugReason, setApduDebugReason] = useState("");
  const [userStatusChangeReason, setUserStatusChangeReason] = useState("");
  const [profileEditorEnvironments, setProfileEditorEnvironments] = useState(
    []
  );
  const [webEnvironments, setWebEnvironments] = useState([]);
  const [mobileEnvironments, setMobileEnvironments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isActive, setIsActive] = useState(1);
  const [isLocked, setIsLocked] = useState(0);
  const [isDeleted, setIsDeleted] = useState(0);
  const [isBlocked, setIsBlocked] = useState(0);

  const navigate = useNavigate();
  const { id } = useParams();

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (id) {
      setUpdateUser(true);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const params = new URLSearchParams(location.search);
      // Only set if it's not already set, or if it's different to prevent unnecessary updates
      if (params.get("recordId") !== id) {
        params.set("recordId", id);
        navigate({ search: params.toString() }, { replace: true });
      }
    }
  }, [id, navigate, location.search]); // Dependencies: id, navigate, and location.search for re-evaluation

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
      if (shippingAddress?.postalCode?.trim() === "") {
        newErrors.postalCode = "Postal Code is required,";
      }
      if (shippingAddress?.city?.trim() === "") {
        newErrors.city = "City is required,";
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
      selectedRoles: selectedRoles,
      bypassOtp: bypassOtp,
      bypassOtpReason: bypassOtpReason,
      apduLog: apduLog,
      debugLog: debugLog,
      apduDebugReason: apduDebugReason,
      user_type: selectedRoles,
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
        prod: webEnvironments.includes("prod") ? 1 : 0,
        qa: webEnvironments.includes("qa") ? 1 : 0,
        test: webEnvironments.includes("test") ? 1 : 0,
      }),
      ...(selectedRoles.includes("mobile") && {
        shippingAddress: shippingAddress,
        partnerName: selectedPartnerName?.partner_name || null,
        partnerEmail: selectedPartnerName?.email || null,
        testing_partner_id: selectedPartnerName?.partner_id || null,
        userStatusChangeReason,
        mobileUser: {
          environments: mobileEnvironments,
        },
      }),
      ...(selectedRoles.includes("profile_editor") && {
        profile_env_prod_access:
          selectedUserRole === "1"
            ? 1
            : selectedUserRole === "4"
              ? 1
              : profileEditorEnvironments.includes("prod")
                ? 1
                : 0,
        profile_env_qa_access:
          selectedUserRole === "1"
            ? 1
            : selectedUserRole === "4"
              ? 1
              : profileEditorEnvironments.includes("qa")
                ? 1
                : 0,
      }),
      isActive,
      is_locked: isLocked,
      isDeleted,
      isBlocked,
    };

    try {
      const response = await axiosToken.put(`/users/${id}`, formData);
      toast.success(response.data.message);
      setIsLoading(false);
      window.location.href = "/dashboard/user-list-view";
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error.response?.data?.error || error.message || "An error occurred."
      );
      setIsLoading(false);
    }
  };

  console.log("selected partner--->", selectedPartnerName);

  const handleUserRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedUserRole(newRole);
    if (newRole === "1" || newRole === "4") {
      setProfileEditorEnvironments(["prod", "qa"]);
      setWebEnvironments(["prod", "qa", "test"]);
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

  const fetchPartners = async () => {
    try {
      const response = await axiosToken.get("/partners?status=active");
      setPartners(response.data.partners || []);
      console.log("partners", response.data.partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const handlePartnerChange = (selected) => {
    if (selected && selected.length > 0) {
      const partner = selected[0];
      setSelectedPartnerName({
        partner_name: partner.partner_name,
        email: partner.email,
        partner_id: partner.partner_id,
        label: partner.partner_name,
        value: partner.pt_id,
      });
    } else {
      setSelectedPartnerName(null);
    }
  };

  const transformedPartners = useMemo(
    () =>
      partners.map((partner) => ({
        label: partner.partner_name,
        value: partner.pt_id,
        ...partner,
      })),
    [partners]
  );

  useEffect(() => {
    if (id) {
      (async () => {
        await fetchPartners();
        try {
          const resp = await apiService.user.getById(id);

          const user = resp.user;
          console.log("user", user);

          if (user) {
            // Pre-populate form fields with user data
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");
            setPasswordType("system"); // Default to system generated
            setSelectedUserRole(user.role_id?.toString() || "5");
            setBypassOtp(user.is_bypass_otp === 1);
            setBypassOtpReason(user.bypass_comment || "");
            setApduLog(user.is_apdu_log === 1);
            setDebugLog(user.is_debug_log == 1);
            setApduDebugReason(user.log_comment || "");
            setUserStatusChangeReason(user.reason || "");
            // Assuming user.user_type is one of 'web', 'mobile', or 'both'
            let convertedRoles = [];

            if (user.user_type === "both") {
              // Set roles to both web and mobile
              convertedRoles = ["web", "mobile"];
              setWebUserRoleOpen(true); // Web role should be open
              setMobileUserRole(true);
            } else if (user.user_type === "web") {
              // Set roles to web only
              convertedRoles = ["web"];
              setWebUserRoleOpen(true);
            } else if (user.user_type === "mobile") {
              // Set roles to mobile only
              convertedRoles = ["mobile"];
              setMobileUserRole(true);
            } else {
              // Fallback: If the user_type is not one of the expected ones
              setSelectedRoles([]);
              setWebUserRoleOpen(false);
              setMobileUserRole(false);
            }

            if (resp.roles.some((role) => role.role_id === "6")) {
              // setSelectedRoles(,['profile_editor']);
              convertedRoles.push("profile_editor");
              setProfileEditorRole(true);
            }
            setSelectedRoles(convertedRoles);

            // Set environments for Test Card Env Access
            let envs = [];
            if (user.prod === 1) envs.push("prod");
            if (user.qa === 1) envs.push("qa");
            if (user.test === 1) envs.push("test");
            setWebEnvironments(envs);

            // Set shipping address
            if (user.shippingAddress) {
              try {
                const address =
                  typeof user.shippingAddress === "string"
                    ? JSON.parse(user.shippingAddress)
                    : user.shippingAddress;
                setShippingAddress(address);
              } catch (error) {
                console.error("Error parsing shipping address:", error);
              }
            }

            // Set partner
            if (user.partnerName) {
              setSelectedPartnerName({
                partner_name: user.partnerName,
                email: user.partnerEmail,
                partner_id: user.testing_partner_id,
                label: user.partnerName,
                value: user.testing_partner_id,
              });
              // handlePartnerChange([{
              //   partner_name: user.partnerName,
              //   email: user.partnerEmail,
              //   partner_id: user.testing_partner_id,
              //   label: user.partnerName,
              //   pt_id: user.testing_partner_id,
              // }]);
            }

            // Set profile editor environments
            let profileEnvs = [];
            if (user.profile_env_prod_access === 1) profileEnvs.push("prod");
            if (user.profile_env_qa_access === 1) profileEnvs.push("qa");
            setProfileEditorEnvironments(profileEnvs);

            setIsActive(user.isActive !== undefined ? user.isActive : 1);
            setIsLocked(user.is_locked !== undefined ? user.is_locked : 0);
            setIsDeleted(user.isDeleted !== undefined ? user.isDeleted : 0);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      })();
    }
  }, [id]);

  // useEffect(() => {
  //   if (transformedPartners.length > 0 && user) {
  //     // 1. Match by testing_partner_id <-> pt_id
  //     let found = transformedPartners.find(
  //       (p) => p.pt_id?.toString() === user.testing_partner_id?.toString()
  //     );
  //     if (!found && user.partnerEmail) {
  //       // 2. Fallback: match by email
  //       found = transformedPartners.find(
  //         (p) => p.email?.trim().toLowerCase() === user.partnerEmail.trim().toLowerCase()
  //       );
  //     }
  //     if (!found && user.partnerName) {
  //       // 3. Fallback: match by name
  //       found = transformedPartners.find(
  //         (p) => p.partner_name?.trim().toLowerCase() === user.partnerName.trim().toLowerCase()
  //       );
  //     }
  //     if (found) {
  //       handlePartnerChange([found]);
  //     } else {
  //       setSelectedPartnerName(null);
  //     }
  //   }
  // }, [transformedPartners, user]);

  useEffect(() => {
    if (selectedPartnerName && partners.length > 0) {
      // Check if the selected partner exists in the fetched partners list
      const partnerExists = partners.some(
        (partner) =>
          partner.partner_id === selectedPartnerName.partner_id ||
          partner.pt_id === selectedPartnerName.value ||
          partner.email?.toLowerCase() ===
            selectedPartnerName.email?.toLowerCase() ||
          partner.partner_name?.toLowerCase() ===
            selectedPartnerName.partner_name?.toLowerCase()
      );

      setIsPartnerValid(partnerExists);
    } else {
      // No partner selected - always allow editing
      setIsPartnerValid(true);
    }
  }, [selectedPartnerName, partners]);

  useEffect(() => {
    if (selectedRoles) {
      setWebUserRoleOpen(selectedRoles.includes("web"));
      setMobileUserRole(selectedRoles.includes("mobile"));
      // setProfileEditorRole(selectedRoles.includes("profile_editor"));
    }
  }, [selectedRoles, isEditMode]);

  const handleCancel = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      navigate("/dashboard/user-list-view");
    }
  };

  const handleUserTypeChange = (role) => {
    let updatedRoles = [...selectedRoles];
    if (updatedRoles.includes(role)) {
      updatedRoles = updatedRoles.filter((r) => r !== role);
    } else {
      updatedRoles.push(role);
      // If profile_editor is checked, also check mobile
      if (role === "profile_editor" && !updatedRoles.includes("mobile")) {
        updatedRoles.push("mobile");
        updatedRoles.push("web");
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

  const handleClickSideButtons = (label) => {
    if (label === "Login History") {
      navigate(`/dashboard/login-history-v2/${id}`);
    } else if (label === "Assigned Cards") {
      navigate(`/dashboard/user-card-history/${id}`);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const isWebAccordionOpen = isEditMode && selectedRoles.includes("web");
  const isMobileAccordionOpen = isEditMode && selectedRoles.includes("mobile");
  const isProfileEditorAccordionOpen =
    isEditMode && selectedRoles.includes("profile_editor");

  return (
    <>
      <SideButtons
        placement="left"
        activeLabel="User Profile"
        buttons={[
          {
            label: "User Profile",
            onClick: () => handleClickSideButtons("User Profile"),
          },
          {
            label: "Login History",
            onClick: () => handleClickSideButtons("Login History"),
          },
          {
            label: "Assigned Cards",
            onClick: () => handleClickSideButtons("Assigned Cards"),
          },
        ]}
      />
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
                    disabled
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
                    disabled
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
                    disabled
                  />
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
                        // Ensure that we're correctly comparing values
                        checked={selectedRoles.includes(role.value)}
                        onChange={() => handleUserTypeChange(role.value)}
                        disabled={!isEditMode}
                        required={selectedRoles.length === 0}
                      />
                      <span className="text-capitalize">{role.label}</span>
                    </label>
                  ))}
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
                    User Status
                  </label>
                  <div className="col-8">
                    <div className="label-password">
                      <div className="radio-group" style={{ gap: "4rem" }}>
                        <label>
                          <input
                            type="radio"
                            className="form-check-input p-12p mt-0"
                            name="userStatus"
                            style={{ marginRight: "1rem" }}
                            checked={isActive === 1 && isLocked === 0}
                            onChange={() => {
                              setIsActive(1);
                              setIsLocked(0);
                            }}
                            disabled={!isEditMode}
                          />{" "}
                          Active
                        </label>
                        <label>
                          <input
                            type="radio"
                            className="form-check-input p-12p mt-0"
                            name="userStatus"
                            style={{ marginRight: "1rem" }}
                            checked={isActive === 0 && isLocked === 1}
                            onChange={() => {
                              setIsActive(0);
                              setIsLocked(1);
                            }}
                            disabled={!isEditMode}
                          />{" "}
                          Locked
                        </label>
                        <label className="d-flex align-items-center">
                          <input
                            type="radio"
                            name="userStatus"
                            className="form-check-input p-12p mt-0"
                            style={{ marginRight: "1rem" }}
                            checked={isActive === 0 && isLocked === 0}
                            onChange={() => {
                              setIsActive(0);
                              setIsLocked(0);
                            }}
                            disabled={!isEditMode}
                          />{" "}
                          Blocked
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
                    Is Deleted
                  </label>
                  <div className="col-5">
                    <div className="label-password">
                      <div className="radio-group" style={{ gap: "4rem" }}>
                        <label>
                          <input
                            type="radio"
                            className="form-check-input p-12p mt-0"
                            name="isDeleted"
                            style={{ marginRight: "1rem" }}
                            checked={isDeleted === 1}
                            onChange={() => {
                              setIsDeleted(1);
                            }}
                            disabled={!isEditMode}
                          />{" "}
                          Yes
                        </label>
                        <label className="d-flex align-items-center">
                          <input
                            type="radio"
                            name="isDeleted"
                            className="form-check-input p-12p mt-0"
                            style={{ marginRight: "1rem" }}
                            checked={isDeleted === 0}
                            onChange={() => {
                              setIsDeleted(0);
                            }}
                            disabled={!isEditMode}
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
                placeholder="Provide Reason for update"
                value={userStatusChangeReason}
                onChange={(e) => setUserStatusChangeReason(e.target.value)}
                disabled={!isEditMode}
              />
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
                          disabled={!isEditMode}
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
                          disabled={!isEditMode}
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
                value={bypassOtpReason}
                required={bypassOtp == true}
                onChange={(e) => setBypassOtpReason(e.target.value)}
                disabled={!isEditMode}
              />
            </div>

            {/* Accordions for Web, Mobile, Profile Editor roles, etc. */}
            {selectedRoles.includes("web") && (
              <>
                <Accordion
                  allowZeroExpanded={!isEditMode}
                  className="onboarduserr-accordian"
                  onChange={
                    isEditMode
                      ? undefined
                      : () => setWebUserRoleOpen(!webUserRoleOpen)
                  }
                  id="webUserRole"
                  preExpanded={isWebAccordionOpen ? [] : ["webUserRole"]}
                >
                  <AccordionItem uuid="webUserRole">
                    <AccordionItemHeading>
                      <AccordionItemButton className="onboarduserr-accordian-button">
                        <div className="onboarduserr-accordian-button-div">
                          <CircleCheck size={20} />
                          {!webUserRoleOpen ? (
                            <ChevronUp color="#000000" />
                          ) : (
                            <ChevronDown color="#000000" />
                          )}
                          <p>Web User Role</p>
                        </div>
                      </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                      <div className="role-group">
                        <label className="radio-label col-2">
                          <input
                            type="radio"
                            name="webUserRole"
                            value="1"
                            className="form-check-input p-12p"
                            checked={selectedUserRole === "1"}
                            onChange={handleUserRoleChange}
                            disabled={!isEditMode}
                            required={selectedRoles.includes("web")}
                          />
                          <span className="font">Test Card SME</span>
                        </label>

                        <label className="radio-label ps-3">
                          <input
                            type="radio"
                            name="webUserRole"
                            value="4"
                            className="form-check-input p-12p ms-2"
                            checked={selectedUserRole === "4"}
                            onChange={handleUserRoleChange}
                            disabled={!isEditMode}
                            required={selectedRoles.includes("web")}
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
                              disabled={!isEditMode}
                              required={selectedRoles.includes("web")}
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
                              disabled={!isEditMode}
                              required={selectedRoles.includes("web")}
                            />
                            <span className="font">
                              Test Card Request View User
                            </span>
                          </label>
                        </div>

                        <div className="env-access-group">
                          <span className="env-label">
                            Test Card Env Access
                          </span>
                          {["prod", "qa", "test"].map((env) => (
                            <label
                              key={env}
                              className="radio-label small"
                              style={{
                                marginLeft: env !== "prod" ? "1rem" : 0,
                              }}
                            >
                              <input
                                type="checkbox"
                                name="envAccess"
                                className="form-check-input p-2"
                                style={{ margin: 0 }}
                                value={env}
                                checked={webEnvironments.includes(env)}
                                onChange={handleWebEnvironmentChange}
                                disabled={!isEditMode}
                                required={webEnvironments.length === 0}
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
                  allowZeroExpanded={!isEditMode}
                  className="onboarduserr-accordian"
                  onChange={
                    isEditMode
                      ? undefined
                      : () => setMobileUserRole(!mobileUserRole)
                  }
                  id="mobileUserRole"
                  preExpanded={isMobileAccordionOpen ? [] : ["mobileUserRole"]}
                >
                  <AccordionItem uuid="mobileUserRole">
                    <AccordionItemHeading>
                      <AccordionItemButton className="onboarduserr-accordian-button">
                        <div className="onboarduserr-accordian-button-div">
                          <CircleCheck size={20} />
                          {!mobileUserRole ? (
                            <ChevronUp color="#000000" />
                          ) : (
                            <ChevronDown color="#000000" />
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
                                placeholder="Select Testing Partner"
                                onChange={handlePartnerChange}
                                values={
                                  selectedPartnerName
                                    ? [selectedPartnerName]
                                    : []
                                }
                                disabled={!isEditMode}
                                required={selectedRoles.includes("mobile")}
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
                                    onChange={handleAddressChange}
                                    disabled={!isEditMode}
                                    required
                                  />
                                </div>
                                <div className="col-6">
                                  <input
                                    name="city"
                                    placeholder="City"
                                    className="form-control formcontrol w-100"
                                    value={shippingAddress.city}
                                    onChange={handleAddressChange}
                                    disabled={!isEditMode}
                                    required
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
                                    onChange={handleAddressChange}
                                    disabled={!isEditMode}
                                    required
                                  />
                                </div>

                                <div className="col-4">
                                  <input
                                    name="country"
                                    placeholder="Country"
                                    className="form-control formcontrol"
                                    value={shippingAddress.country}
                                    onChange={handleAddressChange}
                                    disabled={!isEditMode}
                                    required
                                  />
                                </div>

                                <div className="col-4">
                                  <input
                                    name="postalCode"
                                    placeholder="Postal Code"
                                    className="form-control formcontrol"
                                    value={shippingAddress.postalCode}
                                    onChange={handleAddressChange}
                                    disabled={!isEditMode}
                                    required
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
                                      disabled={!isEditMode}
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
                                      disabled={!isEditMode}
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
                                      checked={debugLog == true}
                                      onChange={() => setDebugLog(true)}
                                      disabled={!isEditMode}
                                    />{" "}
                                    Yes
                                  </label>
                                  <label className="d-flex align-items-center">
                                    <input
                                      type="radio"
                                      name="debugLog"
                                      className="form-check-input p-12p mt-0"
                                      style={{ marginRight: "1rem" }}
                                      checked={debugLog == false}
                                      onChange={() => setDebugLog(false)}
                                      disabled={!isEditMode}
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
                          disabled={!isEditMode}
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
                allowZeroExpanded={!isEditMode}
                className="onboarduserr-accordian"
                onChange={
                  isEditMode
                    ? undefined
                    : () => setProfileEditorRole(!profileEditorRole)
                }
                id="profileEditorRole"
                preExpanded={
                  isProfileEditorAccordionOpen ? [] : ["profileEditorRole"]
                }
              >
                <AccordionItem uuid="profileEditorRole">
                  <AccordionItemHeading>
                    <AccordionItemButton className="onboarduserr-accordian-button">
                      <div className="onboarduserr-accordian-button-div">
                        <CircleCheck size={20} />
                        {!profileEditorRole ? (
                          <ChevronUp color="#000000" />
                        ) : (
                          <ChevronDown color="#000000" />
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
                            <div
                              className="radio-group"
                              style={{ gap: "5rem" }}
                            >
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
                                      !isEditMode ||
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
              {!isEditMode && (
                <button
                  type="button"
                  disabled={id == user?.user_id || !isPartnerValid}
                  className="btn"
                  onClick={handleEditClick}
                >
                  Edit User
                </button>
              )}
              {isEditMode ? (
                <>
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
                      "Update User"
                    )}
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleCancel}>
                  Back
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateUser;
