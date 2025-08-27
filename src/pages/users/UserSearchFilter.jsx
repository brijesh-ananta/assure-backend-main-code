import React, { useState, useEffect } from "react";
import axiosToken from "../../utils/axiosToken";
import AuditTrails from "./AuditTrails";
import { useAuth } from "../../utils/AuthContext";

function UserSearchFilter({ userType }) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [testPartner, setTestPartner] = useState("");
  const [showLockedOnly, setShowLockedOnly] = useState(false);
  const [users, setUsers] = useState([]);
  const [userEnv, setUserEnv] = useState("");
  const [reason, setReason] = useState("");
  const { userRole } = useAuth();

  useEffect(() => {
    getUsers();
  }, [userType, userEnv]);

  const roleMapping = {
    1: "TC SME",
    2: "TC REQUEST USER",
    3: "TC REQUEST VIEW USER",
    4: "TC MANAGER USER",
    5: "Mobile App User",
  };

  const rolesList = [
    { role_id: 1, role_name: "TC SME" },
    { role_id: 2, role_name: "TC REQUEST USER" },
    { role_id: 3, role_name: "TC REQUEST VIEW USER" },
    { role_id: 4, role_name: "TC MANAGER USER" },
    { role_id: 5, role_name: "Mobile App User" },
  ];

  const [roles, setRoles] = useState(rolesList);

  const getUsers = async () => {
    try {
      let response;
      if (userType && userType !== "") {
        if (userEnv && userEnv !== "") {
          response = await axiosToken.get(
            `/users?userType=${userType}&userEnv=${userEnv}`
          );
        } else {
          response = await axiosToken.get(`/users?userType=${userType}`);
        }
      } else {
        if (userEnv && userEnv !== "") {
          response = await axiosToken.get(`/users?userEnv=${userEnv}`);
        } else {
          response = await axiosToken.get(`/users`);
        }
      }
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUserStatusChange = (userId, newStatus) => {
    if (userRole === 1) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId ? { ...user, isActive: newStatus } : user
        )
      );
    }
  };

  const handleAccountStatusChange = (userId, newStatus) => {
    if (userRole === 1) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId
            ? {
                ...user,
                accountStatus: newStatus,
                is_locked: newStatus === "Locked" || newStatus === 1,
              }
            : user
        )
      );
    }
  };

  const handleDeleteChange = (userId, isDeleted) => {
    if (userRole === 1) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId ? { ...user, isDeleted } : user
        )
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const nameMatch = userName
      ? `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(userName.toLowerCase())
      : true;

    const emailMatch = email
      ? user.email.toLowerCase().includes(email.toLowerCase())
      : true;

    const partnerMatch =
      userType === "mobile" && testPartner
        ? (user.partnerEmail || "")
            .toLowerCase()
            .includes(testPartner.toLowerCase()) ||
          (user.partnerName || "")
            .toLowerCase()
            .includes(testPartner.toLowerCase())
        : true;

    const lockedMatch = showLockedOnly ? user.is_locked : true;

    return nameMatch && emailMatch && partnerMatch && lockedMatch;
  });

  const handleUserEnvChange = (envType) => {
    if (userRole === 1) {
      setUserEnv(envType);
    }
  };

  const handleSaveUser = async (user) => {
    if (userRole === 1) {
      try {
        const payload = {
          username: user.firstName,
          user_id: user.user_id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role_id,
          is_locked: user.is_locked,
          isActive: user.isActive,
          isDeleted: user.isDeleted,
          prod: user.prod,
          qa: user.qa,
          test: user.test,
          partnerEmail: user.partnerEmail || "",
          partnerName: user.partnerName || "",
          reason: user.reason,
        };

        const response = await axiosToken.put(
          `/users/${user.user_id}`,
          payload
        );
        alert(response.data.message || "s updated successfully.");
        window.location.reload();
      } catch (err) {
        console.error("Error updating user:", err);
        alert(
          err.response?.data?.message ||
            "An error occurred while updating the user."
        );
      }
    }
  };

  return (
    <>
      <form>
        <div className="login-page mb-lg-4 mb-2 row">
          <div className="col-12 col-lg-6 pe-lg-0 mb-lg-4 mb-2 pe-lg-5">
            <div className="d-lg-flex align-items-center">
              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                User Name
              </label>
              <div className="position-relative w-100">
                <input
                  placeholder="FirstName* or LastName* (full or partial)"
                  type="text"
                  className="form-control formcontrol"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <img
                  className="postiop"
                  src="/images/search.svg"
                  alt="search"
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 mb-lg-4 mb-2">
            <div className="d-lg-flex align-items-center">
              <label className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow2">
                Email:
              </label>
              <div className="position-relative w-100">
                <input
                  placeholder="Email* (full or partial)"
                  type="email"
                  className="form-control formcontrol"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <img
                  className="postiop"
                  src="/images/search.svg"
                  alt="search"
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 pe-lg-0 mb-lg-4 mb-2 pe-lg-5">
            {userType === "mobile" && (
              <div className="d-lg-flex align-items-center">
                <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                  Test Partner
                </label>
                <div className="position-relative w-100">
                  <input
                    placeholder="Partner Name or Email (full or partial)*"
                    type="text"
                    className="form-control formcontrol"
                    value={testPartner}
                    onChange={(e) => setTestPartner(e.target.value)}
                  />
                  <img
                    className="postiop"
                    src="/images/search.svg"
                    alt="search"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="col-12 col-lg-6 mb-lg-4 mb-2">
            <div className="d-lg-flex align-items-center justify-content-end">
              <div>
                <button
                  type="button"
                  className="btn-add py-2"
                  onClick={() =>
                    userRole === 1 ? setShowLockedOnly(!showLockedOnly) : null
                  }
                  disabled={userRole !== 1}
                >
                  <img className="me-2" src="/images/lock.svg" alt="lock" />
                  {showLockedOnly ? "Show All Accounts" : "Locked Accounts"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="card rounded-0 accordian-flex">
        <div className="card-body">
          <div className="d-lg-flex align-items-center justify-content-between mb-lg-3 mb-2">
            <span className="search-title">Matching Users</span>
            {(!userType || userType === "mobile") && (
              <div className="d-lg-flex formcard">
                <span className="me-3 font">Environment</span>
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="userEnvironment"
                    id="flexRadioDefault1"
                    value={"prod"}
                    onChange={(e) => handleUserEnvChange(e.target.value)}
                    checked={userEnv === "prod"}
                    disabled={userRole !== 1}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault1"
                  >
                    Prod
                  </label>
                </div>
                <div className="form-check d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="userEnvironment"
                    value={"qa"}
                    onChange={(e) => handleUserEnvChange(e.target.value)}
                    checked={userEnv === "qa"}
                    id="flexRadioDefault2"
                    disabled={userRole !== 1}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault2"
                  >
                    QA
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="accordion" id="accordionExample">
            {filteredUsers.map((user, index) => (
              <div className="accordion-item" key={user.user_id}>
                <h2 className="accordion-header" id={`heading-${user.user_id}`}>
                  <button
                    className="accordion-button bgbutton collapsed p-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${user.user_id}`}
                    aria-expanded={index === 0}
                    aria-controls={`collapse-${user.user_id}`}
                  >
                    <div className="table-responsive w-100">
                      <table className="table mb-0">
                        <thead className="table-theme themac themewidh">
                          <tr>
                            <th scope="col">User {index + 1}</th>
                            <th scope="col">{user.firstName}</th>
                            <th scope="col">{user.lastName}</th>
                            <th scope="col">{user.email}</th>
                            <th scope="col">
                              <div className="d-flex align-items-center">
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    checked={user.is_locked == 1}
                                    value="1"
                                    name={`isLocked-${user.user_id}`}
                                    disabled
                                  />
                                  <label className="form-check-label">
                                    Locked
                                  </label>
                                </div>
                              </div>
                            </th>
                            <th scope="col">
                              <span>
                                {roleMapping[user.role_id] || "Unknown Role"}
                              </span>
                            </th>
                            <th scope="col">
                              <button
                                className="btn btn-secondary btn-sm btn-color darkcolor"
                                disabled={userRole !== 1}
                              >
                                View Details
                              </button>
                            </th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </button>
                </h2>
                <div
                  id={`collapse-${user.user_id}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${user.user_id}`}
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <div className="cardbody bg-light-theme">
                      <form>
                        <div className="login-page mb-lg-4 mb-2 row">
                          <div className="col-lg-12">
                            <div className="d-flex justify-content-between mb-lg-4 mb-2">
                              <div className="d-lg-flex formcard">
                                <span className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                  User {index + 1}
                                </span>
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`userPlatform-${user.user_id}`}
                                    id={`web-${user.user_id}`}
                                    value="web"
                                    defaultChecked={user.user_type === "web"}
                                    disabled
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`web-${user.user_id}`}
                                  >
                                    Web
                                  </label>
                                </div>
                                <div className="form-check d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`userPlatform-${user.user_id}`}
                                    id={`mobile-${user.user_id}`}
                                    value="mobile"
                                    defaultChecked={user.user_type === "mobile"}
                                    disabled
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`mobile-${user.user_id}`}
                                  >
                                    Mobile app tester
                                  </label>
                                </div>
                              </div>
                              {user.user_type === "mobile" && (
                                <div className="d-lg-flex formcard">
                                  <div className="form-check me-3 d-flex gap-2 align-items-center">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name={`userEnvPrd-${user.user_id}`}
                                      id={`prod-${user.user_id}`}
                                      value="prod"
                                      defaultChecked={user.prod === 1}
                                      disabled
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`prod-${user.user_id}`}
                                    >
                                      Prod
                                    </label>
                                  </div>
                                  <div className="form-check d-flex gap-2 align-items-center">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name={`userEnvQa-${user.user_id}`}
                                      id={`qa-${user.user_id}`}
                                      value="qa"
                                      defaultChecked={user.qa === 1}
                                      disabled
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`qa-${user.user_id}`}
                                    >
                                      QA
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 pe-lg-0 mb-lg-4 mb-2">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                First Name
                              </label>
                              <div className="position-relative w-75">
                                <input
                                  type="text"
                                  className="form-control formcontrol"
                                  value={user.firstName}
                                  onChange={(e) =>
                                    userRole === 1
                                      ? setUsers((prev) =>
                                          prev.map((u) =>
                                            u.user_id === user.user_id
                                              ? {
                                                  ...u,
                                                  firstName: e.target.value,
                                                }
                                              : u
                                          )
                                        )
                                      : null
                                  }
                                  disabled={userRole !== 1}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 mb-lg-4 mb-2">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2">
                                Last Name
                              </label>
                              <div className="position-relative w-75">
                                <input
                                  type="text"
                                  className="form-control formcontrol"
                                  value={user.lastName}
                                  onChange={(e) =>
                                    userRole === 1
                                      ? setUsers((prev) =>
                                          prev.map((u) =>
                                            u.user_id === user.user_id
                                              ? {
                                                  ...u,
                                                  lastName: e.target.value,
                                                }
                                              : u
                                          )
                                        )
                                      : null
                                  }
                                  disabled={userRole !== 1}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 pe-lg-0 mb-lg-4 mb-2">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                User Role
                              </label>
                              <div className="position-relative w-75">
                                <select
                                  className="form-select formcontrol"
                                  value={user.role_id}
                                  disabled={
                                    user.role_id === 5 || userRole !== 1
                                  }
                                  onChange={(e) =>
                                    userRole === 1
                                      ? setUsers((prev) =>
                                          prev.map((u) =>
                                            u.user_id === user.user_id
                                              ? {
                                                  ...u,
                                                  role_id: e.target.value,
                                                }
                                              : u
                                          )
                                        )
                                      : null
                                  }
                                >
                                  <option value="">Select Role</option>
                                  {roles.map((role) => (
                                    <option
                                      key={role.role_id}
                                      value={role.role_id}
                                    >
                                      {role.role_name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 mb-lg-4 mb-2">
                            {user.role_id !== 5 && (
                              <div className="d-lg-flex formcard">
                                <span className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 text-capitalize">
                                  Test Card ENV Access
                                </span>
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name={`accessProd-${user.user_id}`}
                                    id={`access-prod-${user.user_id}`}
                                    checked={user.prod === 1}
                                    onChange={(e) =>
                                      userRole === 1
                                        ? setUsers((prev) =>
                                            prev.map((u) =>
                                              u.user_id === user.user_id
                                                ? {
                                                    ...u,
                                                    prod: e.target.checked
                                                      ? 1
                                                      : 0,
                                                  }
                                                : u
                                            )
                                          )
                                        : null
                                    }
                                    disabled={userRole !== 1}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`access-prod-${user.user_id}`}
                                  >
                                    Prod
                                  </label>
                                </div>
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name={`accessQa-${user.user_id}`}
                                    id={`access-qa-${user.user_id}`}
                                    checked={user.qa === 1}
                                    onChange={(e) =>
                                      userRole === 1
                                        ? setUsers((prev) =>
                                            prev.map((u) =>
                                              u.user_id === user.user_id
                                                ? {
                                                    ...u,
                                                    qa: e.target.checked
                                                      ? 1
                                                      : 0,
                                                  }
                                                : u
                                            )
                                          )
                                        : null
                                    }
                                    disabled={userRole !== 1}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`access-qa-${user.user_id}`}
                                  >
                                    QA
                                  </label>
                                </div>
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name={`accessTest-${user.user_id}`}
                                    id={`access-test-${user.user_id}`}
                                    checked={user.test === 1}
                                    onChange={(e) =>
                                      userRole === 1
                                        ? setUsers((prev) =>
                                            prev.map((u) =>
                                              u.user_id === user.user_id
                                                ? {
                                                    ...u,
                                                    test: e.target.checked
                                                      ? 1
                                                      : 0,
                                                  }
                                                : u
                                            )
                                          )
                                        : null
                                    }
                                    disabled={userRole !== 1}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`access-test-${user.user_id}`}
                                  >
                                    Cert
                                  </label>
                                </div>
                              </div>
                            )}
                            {user.role_id === 5 && (
                              <div className="d-lg-flex formcard">
                                <span className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 text-capitalize">
                                  Testing Partner
                                </span>
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <label className="form-check-label">
                                    {user.partnerName || "N/A"}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="yellowcolor mb-lg-4 mb-2">
                      <div className="d-lg-flex align-items-center justify-content-between mb-3 gap-3">
                        <div className="d-flex align-items-center flex-grow-1 bg-light-theme-orange border border-dark">
                          <p className="m-0 me-3 fontuse fontcolor">
                            User Status
                          </p>
                          <div className="d-flex formcard">
                            <div className="form-check me-3 d-flex gap-2 align-items-center">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`userStatus-${user.user_id}`}
                                id={`status-block-${user.user_id}`}
                                value="0"
                                defaultChecked={user.isActive === 0}
                                onChange={() =>
                                  handleUserStatusChange(user.user_id, 0)
                                }
                                disabled={userRole !== 1}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`status-block-${user.user_id}`}
                              >
                                Block
                              </label>
                            </div>
                            <div className="form-check d-flex gap-2 align-items-center">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`userStatus-${user.user_id}`}
                                id={`status-active-${user.user_id}`}
                                value="1"
                                defaultChecked={user.isActive === 1}
                                onChange={() =>
                                  handleUserStatusChange(user.user_id, 1)
                                }
                                disabled={userRole !== 1}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`status-active-${user.user_id}`}
                              >
                                Active
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center flex-grow-1 bg-light-theme-orange border border-dark">
                          <p className="m-0 me-3 fontuse fontcolor">
                            Account Status
                          </p>
                          <div className="d-flex formcard">
                            <div className="form-check me-3 d-flex gap-2 align-items-center">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`accountStatus-${user.user_id}`}
                                id={`acc-locked-${user.user_id}`}
                                value="1"
                                defaultChecked={user.is_locked === 1}
                                onChange={() =>
                                  handleAccountStatusChange(user.user_id, 1)
                                }
                                disabled={userRole !== 1}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`acc-locked-${user.user_id}`}
                              >
                                Locked
                              </label>
                            </div>
                            <div className="form-check d-flex gap-2 align-items-center">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`accountStatus-${user.user_id}`}
                                id={`acc-unlock-${user.user_id}`}
                                value="0"
                                defaultChecked={user.is_locked === 0}
                                onChange={() =>
                                  handleAccountStatusChange(user.user_id, 0)
                                }
                                disabled={userRole !== 1}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`acc-unlock-${user.user_id}`}
                              >
                                UnLock
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center flex-grow-1 bg-light-theme-orange border border-dark">
                          <p className="m-0 me-3 fontuse fontcolor">
                            Delete User
                          </p>
                          <div className="d-flex formcard">
                            <div className="form-check me-3 d-flex gap-2 align-items-center">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`deleteUser-${user.user_id}`}
                                id={`delete-yes-${user.user_id}`}
                                value="1"
                                defaultChecked={user.isDeleted === 1}
                                onChange={() =>
                                  handleDeleteChange(user.user_id, 1)
                                }
                                disabled={userRole !== 1}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`delete-yes-${user.user_id}`}
                              >
                                Yes
                              </label>
                            </div>
                            <div className="form-check d-flex gap-2 align-items-center">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`deleteUser-${user.user_id}`}
                                id={`delete-no-${user.user_id}`}
                                value="0"
                                defaultChecked={user.isDeleted === 0}
                                onChange={() =>
                                  handleDeleteChange(user.user_id, 0)
                                }
                                disabled={userRole !== 1}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`delete-no-${user.user_id}`}
                              >
                                No
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(user.isActive === 0 ||
                        user.is_locked == 1 ||
                        user.isDeleted == 1) && (
                        <textarea
                          placeholder="Provide reason for update: mandatory for changing user status and deleting user"
                          className="form-control formcontrol"
                          value={user.reason || ""}
                          name={`reason-${user.user_id}`}
                          onChange={(e) =>
                            userRole === 1
                              ? setUsers((prev) =>
                                  prev.map((u) =>
                                    u.user_id === user.user_id
                                      ? { ...u, reason: e.target.value }
                                      : u
                                  )
                                )
                              : null
                          }
                          disabled={userRole !== 1}
                        ></textarea>
                      )}
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      {userRole === 1 && (
                        <button
                          className="btn-add py-2"
                          type="button"
                          onClick={() => handleSaveUser(user)}
                        >
                          Save User
                        </button>
                      )}
                    </div>
                    <AuditTrails
                      audit={true}
                      tableName="users"
                      recordId={user.user_id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserSearchFilter;
