import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import UserSearchFilter from "./UserSearchFilter";
import { useAuth } from "../../utils/AuthContext";

const ManageUsers = () => {
  const [headerTitle, setHeaderTitle] = useState("Manage Users"); // Default title
  // userType 
  const [userType, setUserType] = useState('');
  const { userRole } = useAuth(); // Added userRole to useAuth

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />
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
                  value={"web"}
                  id="webuser"
                  checked={userType === "web"}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="webuser">
                  Web User
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  value={"mobile"}
                  name="userType"
                  id="mobileuser"
                  checked={userType === "mobile"}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="mobileuser">
                  Mobile app tester
                </label>
              </div>
            </div>

            <div className="">
              {/* userRole == 1 */}
              {userRole === 1 && (
              <Link
                className="btn-add py-2"
                to="/dashboard/user-management/onboard-user"
              >
                Onboard User
              </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <section className="notification pb-5">
        <div className="container-fluid">
          <UserSearchFilter userType={userType} />
        </div>
      </section>
      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
};

export default ManageUsers;
