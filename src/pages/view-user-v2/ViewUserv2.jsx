import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import { CircleCheck, ChevronDown, ChevronUp } from "lucide-react";
import "react-accessible-accordion/dist/fancy-example.css";
import "./viewuserv2.css";
import Separator from "../../common/Separator/Separator";
import SideButtons from "../../common/SideButtons/SideButtons";
import { useNavigate } from "react-router-dom";

const ViewUserv2 = () => {
  const navigate = useNavigate();

  //   const [showPassword, setShowPassword] = useState(false);
  const [passwordType, setPasswordType] = useState("system");
  //   const [password, setPassword] = useState("");

  const [webUserRoleOpen, setWebUserRoleOpen] = useState(false);
  const [mobileUserRole, setmobileUserRole] = useState(false);
  const [profileEditorRole, setProfileEditorRole] = useState(false);

  const handleClickSideButtons = (label) => {
    if (label === "Login History") {
      navigate("/dashboard/login-history-v2");
    } else if (label === "Assigned Cards") {
      navigate("/dashboard/user-card-history");
    }
  };

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
          <form className="d-flex gap-4 flex-column w-80 m-auto">
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
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-6 row align-items-center onboarduserv2-form">
                <label className="font text-right col-5 onboarduserv2-form-label">
                  Password
                </label>
                <div className="col-5">
                  <div className="label-password">
                    <div className="radio-group" style={{ gap: "5rem" }}>
                      <label>
                        <input
                          type="radio"
                          className="form-check-input p-12p mt-0"
                          name="passwordType"
                          checked={passwordType === "system"}
                          style={{ marginRight: "1rem" }}
                          onChange={() => setPasswordType("system")}
                        />{" "}
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
                    {/* {passwordType === "admin" && (
                    <div className="input-with-icon">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Type password"
                        className="form-control formcontrol"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </span>
                    </div>
                  )} */}
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-6 row align-items-center onboarduserv2-form">
                <label className="font text-right col-5 onboarduserv2-form-label">
                  User Role
                </label>
                <div className="col-5 d-flex gap-5">
                  {["Web", "Profile Editor", "Mobile"].map((status) => (
                    <label key={status} className="tp-radio-label">
                      <input
                        className="form-check-input onboarduserv2-form-radio-square-label"
                        type="radio"
                        name="status"
                        value={status}
                      />
                      <span className="text-capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

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
                        />{" "}
                        Yes
                      </label>
                      <label className="d-flex align-items-center">
                        <input
                          type="radio"
                          name="bypassOtp"
                          className="form-check-input p-12p mt-0"
                          style={{ marginRight: "1rem" }}
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
              />
            </div>
            <Separator />

            <Accordion
              allowZeroExpanded={true}
              className="onboarduserr-accordian"
              onChange={() => setWebUserRoleOpen(!webUserRoleOpen)}
              id="webUserRole"
            >
              <AccordionItem>
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
                      />
                      <span className="font">Test Card SME</span>
                    </label>

                    <label className="radio-label">
                      <input
                        type="radio"
                        name="webUserRole"
                        value="4"
                        className="form-check-input p-12p ms-2"
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
                        />
                        <span className="font">Test Card Request User</span>
                      </label>

                      <label className="radio-label col-5">
                        <input
                          type="radio"
                          name="webUserRole"
                          className="form-check-input p-12p"
                          value="3"
                        />
                        <span className="font">
                          Test Card Request View User
                        </span>
                      </label>
                    </div>

                    <div className="env-access-group">
                      <span className="env-label">Test Card Env Access</span>

                      <label className="radio-label small">
                        <input
                          type="radio"
                          name="envAccess"
                          className="form-check-input p-2"
                          style={{ margin: 0 }}
                        />
                        <span className="font">Prod</span>
                      </label>

                      <label
                        className="radio-label small"
                        style={{ marginLeft: "1rem" }}
                      >
                        <input
                          type="radio"
                          name="envAccess"
                          className="form-check-input p-2"
                          style={{ margin: 0 }}
                        />
                        <span className="font">QA</span>
                      </label>

                      <label
                        className="radio-label small"
                        style={{ marginLeft: "1rem" }}
                      >
                        <input
                          type="radio"
                          name="envAccess"
                          className="form-check-input p-2"
                          style={{ margin: 0 }}
                          value="test"
                        />
                        <span className="font">Cert</span>
                      </label>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            </Accordion>

            <Separator />

            <Accordion
              allowZeroExpanded={true}
              className="onboarduserr-accordian"
              onChange={() => setmobileUserRole(!mobileUserRole)}
              id="mobileUserRole"
            >
              <AccordionItem>
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
                          <input
                            name="testing_partner"
                            type="text"
                            className="form-control formcontrol"
                            placeholder="Select Testing Partner"
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
                                name="address"
                                placeholder="Unit/Building and Street Name"
                                className="form-control formcontrol"
                              />
                            </div>
                            <div className="col-6">
                              <input
                                name="city"
                                placeholder="City"
                                className="form-control formcontrol w-100"
                              />
                            </div>
                          </div>

                          <div className="w-100 row mt-4">
                            <div className="col-4">
                              <input
                                name="state"
                                placeholder="State"
                                className="form-control formcontrol"
                              />
                            </div>

                            <div className="col-4">
                              <input
                                name="country"
                                placeholder="Country"
                                className="form-control formcontrol"
                              />
                            </div>

                            <div className="col-4">
                              <input
                                name="postalCode"
                                placeholder="Postal Code"
                                className="form-control formcontrol"
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
                                />{" "}
                                Yes
                              </label>
                              <label className="d-flex align-items-center">
                                <input
                                  type="radio"
                                  name="apduLog"
                                  className="form-check-input p-12p mt-0"
                                  style={{ marginRight: "1rem" }}
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
                                  name="apduLog"
                                  style={{ marginRight: "1rem" }}
                                />{" "}
                                Yes
                              </label>
                              <label className="d-flex align-items-center">
                                <input
                                  type="radio"
                                  name="apduLog"
                                  className="form-check-input p-12p mt-0"
                                  style={{ marginRight: "1rem" }}
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
                    />
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            </Accordion>

            <Separator />

            <Accordion
              allowZeroExpanded={true}
              className="onboarduserr-accordian"
              onChange={() => setProfileEditorRole(!profileEditorRole)}
              id="profileEditorRole"
            >
              <AccordionItem>
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
                            <label>
                              <input
                                type="radio"
                                className="form-check-input p-12p mt-0"
                                name="testCardEnvAccess"
                                style={{ marginRight: "1rem" }}
                              />{" "}
                              Prod
                            </label>
                            <label className="d-flex align-items-center">
                              <input
                                type="radio"
                                name="testCardEnvAccess"
                                className="form-check-input p-12p mt-0"
                                style={{ marginRight: "1rem" }}
                              />{" "}
                              QA
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            </Accordion>
            <Separator />
            <div className="form-actions" style={{ marginBottom: "1.5rem" }}>
              <button type="button">Cancel</button>
              <button type="submit">Edit</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ViewUserv2;
